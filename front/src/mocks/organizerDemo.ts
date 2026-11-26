import type { EventItem, OrganizerSummary, RegistrationStatus } from "@/api/client";
import { ApiError } from "@/api/errors";
import { generateUuid } from "@/api/http";
import type { EventFormValues } from "@/hooks/useSaveEvent";

type EventRegistrantStatus = Exclude<RegistrationStatus, "CANCELLED">;

export interface EventRegistrant {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly status: EventRegistrantStatus;
  readonly position: number | null;
  readonly createdAt: string;
}

const GRACE: OrganizerSummary = {
  id: "00000000-0000-4000-8100-000000000001",
  displayName: "Grace",
};

const ALAN: OrganizerSummary = {
  id: "00000000-0000-4000-8100-000000000002",
  displayName: "Alan",
};

export const DEMO_TYPESCRIPT_WORKSHOP: EventItem = {
  id: "00000000-0000-4000-8200-000000000001",
  title: "TypeScript Workshop",
  description:
    "Hands-on session : configuration du compilateur, types utilitaires, génériques et narrowing. Apportez votre ordinateur avec Node.js 20+ installé.",
  category: "WORKSHOP",
  location: "Hub Central, 12 rue de la République, Lyon",
  startsAt: "2026-12-10T18:00:00.000Z",
  endsAt: "2026-12-10T21:00:00.000Z",
  capacity: 30,
  confirmedCount: 18,
  remainingSeats: 12,
  waitlistCount: 4,
  status: "PUBLISHED",
  organizer: GRACE,
  createdAt: "2026-11-16T09:05:00.000Z",
  updatedAt: "2026-11-16T09:05:00.000Z",
};

const DEMO_DRAFT_EVENT: EventItem = {
  id: "00000000-0000-4000-8200-000000000014",
  title: "Conférence Accessibilité Web",
  description: "Bonnes pratiques WCAG 2.2 AA, navigation clavier et lecteurs d'écran.",
  category: "CONFERENCE",
  location: "Amphithéâtre Ynov, Lyon 7e",
  startsAt: "2026-12-15T08:00:00.000Z",
  endsAt: "2026-12-15T12:00:00.000Z",
  capacity: 50,
  confirmedCount: 0,
  remainingSeats: 50,
  waitlistCount: 0,
  status: "DRAFT",
  organizer: GRACE,
  createdAt: "2026-11-24T10:00:00.000Z",
  updatedAt: "2026-11-24T10:00:00.000Z",
};

export const DEMO_EMPTY_EVENT: EventItem = {
  id: "00000000-0000-4000-8200-000000000005",
  title: "Meetup Node.js Lyon",
  description: "Deux talks courts puis échanges autour d'un verre.",
  category: "OTHER",
  location: "Espace coworking, Lyon 7e",
  startsAt: "2026-12-18T17:30:00.000Z",
  endsAt: "2026-12-18T20:00:00.000Z",
  capacity: 50,
  confirmedCount: 0,
  remainingSeats: 50,
  waitlistCount: 0,
  status: "PUBLISHED",
  organizer: GRACE,
  createdAt: "2026-11-16T09:05:00.000Z",
  updatedAt: "2026-11-16T09:05:00.000Z",
};

export const DEMO_CANCELLED_EVENT: EventItem = {
  id: "00000000-0000-4000-8200-000000000015",
  title: "Atelier Figma",
  description: "Atelier annulé.",
  category: "WORKSHOP",
  location: "Campus Ynov, Lyon",
  startsAt: "2026-09-14T12:00:00.000Z",
  endsAt: "2026-09-14T15:00:00.000Z",
  capacity: 20,
  confirmedCount: 0,
  remainingSeats: 20,
  waitlistCount: 0,
  status: "CANCELLED",
  organizer: GRACE,
  createdAt: "2026-09-01T09:00:00.000Z",
  updatedAt: "2026-09-10T09:00:00.000Z",
};

const DEMO_OTHER_ORGANIZER_EVENT: EventItem = {
  id: "00000000-0000-4000-8200-000000000003",
  title: "Jazz au parc",
  description: "Concert en plein air.",
  category: "CONCERT",
  location: "Kiosque du parc, Lyon 6e",
  startsAt: "2026-12-12T19:30:00.000Z",
  endsAt: "2026-12-12T22:30:00.000Z",
  capacity: 80,
  confirmedCount: 80,
  remainingSeats: 0,
  waitlistCount: 0,
  status: "PUBLISHED",
  organizer: ALAN,
  createdAt: "2026-11-10T09:00:00.000Z",
  updatedAt: "2026-11-10T09:00:00.000Z",
};

