"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/auth-context";
import { getSafeRedirect } from "@/auth/safe-redirect";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { Alert } from "@/components/ui/Alert";

const PROTECTED_PAGE_LABELS = new Map([
  ["/me/registrations", "nav.myRegistrations"],
  ["/admin/events/new", "nav.newEvent"],
]);

function LoginContent() {
  const { t } = useTranslation();
  const { signInDemo } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next");
  const redirectPath = getSafeRedirect(next);
  const pageLabelKey = PROTECTED_PAGE_LABELS.get(redirectPath);
  const demoRole = searchParams.get("mock") === "organizer" ? "ORGANIZER" : "PARTICIPANT";

  let notice = null;
  if (searchParams.get("registered") === "1") {
    notice = <Alert tone="success">{t("login.accountCreatedBanner")}</Alert>;
  } else if (next) {
    notice = (
      <Alert tone="info">
        {pageLabelKey
          ? t("login.redirectNotice", { page: t(pageLabelKey) })
          : t("login.redirectNoticeGeneric")}
      </Alert>
    );
  }

  return (
    <AuthLayout screen="login" title={t("login.title")} subtitle={t("login.subtitle")}>
      <LoginForm
        notice={notice}
        onSubmit={() => {
          signInDemo(demoRole);
          router.push(redirectPath);
        }}
      />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
