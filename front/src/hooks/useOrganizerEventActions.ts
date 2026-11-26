"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  api,
  type EventItem,
  type EventListResponse,
  type EventResponse,
  type MyEventListQuery,
} from "@/api/client";
import type { ApiError } from "@/api/errors";
import { eventsKeys } from "./useEvents";
import { myEventsKeys } from "./useMyEvents";

/**
 * Met à jour directement en cache toutes les listes `GET /me/events` à partir de l'événement retourné,
 * sans re-lecture réseau superflue (contrat d'API v0.1 §7 — US06 / US08).
 */
function syncEventInOrganizerCaches(queryClient: QueryClient, updatedEvent: EventItem): void {
  queryClient.setQueryData<EventResponse>(eventsKeys.detail(updatedEvent.id), {
    data: updatedEvent,
  });

  const queries = queryClient.getQueriesData<EventListResponse>({
    queryKey: myEventsKeys.all,
  });

  for (const [queryKey, cached] of queries) {
    if (!cached) continue;
    const maybeFilter = queryKey[2] as MyEventListQuery | undefined;
    const allowedStatuses = maybeFilter?.status
      ? new Set(maybeFilter.status.split(","))
      : null;

    const existsInPage = cached.data.some((item) => item.id === updatedEvent.id);
    if (!existsInPage) continue;

    if (allowedStatuses && !allowedStatuses.has(updatedEvent.status)) {
      const nextData = cached.data.filter((item) => item.id !== updatedEvent.id);
      const nextTotal = Math.max(0, cached.meta.totalItems - 1);
      queryClient.setQueryData<EventListResponse>(queryKey, {
        data: nextData,
        meta: {
          ...cached.meta,
          totalItems: nextTotal,
          totalPages: nextTotal === 0 ? 0 : Math.ceil(nextTotal / cached.meta.pageSize),
        },
      });
    } else {
      queryClient.setQueryData<EventListResponse>(queryKey, {
        ...cached,
        data: cached.data.map((item) => (item.id === updatedEvent.id ? updatedEvent : item)),
      });
    }
  }
}

/**
 * Insère un nouveau brouillon dupliqué en tête des caches pertinents (`ALL` et `DRAFT`).
 */
function prependDuplicatedEventInCaches(queryClient: QueryClient, createdEvent: EventItem): void {
  queryClient.setQueryData<EventResponse>(eventsKeys.detail(createdEvent.id), {
    data: createdEvent,
  });

  const queries = queryClient.getQueriesData<EventListResponse>({
    queryKey: myEventsKeys.all,
  });

  for (const [queryKey, cached] of queries) {
    if (!cached) continue;
    const maybeFilter = queryKey[2] as MyEventListQuery | undefined;
    const allowedStatuses = maybeFilter?.status
      ? new Set(maybeFilter.status.split(","))
      : null;

    if (allowedStatuses && !allowedStatuses.has("DRAFT")) continue;

    const nextTotal = cached.meta.totalItems + 1;
    const nextData =
      cached.meta.page === 1
        ? [createdEvent, ...cached.data].slice(0, cached.meta.pageSize)
        : cached.data;

    queryClient.setQueryData<EventListResponse>(queryKey, {
      data: nextData,
      meta: {
        ...cached.meta,
        totalItems: nextTotal,
        totalPages: Math.ceil(nextTotal / cached.meta.pageSize),
      },
    });
  }
}

/** E6 (US06) — POST /api/events/{id}/publish */
export function usePublishEvent() {
  const queryClient = useQueryClient();

  return useMutation<EventResponse, ApiError, string>({
    mutationFn: (eventId) => api.publishEvent(eventId),
    onSuccess: (response) => {
      syncEventInOrganizerCaches(queryClient, response.data);
    },
  });
}

/** E7 (US08) — POST /api/events/{id}/cancel */
export function useCancelEvent() {
  const queryClient = useQueryClient();

  return useMutation<EventResponse, ApiError, string>({
    mutationFn: (eventId) => api.cancelEvent(eventId),
    onSuccess: (response) => {
      syncEventInOrganizerCaches(queryClient, response.data);
    },
  });
}

/** US26 — POST /api/events/{id}/duplicate */
export function useDuplicateEvent() {
  const queryClient = useQueryClient();

  return useMutation<EventResponse, ApiError, string>({
    mutationFn: (eventId) => api.duplicateEvent(eventId),
    onSuccess: (response) => {
      prependDuplicatedEventInCaches(queryClient, response.data);
    },
  });
}
