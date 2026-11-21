/**
 * Pure helpers for docs/IMAGE_CREDITS.md: one table row per shipped photo, with the photographer
 * and the page it was downloaded from. `scripts/check-credits.ts` uses them; they are tested here.
 */
export interface CreditRow {
  file: string;
  photographer: string;
  link: string;
}

export interface ParsedCredits {
  /** Everything above the table (title and notes), kept as written. */
  intro: string;
  rows: CreditRow[];
}

const ROW = /^\|\s*`([^`]+)`\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*$/;
const SOURCES = /^https:\/\/(?:www\.)?(?:unsplash\.com|pexels\.com)\//i;

export const isPending = (value: string): boolean =>
  value.trim() === '' || /^pending$/i.test(value.trim());

/** A row marked "AI-generated" is complete: there is no photographer or page to name. */
export const isGenerated = (row: CreditRow): boolean =>
  /^ai[\s-]*generated/i.test(row.photographer.trim());

export function parseCredits(markdown: string): ParsedCredits {
  const lines = markdown.split('\n');
  const firstRow = lines.findIndex((line) => line.startsWith('| File'));
  const intro = (firstRow === -1 ? lines : lines.slice(0, firstRow)).join('\n').trimEnd();
  const rows: CreditRow[] = [];
  for (const line of lines) {
    const match = ROW.exec(line);
    if (match) rows.push({ file: match[1]!, photographer: match[2]!, link: match[3]! });
  }
  return { intro, rows };
}

export interface Reconciled {
  rows: CreditRow[];
  /** Photos that had no row yet (added as pending). */
  added: string[];
  /** Rows whose photo no longer exists (dropped). */
  removed: string[];
}

/** Matches the table to the photos that really exist, keeping every row someone already filled in. */
export function reconcileCredits(
  files: readonly string[],
  existing: readonly CreditRow[],
): Reconciled {
  const byFile = new Map(existing.map((row) => [row.file, row]));
  const sorted = [...new Set(files)].sort((a, b) => a.localeCompare(b));
  const rows = sorted.map(
    (file) => byFile.get(file) ?? { file, photographer: 'pending', link: 'pending' },
  );
  return {
    rows,
    added: sorted.filter((file) => !byFile.has(file)),
    removed: existing.map((row) => row.file).filter((file) => !sorted.includes(file)),
  };
}

export interface CreditsSummary {
  total: number;
  /** Rows that still need a photographer and a source page (AI-generated rows never do). */
  pending: number;
  /** Rows marked as AI-generated variations (extra angles or colours). */
  generated: number;
  /** Filled-in links that are not an Unsplash or Pexels address. */
  unexpectedLinks: string[];
}

export function summarizeCredits(rows: readonly CreditRow[]): CreditsSummary {
  return {
    total: rows.length,
    pending: rows.filter(
      (row) => !isGenerated(row) && (isPending(row.photographer) || isPending(row.link)),
    ).length,
    generated: rows.filter(isGenerated).length,
    unexpectedLinks: rows
      .filter((row) => !isGenerated(row) && !isPending(row.link) && !SOURCES.test(row.link))
      .map((row) => row.file),
  };
}

/** Terminal-style width: East Asian wide characters take two columns, as Prettier counts them. */
const displayWidth = (text: string): number =>
  [...text].reduce((sum, char) => {
    const code = char.codePointAt(0) ?? 0;
    const wide =
      (code >= 0x1100 && code <= 0x115f) ||
      (code >= 0x2e80 && code <= 0xa4cf) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe30 && code <= 0xfe6f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6);
    return sum + (wide ? 2 : 1);
  }, 0);

const pad = (text: string, width: number): string =>
  text + ' '.repeat(Math.max(0, width - displayWidth(text)));

/** Renders the table already aligned the way Prettier formats it, so `npm run check` stays green. */
export function renderCredits(intro: string, rows: readonly CreditRow[]): string {
  const cells = rows.map((row) => [`\`${row.file}\``, row.photographer, row.link] as const);
  const head = ['File', 'Photographer', 'Source link'] as const;
  const widths = head.map((title, col) =>
    Math.max(title.length, ...cells.map((c) => displayWidth(c[col]!))),
  );
  const line = (values: readonly string[]) =>
    `| ${values.map((value, col) => pad(value, widths[col]!)).join(' | ')} |`;
  const table = [
    line(head),
    `| ${widths.map((w) => '-'.repeat(w)).join(' | ')} |`,
    ...cells.map(line),
  ];
  return `${intro}\n\n${table.join('\n')}\n`;
}
