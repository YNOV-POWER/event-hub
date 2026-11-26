"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/auth-context";
import { formatRegistrantStatus, RegistrantsView } from "@/components/organizer/RegistrantsView";
import { useEventRegistrants, useOrganizerEvent } from "@/hooks/useOrganizerEvent";
import { buildCsv, downloadCsv, toFileSlug } from "@/i18n/csv";
import { formatRegistrationDate } from "@/i18n/formatters";

const PAGE_SIZE = 6;

export function RegistrantsPage({ eventId }: { readonly eventId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const eventQuery = useOrganizerEvent(eventId);
  const event = eventQuery.data ?? null;
  const isForbidden = Boolean(user && event && event.organizer.id !== user.id);
  const registrantsQuery = useEventRegistrants(eventId, Boolean(event) && !isForbidden);
  const registrants = registrantsQuery.data ?? [];
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);

  useEffect(() => {
    if (!isLinkCopied) return;
    const timer = setTimeout(() => setIsLinkCopied(false), 2500);
    return () => clearTimeout(timer);
  }, [isLinkCopied]);

  const handleExport = () => {
    if (!event) return;
    const rows = [
      [
        t("registrants.columns.participant"),
        t("registrants.columns.email"),
        t("registrants.columns.status"),
        t("registrants.csvPosition"),
        t("registrants.columns.registeredAt"),
      ],
      ...registrants.map((registrant) => [
        registrant.displayName,
        registrant.email,
        formatRegistrantStatus(registrant, t),
        registrant.position === null ? "" : String(registrant.position),
        formatRegistrationDate(registrant.createdAt),
      ]),
    ];
    downloadCsv(t("registrants.csvFilename", { slug: toFileSlug(event.title) }), buildCsv(rows));
  };

  const handleCopyLink = () => {
    void navigator.clipboard
      ?.writeText(`${window.location.origin}/events/${eventId}`)
      .then(() => setIsLinkCopied(true));
  };

  return (
    <RegistrantsView
      event={event}
      registrants={registrants}
      page={page}
      pageSize={PAGE_SIZE}
      isLoading={eventQuery.isPending || (!isForbidden && registrantsQuery.isPending)}
      error={eventQuery.error ?? registrantsQuery.error ?? null}
      isForbidden={isForbidden}
      isLinkCopied={isLinkCopied}
      onPageChange={(nextPage) => router.replace(`${pathname}?page=${nextPage}`, { scroll: false })}
      onExport={handleExport}
      onCopyLink={handleCopyLink}
      onRetry={() => {
        void eventQuery.refetch();
        void registrantsQuery.refetch();
      }}
    />
  );
}
