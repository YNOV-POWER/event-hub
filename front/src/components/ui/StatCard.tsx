import { Icon, type IconName } from "./Icon";
import styles from "./StatCard.module.css";

export type StatCardIconTone = "primary" | "warning" | "success" | "info" | "neutral";
export type StatCardCaptionTone = "success" | "warning" | "muted" | "primary";

export interface StatCardProps {
  readonly icon: IconName;
  readonly iconTone?: StatCardIconTone;
  readonly value: string | number;
  readonly label: string;
  readonly caption?: string;
  readonly captionTone?: StatCardCaptionTone;
  readonly className?: string;
}

/**
 * Carte d'indicateur clé (KPI) du Design System EventHub.
 * Fidèle aux maquettes Figma `10 · Tableau de bord organisateur` et `09 · Inscrits d'un événement`.
 */
export function StatCard({
  icon,
  iconTone = "primary",
  value,
  label,
  caption,
  captionTone = "success",
  className = "",
}: StatCardProps) {
  return (
    <article className={`${styles.card} ${className}`.trim()}>
      <div className={`${styles.iconBadge} ${styles[`icon_${iconTone}`]}`} aria-hidden="true">
        <Icon name={icon} size={20} />
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {caption ? (
        <div className={`${styles.caption} ${styles[`caption_${captionTone}`]}`}>{caption}</div>
      ) : null}
    </article>
  );
}
