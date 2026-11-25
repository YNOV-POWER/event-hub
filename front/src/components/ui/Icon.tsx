import styles from "./Icon.module.css";

export type IconName =
  | "alert"
  | "calendarPlus"
  | "check"
  | "checkCircle"
  | "hourglass"
  | "info"
  | "xCircle";

export interface IconProps {
  readonly name: IconName;
  readonly size?: number;
  readonly className?: string;
}

export function Icon({ name, size = 20, className = "" }: IconProps) {
  return (
    <span
      className={`${styles.icon} ${styles[name]} ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
