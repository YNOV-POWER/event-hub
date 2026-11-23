"use client";

import Link from "next/link";
import type { TFunction } from "i18next";
import { Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EventCategory, EventItem } from "@/api/client";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import {
  formatCalendarChip,
  formatEventCardDateRange,
  getInitials,
} from "@/i18n/formatters";
import styles from "./EventCard.module.css";

export interface EventCardProps {
  readonly event: EventItem;
  readonly href?: string;
}

const CATEGORY_DOT_COLORS: Record<EventCategory, string> = {
  WORKSHOP: "#4F46E5",
  CONCERT: "#F97316",
  CONFERENCE: "#0284C7",
  OTHER: "#10B981",
};

const BANNER_CLASS_BY_CATEGORY: Record<EventCategory, string> = {
  WORKSHOP: styles.bannerWorkshop ?? "",
  CONCERT: styles.bannerConcert ?? "",
  CONFERENCE: styles.bannerConference ?? "",
  OTHER: styles.bannerOther ?? "",
};

function getSeatBadgeInfo(
  event: EventItem,
  t: TFunction,
): { tone: BadgeTone; label: string } {
  if (event.status === "CANCELLED") {
    return { tone: "danger", label: t("eventCard.cancelled") };
  }
  if (event.remainingSeats <= 0) {
    return { tone: "danger", label: t("eventCard.full") };
  }
  const lowThreshold = Math.max(5, Math.ceil(event.capacity * 0.1));
  if (event.remainingSeats <= lowThreshold) {
    return {
      tone: "warning",
      label: t("eventCard.seats", { count: event.remainingSeats }),
    };
  }
  return {
    tone: "success",
    label: t("eventCard.seats", { count: event.remainingSeats }),
  };
}

/**
 * Carte événement du catalogue (US09) — composant de présentation pur (aucun appel réseau).
 */
export function EventCard({ event, href }: EventCardProps) {
  const { t } = useTranslation();
  const targetHref = href ?? `/events/${event.id}`;
  const calendar = formatCalendarChip(event.startsAt);
  const dateRange = formatEventCardDateRange(event.startsAt, event.endsAt);
  const seatBadge = getSeatBadgeInfo(event, t);
  const bannerClass =
    event.status === "CANCELLED"
      ? styles.bannerCancelled
      : BANNER_CLASS_BY_CATEGORY[event.category];

  return (
    <article className={styles.card}>
      <Link
        href={targetHref}
        className={styles.link}
        aria-label={t("eventCard.viewDetails", { title: event.title })}
      >
        <div className={`${styles.banner} ${bannerClass}`}>
          <Badge tone="frosted" dot dotColor={CATEGORY_DOT_COLORS[event.category]}>
            {t(`categories.${event.category}`)}
          </Badge>

          <div className={styles.calendarChip} aria-hidden="true">
            <span className={styles.calendarMonth}>{calendar.month}</span>
            <span className={styles.calendarDay}>{calendar.day}</span>
          </div>
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>{event.title}</h3>

          <div className={styles.metaList}>
            <p className={styles.metaItem}>
              <Clock size={14} className={styles.metaIcon} aria-hidden="true" />
              <span>{dateRange}</span>
            </p>
            <p className={styles.metaItem}>
              <MapPin size={14} className={styles.metaIcon} aria-hidden="true" />
              <span className={styles.location}>{event.location}</span>
            </p>
          </div>

          <div className={styles.footer}>
            <div className={styles.organizer}>
              <span className={styles.avatar} aria-hidden="true">
                {getInitials(event.organizer.displayName)}
              </span>
              <span className={styles.organizerName}>
                {t("eventCard.organizedBy", { name: event.organizer.displayName })}
              </span>
            </div>

            <Badge tone={seatBadge.tone} dot>
              {seatBadge.label}
            </Badge>
          </div>
        </div>
      </Link>
    </article>
  );
}
