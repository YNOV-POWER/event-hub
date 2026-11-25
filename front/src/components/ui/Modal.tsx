"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Alert } from "./Alert";
import { Button } from "./Button";
import { Icon } from "./Icon";
import styles from "./Modal.module.css";

export type ModalTone = "danger" | "neutral";

export interface ModalProps {
  readonly isOpen: boolean;
  readonly tone?: ModalTone;
  readonly title: string;
  readonly description?: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
  readonly children?: ReactNode;
}

/**
 * Modale de confirmation accessible (WCAG 2.2 AA), fidèle à Figma `Section/Modal`.
 */
export function Modal({
  isOpen,
  tone = "danger",
  title,
  description,
  confirmLabel,
  cancelLabel,
  isLoading = false,
  error = null,
  onConfirm,
  onClose,
  children,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    onCloseRef.current = onClose;
    isLoadingRef.current = isLoading;
  }, [onClose, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoadingRef.current) {
        onCloseRef.current();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={styles.dialog}
      >
        <div className={`${styles.iconCircle} ${styles[tone]}`} aria-hidden="true">
          <Icon name={tone === "danger" ? "alert" : "info"} size={22} />
        </div>

        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>

        {description ? (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        ) : null}

        {children ? <div className={styles.content}>{children}</div> : null}

        {error ? (
          <Alert tone="danger" className={styles.errorAlert}>
            {error}
          </Alert>
        ) : null}

        <div className={styles.actions}>
          <Button
            ref={cancelRef}
            variant="secondary"
            disabled={isLoading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
