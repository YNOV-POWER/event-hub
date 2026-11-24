"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth/auth-context";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import styles from "./login.module.css";

function LoginContent() {
  const { t } = useTranslation();
  const { signInDemo } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const next = searchParams.get("next") ?? "/events";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/events";

  return (
    <section className={styles.card}>
      <h1 className={styles.title}>{t("login.title")}</h1>
      <p className={styles.subtitle}>{t("login.subtitle")}</p>

      {registered ? (
        <Alert tone="success" className={styles.alert}>
          {t("login.accountCreatedBanner")}
        </Alert>
      ) : null}

      {searchParams.get("next") ? (
        <Alert tone="info" className={styles.alert}>
          {t("login.redirectNotice")}
        </Alert>
      ) : null}

      <div className={styles.demoBox}>
        <p className={styles.demoTitle}>{t("login.demoTitle")}</p>
        <div className={styles.actions}>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              signInDemo("PARTICIPANT");
              router.push(safeNext);
            }}
          >
            {t("login.demoParticipant")}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              signInDemo("ORGANIZER");
              router.push(safeNext);
            }}
          >
            {t("login.demoOrganizer")}
          </Button>
        </div>
      </div>

      <p className={styles.footer}>
        {t("login.noAccount")}{" "}
        <Link href="/register" className={styles.link}>
          {t("login.registerLink")}
        </Link>
      </p>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
