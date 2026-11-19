'use client';

import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateBlocks';
import { firstPhotoColorId } from '@/data/images';
import { catalogRepository } from '@/data/repository';
import { ArtTile, ProductImage } from '@/features/catalog/components/ProductImage';
import { artFor, type ArtTone } from '@/features/catalog/components/ShoeArt';
import { Link } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';

async function loadTiles() {
  const [categories, page] = await Promise.all([
    catalogRepository.listCategories(),
    catalogRepository.list({ pageSize: 1 }),
  ]);
  return categories.map((category) => ({
    category,
    count: page.facets.categories.find((c) => c.id === category.id)?.count ?? 0,
  }));
}

const SHOE: Record<ArtTone, string> = {
  sand: '#a86b32',
  sage: '#6b6e3c',
  blush: '#b5532e',
  stone: '#1a1a1a',
  mist: '#2d4fcb',
  ink: '#f1ece2',
};

export function CategoryTiles() {
  const t = useTranslations('home');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const format = useFormat();
  const state = useAsync('home:categories', loadTiles);

  return (
    <section aria-labelledby="categories-title">
      <h2 id="categories-title" className="mb-8 font-display text-2xl font-semibold">
        {t('categoriesTitle')}
      </h2>
      {state.status === 'loading' ? (
        <div
          role="status"
          aria-busy
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5"
        >
          <span className="sr-only">{common('loading')}</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-md" />
          ))}
        </div>
      ) : null}
      {state.status === 'error' ? (
        <ErrorState
          title={states('errorTitle')}
          body={states('errorBody')}
          retryLabel={common('retry')}
          onRetry={state.retry}
        />
      ) : null}
      {state.status === 'success' ? (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {state.data.map(({ category, count }) => {
            const art = artFor(category.id, category.coverSlug);
            const coverColorId = firstPhotoColorId(category.coverSlug);
            return (
              <li key={category.id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-md bg-canvas"
                >
                  {coverColorId ? (
                    <ProductImage
                      fill
                      zoom
                      slug={category.coverSlug}
                      colorId={coverColorId}
                      categoryId={category.id}
                      alt=""
                      colorHex={SHOE[art.tone]}
                      sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 48vw"
                    />
                  ) : (
                    <ArtTile
                      silhouette={art.silhouette}
                      tone={art.tone}
                      color={SHOE[art.tone]}
                      className="absolute inset-0"
                    />
                  )}
                  <span className="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-ink-900/75 to-transparent p-4 pt-12 text-paper">
                    <span className="font-display text-lg font-semibold">
                      {format.text(category.name)}
                    </span>
                    <span className="text-xs text-sand-200">
                      {t('styleCount', { count, countText: format.number(count) })}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
