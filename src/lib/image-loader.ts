/**
 * next/image loader for a static export. `src` is a path WITHOUT extension or width,
 * e.g. "/images/products/nile-low/1". The optimizer script writes `<src>-<width>.webp`
 * for each width below, and this picks the smallest one that is wide enough.
 */
export const IMAGE_WIDTHS = [480, 960, 1600] as const;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function imageLoader({ src, width }: { src: string; width: number }): string {
  const target = IMAGE_WIDTHS.find((w) => w >= width) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
  return `${BASE_PATH}${src}-${target}.webp`;
}
