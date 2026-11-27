"use client";

import { useId, type SelectHTMLAttributes } from "react";
import { Icon } from "./Icon";
import styles from "./Select.module.css";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label: string;
  readonly options: readonly SelectOption[];
  readonly hint?: string;
  readonly error?: string;
}

export function Select({
  label,
  options,
  hint,
  error,
  id,
  className = "",
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`${styles.group} ${className}`.trim()}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <div className={styles.selectWrap}>
        <select
          id={selectId}
          className={`${styles.select} ${error ? styles.selectError : ""}`.trim()}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={18} className={styles.chevron} />
      </div>
      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          <Icon name="alert" size={14} />
          <span>{error}</span>
        </p>
      ) : null}
      {hint && !error ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
