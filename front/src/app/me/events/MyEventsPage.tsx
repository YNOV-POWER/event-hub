"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { EventItem, EventListResponse, EventSort } from "@/api/client";
import type { ApiError } from "@/api/errors";
import {
  MyEventsView,
  type OrganizerFeedbackBanner,
  type OrganizerStatusCounts,
} from "@/components/organizer/MyEventsView";
import { Modal } from "@/components/ui/Modal";
import { myEventsKeys, useMyEvents } from "@/hooks/useMyEvents";
import {
  useCancelEvent,
  useDuplicateEvent,
  usePublishEvent,
} from "@/hooks/useOrganizerEventActions";
import {
  useOrganizerEventFilters,
  type OrganizerStatusFilter,
} from "@/hooks/useOrganizerEventFilters";

function computeCountsFromItems(
  items: readonly EventItem[],
): OrganizerStatusCounts {
  let draft = 0;
  let published = 0;
  let cancelled = 0;
  for (const item of items) {
    if (item.status === "DRAFT") draft += 1;
    else if (item.status === "PUBLISHED") published += 1;
    else if (item.status === "CANCELLED") cancelled += 1;
  }
  return {
    ALL: items.length,
    DRAFT: draft,
    PUBLISHED: published,
    CANCELLED: cancelled,
  };
}

function buildPublishErrorBanner(
  error: ApiError,
  event: EventItem,
  t: ReturnType<typeof useTranslation>["t"],
): OrganizerFeedbackBanner {
  if (error.status === 409 || error.code === "INVALID_STATE_TRANSITION") {
    return {
      tone: "warning",
      message: t("myEvents.banners.publishInvalidState"),
    };
  }
  if (error.status === 422 || error.code === "VALIDATION_FAILED") {
    const hasPastDateField = error.errors.some(
      (fieldErr) => fieldErr.field === "startsAt" || fieldErr.code === "PAST_DATE",
    );
    return {
      tone: "danger",
      message:
        hasPastDateField || error.errors.length === 0
          ? t("myEvents.banners.publishPastDate")
          : t("myEvents.banners.publishValidationFailed"),
      editEventId: event.id,
    };
  }
  return {
    tone: "danger",
    message: t(`errors.codes.${error.code}`, {
      defaultValue: t("errors.genericDescription"),
    }),
  };
}

/**
 * Conteneur de l'écran `07 · Mes événements (organisateur)` (`/me/events`).
 * Orchestre les filtres URL (`useOrganizerEventFilters`), la liste paginée (`useMyEvents`),
 * la publication directe sans rechargement (`usePublishEvent`, US06), l'annulation avec modale
 * (`useCancelEvent`, US08) et la duplication en brouillon (`useDuplicateEvent`, US26).
 */
