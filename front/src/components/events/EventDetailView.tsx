"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { EventItem } from "@/api/client";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SyncIndicator } from "@/components/ui/SyncIndicator";
import { downloadEventIcs } from "@/i18n/calendar";
import { formatEventDetailDate } from "@/i18n/formatters";
import { EventBanner } from "./EventBanner";
import styles from "./EventDetailView.module.css";

export interface EventDetailViewProps {
  readonly event: EventItem;
  readonly isRevalidating?: boolean;
  readonly registrationSlot: ReactNode;
}

export function EventDetailView({
  event,
  isRevalidating = false,
  registrationSlot,
}: EventDetailViewProps) {
  const { t } = useTranslation();
  const formatted = formatEventDetailDate(event.startsAt, event.endsAt);
  const isCancelled = event.status === "CANCELLED";

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/events" className={styles.backLink}>
          <Icon name="chevronLeft" size={16} />
          <span>{t("eventDetail.backToCatalogue")}</span>
        </Link>
        {isRevalidating ? <SyncIndicator label={t("eventDetail.revalidating")} /> : null}
      </div>

      {isCancelled ? (
        <Alert
          tone="danger"
          title={t("eventDetail.cancelledBannerTitle")}
          className={styles.bannerAlert}
        >
          {t("eventDetail.cancelledBannerBody")}
        </Alert>
      ) : null}

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <EventBanner
            category={event.category}
            status={event.status}
            size="hero"
            showStatusBadge
          />

          <h1 className={styles.title}>{event.title}</h1>

          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon} aria-hidden="true">
                <Icon name="calendar" size={18} />
              </span>
              <div>
                <p className={styles.infoPrimary}>{formatted.date}</p>
                <p className={styles.infoSecondary}>
                  {formatted.timeRange} ({t("eventDetail.timezoneNote")})
                </p>
              </div>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoIcon} aria-hidden="true">
                <Icon name="mapPin" size={18} />
              </span>
              <div>
                <p className={styles.infoPrimary}>{event.location}</p>
              </div>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoIcon} aria-hidden="true">
                <Icon name="user" size={18} />
              </span>
              <div>
                <p className={styles.infoPrimary}>
                  {t("eventDetail.organizedBy", { name: event.organizer.displayName })}
                </p>
                <p className={styles.infoSecondary}>{t("eventDetail.organizerSubtitle")}</p>
              </div>
            </div>
          </div>

          <section aria-labelledby="about-heading" className={styles.about}>
            <h2 id="about-heading" className={styles.sectionTitle}>
              {t("eventDetail.aboutTitle")}
            </h2>
            <p className={styles.description}>
              {event.description || t("eventDetail.noDescription")}
            </p>
          </section>
        </div>

        <aside className={styles.sideCol} aria-label={t("eventDetail.registrationCardTitle")}>
          <div className={styles.sideCard}>
            <div className={styles.sideHeader}>
              <h2 className={styles.sideTitle}>{t("eventDetail.registrationCardTitle")}</h2>
              <Badge tone="neutral" dot>
                {t("eventDetail.freeBadge")}
              </Badge>
            </div>

            <div className={styles.seatsSummary}>
              <span className={styles.seatsNumber}>{event.remainingSeats}</span>
              <span className={styles.seatsText}>
                {t("eventDetail.remainingSeats", {
                  count: event.remainingSeats,
                  capacity: event.capacity,
                })}
              </span>
            </div>

            <ProgressBar
              value={event.confirmedCount}
              max={event.capacity}
              label={t("eventDetail.confirmedParticipants", { count: event.confirmedCount })}
            />

            {registrationSlot}

            {!isCancelled ? (
              <Button
                variant="secondary"
                fullWidth
                leftIcon={<Icon name="calendarPlus" size={16} />}
                onClick={() => downloadEventIcs(event)}
              >
                {t("eventDetail.addToCalendar")}
              </Button>
            ) : null}

            <p className={styles.note}>{t("eventDetail.unsubscribeNote")}</p>
          </div>

          <div className={styles.countCard}>
            <Icon name="users" size={16} />
            <span>
              {t("eventDetail.confirmedParticipants", { count: event.confirmedCount })}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
