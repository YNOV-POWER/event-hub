"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { EventItem, EventStatus } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonRow } from "@/components/ui/SkeletonRow";
import { StatCard } from "@/components/ui/StatCard";
import {
  formatOrdinalFr,
  formatOrganizerEventDate,
  formatRegistrationDate,
} from "@/i18n/formatters";
import type { EventRegistrant } from "@/mocks/organizerDemo";
import styles from "./RegistrantsView.module.css";

const STATUS_TONES: Record<EventStatus, BadgeTone> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  CANCELLED: "danger",
};

export interface RegistrantsViewProps {
  readonly event: EventItem | null;
  readonly registrants: readonly EventRegistrant[];
  readonly page: number;
  readonly pageSize: number;
  readonly isLoading?: boolean;
  readonly error?: ApiError | null;
  readonly isForbidden?: boolean;
  readonly isLinkCopied?: boolean;
  readonly onPageChange: (page: number) => void;
  readonly onExport: () => void;
  readonly onCopyLink: () => void;
  readonly onRetry?: () => void;
}

export function formatRegistrantStatus(registrant: EventRegistrant, t: TFunction): string {
  return registrant.status === "WAITLISTED"
    ? t("registrants.statuses.WAITLISTED", { position: formatOrdinalFr(registrant.position ?? 1) })
    : t("registrants.statuses.CONFIRMED");
}

function mapLoadError(error: ApiError, t: TFunction) {
  if (error.status === 404) {
    return {
      variant: "notFound" as const,
      overline: t("eventDetail.notFoundOverline"),
      title: t("eventDetail.notFoundTitle"),
      description: t("eventDetail.notFoundDescription"),
      homeHref: "/me/events",
      homeLabel: t("registrants.backToMyEvents"),
    };
  }
  return {
    variant: "technical" as const,
    title: t("errors.genericTitle"),
    description: t(`errors.codes.${error.code}`, { defaultValue: t("errors.genericDescription") }),
  };
}

export function RegistrantsView({
  event,
  registrants,
  page,
  pageSize,
  isLoading = false,
  error = null,
  isForbidden = false,
  isLinkCopied = false,
  onPageChange,
  onExport,
  onCopyLink,
  onRetry,
}: RegistrantsViewProps) {
  const { t } = useTranslation();

  const totalPages = Math.max(1, Math.ceil(registrants.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = registrants.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeFrom = registrants.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeTo = Math.min(currentPage * pageSize, registrants.length);

  const columns = useMemo<readonly DataTableColumn<EventRegistrant>[]>(
    () => [
      {
        key: "participant",
        header: t("registrants.columns.participant"),
        render: (registrant) => (
          <span className={styles.participant}>
            <Avatar name={registrant.displayName} size="md" />
            <span>{registrant.displayName}</span>
          </span>
        ),
      },
      {
        key: "email",
        header: t("registrants.columns.email"),
        headerClassName: styles.emailColumn,
        cellClassName: styles.mutedCell,
        render: (registrant) => registrant.email,
      },
      {
        key: "status",
        header: t("registrants.columns.status"),
        headerClassName: styles.statusColumn,
        render: (registrant) => (
          <Badge tone={registrant.status === "WAITLISTED" ? "warning" : "success"} dot>
            {formatRegistrantStatus(registrant, t)}
          </Badge>
        ),
      },
      {
        key: "registeredAt",
        header: t("registrants.columns.registeredAt"),
        headerClassName: styles.dateColumn,
        cellClassName: styles.mutedCell,
        render: (registrant) => formatRegistrationDate(registrant.createdAt),
      },
    ],
    [t],
  );

  const backLink = (
    <Link href="/me/events" className={styles.backLink}>
      <Icon name="chevronLeft" size={16} />
      <span>{t("registrants.backToMyEvents")}</span>
    </Link>
  );

  if (isLoading) {
    return (
      <div className={styles.page}>
        {backLink}
        <SkeletonRow count={4} ariaLabel={t("registrants.loadingAnnouncement")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        {backLink}
        <ErrorState {...mapLoadError(error, t)} requestId={error.requestId} onRetry={onRetry} />
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className={styles.page}>
        {backLink}
        <EmptyState
          tone="danger"
          icon={<Icon name="lock" size={28} />}
          title={t("registrants.forbiddenTitle")}
          description={t("registrants.forbiddenDescription")}
          actionLabel={t("registrants.back")}
          actionHref="/me/events"
        />
      </div>
    );
  }

  if (!event) return null;

  const fillPercent = event.capacity > 0 ? Math.round((event.confirmedCount / event.capacity) * 100) : 0;

  return (
    <div className={styles.page}>
      {backLink}

      <PageHeader
        title={t("registrants.title", { title: event.title })}
        subtitle={t("registrants.subtitle", {
          date: formatOrganizerEventDate(event.startsAt),
          location: event.location,
        })}
        actions={
          <>
            <Badge tone={STATUS_TONES[event.status]} dot className={styles.statusBadge}>
              {t(`statuses.${event.status}`)}
            </Badge>
            <Button
              variant="secondary"
              leftIcon={<Icon name="download" size={18} />}
              disabled={registrants.length === 0}
              onClick={onExport}
            >
              {t("registrants.export")}
            </Button>
          </>
        }
      />

      <div className={styles.stats}>
        <StatCard
          icon="users"
          iconTone="primary"
          value={t("registrants.stats.confirmedValue", {
            confirmed: event.confirmedCount,
            capacity: event.capacity,
          })}
          label={t("registrants.stats.confirmedLabel")}
          caption={t("registrants.stats.fillRate", { percent: fillPercent })}
        />
        <StatCard
          icon="ticket"
          iconTone="success"
          value={event.remainingSeats}
          label={t("registrants.stats.remainingLabel")}
          caption={t("registrants.stats.remainingCaption")}
        />
        <StatCard
          icon="hourglass"
          iconTone="warning"
          value={event.waitlistCount ?? 0}
          label={t("registrants.stats.waitlistLabel")}
          caption={t("registrants.stats.waitlistCaption")}
        />
      </div>

      {registrants.length === 0 ? (
        <EmptyState
          icon={<Icon name="users" size={28} />}
          title={t("registrants.emptyTitle")}
          description={t("registrants.emptyDescription")}
          actionLabel={isLinkCopied ? t("registrants.linkCopied") : t("registrants.copyLink")}
          actionIcon={<Icon name={isLinkCopied ? "check" : "copy"} size={18} />}
          onAction={onCopyLink}
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={pageRows}
            getRowKey={(registrant) => registrant.id}
            ariaLabel={t("registrants.tableLabel", { title: event.title })}
          />
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            summary={t("registrants.paginationSummary", {
              from: rangeFrom,
              to: rangeTo,
              total: registrants.length,
            })}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}
