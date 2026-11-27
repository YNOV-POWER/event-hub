"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "@/components/ui/Icon";
import styles from "./AuthLayout.module.css";

const BENEFITS = [
  { icon: "check", labelKey: "authLayout.benefitOneClick" },
  { icon: "calendarPlus", labelKey: "authLayout.benefitCalendar" },
  { icon: "hourglass", labelKey: "authLayout.benefitWaitlist" },
] as const satisfies readonly { icon: IconName; labelKey: string }[];

export interface AuthLayoutProps {
  readonly screen: "register" | "login";
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
}

export function AuthLayout({ screen, title, subtitle, children }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <section className={styles.card}>
      <div className={`${styles.brandPanel} ${styles[screen]}`}>
        <div className={styles.brandTop}>
          <p className={styles.overline}>{t("authLayout.overline")}</p>
          <p className={styles.brandTitle}>{t("authLayout.title")}</p>
          <p className={styles.brandSubtitle}>{t("authLayout.subtitle")}</p>
        </div>

        <ul className={styles.benefits}>
          {BENEFITS.map(({ icon, labelKey }) => (
            <li key={icon} className={styles.benefit}>
              <span className={styles.benefitIcon}>
                <Icon name={icon} size={18} />
              </span>
              <span>{t(labelKey)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.formPanel}>
        <header>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>
        {children}
      </div>
    </section>
  );
}
