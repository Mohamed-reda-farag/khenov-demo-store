import { simulateNetwork } from '@/lib/demo/network';
import { ratingDistribution } from '../rating';
import { PRODUCTS, REVIEWS } from '../seed';
import type { ReviewsRepository } from './reviews';

export const localReviewsRepository: ReviewsRepository = {
  async forProduct(productId) {
    await simulateNetwork();
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) throw new Error(`Unknown product ${productId}`);
    return {
      summary: {
        average: product.rating,
        count: product.reviewCount,
        distribution: ratingDistribution(product.rating, product.reviewCount),
      },
      samples: REVIEWS.filter((r) => r.productId === productId),
    };
  },
};
