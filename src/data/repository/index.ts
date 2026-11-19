import { localAddressesRepository } from './addresses.local';
import { localCartRepository } from './cart.local';
import { localCatalogRepository } from './catalog.local';
import { localNewsletterRepository } from './newsletter.local';
import { localOrdersRepository } from './orders.local';
import { localPreferencesRepository } from './preferences';
import { localReviewsRepository } from './reviews.local';
import { localSearchHistoryRepository } from './search-history.local';
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
export const ordersRepository = localOrdersRepository;
export const addressesRepository = localAddressesRepository;
export const searchHistoryRepository = localSearchHistoryRepository;

export type { AddressesRepository } from './addresses';
export type { CartRepository } from './cart';
export type { OrdersRepository } from './orders';
export type { SearchHistoryRepository } from './search-history';
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
