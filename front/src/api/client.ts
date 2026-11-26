import type { components, operations } from "./generated/schema";
import { generateUuid, http } from "./http";

// Types dérivés directement du contrat OpenAPI généré (`src/api/generated/schema.d.ts`)
export type EventCategory = components["schemas"]["EventCategory"];
export type EventStatus = components["schemas"]["EventStatus"];
export type UserRole = components["schemas"]["UserRole"];
export type RegistrationStatus = components["schemas"]["RegistrationStatus"];
export type OrganizerSummary = components["schemas"]["OrganizerSummary"];
export type EventItem = components["schemas"]["Event"];
export type PaginationMeta = components["schemas"]["PaginationMeta"];
export type EventListResponse = components["schemas"]["EventListResponse"];
export type EventResponse = components["schemas"]["EventResponse"];
export type CreateRegistrationDto = components["schemas"]["CreateRegistrationRequest"];
export type Registration = components["schemas"]["Registration"];
export type RegistrationResponse = components["schemas"]["RegistrationResponse"];
export type MyRegistrationEventSummary = components["schemas"]["MyRegistrationEventSummary"];
export type MyRegistrationItem = components["schemas"]["MyRegistrationItem"];
export type MyRegistrationsResponse = components["schemas"]["MyRegistrationsResponse"];
export type RegisterAccountDto = components["schemas"]["RegisterAccountRequest"];
export type User = components["schemas"]["User"];
export type UserResponse = components["schemas"]["UserResponse"];
export type ErrorCode = components["schemas"]["ErrorCode"];
export type ProblemDetails = components["schemas"]["Problem"];

export type EventSort = NonNullable<
  NonNullable<operations["listEvents"]["parameters"]["query"]>["sort"]
>;

export type EventListQuery = NonNullable<operations["listEvents"]["parameters"]["query"]>;

export type MyEventListQuery = NonNullable<operations["listMyEvents"]["parameters"]["query"]>;

export interface MutationOptions {
  idempotencyKey?: string;
  preferExample?: string;
}

/**
 * Client d'API typé dont les méthodes reprennent exactement les `operationId` de la spec OpenAPI.
 */
export const api = {
  /** E1 — GET /events (operationId: listEvents) */
  listEvents(query: EventListQuery = {}, signal?: AbortSignal): Promise<EventListResponse> {
    return http<EventListResponse>("/events", {
      method: "GET",
      query: {
        page: query.page,
        pageSize: query.pageSize,
        from: query.from,
        to: query.to,
        category: query.category,
        q: query.q,
        sort: query.sort,
      },
      signal,
    });
  },

  /** E2 — GET /events/{id} (operationId: getEvent) */
  getEvent(id: string, signal?: AbortSignal): Promise<EventResponse> {
    return http<EventResponse>(`/events/${encodeURIComponent(id)}`, {
      method: "GET",
      signal,
    });
  },

  /** E3 (US05) — GET /me/events (operationId: listMyEvents) */
  listMyEvents(query: MyEventListQuery = {}, signal?: AbortSignal): Promise<EventListResponse> {
    return http<EventListResponse>("/me/events", {
      method: "GET",
      query: {
        page: query.page,
        pageSize: query.pageSize,
        status: query.status,
        sort: query.sort,
      },
      signal,
    });
  },

  /** E6 (US06) — POST /events/{id}/publish (operationId: publishEvent) */
  publishEvent(eventId: string, options: MutationOptions = {}): Promise<EventResponse> {
    const headers: Record<string, string> = {};
    if (options.preferExample) {
      headers["Prefer"] = `example=${options.preferExample}`;
    }
    return http<EventResponse>(`/events/${encodeURIComponent(eventId)}/publish`, {
      method: "POST",
      idempotencyKey: options.idempotencyKey ?? generateUuid(),
      headers,
    });
  },

  /** E7 (US08) — POST /events/{id}/cancel (operationId: cancelEvent) */
  cancelEvent(eventId: string, options: MutationOptions = {}): Promise<EventResponse> {
    const headers: Record<string, string> = {};
    if (options.preferExample) {
      headers["Prefer"] = `example=${options.preferExample}`;
    }
    return http<EventResponse>(`/events/${encodeURIComponent(eventId)}/cancel`, {
      method: "POST",
      idempotencyKey: options.idempotencyKey ?? generateUuid(),
      headers,
    });
  },

  /** US26 — POST /events/{id}/duplicate (operationId: duplicateEvent) */
  duplicateEvent(eventId: string, options: MutationOptions = {}): Promise<EventResponse> {
    const headers: Record<string, string> = {};
    if (options.preferExample) {
      headers["Prefer"] = `example=${options.preferExample}`;
    }
    return http<EventResponse>(`/events/${encodeURIComponent(eventId)}/duplicate`, {
      method: "POST",
      idempotencyKey: options.idempotencyKey ?? generateUuid(),
      headers,
    });
  },

  /** US11 — POST /events/{id}/registrations (operationId: registerToEvent) */
  registerToEvent(
    eventId: string,
    dto: CreateRegistrationDto,
    options: MutationOptions = {},
  ): Promise<RegistrationResponse> {
    const headers: Record<string, string> = {};
    if (options.preferExample) {
      headers["Prefer"] = `example=${options.preferExample}`;
    }
    return http<RegistrationResponse>(`/events/${encodeURIComponent(eventId)}/registrations`, {
      method: "POST",
      body: dto,
      idempotencyKey: options.idempotencyKey ?? generateUuid(),
      headers,
    });
  },

  /** US13 — DELETE /events/{id}/registrations/me (operationId: cancelMyRegistration) */
  cancelMyRegistration(eventId: string): Promise<void> {
    return http<void>(`/events/${encodeURIComponent(eventId)}/registrations/me`, {
      method: "DELETE",
    });
  },

  /** US14 — GET /me/registrations (operationId: listMyRegistrations) */
  listMyRegistrations(signal?: AbortSignal): Promise<MyRegistrationsResponse> {
    return http<MyRegistrationsResponse>("/me/registrations", {
      method: "GET",
      signal,
    });
  },

  /** A1 (US01) — POST /auth/register (operationId: registerAccount) */
  registerAccount(
    dto: RegisterAccountDto,
    options: MutationOptions = {},
  ): Promise<UserResponse> {
    const headers: Record<string, string> = {};
    if (options.preferExample) {
      headers["Prefer"] = `example=${options.preferExample}`;
    }
    return http<UserResponse>("/auth/register", {
      method: "POST",
      body: dto,
      idempotencyKey: options.idempotencyKey ?? generateUuid(),
      headers,
    });
  },
};
