"use client";

import { useCallback } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import type { EventCategory, EventSort } from "@/api/client";
import type { ApiError } from "@/api/errors";
import { EventGrid } from "@/components/events/EventGrid";
import { FilterBar } from "@/components/events/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { useEventFilters, type DatePreset } from "@/hooks/useEventFilters";
import { useEvents } from "@/hooks/useEvents";
import styles from "./EventListPage.module.css";

function mapErrorDisplay(error: ApiError, t: TFunction) {
  if (error.status === 401) {
    return {
      variant: "unauthorized" as const,
      title: t("errors.unauthenticatedTitle"),
      description: t("errors.unauthenticatedDescription"),
      loginHref: "/login?next=%2Fevents",
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
  if (error.code === "NETWORK_ERROR") {
    return {
      variant: "technical" as const,
      title: t("errors.networkTitle"),
      description: t("errors.networkDescription"),
    };
  }
  if (error.code === "TIMEOUT") {
    return {
      variant: "technical" as const,
      title: t("errors.timeoutTitle"),
      description: t("errors.timeoutDescription"),
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

/**
 * Conteneur de la page catalogue (`/events`).
 * Orchestre les filtres URL (`useEventFilters`), les données serveur (`useEvents`)
 * et les 5 états d'interface : Chargement, Succès, Vide, Erreur et Obsolète.
 */
export function EventListPage() {
  const { t } = useTranslation();
  const { filters, apiQuery, isFiltered, updateFilters, resetFilters } = useEventFilters();
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } =
    useEvents(apiQuery);

  const handleSearchChange = useCallback(
    (q: string) => updateFilters({ q }, true),
    [updateFilters],
  );

  const handleToggleCategory = useCallback(
    (category: EventCategory | "ALL") => {
      if (category === "ALL") {
        updateFilters({ categories: [] }, true);
        return;
      }
      const exists = filters.categories.includes(category);
      const next = exists
        ? filters.categories.filter((item) => item !== category)
        : [...filters.categories, category];
      updateFilters({ categories: next }, true);
    },
    [filters.categories, updateFilters],
  );

  const handleDatePresetChange = useCallback(
    (datePreset: DatePreset) => updateFilters({ datePreset }, true),
    [updateFilters],
  );

  const handleSortChange = useCallback(
    (sort: EventSort) => updateFilters({ sort }, true),
    [updateFilters],
  );

  const handlePageChange = useCallback(
    (page: number) => updateFilters({ page }, false),
    [updateFilters],
  );

  const isStaleRevalidating = !isPending && (isFetching || isPlaceholderData);
  const events = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.overline}>{t("catalogue.overline")}</p>
        <h1 className={styles.title}>{t("catalogue.title")}</h1>
        {meta ? (
          <p className={styles.subtitle}>
            {t("catalogue.subtitle", { count: meta.totalItems })}
          </p>
        ) : null}
      </header>

      <FilterBar
        filters={filters}
        totalItems={meta?.totalItems}
        totalPages={meta?.totalPages}
        isFiltered={isFiltered}
        isRevalidating={isStaleRevalidating}
        onSearchChange={handleSearchChange}
        onToggleCategory={handleToggleCategory}
        onDatePresetChange={handleDatePresetChange}
        onSortChange={handleSortChange}
        onReset={resetFilters}
      />

      {isPending ? (
        <EventGrid events={[]} isLoading skeletonCount={6} />
      ) : isError ? (
        <ErrorState
          {...mapErrorDisplay(error, t)}
          requestId={error.requestId}
          onRetry={() => void refetch()}
        />
      ) : events.length === 0 ? (
        <EmptyState
          title={t("catalogue.emptyTitle")}
          description={t("catalogue.emptyDescription")}
          actionLabel={isFiltered ? t("catalogue.emptyAction") : undefined}
          onAction={isFiltered ? resetFilters : undefined}
        />
      ) : (
        <>
          <EventGrid events={events} isStale={isStaleRevalidating} />
          {meta ? (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              disabled={isStaleRevalidating}
              onPageChange={handlePageChange}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
