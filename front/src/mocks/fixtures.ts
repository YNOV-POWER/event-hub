import type {
  EventItem,
  EventListResponse,
  MyRegistrationItem,
  MyRegistrationsResponse,
} from "@/api/client";

/**
 * Jeux de données alignés sur `back/prisma/seed.ts` (UUIDs déterministes et catégories du contrat).
 * Réutilisés dans les stories Storybook, les handlers MSW et les tests Vitest.
 */
export const MOCK_EVENTS: readonly EventItem[] = [
  {
    id: "00000000-0000-4000-8200-000000000001",
    title: "TypeScript Workshop",
    description:
      "Hands-on session: strict typing, generics and narrowing on a real codebase.",
    category: "WORKSHOP",
    location: "Hub Central, 12 rue de la République, Lyon",
    startsAt: "2026-12-10T17:00:00.000Z",
    endsAt: "2026-12-10T20:00:00.000Z",
    capacity: 30,
    confirmedCount: 18,
    remainingSeats: 12,
    status: "PUBLISHED",
    organizer: {
      id: "00000000-0000-4000-8100-000000000001",
      displayName: "Grace",
    },
    createdAt: "2026-11-16T09:05:00.000Z",
    updatedAt: "2026-11-16T09:05:00.000Z",
  },
  {
    id: "00000000-0000-4000-8200-000000000003",
    title: "Jazz au parc",
    description: "Trio acoustique en plein air. Places limitées.",
    category: "CONCERT",
    location: "Kiosque du parc, Lyon 6e",
    startsAt: "2026-12-12T19:00:00.000Z",
    endsAt: "2026-12-12T21:00:00.000Z",
    capacity: 3,
    confirmedCount: 3,
    remainingSeats: 0,
    status: "PUBLISHED",
    organizer: {
      id: "00000000-0000-4000-8100-000000000002",
      displayName: "Alan",
    },
    createdAt: "2026-11-16T09:05:00.000Z",
    updatedAt: "2026-11-16T09:05:00.000Z",
  },
  {
    id: "00000000-0000-4000-8200-000000000002",
    title: "Conférence Web & Accessibilité",
    description:
      "Une journée de talks sur le RGAA, les lecteurs d'écran et le design inclusif.",
    category: "CONFERENCE",
    location: "Centre des congrès, Lyon 6e",
    startsAt: "2026-12-15T08:00:00.000Z",
    endsAt: "2026-12-15T16:00:00.000Z",
    capacity: 200,
    confirmedCount: 197,
    remainingSeats: 3,
    status: "PUBLISHED",
    organizer: {
      id: "00000000-0000-4000-8100-000000000001",
      displayName: "Grace",
    },
    createdAt: "2026-11-16T09:05:00.000Z",
    updatedAt: "2026-11-16T09:05:00.000Z",
  },
  {
    id: "00000000-0000-4000-8200-000000000005",
    title: "Meetup Node.js",
    description: "Deux talks courts puis échanges autour d'un verre.",
    category: "OTHER",
    location: "Espace coworking, Lyon 7e",
    startsAt: "2026-12-18T18:00:00.000Z",
    endsAt: "2026-12-18T20:00:00.000Z",
    capacity: 50,
    confirmedCount: 5,
    remainingSeats: 45,
    status: "PUBLISHED",
    organizer: {
      id: "00000000-0000-4000-8100-000000000001",
      displayName: "Grace",
    },
    createdAt: "2026-11-16T09:05:00.000Z",
    updatedAt: "2026-11-16T09:05:00.000Z",
  },
  {
    id: "00000000-0000-4000-8200-000000000012",
    title: "Concert d'hiver",
    description: "Annulé pour raisons techniques.",
    category: "CONCERT",
    location: "Salle des fêtes, Villeurbanne",
    startsAt: "2026-12-20T20:00:00.000Z",
    endsAt: "2026-12-20T22:00:00.000Z",
    capacity: 100,
    confirmedCount: 0,
    remainingSeats: 100,
    status: "CANCELLED",
    organizer: {
      id: "00000000-0000-4000-8100-000000000002",
      displayName: "Alan",
    },
    createdAt: "2026-11-16T09:05:00.000Z",
    updatedAt: "2026-11-16T09:05:00.000Z",
  },
];

export const OPEN_EVENT = MOCK_EVENTS[0]!;
export const FULL_EVENT = MOCK_EVENTS[1]!;
export const FEW_SEATS_EVENT = MOCK_EVENTS[2]!;
export const OTHER_EVENT = MOCK_EVENTS[3]!;
export const CANCELLED_EVENT = MOCK_EVENTS[4]!;

export const LONG_TITLE_EVENT: EventItem = {
  ...OPEN_EVENT,
  id: "00000000-0000-4000-8200-000000000099",
  title:
    "Atelier approfondi d'architecture Front/Back, contrats OpenAPI 3.1, accessibilité WCAG 2.2 AA et design systems",
};