const REGISTRANT_PEOPLE: readonly [string, string, EventRegistrantStatus, string][] = [
  ["Ada Lovelace", "ada@example.com", "CONFIRMED", "2026-11-20T09:12:00.000Z"],
  ["Alan Turing", "alan@example.com", "CONFIRMED", "2026-11-20T10:40:00.000Z"],
  ["Grace Hopper", "grace@example.com", "CONFIRMED", "2026-11-21T08:05:00.000Z"],
  ["Linus Torvalds", "linus@example.com", "CONFIRMED", "2026-11-21T16:22:00.000Z"],
  ["Margaret Hamilton", "margaret@example.com", "WAITLISTED", "2026-11-22T07:03:00.000Z"],
  ["Katherine Johnson", "katherine@example.com", "WAITLISTED", "2026-11-22T13:47:00.000Z"],
  ["Barbara Liskov", "barbara@example.com", "CONFIRMED", "2026-11-22T15:10:00.000Z"],
  ["Donald Knuth", "donald@example.com", "CONFIRMED", "2026-11-22T16:31:00.000Z"],
  ["Edsger Dijkstra", "edsger@example.com", "CONFIRMED", "2026-11-22T17:02:00.000Z"],
  ["Frances Allen", "frances@example.com", "CONFIRMED", "2026-11-22T18:45:00.000Z"],
  ["Hedy Lamarr", "hedy@example.com", "CONFIRMED", "2026-11-23T08:20:00.000Z"],
  ["John von Neumann", "john@example.com", "CONFIRMED", "2026-11-23T09:14:00.000Z"],
  ["Ken Thompson", "ken@example.com", "CONFIRMED", "2026-11-23T10:05:00.000Z"],
  ["Dennis Ritchie", "dennis@example.com", "CONFIRMED", "2026-11-23T11:37:00.000Z"],
  ["Radia Perlman", "radia@example.com", "CONFIRMED", "2026-11-23T13:58:00.000Z"],
  ["Tim Berners-Lee", "tim@example.com", "CONFIRMED", "2026-11-23T15:26:00.000Z"],
  ["Annie Easley", "annie@example.com", "CONFIRMED", "2026-11-24T08:44:00.000Z"],
  ["Shafi Goldwasser", "shafi@example.com", "CONFIRMED", "2026-11-24T09:51:00.000Z"],
  ["Guido van Rossum", "guido@example.com", "CONFIRMED", "2026-11-24T11:09:00.000Z"],
  ["Brendan Eich", "brendan@example.com", "CONFIRMED", "2026-11-24T14:33:00.000Z"],
  ["Adele Goldberg", "adele@example.com", "WAITLISTED", "2026-11-24T16:18:00.000Z"],
  ["Bjarne Stroustrup", "bjarne@example.com", "WAITLISTED", "2026-11-24T17:40:00.000Z"],
];

function buildRegistrants(): EventRegistrant[] {
  let waitlistPosition = 0;
  return REGISTRANT_PEOPLE.map(([displayName, email, status, createdAt], index) => {
    if (status === "WAITLISTED") waitlistPosition += 1;
    return {
      id: `00000000-0000-4000-8300-${String(index + 1).padStart(12, "0")}`,
      displayName,
      email,
      status,
      position: status === "WAITLISTED" ? waitlistPosition : null,
      createdAt,
    };
  });
}

export const DEMO_REGISTRANTS: readonly EventRegistrant[] = buildRegistrants();

const eventsStore = new Map<string, EventItem>(
  [
    DEMO_TYPESCRIPT_WORKSHOP,
    DEMO_DRAFT_EVENT,
    DEMO_EMPTY_EVENT,
    DEMO_CANCELLED_EVENT,
    DEMO_OTHER_ORGANIZER_EVENT,
  ].map((event) => [event.id, event]),
);

const registrantsStore = new Map<string, readonly EventRegistrant[]>([
  [DEMO_TYPESCRIPT_WORKSHOP.id, DEMO_REGISTRANTS],
]);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function notFound(id: string): ApiError {
  return new ApiError({
    status: 404,
    code: "NOT_FOUND",
    title: "Resource not found",
    detail: `Event ${id} not found.`,
  });
}

export async function fetchDemoOrganizerEvent(id: string): Promise<EventItem> {
  await wait(250);
  const event = eventsStore.get(id);
  if (!event) throw notFound(id);
  return event;
}

export async function fetchDemoEventRegistrants(id: string): Promise<readonly EventRegistrant[]> {
  await wait(250);
  if (!eventsStore.has(id)) throw notFound(id);
  return registrantsStore.get(id) ?? [];
}

export async function saveDemoOrganizerEvent(
  id: string | undefined,
  values: EventFormValues,
  organizer: OrganizerSummary,
): Promise<EventItem> {
  await wait(600);
  const existing = id ? eventsStore.get(id) : undefined;
  if (id && !existing) throw notFound(id);
  const now = new Date().toISOString();
  const confirmedCount = existing?.confirmedCount ?? 0;
  const saved: EventItem = {
    id: existing?.id ?? generateUuid(),
    ...values,
    confirmedCount,
    remainingSeats: Math.max(values.capacity - confirmedCount, 0),
    waitlistCount: existing?.waitlistCount ?? 0,
    status: existing?.status ?? "DRAFT",
    organizer: existing?.organizer ?? organizer,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  eventsStore.set(saved.id, saved);
  return saved;
}
