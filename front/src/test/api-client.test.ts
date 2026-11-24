import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import { configureHttpClient } from "@/api/http";
import {
  DEFAULT_FILTERS,
  parseFiltersFromSearchParams,
  toApiEventQuery,
} from "@/hooks/useEventFilters";

describe("API Client & RFC 9457 error handling", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    configureHttpClient({ getToken: () => null, onUnauthorized: undefined });
  });

  it("envoie Authorization, X-Request-Id et Idempotency-Key sur les mutations", async () => {
    configureHttpClient({ getToken: () => "jwt-token-123" });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "00000000-0000-4000-8300-000000000099",
            eventId: "00000000-0000-4000-8200-000000000001",
            status: "CONFIRMED",
            position: null,
            createdAt: "2026-11-23T14:30:00.000Z",
          },
        }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      ),
    );

    await api.registerToEvent(
      "00000000-0000-4000-8200-000000000001",
      { participantName: "Ada", email: "ada@example.com" },
      { idempotencyKey: "idem-key-1" },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer jwt-token-123");
    expect(headers["Idempotency-Key"]).toBe("idem-key-1");
    expect(headers["X-Request-Id"]).toMatch(/^cli_/);
  });

  it("convertit une réponse RFC 9457 422 en ApiError typée avec champs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          type: "/problems/validation-failed",
          title: "Validation failed",
          status: 422,
          detail: "Request validation failed.",
          instance: "/api/auth/register",
          code: "VALIDATION_FAILED",
          requestId: "req_abc123",
          errors: [
            { field: "password", code: "MIN_LENGTH", message: "12 chars minimum" },
          ],
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/problem+json" },
        },
      ),
    );

    await expect(
      api.registerAccount({
        displayName: "Ada",
        email: "ada@example.com",
        password: "short",
      }),
    ).rejects.toMatchObject({
      status: 422,
      code: "VALIDATION_FAILED",
      requestId: "req_abc123",
      errors: [{ field: "password", code: "MIN_LENGTH", message: "12 chars minimum" }],
    });
  });

  it("déclenche onUnauthorized lors d'une réponse 401", async () => {
    const onUnauthorized = vi.fn();
    configureHttpClient({ onUnauthorized });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          type: "/problems/unauthenticated",
          title: "Authentication required",
          status: 401,
          detail: "Token expired",
          instance: "/api/events/1/registrations",
          code: "UNAUTHENTICATED",
          requestId: "req_401",
        }),
        { status: 401, headers: { "Content-Type": "application/problem+json" } },
      ),
    );

    await expect(
      api.registerToEvent("1", { participantName: "Ada", email: "ada@example.com" }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("supporte également le format legacy { error: { code, details } } du contrat v0.1", () => {
    const error = ApiError.fromHttpBody(422, {
      error: {
        code: "VALIDATION_FAILED",
        message: "Request validation failed.",
        status: 422,
        details: [{ field: "email", code: "INVALID_FORMAT", message: "Bad email" }],
        requestId: "req_legacy_1",
      },
    });

    expect(error.code).toBe("VALIDATION_FAILED");
    expect(error.requestId).toBe("req_legacy_1");
    expect(error.errors).toHaveLength(1);
    expect(error.errors[0]?.field).toBe("email");
  });
});

describe("URL filters <-> OpenAPI query mapping", () => {
  it("parse les paramètres URL valides et ignore les catégories inconnues", () => {
    const params = new URLSearchParams(
      "q=TypeScript&category=WORKSHOP,INVALID,CONCERT&sort=-startsAt&page=2&dates=month",
    );
    const parsed = parseFiltersFromSearchParams(params);
    expect(parsed).toEqual({
      q: "TypeScript",
      categories: ["WORKSHOP", "CONCERT"],
      datePreset: "month",
      sort: "-startsAt",
      page: 2,
      pageSize: 9,
    });
  });

  it("n'envoie pas q à l'API si sa longueur est inférieure à 2 caractères", () => {
    const query = toApiEventQuery({ ...DEFAULT_FILTERS, q: "a" });
    expect(query.q).toBeUndefined();
  });

  it("envoie from dans le passé lorsque le preset 'all' est choisi", () => {
    const query = toApiEventQuery({ ...DEFAULT_FILTERS, datePreset: "all" });
    expect(query.from).toBe("2020-01-01T00:00:00Z");
  });
});
