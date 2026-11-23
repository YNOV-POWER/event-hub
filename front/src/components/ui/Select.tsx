"use client";

import { useId, type SelectHTMLAttributes } from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./Select.module.css";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label: string;
  readonly options: readonly SelectOption[];
  readonly error?: string;
}

export function Select({
  label,
  options,
  error,
  id,
  className = "",
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={`${styles.group} ${className}`.trim()}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <select
        id={selectId}
        className={`${styles.select} ${error ? styles.selectError : ""}`.trim()}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={errorId}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          <AlertTriangle size={14} aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
