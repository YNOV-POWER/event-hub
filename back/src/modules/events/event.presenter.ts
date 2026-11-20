import type { EventCategory, EventStatus } from "../../../generated/prisma/enums.js";
import type { EventDetails, OrganizerSummary } from "./event.model.js";

/** `Event` resource as defined by the API contract (§1.2). Dates are ISO 8601 UTC strings. */
export interface EventResponse {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  confirmedCount: number;
  remainingSeats: number;
  status: EventStatus;
  organizer: OrganizerSummary;
  createdAt: string;
  updatedAt: string;
}

export function toEventResponse(event: EventDetails): EventResponse {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt.toISOString(),
    capacity: event.capacity,
    confirmedCount: event.confirmedCount,
    remainingSeats: event.capacity - event.confirmedCount,
    status: event.status,
    organizer: { id: event.organizer.id, displayName: event.organizer.displayName },
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}
