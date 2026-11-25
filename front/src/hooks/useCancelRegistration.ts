"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type MyRegistrationsResponse } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { eventsKeys } from "./useEvents";
import { registrationsKeys } from "./useMyRegistrations";

interface CancelContext {
  readonly previous?: MyRegistrationsResponse;
}

/**
 * Mutation de désinscription / sortie de liste d'attente (`DELETE /api/events/{id}/registrations/me`, US13).
 * Applique une mise à jour optimiste sur le cache `['registrations', 'me']` avec rollback en cas d'erreur,
 * puis invalide les caches événements pour rafraîchir les places restantes.
 */
export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string, CancelContext>({
    mutationFn: (eventId) => api.cancelMyRegistration(eventId),
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: registrationsKeys.mine() });
      const previous = queryClient.getQueryData<MyRegistrationsResponse>(
        registrationsKeys.mine(),
      );
      if (previous) {
        queryClient.setQueryData<MyRegistrationsResponse>(registrationsKeys.mine(), {
          data: previous.data.filter((item) => item.eventId !== eventId),
        });
      }
      return { previous };
    },
    onError: (_error, _eventId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(registrationsKeys.mine(), context.previous);
      }
    },
    onSuccess: async (_data, eventId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: eventsKeys.all }),
        queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) }),
      ]);
    },
  });
}
