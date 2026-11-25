import type { Request, Response } from "express";
import { ValidationError } from "../../errors/app-error.js";
import { registerSchema } from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

export class AuthController {
    private readonly authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    register = async (req: Request, res: Response): Promise<void> => {
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            throw new ValidationError(
                result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    code: issue.code,
                    message: issue.message,
                })),
            );
        }

        const user = await this.authService.register(result.data);
        res.status(201).json(user);
    };
}