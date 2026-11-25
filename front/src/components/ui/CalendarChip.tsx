import styles from "./CalendarChip.module.css";

export type CalendarChipTone = "surface" | "soft" | "muted";
export type CalendarChipSize = "sm" | "md";

export interface CalendarChipProps {
  readonly month: string;
  readonly day: string;
  readonly tone?: CalendarChipTone;
  readonly size?: CalendarChipSize;
  readonly className?: string;
}

export function CalendarChip({
  month,
  day,
  tone = "surface",
  size = "sm",
  className = "",
}: CalendarChipProps) {
  return (
    <div
      className={`${styles.chip} ${styles[tone]} ${styles[size]} ${className}`.trim()}
      aria-hidden="true"
    >
      <span className={styles.month}>{month}</span>
      <span className={styles.day}>{day}</span>
    </div>
  );
}
