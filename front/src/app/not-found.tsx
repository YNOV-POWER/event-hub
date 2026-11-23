"use client";

import { useTranslation } from "react-i18next";
import { ErrorState } from "@/components/ui/ErrorState";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <ErrorState
      variant="notFound"
      overline={t("eventDetail.notFoundOverline")}
      title={t("eventDetail.notFoundTitle")}
      description={t("eventDetail.notFoundDescription")}
      homeHref="/events"
      homeLabel={t("eventDetail.notFoundAction")}
      secondaryHref="/me/registrations"
      secondaryLabel={t("nav.myRegistrations")}
    />
  );
}
