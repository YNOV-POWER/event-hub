"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EventCategory, EventItem, OrganizerSummary } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { saveDemoOrganizerEvent } from "@/mocks/organizerDemo";
import { myEventsKeys } from "./useMyEvents";
import { organizerEventKeys } from "./useOrganizerEvent";

export interface EventFormValues {
  readonly title: string;
  readonly description: string;
  readonly category: EventCategory;
  readonly location: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly capacity: number;
}

export function useSaveEvent(eventId: string | undefined, organizer: OrganizerSummary | null) {
  const queryClient = useQueryClient();

  return useMutation<EventItem, ApiError, EventFormValues>({
    mutationFn: (values) =>
      saveDemoOrganizerEvent(eventId, values, organizer ?? { id: "", displayName: "" }),
    onSuccess: (event) => {
      queryClient.setQueryData(organizerEventKeys.detail(event.id), event);
      void queryClient.invalidateQueries({ queryKey: myEventsKeys.all });
    },
  });
}
