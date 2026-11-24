import { ApiError } from "./errors";

export interface HttpClientConfig {
  getToken: () => string | null;
  onUnauthorized?: () => void | Promise<void>;
}

let clientConfig: HttpClientConfig = {
  getToken: () => null,
};

export function configureHttpClient(config: Partial<HttpClientConfig>): void {
  clientConfig = { ...clientConfig, ...config };
}

export function getApiBaseUrl(): string {
  return process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "/api";
}

export function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export interface HttpRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fullPath = `${base}${cleanPath}`;

  if (!query) return fullPath;
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `${fullPath}?${qs}` : fullPath;
}

async function safeParseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Couche HTTP unique (seul fichier autorisé par ESLint à appeler `fetch`).
 * Centralise : base URL, Bearer token, X-Request-Id, Idempotency-Key, timeout,
 * nouvelle tentative sur GET, gestion 401 et conversion RFC 9457 -> ApiError.
 */
export async function http<TResponse>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<TResponse> {
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? 10_000;
  const maxRetries = method === "GET" ? (options.retries ?? 1) : 0;
  const url = buildUrl(path, options.query);

  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("timeout"), timeoutMs);

    const onExternalAbort = () => controller.abort("aborted");
    if (options.signal) {
      if (options.signal.aborted) {
        clearTimeout(timeoutId);
        throw ApiError.network(new Error("Request aborted"));
      }
      options.signal.addEventListener("abort", onExternalAbort, { once: true });
    }

    const headers: Record<string, string> = {
      Accept: "application/json, application/problem+json",
      "X-Request-Id": `cli_${generateUuid()}`,
      ...options.headers,
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const token = clientConfig.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (options.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      options.signal?.removeEventListener("abort", onExternalAbort);

      if (response.status === 401) {
        await clientConfig.onUnauthorized?.();
      }

      if (!response.ok) {
        const errorBody = await safeParseJson(response);
        const apiError = ApiError.fromHttpBody(
          response.status,
          errorBody,
          response.headers.get("X-Request-Id"),
        );

        if (attempt < maxRetries && response.status >= 500) {
          attempt += 1;
          await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
          continue;
        }
        throw apiError;
      }

      if (response.status === 204) {
        return undefined as TResponse;
      }

      return (await safeParseJson(response)) as TResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      options.signal?.removeEventListener("abort", onExternalAbort);

      if (error instanceof ApiError) {
        throw error;
      }

      if (controller.signal.aborted && controller.signal.reason === "timeout") {
        if (attempt < maxRetries) {
          attempt += 1;
          continue;
        }
        throw ApiError.timeout();
      }

      if (attempt < maxRetries && !options.signal?.aborted) {
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
        continue;
      }

      throw ApiError.network(error);
    }
  }
}
