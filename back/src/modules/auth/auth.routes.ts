import { Router } from "express";
import type { RequestHandler } from "express";
import type { AuthController } from "./auth.controller.js";

export function createAuthRouter(controller: AuthController): Router {
    const router = Router();
    router.post("/register", controller.register);
    router.post("/login", controller.login);
    return router;
}

export function createMeRouter(controller: AuthController, authenticate: RequestHandler): Router {
    const router = Router();
    router.get("/", authenticate, controller.me);
    return router;
}
