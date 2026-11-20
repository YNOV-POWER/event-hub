/**
 * Development seed. Idempotent: every row has a fixed id and is upserted, so it can be re-run at will.
 * Event dates are relative to the moment the seed runs, so the public catalogue always has upcoming events.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import {
  EventCategory,
  EventStatus,
  PrismaClient,
  RegistrationStatus,
  UserRole,
} from "../generated/prisma/client.js";
import type { Prisma } from "../generated/prisma/client.js";

const connectionString = process.env["DATABASE_URL"];
if (connectionString === undefined || connectionString === "") {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * Authentication (US01/US02) is not implemented yet, so the hashing scheme is not decided.
 * This value matches no password: seeded accounts cannot log in until the auth story updates the seed.
 */
const PLACEHOLDER_PASSWORD_HASH = "!seed-placeholder-no-login";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Deterministic UUIDs: one namespace digit per table, then a sequence number. */
function seedId(table: 1 | 2 | 3, sequence: number): string {
  return `00000000-0000-4000-8${table}00-${sequence.toString().padStart(12, "0")}`;
}

/** Midnight UTC of the current day, shifted by `days`, at `hour` o'clock UTC. */
function atUtc(days: number, hour: number, minute = 0): Date {
  const today = new Date();
  const midnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return new Date(midnight + days * DAY_MS + hour * HOUR_MS + minute * 60 * 1000);
}

function hoursAfter(start: Date, hours: number): Date {
  return new Date(start.getTime() + hours * HOUR_MS);
}

const users = {
  grace: seedId(1, 1),
  alan: seedId(1, 2),
  ada: seedId(1, 3),
  katherine: seedId(1, 4),
  margaret: seedId(1, 5),
  hedy: seedId(1, 6),
} as const;

const userRows: Prisma.UserCreateInput[] = [
  { id: users.grace, email: "grace@example.com", displayName: "Grace", role: UserRole.ORGANIZER },
  { id: users.alan, email: "alan@example.com", displayName: "Alan", role: UserRole.ORGANIZER },
  { id: users.ada, email: "ada@example.com", displayName: "Ada", role: UserRole.PARTICIPANT },
  { id: users.katherine, email: "katherine@example.com", displayName: "Katherine", role: UserRole.PARTICIPANT },
  { id: users.margaret, email: "margaret@example.com", displayName: "Margaret", role: UserRole.PARTICIPANT },
  { id: users.hedy, email: "hedy@example.com", displayName: "Hedy", role: UserRole.PARTICIPANT },
].map((user) => ({ ...user, passwordHash: PLACEHOLDER_PASSWORD_HASH }));

interface EventSeed {
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startsAt: Date;
  durationHours: number;
  capacity: number;
  status: EventStatus;
  organizerId: string;
}

