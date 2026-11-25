"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "./Button";
import { Icon } from "./Icon";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly actionHref?: string;
  readonly onAction?: () => void;
  readonly icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <section className={styles.container} aria-live="polite">
      <div className={styles.iconCircle} aria-hidden="true">
        {icon ?? <Icon name="search" size={28} />}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={styles.actionLink}>
          {actionLabel}
        </Link>
      ) : actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}
