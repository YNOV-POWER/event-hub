import styles from "./SkeletonRow.module.css";

export interface SkeletonRowProps {
  readonly count?: number;
  readonly ariaLabel?: string;
}

/**
 * Squelette de carte horizontale (fidèle à Figma 06 · Mes inscriptions — état Chargement).
 */
export function SkeletonRow({ count = 1, ariaLabel }: SkeletonRowProps) {
  return (
    <div
      className={styles.list}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      {Array.from({ length: count }, (_, idx) => (
        <div key={idx} className={styles.row} aria-hidden="true">
          <div className={styles.square} />
          <div className={styles.lines}>
            <div className={`${styles.line} ${styles.title}`} />
            <div className={`${styles.line} ${styles.meta}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
