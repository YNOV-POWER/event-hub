"use client";

import { useTranslation } from "react-i18next";
import type { EventItem } from "@/api/client";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { EventCard } from "./EventCard";
import styles from "./EventGrid.module.css";

export interface EventGridProps {
  readonly events: readonly EventItem[];
  readonly isLoading?: boolean;
  readonly isStale?: boolean;
  readonly skeletonCount?: number;
}

export function EventGrid({
  events,
  isLoading = false,
  isStale = false,
  skeletonCount = 6,
}: EventGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div
        className={styles.grid}
        aria-busy="true"
        aria-label={t("catalogue.loadingAnnouncement")}
      >
        {Array.from({ length: skeletonCount }, (_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className={`${styles.grid} ${isStale ? styles.stale : ""}`.trim()}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
