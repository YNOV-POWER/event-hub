"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { EventSort, EventStatus, MyEventListQuery } from "@/api/client";

export type OrganizerStatusFilter = "ALL" | EventStatus;

export interface OrganizerEventFilterState {
  readonly status: OrganizerStatusFilter;
  readonly sort: EventSort;
  readonly page: number;
  readonly pageSize: number;
}

const VALID_STATUSES = new Set<EventStatus>(["DRAFT", "PUBLISHED", "CANCELLED"]);

const VALID_SORTS = new Set<EventSort>([
  "startsAt",
  "-startsAt",
  "createdAt",
  "-createdAt",
  "title",
  "-title",
]);

export const DEFAULT_ORGANIZER_FILTERS: OrganizerEventFilterState = {
  status: "ALL",
  sort: "-startsAt",
  page: 1,
  pageSize: 10,
};

export function parseOrganizerFiltersFromSearchParams(
  params: URLSearchParams,
): OrganizerEventFilterState {
  const rawStatus = (params.get("status") ?? "ALL").trim().toUpperCase();
  const status: OrganizerStatusFilter = VALID_STATUSES.has(rawStatus as EventStatus)
    ? (rawStatus as EventStatus)
    : "ALL";

  const rawSort = params.get("sort") ?? DEFAULT_ORGANIZER_FILTERS.sort;
  const sort: EventSort = VALID_SORTS.has(rawSort as EventSort)
    ? (rawSort as EventSort)
    : DEFAULT_ORGANIZER_FILTERS.sort;

  const parsedPage = Number.parseInt(params.get("page") ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const parsedSize = Number.parseInt(
    params.get("pageSize") ?? String(DEFAULT_ORGANIZER_FILTERS.pageSize),
    10,
  );
  const pageSize =
    Number.isFinite(parsedSize) && parsedSize >= 1 && parsedSize <= 100
      ? parsedSize
      : DEFAULT_ORGANIZER_FILTERS.pageSize;

  return { status, sort, page, pageSize };
}

export function toApiMyEventQuery(filters: OrganizerEventFilterState): MyEventListQuery {
  const query: MyEventListQuery = {
    page: filters.page,
    pageSize: filters.pageSize,
    sort: filters.sort,
  };
  if (filters.status !== "ALL") {
    query.status = filters.status;
  }
  return query;
}

export function useOrganizerEventFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const filters = useMemo(
    () => parseOrganizerFiltersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const apiQuery = useMemo(() => toApiMyEventQuery(filters), [filters]);

  const updateFilters = useCallback(
    (patch: Partial<OrganizerEventFilterState>, resetPage = true) => {
      const next: OrganizerEventFilterState = {
        ...filters,
        ...patch,
        page: resetPage ? 1 : (patch.page ?? filters.page),
      };

      const params = new URLSearchParams();
      if (next.status !== DEFAULT_ORGANIZER_FILTERS.status) {
        params.set("status", next.status);
      }
      if (next.sort !== DEFAULT_ORGANIZER_FILTERS.sort) {
        params.set("sort", next.sort);
      }
      if (next.page > 1) {
        params.set("page", String(next.page));
      }
      if (next.pageSize !== DEFAULT_ORGANIZER_FILTERS.pageSize) {
        params.set("pageSize", String(next.pageSize));
      }

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  const resetStatusFilter = useCallback(() => {
    updateFilters({ status: "ALL" }, true);
  }, [updateFilters]);

  return {
    filters,
    apiQuery,
    isStatusFiltered: filters.status !== "ALL",
    updateFilters,
    resetStatusFilter,
  };
}
