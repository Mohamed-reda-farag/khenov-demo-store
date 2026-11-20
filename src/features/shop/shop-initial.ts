import { catalogStatic } from '@/data/repository/catalog.static';
import type { Loaded } from './ShopListing';
import { EMPTY_SHOP_STATE, toCatalogQuery, type ShopScope } from './shop-params';

/**
 * The unfiltered first page of a listing, computed while the site is built. Server components
 * only (it reads the seed); the browser gets the result as props and never downloads the seed.
 */
export function shopInitial(scope: ShopScope): Loaded {
  return {
    page: catalogStatic.list(toCatalogQuery(EMPTY_SHOP_STATE, scope)),
    categories: catalogStatic.categories(),
  };
}
