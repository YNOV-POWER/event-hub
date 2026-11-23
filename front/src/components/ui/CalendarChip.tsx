import styles from "./CalendarChip.module.css";

export interface CalendarChipProps {
  readonly month: string;
  readonly day: string;
  readonly className?: string;
}

export function CalendarChip({ month, day, className = "" }: CalendarChipProps) {
  return (
    <div className={`${styles.chip} ${className}`.trim()} aria-hidden="true">
      <span className={styles.month}>{month}</span>
      <span className={styles.day}>{day}</span>
    </div>
  );
}
