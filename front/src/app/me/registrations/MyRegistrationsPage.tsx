"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import type { MyRegistrationItem } from "@/api/client";
import {
  MyRegistrationsView,
  type RegistrationsTab,
} from "@/components/registrations/MyRegistrationsView";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { useCancelRegistration } from "@/hooks/useCancelRegistration";
import { useMyRegistrations } from "@/hooks/useMyRegistrations";
import { downloadEventIcs } from "@/i18n/calendar";

export function splitRegistrations(
  items: readonly MyRegistrationItem[],
  nowMs: number = Date.now(),
): {
  upcoming: MyRegistrationItem[];
  past: MyRegistrationItem[];
  promoted: MyRegistrationItem | null;
} {
  const upcoming: MyRegistrationItem[] = [];
  const past: MyRegistrationItem[] = [];

  for (const item of items) {
    const endsMs = new Date(item.event.endsAt).getTime();
    const isPastEvent = Number.isFinite(endsMs) && endsMs < nowMs;
    const isCancelled = item.status === "CANCELLED" || item.event.status === "CANCELLED";
    if (isPastEvent || isCancelled) {
      past.push(item);
    } else {
      upcoming.push(item);
    }
  }

  upcoming.sort(
    (a, b) => new Date(a.event.startsAt).getTime() - new Date(b.event.startsAt).getTime(),
  );
  past.sort(
    (a, b) => new Date(b.event.startsAt).getTime() - new Date(a.event.startsAt).getTime(),
  );

  const promoted =
    upcoming.find((item) => item.status === "CONFIRMED" && item.promotedAt !== null) ?? null;

  return { upcoming, past, promoted };
}

/**
 * Conteneur de la page « Mes inscriptions » (`/me/registrations`).
 * Orchestre `useMyRegistrations`, `useCancelRegistration`, le filtre `?tab=` dans l'URL,
 * la modale de confirmation et le toast de retour.
 */
export function MyRegistrationsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data, isPending, isError, error, isFetching, refetch } = useMyRegistrations();
  const cancelMutation = useCancelRegistration();

  const [pendingCancel, setPendingCancel] = useState<MyRegistrationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeTab: RegistrationsTab =
    searchParams.get("tab") === "past" ? "past" : "upcoming";

  const { upcoming, past, promoted } = useMemo(
    () => splitRegistrations(data?.data ?? []),
    [data],
  );

  const handleTabChange = useCallback(
    (nextTab: RegistrationsTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextTab === "upcoming") {
        params.delete("tab");
      } else {
        params.set("tab", nextTab);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleDownloadIcs = useCallback((registration: MyRegistrationItem) => {
    downloadEventIcs(registration.event);
  }, []);

  const handleRequestCancel = useCallback(
    (registration: MyRegistrationItem) => {
      cancelMutation.reset();
      setPendingCancel(registration);
    },
    [cancelMutation],
  );

  const handleConfirmCancel = useCallback(() => {
    if (!pendingCancel) return;
    const target = pendingCancel;
    cancelMutation.mutate(target.eventId, {
      onSuccess: () => {
        setPendingCancel(null);
        setToastMessage(
          target.status === "WAITLISTED"
            ? t("myRegistrations.toast.leftWaitlist", { title: target.event.title })
            : t("myRegistrations.toast.unsubscribed", { title: target.event.title }),
        );
      },
    });
  }, [cancelMutation, pendingCancel, t]);

  const isWaitlistTarget = pendingCancel?.status === "WAITLISTED";
  const modalErrorMessage = cancelMutation.error
    ? t(`errors.codes.${cancelMutation.error.code}`, {
        defaultValue: t("errors.genericDescription"),
      })
    : null;

  return (
    <>
      <MyRegistrationsView
        upcoming={upcoming}
        past={past}
        promotedRegistration={promoted}
        activeTab={activeTab}
        isLoading={isPending}
        isRevalidating={!isPending && isFetching}
        errorMessage={isError ? t("myRegistrations.loadError") : null}
        errorRequestId={isError ? error.requestId : undefined}
        onTabChange={handleTabChange}
        onRetry={() => void refetch()}
        onDownloadIcs={handleDownloadIcs}
        onRequestCancel={handleRequestCancel}
      />

      <Modal
        isOpen={pendingCancel !== null}
        tone="danger"
        title={
          pendingCancel
            ? isWaitlistTarget
              ? t("myRegistrations.confirmModal.leaveWaitlistTitle", {
                  title: pendingCancel.event.title,
                })
              : t("myRegistrations.confirmModal.unsubscribeTitle", {
                  title: pendingCancel.event.title,
                })
            : ""
        }
        description={
          isWaitlistTarget
            ? t("myRegistrations.confirmModal.leaveWaitlistDescription")
            : t("myRegistrations.confirmModal.unsubscribeDescription")
        }
        cancelLabel={t("myRegistrations.confirmModal.cancel")}
        confirmLabel={
          cancelMutation.isPending
            ? t("myRegistrations.confirmModal.submitting")
            : isWaitlistTarget
              ? t("myRegistrations.confirmModal.leaveWaitlistConfirm")
              : t("myRegistrations.confirmModal.unsubscribeConfirm")
        }
        isLoading={cancelMutation.isPending}
        error={modalErrorMessage}
        onConfirm={handleConfirmCancel}
        onClose={() => setPendingCancel(null)}
      />

      {toastMessage ? (
        <Toast
          tone="success"
          message={toastMessage}
          closeLabel={t("myRegistrations.toast.close")}
          onClose={() => setToastMessage(null)}
        />
      ) : null}
    </>
  );
}
