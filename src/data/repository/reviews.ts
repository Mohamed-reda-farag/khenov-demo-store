import type { RatingBucket } from '../rating';
import type { Review } from '../types';

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: RatingBucket[];
}

export interface ProductReviews {
  summary: ReviewSummary;
  /** A handful of fictional sample reviews; the summary covers the product's full count. */
  samples: Review[];
}

export interface ReviewsRepository {
  forProduct(productId: string): Promise<ProductReviews>;
}
