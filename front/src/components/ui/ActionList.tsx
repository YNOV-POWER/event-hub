"use client";

import Link from "next/link";
import { Icon, type IconName } from "./Icon";
import styles from "./ActionList.module.css";

export type ActionItemTone =
  | "primary"
  | "warning"
  | "info"
  | "success"
  | "neutral"
  | "danger";

export interface ActionListItem {
  readonly id: string;
  readonly icon: IconName;
  readonly tone?: ActionItemTone;
  readonly title: string;
  readonly subtitle?: string;
  readonly href?: string;
  readonly onClick?: () => void;
}

export interface ActionListProps {
  readonly items: readonly ActionListItem[];
  readonly emptyItem?: Omit<ActionListItem, "id" | "href" | "onClick">;
  readonly className?: string;
}

/**
 * Carte de liste d'actions rapides / notifications actionnables du Design System.
 * Fidèle au bloc Figma « À faire » de l'écran `10 · Tableau de bord organisateur`.
 */
export function ActionList({ items, emptyItem, className = "" }: ActionListProps) {
  if (items.length === 0 && emptyItem) {
    const emptyTone = emptyItem.tone ?? "success";
    return (
      <div className={`${styles.card} ${className}`.trim()}>
        <div className={styles.staticRow}>
          <div
            className={`${styles.iconBadge} ${styles[`tone_${emptyTone}`]}`}
            aria-hidden="true"
          >
            <Icon name={emptyItem.icon} size={18} />
          </div>
          <div className={styles.text}>
            <span className={styles.title}>{emptyItem.title}</span>
            {emptyItem.subtitle ? (
              <span className={styles.subtitle}>{emptyItem.subtitle}</span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.card} ${className}`.trim()}>
      <ul className={styles.list}>
        {items.map((item) => {
          const tone = item.tone ?? "primary";
          const inner = (
            <>
              <div
                className={`${styles.iconBadge} ${styles[`tone_${tone}`]}`}
                aria-hidden="true"
              >
                <Icon name={item.icon} size={18} />
              </div>
              <div className={styles.text}>
                <span className={styles.title}>{item.title}</span>
                {item.subtitle ? (
                  <span className={styles.subtitle}>{item.subtitle}</span>
                ) : null}
              </div>
              {item.href || item.onClick ? (
                <Icon name="chevronRight" size={16} className={styles.chevron} />
              ) : null}
            </>
          );

          return (
            <li key={item.id} className={styles.listItem}>
              {item.href ? (
                <Link href={item.href} className={styles.interactiveRow}>
                  {inner}
                </Link>
              ) : item.onClick ? (
                <button
                  type="button"
                  className={styles.interactiveButton}
                  onClick={item.onClick}
                >
                  {inner}
                </button>
              ) : (
                <div className={styles.staticRow}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
