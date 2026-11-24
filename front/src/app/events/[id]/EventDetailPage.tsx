"use client";

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { generateUuid } from "@/api/http";
import { useAuth } from "@/auth/auth-context";
import { EventDetailView } from "@/components/events/EventDetailView";
import { EventRegistrationForm } from "@/components/events/EventRegistrationForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { useEvent } from "@/hooks/useEvent";
import { useRegisterToEvent } from "@/hooks/useRegisterToEvent";
import styles from "./EventDetailPage.module.css";

export function EventDetailPage({ eventId }: { readonly eventId: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, isPending, isError, error, isFetching, refetch } = useEvent(eventId);
  const registerMutation = useRegisterToEvent(eventId);
  const idempotencyKeyRef = useRef<string>(generateUuid());

  if (isPending) {
    return (
      <div className={styles.skeletonLayout} aria-busy="true">
        <SkeletonCard />
        <SkeletonCard compact />
      </div>
    );
  }

  if (isError) {
    if (error.status === 404) {
      return (
        <ErrorState
          variant="notFound"
          overline={t("eventDetail.notFoundOverline")}
          title={t("eventDetail.notFoundTitle")}
          description={t("eventDetail.notFoundDescription")}
          requestId={error.requestId}
          homeHref="/events"
          homeLabel={t("eventDetail.notFoundAction")}
        />
      );
    }

    return (
      <ErrorState
        variant="technical"
        title={t("errors.genericTitle")}
        description={t(`errors.codes.${error.code}`, {
          defaultValue: t("errors.genericDescription"),
        })}
        requestId={error.requestId}
        onRetry={() => void refetch()}
        homeHref="/events"
      />
    );
  }

  const event = data.data;

  return (
    <EventDetailView
      event={event}
      isRevalidating={isFetching && !isPending}
      registrationSlot={
        <EventRegistrationForm
          eventStatus={event.status}
          remainingSeats={event.remainingSeats}
          defaultName={user?.displayName ?? ""}
          defaultEmail={user?.email ?? ""}
          isSubmitting={registerMutation.isPending}
          serverError={registerMutation.error ?? null}
          registration={registerMutation.data?.data ?? null}
          onSubmit={(dto) => {
            registerMutation.mutate(
              { dto, idempotencyKey: idempotencyKeyRef.current },
              {
                onSuccess: () => {
                  idempotencyKeyRef.current = generateUuid();
                },
              },
            );
          }}
        />
      }
    />
  );
}
