"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type EventResponse } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { eventsKeys } from "./useEvents";

/**
 * Lecture du détail d'un événement (`GET /api/events/{id}`).
 */
export function useEvent(id: string) {
  return useQuery<EventResponse, ApiError>({
    queryKey: eventsKeys.detail(id),
    queryFn: ({ signal }) => api.getEvent(id, signal),
    staleTime: 30_000,
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      if (error.status === 404 || error.status === 403 || error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
  });
}