export function MyEventsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { filters, apiQuery, updateFilters, resetStatusFilter } =
    useOrganizerEventFilters();

  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } =
    useMyEvents(apiQuery);

  const publishMutation = usePublishEvent();
  const cancelMutation = useCancelEvent();
  const duplicateMutation = useDuplicateEvent();

  const [pendingCancel, setPendingCancel] = useState<EventItem | null>(null);
  const [feedbackBanner, setFeedbackBanner] =
    useState<OrganizerFeedbackBanner | null>(null);
  const [publishingEventId, setPublishingEventId] = useState<string | null>(null);
  const [duplicatingEventId, setDuplicatingEventId] = useState<string | null>(null);

  const events = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const isRevalidating = !isPending && (isFetching || isPlaceholderData);

  const statusCounts = useMemo<Partial<OrganizerStatusCounts> | undefined>(() => {
    if (filters.status === "ALL" && meta && meta.totalPages <= 1) {
      return computeCountsFromItems(events);
    }
    const cachedQueries = queryClient.getQueriesData<EventListResponse>({
      queryKey: myEventsKeys.all,
    });
    for (const [key, cached] of cachedQueries) {
      const keyFilter = key[2] as { status?: string } | undefined;
      if (!keyFilter?.status && cached && cached.meta.totalPages <= 1) {
        return computeCountsFromItems(cached.data);
      }
    }
    if (meta) {
      return { [filters.status]: meta.totalItems };
    }
    return undefined;
  }, [events, filters.status, meta, queryClient]);

  const handleStatusChange = useCallback(
    (status: OrganizerStatusFilter) => {
      updateFilters({ status }, true);
    },
    [updateFilters],
  );

  const handleSortChange = useCallback(
    (sort: EventSort) => {
      updateFilters({ sort }, true);
    },
    [updateFilters],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({ page }, false);
    },
    [updateFilters],
  );

  const handlePublish = useCallback(
    (event: EventItem) => {
      setFeedbackBanner(null);
      setPublishingEventId(event.id);
      publishMutation.mutate(event.id, {
        onSuccess: (response) => {
          setFeedbackBanner({
            tone: "success",
            message: t("myEvents.banners.published", { title: response.data.title }),
          });
        },
        onError: (apiError) => {
          setFeedbackBanner(buildPublishErrorBanner(apiError, event, t));
        },
        onSettled: () => {
          setPublishingEventId(null);
        },
      });
    },
    [publishMutation, t],
  );

  const handleRequestCancel = useCallback(
    (event: EventItem) => {
      cancelMutation.reset();
      setPendingCancel(event);
    },
    [cancelMutation],
  );

  const handleConfirmCancel = useCallback(() => {
    if (!pendingCancel) return;
    const target = pendingCancel;
    cancelMutation.mutate(target.id, {
      onSuccess: (response) => {
        setPendingCancel(null);
        setFeedbackBanner({
          tone: "success",
          message: t("myEvents.banners.cancelled", { title: response.data.title }),
        });
      },
    });
  }, [cancelMutation, pendingCancel, t]);

  const handleDuplicate = useCallback(
    (event: EventItem) => {
      setFeedbackBanner(null);
      setDuplicatingEventId(event.id);
      duplicateMutation.mutate(event.id, {
        onSuccess: (response) => {
          setFeedbackBanner({
            tone: "success",
            message: t("myEvents.banners.duplicated", { title: event.title }),
            editEventId: response.data.id,
          });
        },
        onError: (apiError) => {
          setFeedbackBanner({
            tone: "danger",
            message: t(`errors.codes.${apiError.code}`, {
              defaultValue: t("errors.genericDescription"),
            }),
          });
        },
        onSettled: () => {
          setDuplicatingEventId(null);
        },
      });
    },
    [duplicateMutation, t],
  );

  const modalError = cancelMutation.error
    ? t(`errors.codes.${cancelMutation.error.code}`, {
        defaultValue: t("errors.genericDescription"),
      })
    : null;

  const cancelModalDescription = pendingCancel
    ? pendingCancel.confirmedCount > 0
      ? t("myEvents.cancelModal.descriptionWithRegistrants", {
          count: pendingCancel.confirmedCount,
        })
      : t("myEvents.cancelModal.descriptionWithoutRegistrants")
    : undefined;

  return (
    <>
      <MyEventsView
        events={events}
        meta={meta}
        activeStatus={filters.status}
        sort={filters.sort}
        statusCounts={statusCounts}
        feedbackBanner={feedbackBanner}
        isLoading={isPending}
        isRevalidating={isRevalidating}
        error={isError ? error : null}
        publishingEventId={publishingEventId}
        duplicatingEventId={duplicatingEventId}
        onStatusChange={handleStatusChange}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onResetStatusFilter={resetStatusFilter}
        onRetry={() => void refetch()}
        onPublish={handlePublish}
        onRequestCancel={handleRequestCancel}
        onDuplicate={handleDuplicate}
      />

      <Modal
        isOpen={pendingCancel !== null}
        tone="danger"
        title={
          pendingCancel
            ? t("myEvents.cancelModal.title", { title: pendingCancel.title })
            : ""
        }
        description={cancelModalDescription}
        cancelLabel={t("myEvents.cancelModal.back")}
        confirmLabel={
          cancelMutation.isPending
            ? t("myEvents.cancelModal.submitting")
            : t("myEvents.cancelModal.confirm")
        }
        isLoading={cancelMutation.isPending}
        error={modalError}
        onConfirm={handleConfirmCancel}
        onClose={() => setPendingCancel(null)}
      />
    </>
  );
}
