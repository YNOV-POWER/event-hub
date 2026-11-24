"use client";

import { useTranslation } from "react-i18next";
import { RouteGuard } from "@/auth/RouteGuard";
import { Alert } from "@/components/ui/Alert";

export default function AdminNewEventPage() {
  const { t } = useTranslation();

  return (
    <RouteGuard requiredRole="ORGANIZER">
      <section>
        <h1>{t("placeholders.newEventTitle")}</h1>
        <p>{t("placeholders.newEventBody")}</p>
        <Alert tone="info" title={t("guard.noteTitle")}>
          {t("guard.clientGuardNote")}
        </Alert>
      </section>
    </RouteGuard>
  );
}