export const MOCK_EVENT_LIST_RESPONSE: EventListResponse = {
  data: [OPEN_EVENT, FULL_EVENT, FEW_SEATS_EVENT, OTHER_EVENT],
  meta: {
    page: 1,
    pageSize: 9,
    totalItems: 4,
    totalPages: 1,
  },
};

export const MOCK_MY_REGISTRATIONS: readonly MyRegistrationItem[] = [
  {
    id: "00000000-0000-4000-8300-000000000001",
    eventId: "00000000-0000-4000-8200-000000000001",
    status: "CONFIRMED",
    position: null,
    promotedAt: null,
    createdAt: "2026-11-18T10:00:00.000Z",
    event: {
      id: "00000000-0000-4000-8200-000000000001",
      title: "TypeScript Workshop",
      description:
        "Hands-on session: strict typing, generics and narrowing on a real codebase.",
      category: "WORKSHOP",
      location: "Hub Central, Lyon",
      startsAt: "2026-12-10T18:00:00.000Z",
      endsAt: "2026-12-10T21:00:00.000Z",
      status: "PUBLISHED",
    },
  },
  {
    id: "00000000-0000-4000-8300-000000000003",
    eventId: "00000000-0000-4000-8200-000000000003",
    status: "CONFIRMED",
    position: null,
    promotedAt: "2026-11-24T16:20:00.000Z",
    createdAt: "2026-11-19T09:15:00.000Z",
    event: {
      id: "00000000-0000-4000-8200-000000000003",
      title: "Jazz au parc",
      description: "Trio acoustique en plein air. Places limitées.",
      category: "CONCERT",
      location: "Kiosque du parc, Lyon 6e",
      startsAt: "2026-12-12T19:30:00.000Z",
      endsAt: "2026-12-12T22:30:00.000Z",
      status: "PUBLISHED",
    },
  },
  {
    id: "00000000-0000-4000-8300-000000000006",
    eventId: "00000000-0000-4000-8200-000000000002",
    status: "WAITLISTED",
    position: 3,
    promotedAt: null,
    createdAt: "2026-11-20T14:00:00.000Z",
    event: {
      id: "00000000-0000-4000-8200-000000000002",
      title: "Conférence Web & Accessibilité",
      description:
        "Une journée de talks sur le RGAA, les lecteurs d'écran et le design inclusif.",
      category: "CONFERENCE",
      location: "Centre des congrès, Lyon 6e",
      startsAt: "2026-12-15T08:00:00.000Z",
      endsAt: "2026-12-15T16:00:00.000Z",
      status: "PUBLISHED",
    },
  },
  {
    id: "00000000-0000-4000-8300-000000000010",
    eventId: "00000000-0000-4000-8200-000000000013",
    status: "CONFIRMED",
    position: null,
    promotedAt: null,
    createdAt: "2026-09-20T12:00:00.000Z",
    event: {
      id: "00000000-0000-4000-8200-000000000013",
      title: "Retour d'expérience Kubernetes",
      description: "Événement passé.",
      category: "CONFERENCE",
      location: "Centre des congrès, Lyon 6e",
      startsAt: "2026-10-02T16:30:00.000Z",
      endsAt: "2026-10-02T19:30:00.000Z",
      status: "PUBLISHED",
    },
  },
  {
    id: "00000000-0000-4000-8300-000000000009",
    eventId: "00000000-0000-4000-8200-000000000012",
    status: "CANCELLED",
    position: null,
    promotedAt: null,
    createdAt: "2026-09-01T10:00:00.000Z",
    event: {
      id: "00000000-0000-4000-8200-000000000012",
      title: "Concert d'hiver",
      description: "Annulé pour raisons techniques.",
      category: "CONCERT",
      location: "Salle des fêtes, Villeurbanne",
      startsAt: "2026-09-14T12:00:00.000Z",
      endsAt: "2026-09-14T14:00:00.000Z",
      status: "CANCELLED",
    },
  },
];

export const CONFIRMED_REGISTRATION = MOCK_MY_REGISTRATIONS[0]!;
export const PROMOTED_REGISTRATION = MOCK_MY_REGISTRATIONS[1]!;
export const WAITLISTED_REGISTRATION = MOCK_MY_REGISTRATIONS[2]!;
export const PAST_ATTENDED_REGISTRATION = MOCK_MY_REGISTRATIONS[3]!;
export const PAST_CANCELLED_REGISTRATION = MOCK_MY_REGISTRATIONS[4]!;

export const MOCK_MY_REGISTRATIONS_RESPONSE: MyRegistrationsResponse = {
  data: [...MOCK_MY_REGISTRATIONS],
};
