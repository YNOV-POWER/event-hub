import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const REQUEST_ID_HEADER = "X-Request-Id";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express exposes its augmentation points through this global namespace.
  namespace Express {
    interface Locals {
      requestId: string;
    }
  }
}

/** Assigns a correlation id to every request, exposed in `X-Request-Id` and in error bodies. */
export const requestId: RequestHandler = (_req, res, next) => {
  const id = `req_${randomUUID().replaceAll("-", "")}`;
  res.locals.requestId = id;
  res.setHeader(REQUEST_ID_HEADER, id);
  next();
};
