"use client";

import { useId, type InputHTMLAttributes } from "react";
import { Icon } from "./Icon";
import styles from "./SearchInput.module.css";

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  readonly label: string;
  readonly hint?: string;
}

export function SearchInput({
  label,
  hint,
  id,
  className = "",
  ...rest
}: SearchInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className={`${styles.group} ${className}`.trim()}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className={styles.wrap}>
        <Icon name="search" size={16} className={styles.icon} />
        <input
          id={inputId}
          type="search"
          className={styles.input}
          aria-describedby={hintId}
          {...rest}
        />
      </div>
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
