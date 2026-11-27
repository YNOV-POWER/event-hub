"use client";

import { useQuery } from "@tanstack/react-query";
import type { EventItem } from "@/api/client";
import type { ApiError } from "@/api/errors";
import {
  fetchDemoEventRegistrants,
  fetchDemoOrganizerEvent,
  type EventRegistrant,
} from "@/mocks/organizerDemo";

export const organizerEventKeys = {
  detail: (id: string) => ["events", "organizer", id] as const,
  registrants: (id: string) => ["events", "organizer", id, "registrants"] as const,
};

export function useOrganizerEvent(id: string | undefined) {
  return useQuery<EventItem, ApiError>({
    queryKey: organizerEventKeys.detail(id ?? ""),
    queryFn: () => fetchDemoOrganizerEvent(id ?? ""),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useEventRegistrants(id: string, enabled: boolean) {
  return useQuery<readonly EventRegistrant[], ApiError>({
    queryKey: organizerEventKeys.registrants(id),
    queryFn: () => fetchDemoEventRegistrants(id),
    enabled,
    retry: false,
  });
}
