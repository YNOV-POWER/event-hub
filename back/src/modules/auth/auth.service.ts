import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { Prisma } from "../../../generated/prisma/client.js";
import type { PrismaClient } from "../../../generated/prisma/client.js";
import { EmailAlreadyUsedError, InvalidCredentialsError } from "../../errors/app-error.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_TTL_SECONDS = 3600;

// Hash valide comparé quand l'email est inconnu, pour que le temps de réponse
// ne révèle pas l'existence d'un compte.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", BCRYPT_ROUNDS);

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
                select: { id: true, email: true, displayName: true, role: true, createdAt: true },
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
            .setProtectedHeader({ alg: "HS256" })
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
}