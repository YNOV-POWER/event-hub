import type { RequestHandler, Response } from "express";
import { UnauthenticatedError } from "../../errors/app-error.js";
import type { AuthService, AuthenticatedUser } from "./auth.service.js";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace -- Express exposes its augmentation points through this global namespace.
    namespace Express {
        interface Locals {
            /** Set by `requireAuth` once the access token has been verified. */
            authUser?: AuthenticatedUser;
        }
    }
}

const BEARER_PATTERN = /^Bearer (\S+)$/i;

/** Contract §2: a protected route without a valid `Authorization: Bearer <token>` header answers `401 UNAUTHENTICATED`. */
export function requireAuth(authService: AuthService): RequestHandler {
    return async (req, res, next) => {
        const token = BEARER_PATTERN.exec(req.get("Authorization") ?? "")?.[1];
        const authUser = token === undefined ? null : await authService.verifyAccessToken(token);
        if (authUser === null) {
            throw new UnauthenticatedError();
        }
        res.locals.authUser = authUser;
        next();
    };
}

/** Identity set by `requireAuth`. Reaching a handler without it is a wiring error, not a client error. */
export function getAuthUser(res: Response): AuthenticatedUser {
    const { authUser } = res.locals;
    if (authUser === undefined) {
        throw new Error("requireAuth must run before this handler.");
    }
    return authUser;
}
