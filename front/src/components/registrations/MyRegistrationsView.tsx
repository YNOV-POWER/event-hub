"use client";

import Link from "next/link";
import { RefreshCw, Ticket } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MyRegistrationItem } from "@/api/client";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/SkeletonRow";
import { SyncIndicator } from "@/components/ui/SyncIndicator";
import { RegistrationRow } from "./RegistrationRow";
import styles from "./MyRegistrationsView.module.css";

export type RegistrationsTab = "upcoming" | "past";

export interface MyRegistrationsViewProps {
  readonly upcoming: readonly MyRegistrationItem[];
  readonly past: readonly MyRegistrationItem[];
  readonly promotedRegistration?: MyRegistrationItem | null;
  readonly activeTab: RegistrationsTab;
  readonly isLoading?: boolean;
  readonly isRevalidating?: boolean;
  readonly errorMessage?: string | null;
  readonly errorRequestId?: string;
  readonly onTabChange: (tab: RegistrationsTab) => void;
  readonly onRetry?: () => void;
  readonly onDownloadIcs: (registration: MyRegistrationItem) => void;
  readonly onRequestCancel: (registration: MyRegistrationItem) => void;
}

/**
 * Vue de présentation de l'écran 06 « Mes inscriptions » (US14, US13, US21, US28).
 */
export function MyRegistrationsView({
  upcoming,
  past,
  promotedRegistration = null,
  activeTab,
  isLoading = false,
  isRevalidating = false,
  errorMessage = null,
  errorRequestId,
  onTabChange,
  onRetry,
  onDownloadIcs,
  onRequestCancel,
}: MyRegistrationsViewProps) {
  const { t } = useTranslation();
  const totalCount = upcoming.length + past.length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t("myRegistrations.title")}</h1>
          {isRevalidating ? <SyncIndicator label={t("myRegistrations.revalidating")} /> : null}
        </div>
        <p className={styles.subtitle}>{t("myRegistrations.subtitle")}</p>
      </header>

      {isLoading ? (
        <SkeletonRow count={3} ariaLabel={t("myRegistrations.loadingAnnouncement")} />
      ) : errorMessage ? (
        <div className={styles.errorBlock}>
          <Alert tone="danger">
            <span>{errorMessage}</span>
            {errorRequestId ? (
              <span className={styles.requestId}>
                {" "}
                ({t("errors.requestId", { id: errorRequestId })})
              </span>
            ) : null}
          </Alert>
          {onRetry ? (
            <div>
              <Button
                variant="secondary"
                leftIcon={<RefreshCw size={15} aria-hidden="true" />}
                onClick={onRetry}
              >
                {t("errors.retry")}
              </Button>
            </div>
          ) : null}
        </div>
      ) : totalCount === 0 ? (
        <EmptyState
          icon={<Ticket size={28} />}
          title={t("myRegistrations.emptyTitle")}
          description={t("myRegistrations.emptyDescription")}
          actionLabel={t("myRegistrations.emptyAction")}
          actionHref="/events"
        />
      ) : (
        <div className={`${styles.body} ${isRevalidating ? styles.stale : ""}`.trim()}>
          {promotedRegistration ? (
            <Alert
              tone="success"
              action={
                <Link
                  href={`/events/${promotedRegistration.eventId}`}
                  className={styles.promotionLink}
                >
                  {t("myRegistrations.promotionAction")}
                </Link>
              }
            >
              {t("myRegistrations.promotionBanner", {
                title: promotedRegistration.event.title,
              })}
            </Alert>
          ) : null}

          <div
            className={styles.tabs}
            role="group"
            aria-label={t("myRegistrations.tabsLabel")}
          >
            <Chip
              active={activeTab === "upcoming"}
              count={upcoming.length}
              onClick={() => onTabChange("upcoming")}
            >
              {t("myRegistrations.upcomingTab")}
            </Chip>
            <Chip
              active={activeTab === "past"}
              count={past.length}
              onClick={() => onTabChange("past")}
            >
              {t("myRegistrations.pastTab")}
            </Chip>
          </div>

          {activeTab === "upcoming" ? (
            <>
              {upcoming.length > 0 ? (
                <section aria-label={t("myRegistrations.upcomingTab")} className={styles.list}>
                  {upcoming.map((item) => (
                    <RegistrationRow
                      key={item.id}
                      registration={item}
                      onDownloadIcs={onDownloadIcs}
                      onRequestCancel={onRequestCancel}
                    />
                  ))}
                </section>
              ) : (
                <EmptyState
                  icon={<Ticket size={28} />}
                  title={t("myRegistrations.emptyTitle")}
                  description={t("myRegistrations.emptyDescription")}
                  actionLabel={t("myRegistrations.emptyAction")}
                  actionHref="/events"
                />
              )}

              {past.length > 0 ? (
                <section aria-labelledby="past-registrations-heading" className={styles.pastSection}>
                  <h2 id="past-registrations-heading" className={styles.sectionTitle}>
                    {t("myRegistrations.pastSectionTitle")}
                  </h2>
                  <div className={styles.list}>
                    {past.map((item) => (
                      <RegistrationRow key={item.id} registration={item} isPast />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : past.length > 0 ? (
            <section aria-label={t("myRegistrations.pastTab")} className={styles.list}>
              {past.map((item) => (
                <RegistrationRow key={item.id} registration={item} isPast />
              ))}
            </section>
          ) : (
            <EmptyState
              icon={<Ticket size={28} />}
              title={t("myRegistrations.emptyPastTitle")}
              description={t("myRegistrations.emptyPastDescription")}
            />
          )}
        </div>
      )}
    </div>
  );
}
