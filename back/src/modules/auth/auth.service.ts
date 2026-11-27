import bcrypt from "bcrypt";
import { SignJWT, errors as joseErrors, jwtVerify } from "jose";
import { Prisma } from "../../../generated/prisma/client.js";
import type { PrismaClient } from "../../../generated/prisma/client.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { EmailAlreadyUsedError, InvalidCredentialsError, UnauthenticatedError } from "../../errors/app-error.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL_SECONDS = 3600;
const JWT_ALGORITHM = "HS256";

// Hash valide comparé quand l'email est inconnu, pour que le temps de réponse
// ne révèle pas l'existence d'un compte.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", BCRYPT_ROUNDS);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const USER_ROLES: readonly string[] = Object.values(UserRole);

/** `User` resource of the contract (§1.1): everything but the password hash. */
const USER_SELECT = {
    id: true,
    email: true,
    displayName: true,
    role: true,
    createdAt: true,
} satisfies Prisma.UserSelect;

/** Identity carried by a valid access token. */
export interface AuthenticatedUser {
    id: string;
    role: UserRole;
}

function isUserRole(value: unknown): value is UserRole {
    return typeof value === "string" && USER_ROLES.includes(value);
}

export class AuthService {
    private readonly prisma: PrismaClient;
    private readonly jwtKey: Uint8Array;

    constructor(prisma: PrismaClient, jwtSecret: string) {
        this.prisma = prisma;
        this.jwtKey = new TextEncoder().encode(jwtSecret);
    }

    async register({ email, password, displayName }: RegisterInput) {
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        try {
            return await this.prisma.user.create({
                data: { email, passwordHash, displayName },
                select: USER_SELECT,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new EmailAlreadyUsedError();
            }
            throw error;
        }
    }

    async login({ email, password }: LoginInput) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (user === null || !passwordMatches) {
            throw new InvalidCredentialsError();
        }

        const accessToken = await new SignJWT({ role: user.role })
            .setProtectedHeader({ alg: JWT_ALGORITHM })
            .setSubject(user.id)
            .setIssuedAt()
            .setExpirationTime(Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS)
            .sign(this.jwtKey);

        return {
            accessToken,
            tokenType: "Bearer" as const,
            expiresIn: ACCESS_TOKEN_TTL_SECONDS,
            user: { id: user.id, displayName: user.displayName, role: user.role },
        };
    }

    /** Identity of a valid access token, or null if it is malformed, expired or not signed with our key. */
    async verifyAccessToken(token: string): Promise<AuthenticatedUser | null> {
        try {
            const { payload } = await jwtVerify(token, this.jwtKey, {
                algorithms: [JWT_ALGORITHM],
                requiredClaims: ["sub", "exp"],
            });
            if (typeof payload.sub !== "string" || !UUID_PATTERN.test(payload.sub) || !isUserRole(payload.role)) {
                return null;
            }
            return { id: payload.sub, role: payload.role };
        } catch (error) {
            if (error instanceof joseErrors.JOSEError) {
                return null;
            }
            throw error;
        }
    }

    /** A3: profile of the connected user. A token whose account no longer exists is no longer valid. */
    async getCurrentUser(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
        if (user === null) {
            throw new UnauthenticatedError();
        }
        return user;
    }
}