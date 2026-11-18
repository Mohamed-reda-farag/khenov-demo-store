/** Foot length that fits an EU size, rounded to the nearest 0.5 cm (Paris-point rule of thumb). */
export function footLengthCm(euSize: number): number {
  const shoeLength = (euSize * 2) / 3;
  return Math.round((shoeLength - 1.5) * 2) / 2;
}

export const SIZE_GUIDE_RANGE = { from: 36, to: 46 } as const;

export function sizeGuideRows(): { eu: number; cm: number }[] {
  const rows: { eu: number; cm: number }[] = [];
  for (let eu = SIZE_GUIDE_RANGE.from; eu <= SIZE_GUIDE_RANGE.to; eu += 1) {
    rows.push({ eu, cm: footLengthCm(eu) });
  }
  return rows;
}
