import { delay, http, HttpResponse } from "msw";
import {
  MOCK_EVENTS,
  MOCK_EVENT_LIST_RESPONSE,
  MOCK_MY_REGISTRATIONS_RESPONSE,
} from "./fixtures";

/**
 * Handlers MSW v2 utilisés dans Storybook et les tests de composants connectés.
 */
export const defaultHandlers = [
  http.get("*/api/events", async ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const category = url.searchParams.get("category");
    const allowedCategories = category ? new Set(category.split(",")) : null;

    const filtered = MOCK_EVENTS.filter((event) => {
      if (event.status !== "PUBLISHED") return false;
      if (allowedCategories && !allowedCategories.has(event.category)) return false;
      if (q) {
        const haystack = `${event.title} ${event.description} ${event.location}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    await delay(120);
    return HttpResponse.json({
      data: filtered,
      meta: {
        page: Number(url.searchParams.get("page") ?? "1"),
        pageSize: Number(url.searchParams.get("pageSize") ?? "9"),
        totalItems: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / 9)),
      },
    });
  }),

  http.get("*/api/events/:id", async ({ params }) => {
    await delay(100);
    const found = MOCK_EVENTS.find((event) => event.id === params["id"]);
    if (!found) {
      return HttpResponse.json(
        {
          type: "/problems/not-found",
          title: "Resource not found",
          status: 404,
          detail: "Event not found.",
          instance: `/api/events/${String(params["id"])}`,
          code: "NOT_FOUND",
          requestId: "req_msw_not_found",
        },
        { status: 404, headers: { "Content-Type": "application/problem+json" } },
      );
    }
    return HttpResponse.json({ data: found });
  }),

  http.post("*/api/events/:id/registrations", async ({ params, request }) => {
    await delay(150);
    const body = (await request.json()) as { email?: string; participantName?: string };
    const event = MOCK_EVENTS.find((item) => item.id === params["id"]);

    if (event?.status === "CANCELLED") {
      return HttpResponse.json(
        {
          type: "/problems/registration-closed",
          title: "Registration closed",
          status: 422,
          detail: "Registrations are closed for this event.",
          instance: `/api/events/${event.id}/registrations`,
          code: "REGISTRATION_CLOSED",
          requestId: "req_msw_reg_closed",
        },
        { status: 422, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    if (event && event.remainingSeats <= 0) {
      return HttpResponse.json(
        {
          type: "/problems/event-full",
          title: "Event is full",
          status: 409,
          detail: "No remaining seats.",
          instance: `/api/events/${event.id}/registrations`,
          code: "EVENT_FULL",
          requestId: "req_msw_event_full",
        },
        { status: 409, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    if (body.email === "already@example.com") {
      return HttpResponse.json(
        {
          type: "/problems/already-registered",
          title: "Already registered",
          status: 409,
          detail: "Participant is already registered.",
          instance: `/api/events/${String(params["id"])}/registrations`,
          code: "ALREADY_REGISTERED",
          requestId: "req_msw_already_reg",
        },
        { status: 409, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    return HttpResponse.json(
      {
        data: {
          id: "00000000-0000-4000-8300-000000000099",
          eventId: String(params["id"]),
          status: "CONFIRMED",
          position: null,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),

  http.get("*/api/me/registrations", async () => {
    await delay(120);
    return HttpResponse.json(MOCK_MY_REGISTRATIONS_RESPONSE);
  }),

  http.delete("*/api/events/:id/registrations/me", async () => {
    await delay(150);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("*/api/auth/register", async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      displayName?: string;
    };

    if (body.email === "ada@example.com") {
      return HttpResponse.json(
        {
          type: "/problems/email-already-used",
          title: "Email already used",
          status: 409,
          detail: "An account with this email already exists.",
          instance: "/api/auth/register",
          code: "EMAIL_ALREADY_USED",
          requestId: "req_msw_email_used",
        },
        { status: 409, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    return HttpResponse.json(
      {
        data: {
          id: "00000000-0000-4000-8100-000000000099",
          email: body.email ?? "new@example.com",
          displayName: body.displayName ?? "Nouveau membre",
          role: "PARTICIPANT",
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),
];

export const emptyEventsHandler = http.get("*/api/events", async () => {
  await delay(100);
  return HttpResponse.json({
    data: [],
    meta: { page: 1, pageSize: 9, totalItems: 0, totalPages: 0 },
  });
});

export const errorEventsHandler = http.get("*/api/events", async () => {
  await delay(100);
  return HttpResponse.json(
    {
      type: "/problems/internal-error",
      title: "Internal server error",
      status: 500,
      detail: "Unexpected server failure.",
      instance: "/api/events",
      code: "INTERNAL_ERROR",
      requestId: "req_msw_500_demo",
    },
    { status: 500, headers: { "Content-Type": "application/problem+json" } },
  );
});

export const listSuccessHandler = http.get("*/api/events", async () => {
  await delay(100);
  return HttpResponse.json(MOCK_EVENT_LIST_RESPONSE);
});

export const myRegistrationsSuccessHandler = http.get("*/api/me/registrations", async () => {
  await delay(100);
  return HttpResponse.json(MOCK_MY_REGISTRATIONS_RESPONSE);
});

export const myRegistrationsEmptyHandler = http.get("*/api/me/registrations", async () => {
  await delay(100);
  return HttpResponse.json({ data: [] });
});

export const myRegistrationsErrorHandler = http.get("*/api/me/registrations", async () => {
  await delay(100);
  return HttpResponse.json(
    {
      type: "/problems/internal-error",
      title: "Internal server error",
      status: 500,
      detail: "Unable to load registrations.",
      instance: "/api/me/registrations",
      code: "INTERNAL_ERROR",
      requestId: "req_msw_my_reg_500",
    },
    { status: 500, headers: { "Content-Type": "application/problem+json" } },
  );
});

export const cancelRegistrationSuccessHandler = http.delete(
  "*/api/events/:id/registrations/me",
  async () => {
    await delay(120);
    return new HttpResponse(null, { status: 204 });
  },
);
