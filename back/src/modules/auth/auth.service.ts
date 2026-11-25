import bcrypt from "bcrypt";
import { Prisma } from "../../../generated/prisma/client.js";
import type { PrismaClient } from "../../../generated/prisma/client.js";
import { EmailAlreadyUsedError } from "../../errors/app-error.js";

export class AuthService {
    private readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async register(input: { email: string; password: string; displayName: string }) {
        const passwordHash = await bcrypt.hash(input.password, 12);

        try {
            return await this.prisma.user.create({
                data: {
                    email: input.email,
                    passwordHash,
                    displayName: input.displayName,
                },
                select: { id: true, email: true, displayName: true, role: true },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new EmailAlreadyUsedError();
            }
            throw error;
        }
    }
}