import { EventStatus, RegistrationStatus } from "../../../generated/prisma/enums.js";
import type { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import type { EventDetails, EventPage, EventSortField, PublishedEventsCriteria } from "./event.model.js";

export interface EventRepository {
  findPublished(criteria: PublishedEventsCriteria): Promise<EventPage>;
  findById(id: string): Promise<EventDetails | null>;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const eventDetailsInclude = {
  organizer: { select: { id: true, displayName: true } },
  _count: {
    select: { registrations: { where: { status: RegistrationStatus.CONFIRMED } } },
  },
} satisfies Prisma.EventInclude;

type EventDetailsRecord = Prisma.EventGetPayload<{ include: typeof eventDetailsInclude }>;

const ORDER_BY: Record<EventSortField, (direction: Prisma.SortOrder) => Prisma.EventOrderByWithRelationInput> = {
  startsAt: (direction) => ({ startsAt: direction }),
  createdAt: (direction) => ({ createdAt: direction }),
  title: (direction) => ({ title: direction }),
};

function toEventDetails(record: EventDetailsRecord): EventDetails {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    category: record.category,
    location: record.location,
    startsAt: record.startsAt,
    endsAt: record.endsAt,
    capacity: record.capacity,
    confirmedCount: record._count.registrations,
    status: record.status,
    organizer: record.organizer,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function buildPublishedWhere(criteria: PublishedEventsCriteria): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {
    status: EventStatus.PUBLISHED,
    startsAt: criteria.to === undefined ? { gte: criteria.from } : { gte: criteria.from, lte: criteria.to },
  };
  if (criteria.categories !== undefined) {
    where.category = { in: [...criteria.categories] };
  }
  if (criteria.search !== undefined) {
    // Prisma passes `contains` to ILIKE as is: escape the wildcards so `%` and `_` are matched literally.
    const pattern = criteria.search.replace(/[\\%_]/g, (character) => `\\${character}`);
    const contains = { contains: pattern, mode: "insensitive" } satisfies Prisma.StringFilter;
    where.OR = [{ title: contains }, { description: contains }, { location: contains }];
  }
  return where;
}

export class PrismaEventRepository implements EventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPublished(criteria: PublishedEventsCriteria): Promise<EventPage> {
    const where = buildPublishedWhere(criteria);
    const [total, records] = await this.prisma.$transaction([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        include: eventDetailsInclude,
        // Deterministic tie-breaker on id keeps offset pagination stable (contract §4.3).
        orderBy: [ORDER_BY[criteria.sort.field](criteria.sort.direction), { id: "asc" }],
        skip: criteria.offset,
        take: criteria.limit,
      }),
    ]);
    return { items: records.map(toEventDetails), total };
  }

  async findById(id: string): Promise<EventDetails | null> {
    // Ids are stored as uuid: anything else cannot exist, and would make PostgreSQL reject the query.
    if (!UUID_PATTERN.test(id)) {
      return null;
    }
    const record = await this.prisma.event.findUnique({ where: { id }, include: eventDetailsInclude });
    return record === null ? null : toEventDetails(record);
  }
}
