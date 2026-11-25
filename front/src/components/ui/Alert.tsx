import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import styles from "./Alert.module.css";

export type AlertTone = "info" | "success" | "warning" | "danger";

export interface AlertProps {
  readonly tone?: AlertTone;
  readonly title?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

const ICONS: Record<AlertTone, IconName> = {
  info: "info",
  success: "checkCircle",
  warning: "alert",
  danger: "xCircle",
};

export function Alert({
  tone = "info",
  title,
  action,
  children,
  className = "",
}: AlertProps) {
  const role = tone === "danger" || tone === "warning" ? "alert" : "status";
  const classes = [styles.alert, styles[tone], title ? styles.withTitle : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div role={role} className={classes}>
      <Icon name={ICONS[tone]} className={styles.icon} />
      <div className={styles.body}>
        {title ? <strong className={styles.title}>{title}</strong> : null}
        <div className={styles.message}>{children}</div>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
