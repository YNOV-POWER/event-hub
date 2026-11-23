"use client";

import Link from "next/link";
import type { TFunction } from "i18next";
import { Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EventItem } from "@/api/client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { CalendarChip } from "@/components/ui/CalendarChip";
import { formatCalendarChip, formatEventCardDateRange } from "@/i18n/formatters";
import { EventBanner } from "./EventBanner";
import styles from "./EventCard.module.css";

export interface EventCardProps {
  readonly event: EventItem;
  readonly href?: string;
}

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

  return (
    <article className={styles.card}>
      <Link
        href={targetHref}
        className={styles.link}
        aria-label={t("eventCard.viewDetails", { title: event.title })}
      >
        <EventBanner
          category={event.category}
          status={event.status}
          size="card"
          rightSlot={<CalendarChip month={calendar.month} day={calendar.day} />}
        />

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
              <Avatar name={event.organizer.displayName} size="sm" />
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
