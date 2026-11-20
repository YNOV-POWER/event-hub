import type { EventCategory, EventStatus } from "../../../generated/prisma/enums.js";

export interface OrganizerSummary {
  id: string;
  displayName: string;
}

/** An event as read by the application, with its computed `confirmedCount`. */
export interface EventDetails {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  confirmedCount: number;
  status: EventStatus;
  organizer: OrganizerSummary;
  createdAt: Date;
  updatedAt: Date;
}

export type EventSortField = "startsAt" | "createdAt" | "title";

export interface EventSort {
  field: EventSortField;
  direction: "asc" | "desc";
}

export interface PublishedEventsCriteria {
  from: Date;
  to: Date | undefined;
  categories: readonly EventCategory[] | undefined;
  search: string | undefined;
  sort: EventSort;
  offset: number;
  limit: number;
}

export interface EventPage {
  items: EventDetails[];
  total: number;
}
