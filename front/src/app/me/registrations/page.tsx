"use client";

import { useTranslation } from "react-i18next";
import { RouteGuard } from "@/auth/RouteGuard";
import { Alert } from "@/components/ui/Alert";

export default function MyRegistrationsPage() {
  const { t } = useTranslation();

  return (
    <RouteGuard>
      <section>
        <h1>{t("placeholders.myRegistrationsTitle")}</h1>
        <p>{t("placeholders.myRegistrationsBody")}</p>
        <Alert tone="info" title={t("guard.noteTitle")}>
          {t("guard.clientGuardNote")}
        </Alert>
      </section>
    </RouteGuard>
  );
}
