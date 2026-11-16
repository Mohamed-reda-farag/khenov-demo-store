export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export type LocaleText = Readonly<Record<Locale, string>>;

export type CategoryId = 'sneakers' | 'running' | 'boots' | 'sandals' | 'classic';

/** Which generated silhouette represents a category while real photos are missing. */
export type Silhouette = 'sneaker' | 'runner' | 'boot' | 'sandal' | 'loafer';

export interface Category {
  id: CategoryId;
  slug: string;
  name: LocaleText;
  blurb: LocaleText;
}

export interface Collection {
  id: string;
  slug: string;
  name: LocaleText;
  blurb: LocaleText;
}

export interface ColorOption {
  id: string;
  name: LocaleText;
  hex: string;
}

export interface SizeStock {
  /** EU size. */
  size: number;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: LocaleText;
  categoryId: CategoryId;
  collectionIds: readonly string[];
  tagline: LocaleText;
  description: LocaleText;
  materials: LocaleText;
  priceEGP: number;
  compareAtPriceEGP?: number;
  /** First color is the "photographed" one. */
  colors: readonly ColorOption[];
  sizes: readonly SizeStock[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  /** ISO date, used for the "newest" sort. */
  createdAt: string;
}

export type BannerKind = 'hero' | 'strip' | 'tile';

export interface Banner {
  id: string;
  kind: BannerKind;
  title: LocaleText;
  subtitle: LocaleText;
  cta: LocaleText;
  /** App route (locale-less), e.g. "/shop?collection=desert-light". */
  href: string;
  tone: 'sand' | 'sage' | 'blush' | 'stone' | 'mist' | 'ink';
  silhouette: Silhouette;
}

/** Minimal product data copied into a cart line so the cart renders without a catalog lookup. */
export interface CartLine {
  id: string;
  productId: string;
  slug: string;
  name: LocaleText;
  categoryId: CategoryId;
  colorId: string;
  colorName: LocaleText;
  colorHex: string;
  size: number;
  quantity: number;
  unitPriceEGP: number;
  /** Upper bound for the quantity stepper (min of stock and the per-line cap). */
  maxQuantity: number;
}
