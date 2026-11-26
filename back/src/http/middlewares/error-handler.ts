import type { ErrorRequestHandler } from "express";
import { AppError } from "../../errors/app-error.js";
import { PROBLEM_CONTENT_TYPE, buildProblemDetails } from "../problem-details.js";

/** Client errors raised by Express itself or body-parser (http-errors objects with a 4xx status). */
function isHttpClientError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return false;
  }
  const { status } = error;
  return typeof status === "number" && status >= 400 && status < 500;
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  if (isHttpClientError(error)) {
    return new AppError(400, "MALFORMED_REQUEST", "The request could not be parsed.");
  }
  return new AppError(500, "INTERNAL_ERROR", "An unexpected error occurred.");
}

/** Serialises every error as RFC 9457 Problem Details. Never leaks stack traces, SQL or internal paths. */
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const appError = toAppError(error);
  const { requestId } = res.locals;

  if (appError.status >= 500) {
    console.error(`[${requestId}] ${req.method} ${req.originalUrl}`, error);
  }

  // RFC 6750 §3: a 401 on a protected resource names the expected authentication scheme.
  if (appError.code === "UNAUTHENTICATED") {
    res.setHeader("WWW-Authenticate", "Bearer");
  }

  res
    .status(appError.status)
    .type(PROBLEM_CONTENT_TYPE)
    .json(
      buildProblemDetails({
        status: appError.status,
        code: appError.code,
        detail: appError.message,
        instance: req.originalUrl.split("?")[0] ?? req.originalUrl,
        requestId,
        errors: appError.errors,
      }),
    );
};
