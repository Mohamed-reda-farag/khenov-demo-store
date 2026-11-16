import { useId } from 'react';
import type { CategoryId, Silhouette } from '@/data/types';
import { darken, lighten, luminance, mix } from '@/lib/color';
import { SHOES, type FillRole } from './shoe-art';

/** Placeholder art only (generated imagery, not UI): background tones for the portrait canvas. */
export const ART_TONES = {
  sand: '#eae3d5',
  sage: '#dde2d8',
  blush: '#ebddd3',
  stone: '#e2e0db',
  mist: '#dce1e6',
  ink: '#27251f',
} as const;

export type ArtTone = keyof typeof ART_TONES;

const CATEGORY_ART: Record<CategoryId, { silhouette: Silhouette; tone: ArtTone }> = {
  sneakers: { silhouette: 'sneaker', tone: 'sand' },
  running: { silhouette: 'runner', tone: 'mist' },
  boots: { silhouette: 'boot', tone: 'blush' },
  sandals: { silhouette: 'sandal', tone: 'sage' },
  classic: { silhouette: 'loafer', tone: 'stone' },
};

const TONE_ORDER: ArtTone[] = ['sand', 'stone', 'sage', 'blush', 'mist'];

export function artFor(categoryId: CategoryId, slug?: string) {
  const base = CATEGORY_ART[categoryId];
  if (!slug) return base;
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return { silhouette: base.silhouette, tone: TONE_ORDER[hash % TONE_ORDER.length] ?? base.tone };
}

interface ShoeArtProps {
  silhouette: Silhouette;
  tone: ArtTone;
  /** Colour of the shoe upper. */
  color: string;
  className?: string;
}

const ACCENT = '#e5541b';

/**
 * Generated placeholder for a product photo: a soft studio background, a floor shadow and
 * a silhouette tinted with the product colour. Used until real photos are added.
 */
export function ShoeArt({ silhouette, tone, color, className = '' }: ShoeArtProps) {
  const uid = useId().replace(/:/g, '');
  const shoe = SHOES[silhouette];
  const scale = 340 / shoe.width;
  const shoeHeight = shoe.height * scale;
  const floorY = 345;

  const light = luminance(color) > 0.55;
  const roles: Record<FillRole, string> = {
    upper: color,
    shade: darken(color, light ? 0.14 : 0.28),
    light: light ? darken(color, 0.12) : lighten(color, 0.42),
    sole: luminance(color) < 0.12 ? '#ede8dd' : light ? '#d8d0c0' : '#f4f0e8',
    accent: ACCENT,
  };

  const dark = tone === 'ink';
  const background = ART_TONES[tone];

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={`size-full ${className}`}
    >
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="42%" r="62%">
          <stop
            offset="0"
            stopColor={dark ? mix(background, '#ffffff', 0.1) : '#ffffff'}
            stopOpacity={dark ? 1 : 0.7}
          />
          <stop offset="1" stopColor={background} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-shadow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#14130f" stopOpacity="0.28" />
          <stop offset="1" stopColor="#14130f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={background} />
      <rect width="400" height="500" fill={`url(#${uid}-glow)`} />
      <ellipse cx="200" cy={floorY + 6} rx="150" ry="14" fill={`url(#${uid}-shadow)`} />
      <g transform={`translate(30 ${floorY - shoeHeight + 4}) scale(${scale})`}>
        {shoe.parts.map((part, i) => (
          <path
            key={i}
            d={part.d}
            fill={part.fill ? roles[part.fill] : 'none'}
            stroke={part.stroke ? roles[part.stroke] : undefined}
            strokeWidth={part.strokeWidth}
            strokeDasharray={part.dash}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>
    </svg>
  );
}
