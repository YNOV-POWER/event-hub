import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "frosted";

export interface BadgeProps {
  readonly tone?: BadgeTone;
  readonly dot?: boolean;
  readonly dotColor?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Badge({
  tone = "neutral",
  dot = false,
  dotColor,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]} ${className}`.trim()}>
      {dot ? (
        <span
          className={styles.dot}
          style={dotColor ? { backgroundColor: dotColor } : undefined}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}
