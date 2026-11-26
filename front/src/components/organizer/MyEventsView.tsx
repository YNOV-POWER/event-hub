"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { EventItem, EventSort, EventStatus, PaginationMeta } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { Alert, type AlertTone } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CapacityMeter } from "@/components/ui/CapacityMeter";
import { Chip } from "@/components/ui/Chip";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { SkeletonRow } from "@/components/ui/SkeletonRow";
import type { OrganizerStatusFilter } from "@/hooks/useOrganizerEventFilters";
import { formatOrganizerEventDate } from "@/i18n/formatters";
import styles from "./MyEventsView.module.css";

export interface OrganizerStatusCounts {
  readonly ALL: number;
  readonly DRAFT: number;
  readonly PUBLISHED: number;
  readonly CANCELLED: number;
}

export interface OrganizerFeedbackBanner {
  readonly tone: AlertTone;
  readonly message: string;
  readonly editEventId?: string;
}

export interface MyEventsViewProps {
  readonly events: readonly EventItem[];
  readonly meta?: PaginationMeta;
  readonly activeStatus: OrganizerStatusFilter;
  readonly sort: EventSort;
  readonly statusCounts?: Partial<OrganizerStatusCounts>;
  readonly feedbackBanner?: OrganizerFeedbackBanner | null;
  readonly isLoading?: boolean;
  readonly isRevalidating?: boolean;
  readonly error?: ApiError | null;
  readonly publishingEventId?: string | null;
  readonly duplicatingEventId?: string | null;
  readonly onStatusChange: (status: OrganizerStatusFilter) => void;
  readonly onSortChange: (sort: EventSort) => void;
  readonly onPageChange: (page: number) => void;
  readonly onResetStatusFilter: () => void;
  readonly onRetry?: () => void;
  readonly onPublish: (event: EventItem) => void;
  readonly onRequestCancel: (event: EventItem) => void;
  readonly onDuplicate: (event: EventItem) => void;
}

const STATUS_TABS: readonly OrganizerStatusFilter[] = [
  "ALL",
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
];

const SORT_VALUES: readonly EventSort[] = [
  "-startsAt",
  "startsAt",
  "-createdAt",
  "title",
  "-title",
];

function getStatusBadgeTone(status: EventStatus): BadgeTone {
  switch (status) {
    case "PUBLISHED":
      return "success";
    case "CANCELLED":
      return "danger";
    case "DRAFT":
      return "neutral";
  }
}

function mapLoadError(error: ApiError, t: TFunction) {
  if (error.status === 401) {
    return {
      variant: "unauthorized" as const,
      title: t("errors.unauthenticatedTitle"),
      description: t("errors.unauthenticatedDescription"),
      loginHref: "/login?next=%2Fme%2Fevents",
    };
  }
  if (error.status === 403) {
    return {
      variant: "forbidden" as const,
      title: t("errors.forbiddenTitle"),
      description: t("errors.forbiddenDescription"),
      homeHref: "/events",
    };
  }
  if (error.code === "NETWORK_ERROR") {
    return {
      variant: "technical" as const,
      title: t("errors.networkTitle"),
      description: t("errors.networkDescription"),
    };
  }
  if (error.code === "TIMEOUT") {
    return {
      variant: "technical" as const,
      title: t("errors.timeoutTitle"),
      description: t("errors.timeoutDescription"),
    };
  }
  return {
    variant: "technical" as const,
    title: t("errors.genericTitle"),
    description: t(`errors.codes.${error.code}`, {
      defaultValue: t("errors.genericDescription"),
    }),
  };
}

/**
 * Vue de présentation pure de l'écran `07 · Mes événements (organisateur)`,
 * assemblée exclusivement à partir des primitives `front/src/components/ui/`.
 */
