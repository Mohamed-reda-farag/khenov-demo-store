import type { Banner, Category, CategoryId, Collection, ColorOption, Product } from '../types';

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

export interface CatalogQuery {
  q?: string;
  categories?: readonly CategoryId[];
  /** EU sizes; matches products that have stock in ANY of them. */
  sizes?: readonly number[];
  colors?: readonly string[];
  minPrice?: number;
  maxPrice?: number;
  collection?: string;
  onlyNew?: boolean;
  onSale?: boolean;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface CatalogFacets {
  categories: { id: CategoryId; count: number }[];
  colors: { color: ColorOption; count: number }[];
  sizes: { size: number; count: number }[];
  price: { min: number; max: number };
}

export interface CatalogPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: CatalogFacets;
}

export type Suggestion =
  { kind: 'product'; product: Product } | { kind: 'category'; category: Category };

export interface CatalogRepository {
  list(query?: CatalogQuery): Promise<CatalogPage>;
  getBySlug(slug: string): Promise<Product | null>;
  getRelated(productId: string, limit?: number): Promise<Product[]>;
  getFeatured(limit?: number): Promise<Product[]>;
  getNewArrivals(limit?: number): Promise<Product[]>;
  suggest(text: string, limit?: number): Promise<Suggestion[]>;
  listCategories(): Promise<Category[]>;
  listCollections(): Promise<Collection[]>;
  listBanners(): Promise<Banner[]>;
}
