"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Calendar, ChevronLeft, MapPin, RefreshCw, User, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EventCategory, EventItem } from "@/api/client";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { formatEventDetailDate } from "@/i18n/formatters";
import styles from "./EventDetailView.module.css";

export interface EventDetailViewProps {
  readonly event: EventItem;
  readonly isRevalidating?: boolean;
  readonly registrationSlot: ReactNode;
}

const BANNER_CLASS_BY_CATEGORY: Record<EventCategory, string> = {
  WORKSHOP: styles.bannerWorkshop ?? "",
  CONCERT: styles.bannerConcert ?? "",
  CONFERENCE: styles.bannerConference ?? "",
  OTHER: styles.bannerOther ?? "",
};

const CATEGORY_DOT_COLORS: Record<EventCategory, string> = {
  WORKSHOP: "#4F46E5",
  CONCERT: "#F97316",
  CONFERENCE: "#0284C7",
  OTHER: "#10B981",
};

export function EventDetailView({
  event,
  isRevalidating = false,
  registrationSlot,
}: EventDetailViewProps) {
  const { t } = useTranslation();
  const formatted = formatEventDetailDate(event.startsAt, event.endsAt);
  const fillPercent = Math.min(
    100,
    Math.round((event.confirmedCount / Math.max(1, event.capacity)) * 100),
  );
  const isCancelled = event.status === "CANCELLED";
  const bannerClass = isCancelled
    ? styles.bannerCancelled
    : BANNER_CLASS_BY_CATEGORY[event.category];

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/events" className={styles.backLink}>
          <ChevronLeft size={16} aria-hidden="true" />
          <span>{t("eventDetail.backToCatalogue")}</span>
        </Link>
        {isRevalidating ? (
          <span className={styles.revalidating} role="status" aria-live="polite">
            <RefreshCw size={13} className={styles.spin} aria-hidden="true" />
            {t("eventDetail.revalidating")}
          </span>
        ) : null}
      </div>

      {isCancelled ? (
        <Alert tone="danger" title={t("eventDetail.cancelledBannerTitle")} className={styles.bannerAlert}>
          {t("eventDetail.cancelledBannerBody")}
        </Alert>
      ) : null}

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <div className={`${styles.hero} ${bannerClass}`}>
            <div className={styles.heroBadges}>
              <Badge tone="frosted" dot dotColor={CATEGORY_DOT_COLORS[event.category]}>
                {t(`categories.${event.category}`)}
              </Badge>
              <Badge tone={isCancelled ? "danger" : "success"} dot>
                {t(`statuses.${event.status}`)}
              </Badge>
            </div>
          </div>

          <h1 className={styles.title}>{event.title}</h1>

          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon} aria-hidden="true">
                <Calendar size={18} />
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
                <MapPin size={18} />
              </span>
              <div>
                <p className={styles.infoPrimary}>{event.location}</p>
              </div>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoIcon} aria-hidden="true">
                <User size={18} />
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

            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={event.confirmedCount}
              aria-valuemin={0}
              aria-valuemax={event.capacity}
              aria-label={t("eventDetail.confirmedParticipants", { count: event.confirmedCount })}
            >
              <div className={styles.progressBar} style={{ width: `${fillPercent}%` }} />
            </div>

            {registrationSlot}

            <p className={styles.note}>{t("eventDetail.unsubscribeNote")}</p>
          </div>

          <div className={styles.countCard}>
            <Users size={16} aria-hidden="true" />
            <span>
              {t("eventDetail.confirmedParticipants", { count: event.confirmedCount })}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
