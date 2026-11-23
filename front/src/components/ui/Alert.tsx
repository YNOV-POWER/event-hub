import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import styles from "./Alert.module.css";

export type AlertTone = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  readonly tone?: AlertTone;
  readonly title?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

const ICONS: Record<AlertTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export function Alert({
  tone = "info",
  title,
  action,
  children,
  className = "",
}: AlertProps) {
  const Icon = ICONS[tone];
  const role = tone === "danger" || tone === "warning" ? "alert" : "status";

  return (
    <div role={role} className={`${styles.alert} ${styles[tone]} ${className}`.trim()}>
      <Icon className={styles.icon} size={18} aria-hidden="true" />
      <div className={styles.body}>
        {title ? <strong className={styles.title}>{title}</strong> : null}
        <div className={styles.message}>{children}</div>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
