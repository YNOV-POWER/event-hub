"use client";

import { Icon, type IconName } from "./Icon";
import styles from "./Toast.module.css";

export type ToastTone = "success" | "info" | "danger";

export interface ToastProps {
  readonly tone?: ToastTone;
  readonly message: string;
  readonly closeLabel?: string;
  readonly onClose?: () => void;
  readonly floating?: boolean;
}

const ICONS: Record<ToastTone, IconName> = {
  success: "checkCircle",
  info: "info",
  danger: "xCircle",
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
  const role = tone === "danger" ? "alert" : "status";

  return (
    <div
      role={role}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={`${styles.toast} ${styles[tone]} ${floating ? styles.floating : ""}`.trim()}
    >
      <Icon name={ICONS[tone]} size={18} className={styles.icon} />
      <span className={styles.message}>{message}</span>
      {onClose ? (
        <button
          type="button"
          className={styles.close}
          aria-label={closeLabel}
          onClick={onClose}
        >
          <Icon name="x" size={16} />
        </button>
      ) : null}
    </div>
  );
}
