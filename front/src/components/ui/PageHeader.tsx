import type { ReactNode } from "react";
import { SyncIndicator } from "./SyncIndicator";
import styles from "./PageHeader.module.css";

export interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly overline?: string;
  readonly badge?: ReactNode;
  readonly isRevalidating?: boolean;
  readonly revalidatingLabel?: string;
  readonly actions?: ReactNode;
  readonly className?: string;
}

/**
 * En-tête de page standardisé du Design System EventHub (écrans 04, 06, 07, 08, 09, 10).
 * Gère le surtitre optionnel, le titre `h1`, un badge de statut ou `SyncIndicator`,
 * le sous-titre descriptif et la zone d'actions alignée à droite.
 */
export function PageHeader({
  title,
  subtitle,
  overline,
  badge,
  isRevalidating = false,
  revalidatingLabel,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`${styles.header} ${className}`.trim()}>
      <div className={styles.textBlock}>
        {overline ? <p className={styles.overline}>{overline}</p> : null}
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {badge}
          {isRevalidating && revalidatingLabel ? (
            <SyncIndicator label={revalidatingLabel} />
          ) : null}
        </div>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
