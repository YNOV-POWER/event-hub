"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/auth-context";
import { EventFormView } from "@/components/organizer/EventFormView";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonRow } from "@/components/ui/SkeletonRow";
import { useOrganizerEvent } from "@/hooks/useOrganizerEvent";
import { useSaveEvent } from "@/hooks/useSaveEvent";

export function EventFormPage({ eventId }: { readonly eventId?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const organizer = user ? { id: user.id, displayName: user.displayName } : null;
  const eventQuery = useOrganizerEvent(eventId);
  const saveMutation = useSaveEvent(eventId, organizer);

  const goToMyEvents = () => router.push("/me/events");

  if (eventId) {
    if (eventQuery.isPending) {
      return <SkeletonRow count={3} ariaLabel={t("eventForm.loadingAnnouncement")} />;
    }

    if (eventQuery.isError) {
      return eventQuery.error.status === 404 ? (
        <ErrorState
          variant="notFound"
          overline={t("eventDetail.notFoundOverline")}
          title={t("eventDetail.notFoundTitle")}
          description={t("eventDetail.notFoundDescription")}
          homeHref="/me/events"
          homeLabel={t("eventForm.backToMyEvents")}
        />
      ) : (
        <ErrorState
          variant="technical"
          title={t("errors.genericTitle")}
          description={t(`errors.codes.${eventQuery.error.code}`, {
            defaultValue: t("errors.genericDescription"),
          })}
          requestId={eventQuery.error.requestId}
          onRetry={() => void eventQuery.refetch()}
        />
      );
    }

    if (user && eventQuery.data.organizer.id !== user.id) {
      return (
        <ErrorState
          variant="forbidden"
          title={t("errors.forbiddenTitle")}
          description={t("errors.forbiddenDescription")}
          homeHref="/me/events"
          homeLabel={t("eventForm.backToMyEvents")}
        />
      );
    }
  }

  return (
    <EventFormView
      key={eventQuery.data?.id ?? "new"}
      event={eventId ? eventQuery.data : null}
      organizer={organizer}
      isSubmitting={saveMutation.isPending}
      serverError={saveMutation.error ?? null}
      onCancel={goToMyEvents}
      onSubmit={(values) => saveMutation.mutate(values, { onSuccess: goToMyEvents })}
    />
  );
}
