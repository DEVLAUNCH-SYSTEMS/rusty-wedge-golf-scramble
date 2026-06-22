const FORMULA_PREFIX_PATTERN = /^[=+\-@\t]/;

export function escapeCsvCell(value: string | null | undefined): string {
  const raw = value ?? "";
  const prefixed = FORMULA_PREFIX_PATTERN.test(raw) ? `'${raw}` : raw;
  const escaped = prefixed.replace(/"/g, '""');

  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}

export function formatCsvRow(cells: Array<string | null | undefined>): string {
  return cells.map((cell) => escapeCsvCell(cell)).join(",");
}
