import Image from 'next/image';
import type { CategoryId, Silhouette } from '@/data/types';
import { photoCount, photoSrc } from '@/data/images';
import { ShoeArt, artFor, type ArtTone } from './ShoeArt';

interface ProductImageProps {
  slug: string;
  categoryId: CategoryId;
  /** Accessible description of the image. */
  alt: string;
  /** Hex of the colour to show on the generated placeholder. */
  colorHex: string;
  /** Gallery position (0-based). */
  index?: number;
  /** next/image `sizes` for the real photo. */
  sizes: string;
  priority?: boolean;
  /** Slow scale-up when a parent with the `group` class is hovered. */
  zoom?: boolean;
  /** Fill the parent (which must be positioned) instead of owning a 4:5 box. */
  fill?: boolean;
  className?: string;
}

/**
 * 4:5 product image. Renders the real optimized photo when one exists for this slot,
 * otherwise a generated placeholder, so the layout is identical either way.
 */
export function ProductImage({
  slug,
  categoryId,
  alt,
  colorHex,
  index = 0,
  sizes,
  priority = false,
  zoom = false,
  fill = false,
  className = '',
}: ProductImageProps) {
  const hasPhoto = photoCount(slug) > index;
  const art = artFor(categoryId, slug);
  const motion = zoom ? 'transition-transform dur-slow ease-brand group-hover:scale-105' : '';

  return (
    <div
      className={`overflow-hidden bg-canvas ${fill ? 'absolute inset-0' : 'relative aspect-[4/5]'} ${className}`}
    >
      {hasPhoto ? (
        <Image
          src={photoSrc(slug, index)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          fetchPriority={priority ? 'high' : undefined}
          className={`object-cover ${motion}`}
        />
      ) : (
        <div role="img" aria-label={alt} className={`size-full ${motion}`}>
          <ShoeArt silhouette={art.silhouette} tone={art.tone} color={colorHex} />
        </div>
      )}
    </div>
  );
}

/** Placeholder-only art for tiles that are not a specific product (banners, empty states). */
export function ArtTile({
  silhouette,
  tone,
  color,
  className = '',
}: {
  silhouette: Silhouette;
  tone: ArtTone;
  color: string;
  className?: string;
}) {
  return (
    <div aria-hidden className={`relative overflow-hidden ${className}`}>
      <ShoeArt silhouette={silhouette} tone={tone} color={color} />
    </div>
  );
}
