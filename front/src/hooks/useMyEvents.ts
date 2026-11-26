"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, type EventListResponse, type MyEventListQuery } from "@/api/client";
import type { ApiError } from "@/api/errors";

export const myEventsKeys = {
  all: ["events", "me"] as const,
  list: (filters: MyEventListQuery) => ["events", "me", filters] as const,
  dashboard: () => ["events", "me", { page: 1, pageSize: 100, sort: "startsAt" }] as const,
};

/**
 * Lecture paginée et filtrée des événements de l'organisateur connecté (`GET /api/me/events`, E3 / US05).
 */
export function useMyEvents(filters: MyEventListQuery) {
  return useQuery<EventListResponse, ApiError>({
    queryKey: myEventsKeys.list(filters),
    queryFn: ({ signal }) => api.listMyEvents(filters, signal),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Lecture consolidée des événements de l'organisateur pour le tableau de bord (US27 / SCRUM-71).
 * S'appuie sur `GET /api/me/events?page=1&pageSize=100` conformément au contrat v0.1 (pas d'endpoint dédié).
 */
export function useOrganizerDashboardEvents() {
  return useQuery<EventListResponse, ApiError>({
    queryKey: myEventsKeys.dashboard(),
    queryFn: ({ signal }) =>
      api.listMyEvents({ page: 1, pageSize: 100, sort: "startsAt" }, signal),
    staleTime: 30_000,
  });
}
