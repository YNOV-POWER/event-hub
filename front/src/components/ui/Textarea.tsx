"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { Icon } from "./Icon";
import styles from "./Textarea.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, id, className = "", ...rest },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`${styles.field} ${className}`.trim()}>
      <label htmlFor={textareaId} className={styles.label}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        className={`${styles.textarea} ${error ? styles.textareaError : ""}`.trim()}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...rest}
      />
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
});
