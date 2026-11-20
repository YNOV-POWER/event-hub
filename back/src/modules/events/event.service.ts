import { EventStatus } from "../../../generated/prisma/enums.js";
import type { EventCategory } from "../../../generated/prisma/enums.js";
import { NotFoundError } from "../../errors/app-error.js";
import type { EventDetails, EventSort } from "./event.model.js";
import type { EventRepository } from "./event.repository.js";

export interface ListPublishedEventsParams {
  page: number;
  pageSize: number;
  from: Date | undefined;
  to: Date | undefined;
  categories: readonly EventCategory[] | undefined;
  search: string | undefined;
  sort: EventSort;
}

export interface PaginatedEvents {
  items: EventDetails[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export class EventService {
  constructor(
    private readonly events: EventRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /** Public catalogue: PUBLISHED events starting from `from` (defaults to now). */
  async listPublished(params: ListPublishedEventsParams): Promise<PaginatedEvents> {
    const { items, total } = await this.events.findPublished({
      from: params.from ?? this.now(),
      to: params.to,
      categories: params.categories,
      search: params.search,
      sort: params.sort,
      offset: (params.page - 1) * params.pageSize,
      limit: params.pageSize,
    });
    return {
      items,
      page: params.page,
      pageSize: params.pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / params.pageSize),
    };
  }

  /**
   * A DRAFT event is only visible to its organizer; anyone else gets a 404 so its existence is not revealed.
   * PUBLISHED and CANCELLED events are visible to everyone.
   */
  async getVisibleById(id: string, viewerId: string | null): Promise<EventDetails> {
    const event = await this.events.findById(id);
    if (event === null || (event.status === EventStatus.DRAFT && event.organizer.id !== viewerId)) {
      throw new NotFoundError("Event not found.");
    }
    return event;
  }
}
