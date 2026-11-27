const FORMULA_PREFIX = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[";\r\n]/;
const BYTE_ORDER_MARK = String.fromCharCode(0xfeff);

function escapeCell(value: string): string {
  const safe = FORMULA_PREFIX.test(value) ? `'${value}` : value;
  return NEEDS_QUOTES.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function buildCsv(rows: readonly (readonly string[])[]): string {
  return `${BYTE_ORDER_MARK}${rows.map((row) => row.map(escapeCell).join(";")).join("\r\n")}\r\n`;
}

export function toFileSlug(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "evenement"
  );
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
