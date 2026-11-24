export interface ApiFieldError {
  readonly field: string;
  readonly code: string;
  readonly message: string;
}

export interface ApiErrorOptions {
  status: number;
  code: string;
  title: string;
  detail: string;
  type?: string | undefined;
  instance?: string | undefined;
  requestId?: string | undefined;
  errors?: readonly ApiFieldError[] | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseFieldErrors(raw: unknown): ApiFieldError[] {
  if (!Array.isArray(raw)) return [];
  const result: ApiFieldError[] = [];
  for (const item of raw) {
    if (
      isRecord(item) &&
      typeof item["field"] === "string" &&
      typeof item["message"] === "string"
    ) {
      result.push({
        field: item["field"],
        code: typeof item["code"] === "string" ? item["code"] : "INVALID_VALUE",
        message: item["message"],
      });
    }
  }
  return result;
}

function defaultCodeForStatus(status: number): string {
  switch (status) {
    case 400:
      return "MALFORMED_REQUEST";
    case 401:
      return "UNAUTHENTICATED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION_FAILED";
    case 429:
      return "TOO_MANY_REQUESTS";
    default:
      return "INTERNAL_ERROR";
  }
}

/**
 * Erreur métier / technique typée dérivée de RFC 9457 (`application/problem+json`).
 * Accepte également le format `{ error: { code, details } }` du contrat v0.1 en repli.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly title: string;
  readonly detail: string;
  readonly type?: string | undefined;
  readonly instance?: string | undefined;
  readonly requestId?: string | undefined;
  readonly errors: readonly ApiFieldError[];

  constructor(options: ApiErrorOptions) {
    super(options.detail || options.title || options.code);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.title = options.title;
    this.detail = options.detail;
    this.type = options.type;
    this.instance = options.instance;
    this.requestId = options.requestId;
    this.errors = options.errors ?? [];
  }

  static fromHttpBody(status: number, body: unknown, headerRequestId?: string | null): ApiError {
    if (isRecord(body)) {
      // 1. Format RFC 9457 (Back réel EventHub)
      if (typeof body["code"] === "string" || typeof body["title"] === "string") {
        return new ApiError({
          status: typeof body["status"] === "number" ? body["status"] : status,
          code: typeof body["code"] === "string" ? body["code"] : defaultCodeForStatus(status),
          title: typeof body["title"] === "string" ? body["title"] : `HTTP ${status}`,
          detail: typeof body["detail"] === "string" ? body["detail"] : "",
          type: typeof body["type"] === "string" ? body["type"] : undefined,
          instance: typeof body["instance"] === "string" ? body["instance"] : undefined,
          requestId:
            typeof body["requestId"] === "string"
              ? body["requestId"]
              : (headerRequestId ?? undefined),
          errors: parseFieldErrors(body["errors"]),
        });
      }

      // 2. Repli compatibilité enveloppe `{ error: { code, details } }` (api-contract-v0.md §5)
      if (isRecord(body["error"])) {
        const err = body["error"];
        return new ApiError({
          status: typeof err["status"] === "number" ? err["status"] : status,
          code: typeof err["code"] === "string" ? err["code"] : defaultCodeForStatus(status),
          title: typeof err["code"] === "string" ? err["code"] : `HTTP ${status}`,
          detail: typeof err["message"] === "string" ? err["message"] : "",
          requestId:
            typeof err["requestId"] === "string"
              ? err["requestId"]
              : (headerRequestId ?? undefined),
          errors: parseFieldErrors(err["details"]),
        });
      }
    }

    return new ApiError({
      status,
      code: defaultCodeForStatus(status),
      title: `HTTP ${status}`,
      detail: "Unexpected error response.",
      requestId: headerRequestId ?? undefined,
    });
  }

  static network(cause?: unknown): ApiError {
    return new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      title: "Network error",
      detail: cause instanceof Error ? cause.message : "Unable to reach API server.",
    });
  }

  static timeout(): ApiError {
    return new ApiError({
      status: 0,
      code: "TIMEOUT",
      title: "Request timeout",
      detail: "The request timed out before receiving a response.",
    });
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
