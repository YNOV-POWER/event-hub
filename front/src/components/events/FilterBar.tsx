"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterX } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EventCategory, EventSort } from "@/api/client";
import { Chip } from "@/components/ui/Chip";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { SyncIndicator } from "@/components/ui/SyncIndicator";
import type { CatalogueFilterState, DatePreset } from "@/hooks/useEventFilters";
import styles from "./FilterBar.module.css";

const ALL_CATEGORIES: readonly EventCategory[] = [
  "WORKSHOP",
  "CONFERENCE",
  "CONCERT",
  "OTHER",
];

const SORT_OPTIONS: readonly EventSort[] = [
  "startsAt",
  "-startsAt",
  "title",
  "-title",
  "-createdAt",
];

const DATE_PRESETS: readonly DatePreset[] = ["upcoming", "week", "month", "all"];

export interface FilterBarProps {
  readonly filters: CatalogueFilterState;
  readonly totalItems?: number;
  readonly totalPages?: number;
  readonly isFiltered: boolean;
  readonly isRevalidating?: boolean;
  readonly onSearchChange: (q: string) => void;
  readonly onToggleCategory: (category: EventCategory | "ALL") => void;
  readonly onDatePresetChange: (preset: DatePreset) => void;
  readonly onSortChange: (sort: EventSort) => void;
  readonly onReset: () => void;
}

export function FilterBar({
  filters,
  totalItems,
  totalPages,
  isFiltered,
  isRevalidating = false,
  onSearchChange,
  onToggleCategory,
  onDatePresetChange,
  onSortChange,
  onReset,
}: FilterBarProps) {
  const { t } = useTranslation();
  const [searchDraft, setSearchDraft] = useState(filters.q);
  const [prevExternalQ, setPrevExternalQ] = useState(filters.q);

  if (filters.q !== prevExternalQ) {
    setPrevExternalQ(filters.q);
    setSearchDraft(filters.q);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDraft !== filters.q) {
        onSearchChange(searchDraft);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDraft, filters.q, onSearchChange]);

  const dateOptions = useMemo(
    () =>
      DATE_PRESETS.map((preset) => ({
        value: preset,
        label: t(`catalogue.datePresets.${preset}`),
      })),
    [t],
  );

  const sortOptions = useMemo(
    () =>
      SORT_OPTIONS.map((option) => ({
        value: option,
        label: t(`catalogue.sortOptions.${option}`),
      })),
    [t],
  );

  const shortHint =
    searchDraft.trim().length === 1 ? t("catalogue.searchTooShort") : undefined;

  return (
    <section aria-label={t("catalogue.categoryFilterLabel")} className={styles.wrapper}>
      <div className={styles.topRow}>
        <SearchInput
          id="catalogue-search"
          label={t("catalogue.searchLabel")}
          placeholder={t("catalogue.searchPlaceholder")}
          value={searchDraft}
          maxLength={100}
          hint={shortHint}
          onChange={(event) => setSearchDraft(event.target.value)}
        />

        <Select
          id="catalogue-dates"
          label={t("catalogue.datePresetLabel")}
          value={filters.datePreset}
          options={dateOptions}
          onChange={(event) => onDatePresetChange(event.target.value as DatePreset)}
        />

        <Select
          id="catalogue-sort"
          label={t("catalogue.sortLabel")}
          value={filters.sort}
          options={sortOptions}
          onChange={(event) => onSortChange(event.target.value as EventSort)}
        />
      </div>

      <div className={styles.chipsRow} role="group" aria-label={t("catalogue.categoryFilterLabel")}>
        <Chip active={filters.categories.length === 0} onClick={() => onToggleCategory("ALL")}>
          {t("categories.ALL")}
        </Chip>
        {ALL_CATEGORIES.map((category) => (
          <Chip
            key={category}
            active={filters.categories.includes(category)}
            onClick={() => onToggleCategory(category)}
          >
            {t(`categories.${category}`)}
          </Chip>
        ))}
      </div>

      <div className={styles.metaRow}>
        <div className={styles.summaryGroup}>
          {totalItems !== undefined && totalPages !== undefined ? (
            <p className={styles.summary}>
              {t("catalogue.resultsSummary", {
                count: totalItems,
                page: filters.page,
                totalPages: Math.max(1, totalPages),
              })}
            </p>
          ) : null}
          {isRevalidating ? <SyncIndicator label={t("catalogue.revalidating")} /> : null}
        </div>

        {isFiltered ? (
          <button type="button" className={styles.resetButton} onClick={onReset}>
            <FilterX size={15} aria-hidden="true" />
            <span>{t("catalogue.resetFilters")}</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
