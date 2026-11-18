export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export type LocaleText = Readonly<Record<Locale, string>>;

export const CATEGORY_IDS = ['sneakers', 'running', 'boots', 'sandals', 'classic'] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

/** Which generated silhouette represents a category while real photos are missing. */
export type Silhouette = 'sneaker' | 'runner' | 'boot' | 'sandal' | 'loafer';

export interface Category {
  id: CategoryId;
  slug: string;
  name: LocaleText;
  blurb: LocaleText;
  /** Slug of the product whose photo represents this category on the home page. */
  coverSlug: string;
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

/** A colourway. Stock is tracked per colour and size, so availability changes with the colour. */
export interface ProductColor extends ColorOption {
  sizes: readonly SizeStock[];
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
  /** First colour is the one the placeholder art and the card start with. */
  colors: readonly ProductColor[];
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
  /** Product whose photo is shown on the banner (falls back to the silhouette). */
  productSlug?: string;
}

/** A fictional sample review. The summary numbers come from the product, not from these. */
export interface Review {
  id: string;
  productId: string;
  author: LocaleText;
  /** 1..5 */
  rating: number;
  title: LocaleText;
  body: LocaleText;
  /** ISO date. */
  date: string;
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
