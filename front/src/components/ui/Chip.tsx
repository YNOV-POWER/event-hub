"use client";

import type { ButtonHTMLAttributes } from "react";
import styles from "./Chip.module.css";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly active?: boolean;
  readonly count?: number;
}

export function Chip({
  active = false,
  count,
  children,
  className = "",
  type = "button",
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={`${styles.chip} ${active ? styles.active : ""} ${className}`.trim()}
      {...rest}
    >
      <span>{children}</span>
      {count !== undefined ? <span className={styles.count}>{count}</span> : null}
    </button>
  );
}
