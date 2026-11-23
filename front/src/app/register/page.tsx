"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, ListChecks, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { generateUuid } from "@/api/http";
import { AccountRegistrationForm } from "@/components/auth/AccountRegistrationForm";
import { useRegisterAccount } from "@/hooks/useRegisterAccount";
import styles from "./register.module.css";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const registerMutation = useRegisterAccount();
  const idempotencyKeyRef = useRef<string>(generateUuid());

  return (
    <section className={styles.card}>
      <div className={styles.brandPanel}>
        <p className={styles.overline}>{t("accountRegister.brandOverline")}</p>
        <h2 className={styles.brandTitle}>{t("accountRegister.brandTitle")}</h2>
        <p className={styles.brandSubtitle}>{t("accountRegister.brandSubtitle")}</p>

        <ul className={styles.features}>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon} aria-hidden="true">
              <Zap size={18} />
            </span>
            <span>{t("accountRegister.feature1")}</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon} aria-hidden="true">
              <CalendarPlus size={18} />
            </span>
            <span>{t("accountRegister.feature2")}</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon} aria-hidden="true">
              <ListChecks size={18} />
            </span>
            <span>{t("accountRegister.feature3")}</span>
          </li>
        </ul>
      </div>

      <div className={styles.formPanel}>
        <h1 className={styles.formTitle}>{t("accountRegister.title")}</h1>
        <p className={styles.formSubtitle}>{t("accountRegister.subtitle")}</p>

        <AccountRegistrationForm
          isSubmitting={registerMutation.isPending}
          serverError={registerMutation.error ?? null}
          onSubmit={(dto) => {
            registerMutation.mutate(
              { dto, idempotencyKey: idempotencyKeyRef.current },
              {
                onSuccess: () => {
                  idempotencyKeyRef.current = generateUuid();
                  router.push("/login?registered=1");
                },
              },
            );
          }}
        />
      </div>
    </section>
  );
}
