"use client";

import { useEffect, useState } from "react";
import { FilterX, RefreshCw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EventCategory, EventSort } from "@/api/client";
import { Chip } from "@/components/ui/Chip";
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

  const showShortSearchHint = searchDraft.trim().length === 1;

  return (
    <section aria-label={t("catalogue.categoryFilterLabel")} className={styles.wrapper}>
      <div className={styles.topRow}>
        <div className={styles.searchGroup}>
          <label htmlFor="catalogue-search" className="sr-only">
            {t("catalogue.searchLabel")}
          </label>
          <div className={styles.searchInputWrap}>
            <Search size={16} className={styles.searchIcon} aria-hidden="true" />
            <input
              id="catalogue-search"
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder={t("catalogue.searchPlaceholder")}
              maxLength={100}
              className={styles.searchInput}
              aria-describedby={showShortSearchHint ? "search-hint" : undefined}
            />
          </div>
          {showShortSearchHint ? (
            <p id="search-hint" className={styles.hint}>
              {t("catalogue.searchTooShort")}
            </p>
          ) : null}
        </div>

        <div className={styles.selectGroup}>
          <label htmlFor="catalogue-dates" className={styles.selectLabel}>
            {t("catalogue.datePresetLabel")}
          </label>
          <select
            id="catalogue-dates"
            value={filters.datePreset}
            onChange={(event) => onDatePresetChange(event.target.value as DatePreset)}
            className={styles.select}
          >
            {DATE_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {t(`catalogue.datePresets.${preset}`)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectGroup}>
          <label htmlFor="catalogue-sort" className={styles.selectLabel}>
            {t("catalogue.sortLabel")}
          </label>
          <select
            id="catalogue-sort"
            value={filters.sort}
            onChange={(event) => onSortChange(event.target.value as EventSort)}
            className={styles.select}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`catalogue.sortOptions.${option}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.chipsRow} role="group" aria-label={t("catalogue.categoryFilterLabel")}>
        <Chip
          active={filters.categories.length === 0}
          onClick={() => onToggleCategory("ALL")}
        >
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
          {isRevalidating ? (
            <span className={styles.revalidating} role="status" aria-live="polite">
              <RefreshCw size={13} className={styles.spin} aria-hidden="true" />
              {t("catalogue.revalidating")}
            </span>
          ) : null}
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
