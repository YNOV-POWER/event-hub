import styles from "./ProgressBar.module.css";

export type ProgressBarTone = "primary" | "success" | "warning" | "danger";

export interface ProgressBarProps {
  readonly value: number;
  readonly max: number;
  readonly label: string;
  readonly tone?: ProgressBarTone;
  readonly className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  tone = "primary",
  className = "",
}: ProgressBarProps) {
  const safeMax = Math.max(1, max);
  const clamped = Math.min(safeMax, Math.max(0, value));
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div
      className={`${styles.track} ${className}`.trim()}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-label={label}
    >
      <div
        className={`${styles.bar} ${styles[tone]}`.trim()}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
