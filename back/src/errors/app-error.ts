/** Stable business error codes from the API contract (§5.1). The front relies on them, never on messages. */
export type ErrorCode =
  | "MALFORMED_REQUEST"
  | "INVALID_QUERY_PARAM"
  | "UNAUTHENTICATED"
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "EMAIL_ALREADY_USED"
  | "INVALID_STATE_TRANSITION"
  | "EVENT_NOT_EDITABLE"
  | "CAPACITY_BELOW_CONFIRMED"
  | "VALIDATION_FAILED"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_ERROR";

export interface FieldError {
  /** Dotted path of the offending field or query parameter. */
  field: string;
  code: string;
  message: string;
}

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly errors: readonly FieldError[] | undefined;

  constructor(status: number, code: ErrorCode, message: string, errors?: readonly FieldError[]) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.") {
    super(404, "NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class InvalidQueryParamError extends AppError {
  constructor(errors: readonly FieldError[]) {
    super(400, "INVALID_QUERY_PARAM", "One or more query parameters are invalid.", errors);
    this.name = "InvalidQueryParamError";
  }
}
