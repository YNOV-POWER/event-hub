import type { RequestHandler } from "express";
import { NotFoundError } from "../../errors/app-error.js";

export const notFoundHandler: RequestHandler = (req) => {
  throw new NotFoundError(`No route matches ${req.method} ${req.path}.`);
};