const eventSeeds: EventSeed[] = [
  {
    title: "TypeScript Workshop",
    description: "Hands-on session: strict typing, generics and narrowing on a real codebase.",
    category: EventCategory.WORKSHOP,
    location: "Hub Central, 12 rue de la République, Lyon",
    startsAt: atUtc(20, 17),
    durationHours: 3,
    capacity: 30,
    status: EventStatus.PUBLISHED,
    organizerId: users.grace,
  },
  {
    title: "Conférence Web & Accessibilité",
    description: "Une journée de talks sur le RGAA, les lecteurs d'écran et le design inclusif.",
    category: EventCategory.CONFERENCE,
    location: "Centre des congrès, Lyon 6e",
    startsAt: atUtc(35, 8),
    durationHours: 8,
    capacity: 200,
    status: EventStatus.PUBLISHED,
    organizerId: users.grace,
  },
  {
    title: "Jazz au parc",
    description: "Trio acoustique en plein air. Places limitées.",
    category: EventCategory.CONCERT,
    location: "Kiosque du parc, Lyon 6e",
    startsAt: atUtc(12, 19),
    durationHours: 2,
    capacity: 3,
    status: EventStatus.PUBLISHED,
    organizerId: users.alan,
  },
  {
    title: "Atelier Docker pour débutants",
    description: "Images, conteneurs, volumes et Compose, pas à pas.",
    category: EventCategory.WORKSHOP,
    location: "Campus numérique, Villeurbanne",
    startsAt: atUtc(5, 13),
    durationHours: 3,
    capacity: 15,
    status: EventStatus.PUBLISHED,
    organizerId: users.alan,
  },
  {
    title: "Meetup Node.js",
    description: "Deux talks courts puis échanges autour d'un verre.",
    category: EventCategory.OTHER,
    location: "Espace coworking, Lyon 7e",
    startsAt: atUtc(8, 18),
    durationHours: 2,
    capacity: 50,
    status: EventStatus.PUBLISHED,
    organizerId: users.grace,
  },
  {
    title: "Conférence Sécurité applicative",
    description: "OWASP Top 10, gestion des secrets et revue de code orientée sécurité.",
    category: EventCategory.CONFERENCE,
    location: "Grand amphithéâtre, Grenoble",
    startsAt: atUtc(60, 8, 30),
    durationHours: 7,
    capacity: 120,
    status: EventStatus.PUBLISHED,
    organizerId: users.alan,
  },
  {
    title: "Atelier Prisma & PostgreSQL",
    description: "Modélisation, migrations et requêtes typées.",
    category: EventCategory.WORKSHOP,
    location: "Hub Central, 12 rue de la République, Lyon",
    startsAt: atUtc(27, 9),
    durationHours: 4,
    capacity: 20,
    status: EventStatus.PUBLISHED,
    organizerId: users.grace,
  },
  {
    title: "Concert de rentrée",
    description: "",
    category: EventCategory.CONCERT,
    location: "Salle des fêtes, Villeurbanne",
    startsAt: atUtc(90, 20),
    durationHours: 3,
    capacity: 500,
    status: EventStatus.PUBLISHED,
    organizerId: users.alan,
  },
  {
    title: "Hackathon Green IT",
    description: "32 heures pour réduire l'empreinte d'une application existante.",
    category: EventCategory.OTHER,
    location: "Halle des sports, Lyon 8e",
    startsAt: atUtc(45, 8),
    durationHours: 32,
    capacity: 60,
    status: EventStatus.PUBLISHED,
    organizerId: users.grace,
  },
  {
    title: "Atelier React (brouillon)",
    description: "Programme en cours de rédaction.",
    category: EventCategory.WORKSHOP,
    location: "Hub Central, 12 rue de la République, Lyon",
    startsAt: atUtc(40, 13),
    durationHours: 3,
    capacity: 25,
    status: EventStatus.DRAFT,
    organizerId: users.grace,
  },
  {
    title: "Conférence IA générative (brouillon)",
    description: "",
    category: EventCategory.CONFERENCE,
    location: "À confirmer",
    startsAt: atUtc(70, 8),
    durationHours: 8,
    capacity: 150,
    status: EventStatus.DRAFT,
    organizerId: users.alan,
  },
  {
    title: "Concert d'hiver",
    description: "Annulé pour raisons techniques.",
    category: EventCategory.CONCERT,
    location: "Salle des fêtes, Villeurbanne",
    startsAt: atUtc(15, 20),
    durationHours: 2,
    capacity: 100,
    status: EventStatus.CANCELLED,
    organizerId: users.alan,
  },
  {
    title: "Retour d'expérience Kubernetes",
    description: "Événement passé : visible avec un paramètre from dans le passé.",
    category: EventCategory.CONFERENCE,
    location: "Centre des congrès, Lyon 6e",
    startsAt: atUtc(-10, 8),
    durationHours: 6,
    capacity: 80,
    status: EventStatus.PUBLISHED,
    organizerId: users.grace,
  },
];

const eventRows: Prisma.EventUncheckedCreateInput[] = eventSeeds.map(({ durationHours, ...event }, index) => ({
  ...event,
  id: seedId(2, index + 1),
  endsAt: hoursAfter(event.startsAt, durationHours),
}));

const events = {
  typescriptWorkshop: seedId(2, 1),
  jazz: seedId(2, 3),
  docker: seedId(2, 4),
  winterConcert: seedId(2, 12),
  kubernetes: seedId(2, 13),
} as const;

type RegistrationSeed = Pick<Prisma.RegistrationUncheckedCreateInput, "eventId" | "userId" | "status" | "position">;

const registrationSeeds: RegistrationSeed[] = [
  { eventId: events.typescriptWorkshop, userId: users.ada, status: RegistrationStatus.CONFIRMED, position: null },
  { eventId: events.typescriptWorkshop, userId: users.katherine, status: RegistrationStatus.CONFIRMED, position: null },
  // "Jazz au parc" is full (capacity 3) with one person on the waiting list.
  { eventId: events.jazz, userId: users.ada, status: RegistrationStatus.CONFIRMED, position: null },
  { eventId: events.jazz, userId: users.katherine, status: RegistrationStatus.CONFIRMED, position: null },
  { eventId: events.jazz, userId: users.margaret, status: RegistrationStatus.CONFIRMED, position: null },
  { eventId: events.jazz, userId: users.hedy, status: RegistrationStatus.WAITLISTED, position: 1 },
  { eventId: events.docker, userId: users.margaret, status: RegistrationStatus.CONFIRMED, position: null },
  { eventId: events.docker, userId: users.hedy, status: RegistrationStatus.CANCELLED, position: null },
  { eventId: events.winterConcert, userId: users.katherine, status: RegistrationStatus.CANCELLED, position: null },
  { eventId: events.kubernetes, userId: users.ada, status: RegistrationStatus.CONFIRMED, position: null },
  { eventId: events.kubernetes, userId: users.hedy, status: RegistrationStatus.CONFIRMED, position: null },
];

const registrationRows: Prisma.RegistrationUncheckedCreateInput[] = registrationSeeds.map((registration, index) => ({
  ...registration,
  id: seedId(3, index + 1),
}));

async function main(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const user of userRows) {
      await tx.user.upsert({ where: { id: user.id }, create: user, update: user });
    }
    for (const event of eventRows) {
      await tx.event.upsert({ where: { id: event.id }, create: event, update: event });
    }
    for (const registration of registrationRows) {
      await tx.registration.upsert({ where: { id: registration.id }, create: registration, update: registration });
    }
  });
  console.info(
    `Seed complete: ${userRows.length} users, ${eventRows.length} events, ${registrationRows.length} registrations.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
