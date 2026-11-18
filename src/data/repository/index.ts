import { localCartRepository } from './cart.local';
import { localCatalogRepository } from './catalog.local';
import { localNewsletterRepository } from './newsletter.local';
import { localPreferencesRepository } from './preferences';
import { localReviewsRepository } from './reviews.local';
import { localWishlistRepository } from './wishlist.local';

/**
 * The only way UI code reads or writes data. To swap in a real API later,
 * replace these assignments — nothing else changes.
 */
export const catalogRepository = localCatalogRepository;
export const cartRepository = localCartRepository;
export const preferencesRepository = localPreferencesRepository;
export const wishlistRepository = localWishlistRepository;
export const reviewsRepository = localReviewsRepository;
export const newsletterRepository = localNewsletterRepository;

export type { CartRepository } from './cart';
export type {
  CatalogFacets,
  CatalogPage,
  CatalogQuery,
  CatalogRepository,
  SortKey,
  Suggestion,
} from './catalog';
export type { PreferencesRepository } from './preferences';
export type { NewsletterRepository } from './newsletter';
export type { ProductReviews, ReviewSummary, ReviewsRepository } from './reviews';
export type { WishlistRepository } from './wishlist';
