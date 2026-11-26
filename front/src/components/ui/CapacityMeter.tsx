import { ProgressBar, type ProgressBarTone } from "./ProgressBar";
import styles from "./CapacityMeter.module.css";

export type CapacityMeterSize = "sm" | "md";

export interface CapacityMeterProps {
  readonly value: number;
  readonly max: number;
  readonly label: string;
  readonly showPercent?: boolean;
  readonly size?: CapacityMeterSize;
  readonly tone?: ProgressBarTone;
  /** Seuil (%) à partir duquel la barre passe automatiquement en `warning` si `tone` n'est pas fixé. */
  readonly warningThresholdPercent?: number;
  readonly className?: string;
}

/**
 * Jauge d'occupation (`confirmés / capacité` + pourcentage optionnel + `ProgressBar`).
 * Réutilisée dans les tableaux des écrans `07 · Mes événements` et `10 · Tableau de bord`.
 */
export function CapacityMeter({
  value,
  max,
  label,
  showPercent = false,
  size = "md",
  tone,
  warningThresholdPercent,
  className = "",
}: CapacityMeterProps) {
  const safeMax = Math.max(1, max);
  const clamped = Math.min(safeMax, Math.max(0, value));
  const percent = Math.round((clamped / safeMax) * 100);

  const resolvedTone: ProgressBarTone =
    tone ??
    (warningThresholdPercent !== undefined && percent >= warningThresholdPercent
      ? "warning"
      : "primary");

  return (
    <div className={`${styles.meter} ${styles[size]} ${className}`.trim()}>
      <div className={styles.meta}>
        <span className={styles.ratio}>
          {value} / {max}
        </span>
        {showPercent ? <span className={styles.percent}>{percent} %</span> : null}
      </div>
      <ProgressBar
        value={value}
        max={max}
        label={label}
        tone={resolvedTone}
        className={size === "sm" ? styles.barSm : undefined}
      />
    </div>
  );
}
