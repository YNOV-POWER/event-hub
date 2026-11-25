"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type MyRegistrationsResponse } from "@/api/client";
import type { ApiError } from "@/api/errors";

export const registrationsKeys = {
  all: ["registrations"] as const,
  mine: () => ["registrations", "me"] as const,
};

/**
 * Lecture des inscriptions de l'utilisateur connecté (`GET /api/me/registrations`, US14).
 */
export function useMyRegistrations() {
  return useQuery<MyRegistrationsResponse, ApiError>({
    queryKey: registrationsKeys.mine(),
    queryFn: ({ signal }) => api.listMyRegistrations(signal),
    staleTime: 30_000,
  });
}
