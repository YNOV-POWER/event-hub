"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { EventCategory, EventStatus } from "@/api/client";
import { Badge } from "@/components/ui/Badge";
import styles from "./EventBanner.module.css";

export type EventBannerSize = "card" | "hero";

export interface EventBannerProps {
  readonly category: EventCategory;
  readonly status: EventStatus;
  readonly size?: EventBannerSize;
  readonly showStatusBadge?: boolean;
  readonly rightSlot?: ReactNode;
  readonly className?: string;
}

const CATEGORY_DOT_COLORS: Record<EventCategory, string> = {
  WORKSHOP: "#4F46E5",
  CONCERT: "#F97316",
  CONFERENCE: "#0284C7",
  OTHER: "#10B981",
};

const GRADIENT_BY_CATEGORY: Record<EventCategory, string> = {
  WORKSHOP: styles.workshop ?? "",
  CONCERT: styles.concert ?? "",
  CONFERENCE: styles.conference ?? "",
  OTHER: styles.other ?? "",
};

/**
 * Bandeau dégradé par catégorie d'événement, partagé entre EventCard et EventDetailView.
 */
export function EventBanner({
  category,
  status,
  size = "card",
  showStatusBadge = false,
  rightSlot,
  className = "",
}: EventBannerProps) {
  const { t } = useTranslation();
  const isCancelled = status === "CANCELLED";
  const gradientClass = isCancelled
    ? styles.cancelled
    : GRADIENT_BY_CATEGORY[category];

  return (
    <div
      className={`${styles.banner} ${styles[size]} ${gradientClass} ${className}`.trim()}
    >
      <div className={styles.badges}>
        <Badge tone="frosted" dot dotColor={CATEGORY_DOT_COLORS[category]}>
          {t(`categories.${category}`)}
        </Badge>
        {showStatusBadge ? (
          <Badge tone={isCancelled ? "danger" : "success"} dot>
            {t(`statuses.${status}`)}
          </Badge>
        ) : null}
      </div>

      {rightSlot ? <div className={styles.right}>{rightSlot}</div> : null}
    </div>
  );
}
