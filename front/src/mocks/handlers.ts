import { delay, http, HttpResponse } from "msw";
import type { EventItem, EventSort } from "@/api/client";
import {
  MOCK_EVENTS,
  MOCK_EVENT_LIST_RESPONSE,
  MOCK_MY_REGISTRATIONS_RESPONSE,
  MOCK_ORGANIZER_EVENTS,
} from "./fixtures";

function sortOrganizerEvents(items: readonly EventItem[], sort: EventSort): EventItem[] {
  const copy = [...items];
  copy.sort((a, b) => {
    switch (sort) {
      case "startsAt":
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      case "-startsAt":
        return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
      case "createdAt":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "-createdAt":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "title":
        return a.title.localeCompare(b.title, "fr");
      case "-title":
        return b.title.localeCompare(a.title, "fr");
    }
  });
  return copy;
}

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

  http.get("*/api/me/events", async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const allowedStatuses = statusParam ? new Set(statusParam.split(",")) : null;
    const rawSort = (url.searchParams.get("sort") ?? "-startsAt") as EventSort;
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
    const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? "10"));

    const filtered = MOCK_ORGANIZER_EVENTS.filter((event) =>
      allowedStatuses ? allowedStatuses.has(event.status) : true,
    );
    const sorted = sortOrganizerEvents(filtered, rawSort);
    const startIndex = (page - 1) * pageSize;
    const sliced = sorted.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      data: sliced,
      meta: {
        page,
        pageSize,
        totalItems: sorted.length,
        totalPages: sorted.length === 0 ? 0 : Math.ceil(sorted.length / pageSize),
      },
    });
  }),

  http.post("*/api/events/:id/publish", async ({ params }) => {
    await delay(140);
    const id = String(params["id"]);
    const found =
      MOCK_ORGANIZER_EVENTS.find((item) => item.id === id) ??
      MOCK_EVENTS.find((item) => item.id === id);

    if (!found) {
      return HttpResponse.json(
        {
          type: "/problems/not-found",
          title: "Resource not found",
          status: 404,
          detail: "Event not found.",
          instance: `/api/events/${id}/publish`,
          code: "NOT_FOUND",
          requestId: "req_msw_publish_404",
        },
        { status: 404, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    if (found.status !== "DRAFT") {
      return HttpResponse.json(
        {
          type: "/problems/invalid-state-transition",
          title: "Invalid state transition",
          status: 409,
          detail: "Only DRAFT events can be published.",
          instance: `/api/events/${id}/publish`,
          code: "INVALID_STATE_TRANSITION",
          requestId: "req_msw_publish_409",
        },
        { status: 409, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    return HttpResponse.json({
      data: {
        ...found,
        status: "PUBLISHED",
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.post("*/api/events/:id/cancel", async ({ params }) => {
    await delay(140);
    const id = String(params["id"]);
    const found =
      MOCK_ORGANIZER_EVENTS.find((item) => item.id === id) ??
      MOCK_EVENTS.find((item) => item.id === id);

    if (!found) {
      return HttpResponse.json(
        {
          type: "/problems/not-found",
          title: "Resource not found",
          status: 404,
          detail: "Event not found.",
          instance: `/api/events/${id}/cancel`,
          code: "NOT_FOUND",
          requestId: "req_msw_cancel_404",
        },
        { status: 404, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    return HttpResponse.json({
      data: {
        ...found,
        status: "CANCELLED",
        confirmedCount: 0,
        remainingSeats: found.capacity,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  http.post("*/api/events/:id/duplicate", async ({ params }) => {
    await delay(140);
    const id = String(params["id"]);
    const found =
      MOCK_ORGANIZER_EVENTS.find((item) => item.id === id) ??
      MOCK_EVENTS.find((item) => item.id === id);

    if (!found) {
      return HttpResponse.json(
        {
          type: "/problems/not-found",
          title: "Resource not found",
          status: 404,
          detail: "Event not found.",
          instance: `/api/events/${id}/duplicate`,
          code: "NOT_FOUND",
          requestId: "req_msw_dup_404",
        },
        { status: 404, headers: { "Content-Type": "application/problem+json" } },
      );
    }

    const nowIso = new Date().toISOString();
    return HttpResponse.json(
      {
        data: {
          ...found,
          id: "00000000-0000-4000-8200-000000000098",
          title: `${found.title} (copie)`,
          status: "DRAFT",
          confirmedCount: 0,
          remainingSeats: found.capacity,
          waitlistCount: 0,
          createdAt: nowIso,
          updatedAt: nowIso,
        },
      },
      { status: 201 },
    );
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

export const myEventsSuccessHandler = http.get("*/api/me/events", async ({ request }) => {
  await delay(100);
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const allowedStatuses = statusParam ? new Set(statusParam.split(",")) : null;
  const rawSort = (url.searchParams.get("sort") ?? "-startsAt") as EventSort;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? "10"));

  const filtered = MOCK_ORGANIZER_EVENTS.filter((event) =>
    allowedStatuses ? allowedStatuses.has(event.status) : true,
  );
  const sorted = sortOrganizerEvents(filtered, rawSort);
  const startIndex = (page - 1) * pageSize;
  const sliced = sorted.slice(startIndex, startIndex + pageSize);

  return HttpResponse.json({
    data: sliced,
    meta: {
      page,
      pageSize,
      totalItems: sorted.length,
      totalPages: sorted.length === 0 ? 0 : Math.ceil(sorted.length / pageSize),
    },
  });
});

export const myEventsEmptyHandler = http.get("*/api/me/events", async () => {
  await delay(100);
  return HttpResponse.json({
    data: [],
    meta: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
  });
});

export const myEventsErrorHandler = http.get("*/api/me/events", async () => {
  await delay(100);
  return HttpResponse.json(
    {
      type: "/problems/internal-error",
      title: "Internal server error",
      status: 500,
      detail: "Unable to load organizer events.",
      instance: "/api/me/events",
      code: "INTERNAL_ERROR",
      requestId: "req_msw_my_events_500",
    },
    { status: 500, headers: { "Content-Type": "application/problem+json" } },
  );
});

export const publishEventPastDateHandler = http.post(
  "*/api/events/:id/publish",
  async ({ params }) => {
    await delay(120);
    return HttpResponse.json(
      {
        type: "/problems/validation-failed",
        title: "Validation failed",
        status: 422,
        detail: "Event start date must be in the future.",
        instance: `/api/events/${String(params["id"])}/publish`,
        code: "VALIDATION_FAILED",
        requestId: "req_msw_publish_422",
        errors: [
          {
            field: "startsAt",
            code: "PAST_DATE",
            message: "startsAt must be in the future.",
          },
        ],
      },
      { status: 422, headers: { "Content-Type": "application/problem+json" } },
    );
  },
);

export const publishEventConflictHandler = http.post(
  "*/api/events/:id/publish",
  async ({ params }) => {
    await delay(120);
    return HttpResponse.json(
      {
        type: "/problems/invalid-state-transition",
        title: "Invalid state transition",
        status: 409,
        detail: "Only DRAFT events can be published.",
        instance: `/api/events/${String(params["id"])}/publish`,
        code: "INVALID_STATE_TRANSITION",
        requestId: "req_msw_publish_409",
      },
      { status: 409, headers: { "Content-Type": "application/problem+json" } },
    );
  },
);
