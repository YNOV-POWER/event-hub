"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, type EventListQuery, type EventListResponse } from "@/api/client";
import type { ApiError } from "@/api/errors";

export const eventsKeys = {
  all: ["events"] as const,
  list: (filters: EventListQuery) => ["events", filters] as const,
  detail: (id: string) => ["events", id] as const,
};

/**
 * Lecture paginée et filtrée du catalogue public (`GET /api/events`).
 * Utilise `placeholderData: keepPreviousData` pour afficher les données en cache
 * pendant le rechargement (état « Obsolète / stale-while-revalidate »).
 */
export function useEvents(filters: EventListQuery) {
  return useQuery<EventListResponse, ApiError>({
    queryKey: eventsKeys.list(filters),
    queryFn: ({ signal }) => api.listEvents(filters, signal),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
