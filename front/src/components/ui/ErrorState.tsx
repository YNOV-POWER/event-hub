"use client";

import Link from "next/link";
import { AlertOctagon, Lock, RefreshCw, SearchX, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import styles from "./ErrorState.module.css";

export type ErrorStateVariant = "technical" | "notFound" | "forbidden" | "unauthorized";

export interface ErrorStateProps {
  readonly variant?: ErrorStateVariant;
  readonly overline?: string;
  readonly title: string;
  readonly description: string;
  readonly requestId?: string;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly homeHref?: string;
  readonly homeLabel?: string;
  readonly loginHref?: string;
  readonly loginLabel?: string;
}

const ICON_BY_VARIANT = {
  technical: AlertOctagon,
  notFound: SearchX,
  forbidden: Lock,
  unauthorized: ShieldAlert,
} as const;

export function ErrorState({
  variant = "technical",
  overline,
  title,
  description,
  requestId,
  onRetry,
  retryLabel,
  homeHref,
  homeLabel,
  loginHref,
  loginLabel,
}: ErrorStateProps) {
  const { t } = useTranslation();
  const Icon = ICON_BY_VARIANT[variant];

  return (
    <section role="alert" className={styles.container}>
      <div className={`${styles.iconCircle} ${styles[variant]}`} aria-hidden="true">
        <Icon size={36} />
      </div>
      {overline ? <p className={styles.overline}>{overline}</p> : null}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      {requestId ? (
        <p className={styles.requestId}>{t("errors.requestId", { id: requestId })}</p>
      ) : null}

      <div className={styles.actions}>
        {onRetry && variant === "technical" ? (
          <Button variant="primary" leftIcon={<RefreshCw size={16} />} onClick={onRetry}>
            {retryLabel ?? t("errors.retry")}
          </Button>
        ) : null}
        {loginHref ? (
          <Link href={loginHref} className={styles.primaryLink}>
            {loginLabel ?? t("errors.loginAction")}
          </Link>
        ) : null}
        {homeHref ? (
          <Link
            href={homeHref}
            className={
              variant === "notFound" || variant === "forbidden"
                ? styles.primaryLink
                : styles.secondaryLink
            }
          >
            {homeLabel ?? t("errors.backHome")}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
