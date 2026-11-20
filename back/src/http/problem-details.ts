import type { ErrorCode, FieldError } from "../errors/app-error.js";

export const PROBLEM_CONTENT_TYPE = "application/problem+json";

const TITLES: Record<ErrorCode, string> = {
  MALFORMED_REQUEST: "Malformed request",
  INVALID_QUERY_PARAM: "Invalid query parameter",
  UNAUTHENTICATED: "Authentication required",
  INVALID_CREDENTIALS: "Invalid credentials",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
  EMAIL_ALREADY_USED: "Email already used",
  INVALID_STATE_TRANSITION: "Invalid state transition",
  EVENT_NOT_EDITABLE: "Event not editable",
  CAPACITY_BELOW_CONFIRMED: "Capacity below confirmed registrations",
  VALIDATION_FAILED: "Validation failed",
  TOO_MANY_REQUESTS: "Too many requests",
  INTERNAL_ERROR: "Internal server error",
};

/**
 * RFC 9457 Problem Details object. `code`, `requestId` and `errors` are extension members:
 * `code` is the stable business code, `errors` lists field-level failures (validation only).
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: ErrorCode;
  requestId: string;
  errors?: readonly FieldError[];
}

/** Relative URI reference identifying the problem type, e.g. `/problems/not-found`. */
export function problemType(code: ErrorCode): string {
  return `/problems/${code.toLowerCase().replaceAll("_", "-")}`;
}

export function buildProblemDetails(input: {
  status: number;
  code: ErrorCode;
  detail: string;
  instance: string;
  requestId: string;
  errors?: readonly FieldError[] | undefined;
}): ProblemDetails {
  const problem: ProblemDetails = {
    type: problemType(input.code),
    title: TITLES[input.code],
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    code: input.code,
    requestId: input.requestId,
  };
  if (input.errors !== undefined && input.errors.length > 0) {
    problem.errors = input.errors;
  }
  return problem;
}
