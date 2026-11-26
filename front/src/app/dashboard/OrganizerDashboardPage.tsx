"use client";

import { useAuth } from "@/auth/auth-context";
import { OrganizerDashboardView } from "@/components/organizer/OrganizerDashboardView";
import { useOrganizerDashboardEvents } from "@/hooks/useMyEvents";

/**
 * Conteneur de l'écran `10 · Tableau de bord organisateur` (`/dashboard`, US27 / SCRUM-71).
 */
export function OrganizerDashboardPage() {
  const { user } = useAuth();
  const { data, isPending, isError, error, isFetching, refetch } =
    useOrganizerDashboardEvents();

  return (
    <OrganizerDashboardView
      organizerName={user?.displayName ?? null}
      events={data?.data ?? []}
      isLoading={isPending}
      isRevalidating={!isPending && isFetching}
      error={isError ? error : null}
      onRetry={() => void refetch()}
    />
  );
}
