import styles from "./SkeletonCard.module.css";

export interface SkeletonCardProps {
  readonly compact?: boolean;
}

export function SkeletonCard({ compact = false }: SkeletonCardProps) {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`${styles.banner} ${compact ? styles.bannerCompact : ""}`.trim()} />
      <div className={styles.body}>
        <div className={`${styles.line} ${styles.title}`} />
        <div className={`${styles.line} ${styles.meta}`} />
        <div className={`${styles.line} ${styles.metaShort}`} />
        <div className={styles.footer}>
          <div className={styles.organizer}>
            <div className={styles.avatar} />
            <div className={`${styles.line} ${styles.name}`} />
          </div>
          <div className={styles.pill} />
        </div>
      </div>
    </div>
  );
}
