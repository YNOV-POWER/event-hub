"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import styles from "./Toast.module.css";

export type ToastTone = "success" | "info" | "danger";

export interface ToastProps {
  readonly tone?: ToastTone;
  readonly message: string;
  readonly closeLabel?: string;
  readonly onClose?: () => void;
  readonly floating?: boolean;
}

const ICONS: Record<ToastTone, typeof Info> = {
  success: CheckCircle2,
  info: Info,
  danger: XCircle,
};

/**
 * Notification de confirmation flottante (fidèle à Figma `Section/Toast`).
 */
export function Toast({
  tone = "success",
  message,
  closeLabel = "Fermer",
  onClose,
  floating = true,
}: ToastProps) {
  const Icon = ICONS[tone];
  const role = tone === "danger" ? "alert" : "status";

  return (
    <div
      role={role}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={`${styles.toast} ${styles[tone]} ${floating ? styles.floating : ""}`.trim()}
    >
      <Icon size={18} className={styles.icon} aria-hidden="true" />
      <span className={styles.message}>{message}</span>
      {onClose ? (
        <button
          type="button"
          className={styles.close}
          aria-label={closeLabel}
          onClick={onClose}
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
