"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { EventCategory, EventListQuery, EventSort } from "@/api/client";

export type DatePreset = "upcoming" | "week" | "month" | "all";

export interface CatalogueFilterState {
  readonly q: string;
  readonly categories: readonly EventCategory[];
  readonly datePreset: DatePreset;
  readonly sort: EventSort;
  readonly page: number;
  readonly pageSize: number;
}

const VALID_CATEGORIES = new Set<EventCategory>([
  "WORKSHOP",
  "CONFERENCE",
  "CONCERT",
  "OTHER",
]);

const VALID_SORTS = new Set<EventSort>([
  "startsAt",
  "-startsAt",
  "createdAt",
  "-createdAt",
  "title",
  "-title",
]);

const VALID_DATE_PRESETS = new Set<DatePreset>(["upcoming", "week", "month", "all"]);

export const DEFAULT_FILTERS: CatalogueFilterState = {
  q: "",
  categories: [],
  datePreset: "upcoming",
  sort: "startsAt",
  page: 1,
  pageSize: 9,
};

export function parseFiltersFromSearchParams(params: URLSearchParams): CatalogueFilterState {
  const rawQ = params.get("q") ?? "";
  const rawCategory = params.get("category") ?? "";
  const categories = rawCategory
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter((item): item is EventCategory => VALID_CATEGORIES.has(item as EventCategory));

  const rawDate = params.get("dates") ?? "upcoming";
  const datePreset: DatePreset = VALID_DATE_PRESETS.has(rawDate as DatePreset)
    ? (rawDate as DatePreset)
    : "upcoming";

  const rawSort = params.get("sort") ?? "startsAt";
  const sort: EventSort = VALID_SORTS.has(rawSort as EventSort)
    ? (rawSort as EventSort)
    : "startsAt";

  const parsedPage = Number.parseInt(params.get("page") ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const parsedSize = Number.parseInt(params.get("pageSize") ?? String(DEFAULT_FILTERS.pageSize), 10);
  const pageSize =
    Number.isFinite(parsedSize) && parsedSize >= 1 && parsedSize <= 100
      ? parsedSize
      : DEFAULT_FILTERS.pageSize;

  return {
    q: rawQ,
    categories,
    datePreset,
    sort,
    page,
    pageSize,
  };
}

/**
 * Convertit l'état UI des filtres en paramètres conformes au contrat `GET /api/events`.
 * `q` n'est envoyé qu'à partir de 2 caractères (contrainte `minLength: 2` du contrat OpenAPI).
 */
export function toApiEventQuery(
  filters: CatalogueFilterState,
  now: Date = new Date(),
): EventListQuery {
  const query: EventListQuery = {
    page: filters.page,
    pageSize: filters.pageSize,
    sort: filters.sort,
  };

  const trimmedQ = filters.q.trim();
  if (trimmedQ.length >= 2) {
    query.q = trimmedQ.slice(0, 100);
  }

  if (filters.categories.length > 0) {
    query.category = filters.categories.join(",");
  }

  const startOfDayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  if (filters.datePreset === "week") {
    const end = new Date(startOfDayUtc.getTime() + 7 * 24 * 60 * 60 * 1000);
    query.to = end.toISOString();
  } else if (filters.datePreset === "month") {
    const end = new Date(startOfDayUtc.getTime() + 30 * 24 * 60 * 60 * 1000);
    query.to = end.toISOString();
  } else if (filters.datePreset === "all") {
    query.from = "2020-01-01T00:00:00Z";
  }

  return query;
}

export function hasActiveFilters(filters: CatalogueFilterState): boolean {
  return (
    filters.q.trim().length > 0 ||
    filters.categories.length > 0 ||
    filters.datePreset !== DEFAULT_FILTERS.datePreset ||
    filters.sort !== DEFAULT_FILTERS.sort
  );
}

export function useEventFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = useMemo(
    () => parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const apiQuery = useMemo(() => toApiEventQuery(filters), [filters]);

  const updateFilters = useCallback(
    (patch: Partial<CatalogueFilterState>, resetPage = true) => {
      const next: CatalogueFilterState = {
        ...filters,
        ...patch,
        page: resetPage ? 1 : (patch.page ?? filters.page),
      };

      const params = new URLSearchParams();
      if (next.q.trim().length > 0) params.set("q", next.q.trim());
      if (next.categories.length > 0) params.set("category", next.categories.join(","));
      if (next.datePreset !== DEFAULT_FILTERS.datePreset) params.set("dates", next.datePreset);
      if (next.sort !== DEFAULT_FILTERS.sort) params.set("sort", next.sort);
      if (next.page > 1) params.set("page", String(next.page));
      if (next.pageSize !== DEFAULT_FILTERS.pageSize) params.set("pageSize", String(next.pageSize));

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  return {
    filters,
    apiQuery,
    isFiltered: hasActiveFilters(filters),
    updateFilters,
    resetFilters,
  };
}
