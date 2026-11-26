"use client";

import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";
import styles from "./Pagination.module.css";

export interface PaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly onPageChange: (nextPage: number) => void;
  readonly disabled?: boolean;
  /** Texte récapitulatif optionnel à gauche (ex. « Affichage 1–4 sur 8 » dans Figma 07 & 09). */
  readonly summary?: string;
}

function buildPageList(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push("ellipsis");
  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }
  if (end < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  summary,
}: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1 && !summary) {
    return null;
  }

  const items = totalPages > 1 ? buildPageList(page, totalPages) : [];

  const controls =
    totalPages > 1 ? (
      <nav
        className={summary ? styles.navInline : styles.nav}
        aria-label={t("pagination.label")}
      >
        <ul className={styles.list}>
          <li>
            <button
              type="button"
              className={styles.pageButton}
              disabled={disabled || page <= 1}
              aria-label={t("pagination.previous")}
              onClick={() => onPageChange(page - 1)}
            >
              <Icon name="chevronLeft" size={16} />
            </button>
          </li>

          {items.map((item, idx) =>
            item === "ellipsis" ? (
              <li key={`ellipsis-${idx}`} className={styles.ellipsis} aria-hidden="true">
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  className={`${styles.pageButton} ${item === page ? styles.active : ""}`.trim()}
                  aria-current={item === page ? "page" : undefined}
                  aria-label={t("pagination.page", { page: item })}
                  disabled={disabled}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </button>
              </li>
            ),
          )}

          <li>
            <button
              type="button"
              className={styles.pageButton}
              disabled={disabled || page >= totalPages}
              aria-label={t("pagination.next")}
              onClick={() => onPageChange(page + 1)}
            >
              <Icon name="chevronRight" size={16} />
            </button>
          </li>
        </ul>
      </nav>
    ) : null;

  if (!summary) {
    return controls;
  }

  return (
    <div className={styles.footerRow}>
      <p className={styles.summary}>{summary}</p>
      {controls}
    </div>
  );
}
