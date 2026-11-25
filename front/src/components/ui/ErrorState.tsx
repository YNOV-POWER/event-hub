"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
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
  readonly secondaryHref?: string;
  readonly secondaryLabel?: string;
  readonly loginHref?: string;
  readonly loginLabel?: string;
}

const ICON_BY_VARIANT: Record<ErrorStateVariant, IconName> = {
  technical: "alertOctagon",
  notFound: "search",
  forbidden: "lock",
  unauthorized: "shieldAlert",
};

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
  secondaryHref,
  secondaryLabel,
  loginHref,
  loginLabel,
}: ErrorStateProps) {
  const { t } = useTranslation();
  const iconName = ICON_BY_VARIANT[variant];
  const isNotFound = variant === "notFound";

  return (
    <section
      role="alert"
      className={`${styles.container} ${isNotFound ? styles.canvas : styles.card}`.trim()}
    >
      <div
        className={`${styles.iconCircle} ${styles[variant]} ${isNotFound ? styles.iconLarge : ""}`.trim()}
        aria-hidden="true"
      >
        <Icon name={iconName} size={isNotFound ? 44 : 34} />
      </div>
      {overline ? <p className={styles.overline}>{overline}</p> : null}
      <h1 className={`${styles.title} ${isNotFound ? styles.titleDisplay : ""}`.trim()}>
        {title}
      </h1>
      <p className={styles.description}>{description}</p>
      {requestId ? (
        <p className={styles.requestId}>{t("errors.requestId", { id: requestId })}</p>
      ) : null}

      <div className={styles.actions}>
        {onRetry && variant === "technical" ? (
          <Button variant="primary" leftIcon={<Icon name="refreshCw" size={16} />} onClick={onRetry}>
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
              isNotFound || variant === "forbidden"
                ? styles.primaryLink
                : styles.secondaryLink
            }
          >
            {isNotFound ? <Icon name="chevronLeft" size={16} /> : null}
            <span>{homeLabel ?? t("errors.backHome")}</span>
          </Link>
        ) : null}
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className={styles.secondaryLink}>
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
