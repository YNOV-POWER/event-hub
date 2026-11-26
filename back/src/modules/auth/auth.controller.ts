import type { Request, Response } from "express";
import { parseBody } from "../../http/parse-body.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

export class AuthController {
    private readonly authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    register = async (req: Request, res: Response): Promise<void> => {
        const user = await this.authService.register(parseBody(registerSchema, req.body));
        res.status(201).json({ data: user });
    };

    login = async (req: Request, res: Response): Promise<void> => {
        const session = await this.authService.login(parseBody(loginSchema, req.body));
        res.status(200).json({ data: session });
    };
}