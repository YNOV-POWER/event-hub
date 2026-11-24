import { RefreshCw } from "lucide-react";
import styles from "./SyncIndicator.module.css";

export interface SyncIndicatorProps {
  readonly label: string;
  readonly className?: string;
}

/**
 * Indicateur discret de revalidation en arrière-plan (5e état d'interface : Obsolète).
 */
export function SyncIndicator({ label, className = "" }: SyncIndicatorProps) {
  return (
    <span
      className={`${styles.pill} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <RefreshCw size={13} className={styles.spin} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
