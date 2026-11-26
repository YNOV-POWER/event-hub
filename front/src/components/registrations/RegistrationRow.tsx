"use client";

import Link from "next/link";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { MyRegistrationItem } from "@/api/client";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CalendarChip } from "@/components/ui/CalendarChip";
import { Icon } from "@/components/ui/Icon";
import {
  formatCalendarChip,
  formatEventCardDateRange,
  formatOrdinalFr,
} from "@/i18n/formatters";
import styles from "./RegistrationRow.module.css";

export interface RegistrationRowProps {
  readonly registration: MyRegistrationItem;
  readonly isPast?: boolean;
  readonly onDownloadIcs?: (registration: MyRegistrationItem) => void;
  readonly onRequestCancel?: (registration: MyRegistrationItem) => void;
}

function getRegistrationBadge(
  registration: MyRegistrationItem,
  isPast: boolean,
  t: TFunction,
): { tone: BadgeTone; label: string } {
  if (registration.status === "CANCELLED" || registration.event.status === "CANCELLED") {
    return { tone: "danger", label: t("myRegistrations.status.cancelled") };
  }
  if (isPast) {
    return { tone: "neutral", label: t("myRegistrations.status.attended") };
  }
  if (registration.status === "WAITLISTED") {
    return {
      tone: "warning",
      label: t("myRegistrations.status.waitlisted", {
        ordinal: formatOrdinalFr(registration.position ?? 1),
      }),
    };
  }
  return { tone: "success", label: t("myRegistrations.status.confirmed") };
}

/**
 * Ligne / carte d'inscription (écran 06 · Mes inscriptions) — présentation pure.
 */
export function RegistrationRow({
  registration,
  isPast = false,
  onDownloadIcs,
  onRequestCancel,
}: RegistrationRowProps) {
  const { t } = useTranslation();
  const { event } = registration;
  const calendar = formatCalendarChip(event.startsAt);
  const dateRange = formatEventCardDateRange(event.startsAt, event.endsAt);
  const badge = getRegistrationBadge(registration, isPast, t);
  const isConfirmedUpcoming = !isPast && registration.status === "CONFIRMED";
  const isWaitlistedUpcoming = !isPast && registration.status === "WAITLISTED";

  return (
    <article className={`${styles.row} ${isPast ? styles.pastRow : ""}`.trim()}>
      <div className={styles.left}>
        <CalendarChip
          month={calendar.month}
          day={calendar.day}
          tone={isPast ? "muted" : "soft"}
          size="md"
        />

        <div className={styles.info}>
          <Link
            href={`/events/${event.id}`}
            className={styles.title}
            aria-label={t("myRegistrations.actions.viewEvent", { title: event.title })}
          >
            {event.title}
          </Link>

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <Icon name="clock" size={14} className={styles.metaIcon} />
              <span>{dateRange}</span>
            </span>
            <span className={styles.metaItem}>
              <Icon name="mapPin" size={14} className={styles.metaIcon} />
              <span>{event.location}</span>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Badge tone={badge.tone} dot>
          {badge.label}
        </Badge>

        {isConfirmedUpcoming && onDownloadIcs ? (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="calendarPlus" size={15} />}
            aria-label={t("myRegistrations.actions.icsAriaLabel", { title: event.title })}
            onClick={() => onDownloadIcs(registration)}
          >
            {t("myRegistrations.actions.ics")}
          </Button>
        ) : null}

        {(isConfirmedUpcoming || isWaitlistedUpcoming) && onRequestCancel ? (
          <Button
            variant="ghost"
            size="sm"
            className={styles.cancelButton}
            onClick={() => onRequestCancel(registration)}
          >
            {isWaitlistedUpcoming
              ? t("myRegistrations.actions.leaveWaitlist")
              : t("myRegistrations.actions.unsubscribe")}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
