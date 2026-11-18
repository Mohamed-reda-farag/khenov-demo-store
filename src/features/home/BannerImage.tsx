import { photoCount } from '@/data/images';
import type { Banner } from '@/data/types';
import { ArtTile, ProductImage } from '@/features/catalog/components/ProductImage';

/** Shoe colour used on the generated placeholder, per banner tone (placeholder art only). */
const ART_SHOE: Record<Banner['tone'], string> = {
  sand: '#a86b32',
  sage: '#6b6e3c',
  blush: '#b5532e',
  stone: '#1a1a1a',
  mist: '#2d4fcb',
  ink: '#f1ece2',
};

/** The banner's product photo when it exists, otherwise the generated silhouette. */
export function BannerImage({
  banner,
  sizes,
  priority = false,
  alt = '',
}: {
  banner: Banner;
  sizes: string;
  priority?: boolean;
  alt?: string;
}) {
  const slug = banner.productSlug;
  if (slug && photoCount(slug) > 0) {
    return (
      <ProductImage
        fill
        slug={slug}
        categoryId="sneakers"
        alt={alt}
        colorHex={ART_SHOE[banner.tone]}
        sizes={sizes}
        priority={priority}
      />
    );
  }
  return (
    <ArtTile
      silhouette={banner.silhouette}
      tone={banner.tone}
      color={ART_SHOE[banner.tone]}
      className="absolute inset-0"
    />
  );
}
