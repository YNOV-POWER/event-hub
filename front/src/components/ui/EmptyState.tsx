"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "./Button";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <section className={styles.container} aria-live="polite">
      <div className={styles.iconCircle} aria-hidden="true">
        {icon ?? <Search size={28} />}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}