export function MyEventsView({
  events,
  meta,
  activeStatus,
  sort,
  statusCounts,
  feedbackBanner = null,
  isLoading = false,
  isRevalidating = false,
  error = null,
  publishingEventId = null,
  duplicatingEventId = null,
  onStatusChange,
  onSortChange,
  onPageChange,
  onResetStatusFilter,
  onRetry,
  onPublish,
  onRequestCancel,
  onDuplicate,
}: MyEventsViewProps) {
  const { t } = useTranslation();

  const isStatusFiltered = activeStatus !== "ALL";
  const isAnyMutating = publishingEventId !== null || duplicatingEventId !== null;

  const sortOptions = useMemo(
    () =>
      SORT_VALUES.map((value) => ({
        value,
        label: t(`myEvents.sortOptions.${value}`),
      })),
    [t],
  );

  const columns = useMemo<readonly DataTableColumn<EventItem>[]>(
    () => [
      {
        key: "title",
        header: t("myEvents.columns.title"),
        cellClassName: styles.titleCell,
        render: (event) => (
          <Link href={`/events/${event.id}`} className={styles.eventTitleLink}>
            {event.title}
          </Link>
        ),
      },
      {
        key: "date",
        header: t("myEvents.columns.date"),
        cellClassName: styles.dateCell,
        render: (event) => formatOrganizerEventDate(event.startsAt),
      },
      {
        key: "status",
        header: t("myEvents.columns.status"),
        render: (event) => (
          <Badge tone={getStatusBadgeTone(event.status)} dot>
            {t(`statuses.${event.status}`)}
          </Badge>
        ),
      },
      {
        key: "registrations",
        header: t("myEvents.columns.registrations"),
        cellClassName: styles.registrantsCell,
        render: (event) =>
          event.status === "DRAFT" ? (
            <span className={styles.emptyDash}>
              {t("myEvents.noRegistrationsDash")}
            </span>
          ) : (
            <CapacityMeter
              value={event.confirmedCount}
              max={event.capacity}
              size="sm"
              label={t("myEvents.fillLabel", {
                title: event.title,
                confirmed: event.confirmedCount,
                capacity: event.capacity,
              })}
            />
          ),
      },
      {
        key: "actions",
        header: t("myEvents.columns.actions"),
        cellClassName: styles.actionsCell,
        render: (event) => (
          <div className={styles.rowActions}>
            {event.status === "DRAFT" ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Icon name="send" size={14} />}
                  isLoading={publishingEventId === event.id}
                  disabled={isAnyMutating && publishingEventId !== event.id}
                  aria-label={t("myEvents.actions.publishAria", {
                    title: event.title,
                  })}
                  onClick={() => onPublish(event)}
                >
                  {t("myEvents.actions.publish")}
                </Button>

                <Button
                  href={`/admin/events/${event.id}/edit`}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Icon name="pencil" size={14} />}
                  aria-label={t("myEvents.actions.editAria", {
                    title: event.title,
                  })}
                >
                  {t("myEvents.actions.edit")}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Icon name="ban" size={14} />}
                  disabled={isAnyMutating}
                  aria-label={t("myEvents.actions.cancelAria", {
                    title: event.title,
                  })}
                  onClick={() => onRequestCancel(event)}
                >
                  {t("myEvents.actions.cancel")}
                </Button>
              </>
            ) : null}

            {event.status === "PUBLISHED" ? (
              <>
                <Button
                  href={`/admin/events/${event.id}/registrations`}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Icon name="users" size={14} />}
                  aria-label={t("myEvents.actions.registrationsAria", {
                    title: event.title,
                  })}
                >
                  {t("myEvents.actions.registrations")}
                </Button>

                <Button
                  href={`/admin/events/${event.id}/edit`}
                  variant="secondary"
                  size="sm"
                  leftIcon={<Icon name="pencil" size={14} />}
                  aria-label={t("myEvents.actions.editAria", {
                    title: event.title,
                  })}
                >
                  {t("myEvents.actions.edit")}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Icon name="ban" size={14} />}
                  disabled={isAnyMutating}
                  aria-label={t("myEvents.actions.cancelAria", {
                    title: event.title,
                  })}
                  onClick={() => onRequestCancel(event)}
                >
                  {t("myEvents.actions.cancel")}
                </Button>
              </>
            ) : null}

            {event.status === "CANCELLED" ? (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Icon name="copy" size={14} />}
                isLoading={duplicatingEventId === event.id}
                disabled={isAnyMutating && duplicatingEventId !== event.id}
                aria-label={t("myEvents.actions.duplicateAria", {
                  title: event.title,
                })}
                onClick={() => onDuplicate(event)}
              >
                {t("myEvents.actions.duplicate")}
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [
      duplicatingEventId,
      isAnyMutating,
      onDuplicate,
      onPublish,
      onRequestCancel,
      publishingEventId,
      t,
    ],
  );

  const rangeFrom =
    meta && meta.totalItems > 0 ? (meta.page - 1) * meta.pageSize + 1 : 0;
  const rangeTo =
    meta && meta.totalItems > 0
      ? Math.min(meta.page * meta.pageSize, meta.totalItems)
      : 0;

  return (
    <div className={styles.page}>
      <PageHeader
        title={t("myEvents.title")}
        subtitle={t("myEvents.subtitle")}
        isRevalidating={isRevalidating}
        revalidatingLabel={t("myEvents.revalidating")}
        actions={
          <Button
            href="/admin/events/new"
            variant="primary"
            leftIcon={<Icon name="plus" size={16} />}
          >
            {t("myEvents.createCta")}
          </Button>
        }
      />

      {feedbackBanner ? (
        <Alert
          tone={feedbackBanner.tone}
          action={
            feedbackBanner.editEventId ? (
              <Link
                href={`/admin/events/${feedbackBanner.editEventId}/edit`}
                className={styles.bannerActionLink}
              >
                {t("myEvents.banners.editAction")}
              </Link>
            ) : undefined
          }
        >
          {feedbackBanner.message}
        </Alert>
      ) : null}

      {isLoading ? (
        <SkeletonRow count={4} ariaLabel={t("myEvents.loadingAnnouncement")} />
      ) : error ? (
        <ErrorState
          {...mapLoadError(error, t)}
          requestId={error.requestId}
          onRetry={onRetry}
        />
      ) : events.length === 0 && !isStatusFiltered ? (
        <EmptyState
          icon={<Icon name="calendarPlus" size={28} />}
          title={t("myEvents.emptyTitle")}
          description={t("myEvents.emptyDescription")}
          actionLabel={t("myEvents.createCta")}
          actionIcon={<Icon name="plus" size={16} />}
          actionHref="/admin/events/new"
        />
      ) : (
        <div className={`${styles.body} ${isRevalidating ? styles.stale : ""}`.trim()}>
          <div className={styles.toolbar}>
            <div
              className={styles.tabs}
              role="group"
              aria-label={t("myEvents.statusFilterLabel")}
            >
              {STATUS_TABS.map((tab) => (
                <Chip
                  key={tab}
                  active={activeStatus === tab}
                  count={statusCounts?.[tab]}
                  onClick={() => onStatusChange(tab)}
                >
                  {t(`myEvents.tabs.${tab}`)}
                </Chip>
              ))}
            </div>

            <Select
              label={t("myEvents.sortLabel")}
              options={sortOptions}
              value={sort}
              onChange={(event) => onSortChange(event.target.value as EventSort)}
              className={styles.sortSelect}
            />
          </div>

          {events.length === 0 ? (
            <EmptyState
              icon={<Icon name="filterX" size={28} />}
              title={t("myEvents.emptyFilteredTitle")}
              description={t("myEvents.emptyFilteredDescription")}
              actionLabel={t("myEvents.emptyFilteredAction")}
              onAction={onResetStatusFilter}
            />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={events}
                getRowKey={(event) => event.id}
              />

              {meta ? (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  summary={t("myEvents.paginationSummary", {
                    from: rangeFrom,
                    to: rangeTo,
                    total: meta.totalItems,
                  })}
                  disabled={isRevalidating}
                  onPageChange={onPageChange}
                />
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
