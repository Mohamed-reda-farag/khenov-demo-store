import { simulateNetwork } from '@/lib/demo/network';
import type { CatalogRepository } from './catalog';
import {
  featuredFrom,
  newArrivalsFrom,
  queryCatalog,
  relatedTo,
  suggestFrom,
} from './catalog.query';

/** The seed is a separate chunk: pages built from static data never download it. */
const loadSeed = () => import('../seed');

/** Local, seed-backed implementation. Every call pays the simulated network cost. */
export const localCatalogRepository: CatalogRepository = {
  async list(query) {
    await simulateNetwork();
    const { PRODUCTS, CATEGORIES } = await loadSeed();
    return queryCatalog(PRODUCTS, CATEGORIES, query);
  },

  async getBySlug(slug) {
    await simulateNetwork();
    const { PRODUCTS } = await loadSeed();
    return PRODUCTS.find((p) => p.slug === slug) ?? null;
  },

  async getByIds(ids) {
    await simulateNetwork(120, 360);
    const { PRODUCTS } = await loadSeed();
    return PRODUCTS.filter((p) => ids.includes(p.id));
  },

  async getRelated(productId, limit = 4) {
    await simulateNetwork();
    const { PRODUCTS } = await loadSeed();
    const source = PRODUCTS.find((p) => p.id === productId);
    return source ? relatedTo(PRODUCTS, source, limit) : [];
  },

  async getFeatured(limit = 8) {
    await simulateNetwork();
    const { PRODUCTS } = await loadSeed();
    return featuredFrom(PRODUCTS, limit);
  },

  async getNewArrivals(limit = 8) {
    await simulateNetwork();
    const { PRODUCTS } = await loadSeed();
    return newArrivalsFrom(PRODUCTS, limit);
  },

  async suggest(text, limit = 6) {
    await simulateNetwork(80, 220);
    const { PRODUCTS, CATEGORIES } = await loadSeed();
    return suggestFrom(PRODUCTS, CATEGORIES, text, limit);
  },

  async listCategories() {
    await simulateNetwork();
    const { CATEGORIES } = await loadSeed();
    return [...CATEGORIES];
  },

  async listCollections() {
    await simulateNetwork();
    const { COLLECTIONS } = await loadSeed();
    return [...COLLECTIONS];
  },

  async listBanners() {
    await simulateNetwork();
    const { BANNERS } = await loadSeed();
    return [...BANNERS];
  },
};
