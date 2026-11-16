import { simulateNetwork } from '@/lib/demo/network';
import { BANNERS, CATEGORIES, COLLECTIONS, PRODUCTS } from '../seed';
import type { CatalogRepository } from './catalog';
import { queryCatalog, relatedTo, suggestFrom } from './catalog.query';

/** Local, seed-backed implementation. Every call pays the simulated network cost. */
export const localCatalogRepository: CatalogRepository = {
  async list(query) {
    await simulateNetwork();
    return queryCatalog(PRODUCTS, CATEGORIES, query);
  },

  async getBySlug(slug) {
    await simulateNetwork();
    return PRODUCTS.find((p) => p.slug === slug) ?? null;
  },

  async getRelated(productId, limit = 4) {
    await simulateNetwork();
    const source = PRODUCTS.find((p) => p.id === productId);
    return source ? relatedTo(PRODUCTS, source, limit) : [];
  },

  async getFeatured(limit = 8) {
    await simulateNetwork();
    return PRODUCTS.filter((p) => p.isFeatured).slice(0, limit);
  },

  async getNewArrivals(limit = 8) {
    await simulateNetwork();
    return PRODUCTS.filter((p) => p.isNew)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },

  async suggest(text, limit = 6) {
    await simulateNetwork(80, 220);
    return suggestFrom(PRODUCTS, CATEGORIES, text, limit);
  },

  async listCategories() {
    await simulateNetwork();
    return [...CATEGORIES];
  },

  async listCollections() {
    await simulateNetwork();
    return [...COLLECTIONS];
  },

  async listBanners() {
    await simulateNetwork();
    return [...BANNERS];
  },
};
