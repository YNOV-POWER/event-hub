import type { ReactNode } from "react";
import styles from "./DataTable.module.css";

export interface DataTableColumn<T> {
  readonly key: string;
  readonly header: string;
  readonly headerClassName?: string;
  readonly cellClassName?: string;
  readonly render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  readonly columns: readonly DataTableColumn<T>[];
  readonly data: readonly T[];
  readonly getRowKey: (row: T) => string;
  readonly getRowClassName?: (row: T) => string | undefined;
  readonly emptyState?: ReactNode;
  readonly ariaLabel?: string;
  readonly className?: string;
}

/**
 * Tableau de données générique en carte du Design System EventHub.
 * Fidèle aux tableaux Figma des écrans `07 · Mes événements`, `09 · Inscrits` et `10 · Tableau de bord`.
 */
export function DataTable<T>({
  columns,
  data,
  getRowKey,
  getRowClassName,
  emptyState,
  ariaLabel,
  className = "",
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return (
      <div className={`${styles.card} ${className}`.trim()}>
        <div className={styles.emptyBox}>{emptyState}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${className}`.trim()}>
      <div className={styles.scroll}>
        <table className={styles.table} aria-label={ariaLabel}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={column.headerClassName}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={getRowKey(row)} className={getRowClassName?.(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={column.cellClassName}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
