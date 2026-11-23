"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type CreateRegistrationDto,
  type RegistrationResponse,
} from "@/api/client";
import type { ApiError } from "@/api/errors";
import { generateUuid } from "@/api/http";
import { eventsKeys } from "./useEvents";

export interface RegisterToEventVariables {
  readonly dto: CreateRegistrationDto;
  readonly idempotencyKey?: string;
}

/**
 * Mutation d'inscription à un événement (`POST /api/events/{id}/registrations`).
 * Envoie un `Idempotency-Key` unique et invalide le cache `['events']` et `['events', eventId]` en succès.
 */
export function useRegisterToEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation<RegistrationResponse, ApiError, RegisterToEventVariables>({
    mutationFn: ({ dto, idempotencyKey }) =>
      api.registerToEvent(eventId, dto, {
        idempotencyKey: idempotencyKey ?? generateUuid(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: eventsKeys.all }),
        queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) }),
        queryClient.invalidateQueries({ queryKey: ["registrations"] }),
      ]);
    },
  });
}
