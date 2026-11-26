"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly actionHref?: string;
  readonly actionIcon?: ReactNode;
  readonly onAction?: () => void;
  readonly icon?: ReactNode;
  readonly tone?: "primary" | "danger";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon,
  onAction,
  icon,
  tone = "primary",
}: EmptyStateProps) {
  const action =
    actionLabel && actionHref ? (
      <Button variant="secondary" href={actionHref} leftIcon={actionIcon}>
        {actionLabel}
      </Button>
    ) : actionLabel && onAction ? (
      <Button variant="secondary" leftIcon={actionIcon} onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null;

  return (
    <section className={styles.container} aria-live="polite">
      <div
        className={`${styles.iconCircle} ${tone === "danger" ? styles.iconCircleDanger : ""}`.trim()}
        aria-hidden="true"
      >
        {icon ?? <Icon name="search" size={28} />}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {action ? <div className={styles.action}>{action}</div> : null}
    </section>
  );
}
