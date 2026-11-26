import { z } from "zod";

const BCRYPT_MAX_BYTES = 72;

const email = z.string().trim().toLowerCase().email().max(254);

export const registerSchema = z.strictObject({
    email,
    password: z
        .string()
        .min(12)
        .refine((value) => new TextEncoder().encode(value).length <= BCRYPT_MAX_BYTES, {
            message: "password must be at most 72 bytes.",
            params: { code: "MAX_LENGTH" },
        }),
    displayName: z.string().trim().min(2).max(80),
});

export const loginSchema = z.strictObject({
    email,
    password: z.string().min(1).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;