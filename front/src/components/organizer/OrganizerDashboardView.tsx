"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { EventItem } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { ActionList, type ActionListItem } from "@/components/ui/ActionList";
import { Button } from "@/components/ui/Button";
import { CapacityMeter } from "@/components/ui/CapacityMeter";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonRow } from "@/components/ui/SkeletonRow";
import { StatCard } from "@/components/ui/StatCard";
import { formatShortEventDate } from "@/i18n/formatters";
import styles from "./OrganizerDashboardView.module.css";

export interface OrganizerDashboardMetrics {
  readonly upcomingPublished: readonly EventItem[];
  readonly upcomingThisMonthCount: number;
  readonly drafts: readonly EventItem[];
  readonly averageFillPercent: number | null;
  readonly totalWaitlistCount: number;
  readonly waitlistEventsCount: number;
  readonly topUpcoming: readonly EventItem[];
  readonly almostFullEvent: EventItem | null;
  readonly topWaitlistedEvent: EventItem | null;
}

/**
 * Calcule les indicateurs agrégés et la liste « À faire » du tableau de bord organisateur
 * directement depuis la collection `GET /api/me/events` (contrat v0.1 / US27).
 */
export function computeOrganizerDashboardMetrics(
  events: readonly EventItem[],
  now: Date = new Date(),
): OrganizerDashboardMetrics {
  const nowMs = now.getTime();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  const drafts = events.filter((event) => event.status === "DRAFT");

  const upcomingPublished = events
    .filter((event) => {
      if (event.status !== "PUBLISHED") return false;
      const endsMs = new Date(event.endsAt).getTime();
      return !Number.isFinite(endsMs) || endsMs >= nowMs;
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const upcomingThisMonthCount = upcomingPublished.filter((event) => {
    const start = new Date(event.startsAt);
    return (
      start.getUTCFullYear() === currentYear && start.getUTCMonth() === currentMonth
    );
  }).length;

  let sumConfirmed = 0;
  let sumCapacity = 0;
  let totalWaitlistCount = 0;
  let waitlistEventsCount = 0;
  let almostFullEvent: EventItem | null = null;
  let highestFillRatio = -1;
  let topWaitlistedEvent: EventItem | null = null;

  for (const event of upcomingPublished) {
    sumConfirmed += event.confirmedCount;
    sumCapacity += event.capacity;

    const wl = event.waitlistCount ?? 0;
    if (wl > 0) {
      totalWaitlistCount += wl;
      waitlistEventsCount += 1;
      if (!topWaitlistedEvent || wl > (topWaitlistedEvent.waitlistCount ?? 0)) {
        topWaitlistedEvent = event;
      }
    }

    const ratio = event.capacity > 0 ? event.confirmedCount / event.capacity : 0;
    if ((ratio >= 0.8 || event.remainingSeats <= 5) && ratio > highestFillRatio) {
      highestFillRatio = ratio;
      almostFullEvent = event;
    }
  }

  const averageFillPercent =
    sumCapacity > 0 ? Math.round((sumConfirmed / sumCapacity) * 100) : null;

  return {
    upcomingPublished,
    upcomingThisMonthCount,
    drafts,
    averageFillPercent,
    totalWaitlistCount,
    waitlistEventsCount,
    topUpcoming: upcomingPublished.slice(0, 4),
    almostFullEvent,
    topWaitlistedEvent,
  };
}

function mapDashboardError(error: ApiError, t: TFunction) {
  if (error.status === 401) {
    return {
      variant: "unauthorized" as const,
      title: t("errors.unauthenticatedTitle"),
      description: t("errors.unauthenticatedDescription"),
      loginHref: "/login?next=%2Fdashboard",
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
  return {
    variant: "technical" as const,
    title: t("errors.genericTitle"),
    description: t(`errors.codes.${error.code}`, {
      defaultValue: t("errors.genericDescription"),
    }),
  };
}

export interface OrganizerDashboardViewProps {
  readonly organizerName?: string | null;
  readonly events: readonly EventItem[];
  readonly referenceDate?: Date;
  readonly isLoading?: boolean;
  readonly isRevalidating?: boolean;
  readonly error?: ApiError | null;
  readonly onRetry?: () => void;
}

/**
 * Vue de présentation pure de l'écran `10 · Tableau de bord organisateur` (US27 / SCRUM-71),
 * assemblée exclusivement à partir des primitives `front/src/components/ui/`.
 */
export function OrganizerDashboardView({
  organizerName = null,
  events,
  referenceDate,
  isLoading = false,
  isRevalidating = false,
  error = null,
  onRetry,
}: OrganizerDashboardViewProps) {
  const { t } = useTranslation();

  const metrics = useMemo(
    () => computeOrganizerDashboardMetrics(events, referenceDate),
    [events, referenceDate],
  );

  const upcomingColumns = useMemo<readonly DataTableColumn<EventItem>[]>(
    () => [
      {
        key: "event",
        header: t("dashboard.upcomingSection.eventColumn"),
        render: (event) => (
          <div className={styles.eventCell}>
            <Link href={`/events/${event.id}`} className={styles.eventTitle}>
              {event.title}
            </Link>
            <span className={styles.eventDate}>
              {formatShortEventDate(event.startsAt)}
            </span>
          </div>
        ),
      },
      {
        key: "fill",
        header: t("dashboard.upcomingSection.fillColumn"),
        cellClassName: styles.fillCell,
        render: (event) => {
          const percent =
            event.capacity > 0
              ? Math.round((event.confirmedCount / event.capacity) * 100)
              : 0;
          return (
            <CapacityMeter
              value={event.confirmedCount}
              max={event.capacity}
              size="md"
              showPercent
              warningThresholdPercent={85}
              label={t("dashboard.upcomingSection.fillBarLabel", {
                title: event.title,
                percent,
              })}
            />
          );
        },
      },
    ],
    [t],
  );

  const todoItems = useMemo<readonly ActionListItem[]>(() => {
    const items: ActionListItem[] = [];

    if (metrics.drafts.length > 0) {
      items.push({
        id: "drafts",
        icon: "send",
        tone: "primary",
        title: t("dashboard.todoSection.draftsTitle", { count: metrics.drafts.length }),
        subtitle: metrics.drafts
          .slice(0, 2)
          .map((item) => item.title)
          .join(", "),
        href: "/me/events?status=DRAFT",
      });
    }

    if (metrics.almostFullEvent) {
      const target = metrics.almostFullEvent;
      const isZero = target.remainingSeats <= 0;
      items.push({
        id: "almost-full",
        icon: "alert",
        tone: "warning",
        title: isZero
          ? t("dashboard.todoSection.fullTitle")
          : t("dashboard.todoSection.almostFullTitle"),
        subtitle: isZero
          ? t("dashboard.todoSection.fullSubtitle", { title: target.title })
          : t("dashboard.todoSection.almostFullSubtitle", {
              title: target.title,
              count: target.remainingSeats,
            }),
        href: `/events/${target.id}`,
      });
    }

    if (metrics.topWaitlistedEvent) {
      const target = metrics.topWaitlistedEvent;
      const count = target.waitlistCount ?? 0;
      items.push({
        id: "waitlist",
        icon: "users",
        tone: "info",
        title: t("dashboard.todoSection.waitlistTitle", { count }),
        subtitle: target.title,
        href: `/admin/events/${target.id}/registrations`,
      });
    }

    return items;
  }, [metrics, t]);

  return (
    <div className={styles.page}>
      <PageHeader
        title={
          organizerName
            ? t("dashboard.greeting", { name: organizerName })
            : t("dashboard.defaultTitle")
        }
        subtitle={t("dashboard.subtitle")}
        isRevalidating={isRevalidating}
        revalidatingLabel={t("dashboard.revalidating")}
        actions={
          <Button
            href="/admin/events/new"
            variant="primary"
            leftIcon={<Icon name="plus" size={16} />}
          >
            {t("dashboard.createCta")}
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonRow count={4} ariaLabel={t("dashboard.loadingAnnouncement")} />
      ) : error ? (
        <ErrorState
          {...mapDashboardError(error, t)}
          requestId={error.requestId}
          onRetry={onRetry}
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Icon name="layoutDashboard" size={28} />}
          title={t("dashboard.emptyTitle")}
          description={t("dashboard.emptyDescription")}
          actionLabel={t("dashboard.createCta")}
          actionIcon={<Icon name="plus" size={16} />}
          actionHref="/admin/events/new"
        />
      ) : (
        <div className={`${styles.body} ${isRevalidating ? styles.stale : ""}`.trim()}>
          <section
            className={styles.kpiGrid}
            aria-label={t("dashboard.defaultTitle")}
          >
            <StatCard
              icon="calendar"
              iconTone="primary"
              value={metrics.upcomingPublished.length}
              label={t("dashboard.kpi.upcomingLabel")}
              caption={
                metrics.upcomingThisMonthCount > 0
                  ? t("dashboard.kpi.upcomingThisMonth", {
                      count: metrics.upcomingThisMonthCount,
                    })
                  : t("dashboard.kpi.upcomingNoneThisMonth")
              }
              captionTone={metrics.upcomingThisMonthCount > 0 ? "success" : "muted"}
            />

            <StatCard
              icon="pencil"
              iconTone="warning"
              value={metrics.drafts.length}
              label={t("dashboard.kpi.draftsLabel")}
              caption={
                metrics.drafts.length > 0
                  ? t("dashboard.kpi.draftsToPublish")
                  : t("dashboard.kpi.draftsNone")
              }
              captionTone="success"
            />

            <StatCard
              icon="trendingUp"
              iconTone="success"
              value={
                metrics.averageFillPercent !== null
                  ? `${metrics.averageFillPercent} %`
                  : "—"
              }
              label={t("dashboard.kpi.fillRateLabel")}
              caption={
                metrics.upcomingPublished.length > 0
                  ? t("dashboard.kpi.fillRateCaption", {
                      count: metrics.upcomingPublished.length,
                    })
                  : t("dashboard.kpi.fillRateEmpty")
              }
              captionTone={
                metrics.upcomingPublished.length > 0 ? "success" : "muted"
              }
            />

            <StatCard
              icon="hourglass"
              iconTone="info"
              value={metrics.totalWaitlistCount}
              label={t("dashboard.kpi.waitlistLabel")}
              caption={
                metrics.waitlistEventsCount > 0
                  ? t("dashboard.kpi.waitlistCaption", {
                      count: metrics.waitlistEventsCount,
                    })
                  : t("dashboard.kpi.waitlistNone")
              }
              captionTone={metrics.waitlistEventsCount > 0 ? "success" : "muted"}
            />
          </section>

          <div className={styles.mainGrid}>
            <section
              className={styles.panelSection}
              aria-labelledby="dashboard-upcoming-heading"
            >
              <h2 id="dashboard-upcoming-heading" className={styles.sectionTitle}>
                {t("dashboard.upcomingSection.title")}
              </h2>

              <DataTable
                columns={upcomingColumns}
                data={metrics.topUpcoming}
                getRowKey={(event) => event.id}
                emptyState={
                  <div className={styles.inlineEmpty}>
                    <p>{t("dashboard.upcomingSection.empty")}</p>
                    <Button href="/me/events" variant="link">
                      {t("dashboard.upcomingSection.manageLink")}
                    </Button>
                  </div>
                }
              />
            </section>

            <section
              className={styles.panelSection}
              aria-labelledby="dashboard-todo-heading"
            >
              <h2 id="dashboard-todo-heading" className={styles.sectionTitle}>
                {t("dashboard.todoSection.title")}
              </h2>

              <ActionList
                items={todoItems}
                emptyItem={{
                  icon: "checkCircle",
                  tone: "success",
                  title: t("dashboard.todoSection.allClearTitle"),
                  subtitle: t("dashboard.todoSection.allClearSubtitle"),
                }}
              />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
