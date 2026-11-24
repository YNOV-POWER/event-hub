import styles from "./StrengthMeter.module.css";

export interface StrengthMeterProps {
  /** Nombre de segments actifs (0 à `segments`). */
  readonly level: number;
  readonly segments?: number;
  /** Seuil à partir duquel la jauge passe en vert (par défaut : 3). */
  readonly goodThreshold?: number;
  readonly className?: string;
}

export function StrengthMeter({
  level,
  segments = 4,
  goodThreshold = 3,
  className = "",
}: StrengthMeterProps) {
  const items = Array.from({ length: segments }, (_, idx) => idx + 1);

  return (
    <div
      className={`${styles.bar} ${className}`.trim()}
      style={{ gridTemplateColumns: `repeat(${segments}, 1fr)` }}
      aria-hidden="true"
    >
      {items.map((segment) => (
        <span
          key={segment}
          className={`${styles.segment} ${
            segment <= level
              ? level >= goodThreshold
                ? styles.good
                : styles.warn
              : ""
          }`.trim()}
        />
      ))}
    </div>
  );
}
