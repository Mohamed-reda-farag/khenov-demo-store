const PREFIX = 'ATR-';
const FIRST = 10001;

/** Order numbers count up from ATR-10001; `sequence` is 0 for the first order. */
export const formatOrderId = (sequence: number): string => `${PREFIX}${FIRST + sequence}`;

/** Accepts what a visitor might type or what the URL holds: any case, stray spaces. */
export function normalizeOrderId(input: string): string | null {
  const match = /^atr-?(\d{5,})$/i.exec(input.trim());
  return match ? `${PREFIX}${match[1]}` : null;
}
