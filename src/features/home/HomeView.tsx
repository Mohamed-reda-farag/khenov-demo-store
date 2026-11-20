'use client';

import { useTranslations } from 'next-intl';
import { buttonClasses } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/StateBlocks';
import { catalogRepository } from '@/data/repository';
import type { Banner, Product } from '@/data/types';
import { Link } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';
import { BannerImage } from '@/features/catalog/components/BannerImage';
import { CategoryTiles, type CategoryTile } from './CategoryTiles';
import { ProductRail } from './ProductRail';
import { PromoStrip, PromoTiles } from './Promos';
import { ValuesStrip } from './ValuesStrip';

function Hero({ banner }: { banner: Banner }) {
  const t = useTranslations('home');
  const format = useFormat();
  return (
    <section aria-labelledby="hero-title" className="bg-canvas">
      <div className="container-page grid items-center gap-8 py-8 lg:grid-cols-2 lg:gap-16 lg:py-0">
        <div className="order-2 flex flex-col items-start gap-6 lg:order-1 lg:py-24">
          <p className="text-xs font-semibold tracking-wide text-accent-700 uppercase">
            {t('heroEyebrow')}
          </p>
          <h1 id="hero-title" className="font-display text-display font-semibold tracking-display">
            {format.text(banner.title)}
          </h1>
          <p className="max-w-md text-lg text-ink-700">{format.text(banner.subtitle)}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className={buttonClasses({ size: 'lg' })}>
              {t('shopNow')}
            </Link>
            <Link
              href={banner.href}
              className={buttonClasses({ variant: 'secondary', size: 'lg' })}
            >
              {format.text(banner.cta)}
            </Link>
          </div>
        </div>
        <div className="relative order-1 aspect-[4/5] w-full overflow-hidden rounded-lg bg-sand-100 lg:order-2 lg:my-10 lg:max-h-[40rem]">
          <BannerImage
            banner={banner}
            sizes="(min-width: 1024px) 45vw, 100vw"
            priority
            alt={format.text(banner.title)}
          />
        </div>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <div role="status" aria-busy className="bg-canvas">
      <div className="container-page grid items-center gap-8 py-8 lg:grid-cols-2 lg:gap-16 lg:py-10">
        <div className="order-2 flex flex-col gap-5 lg:order-1" aria-hidden>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-4/5" />
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-14 w-56 rounded-pill" />
        </div>
        <Skeleton className="order-1 aspect-[4/5] w-full rounded-lg lg:order-2 lg:max-h-[40rem]" />
      </div>
    </div>
  );
}

/** What the home page already knows when it is built (it is rendered into the static HTML). */
export interface HomeInitialData {
  banners: Banner[];
  tiles: CategoryTile[];
  featured: Product[];
  newArrivals: Product[];
}

export function HomeView({ initial }: { initial: HomeInitialData }) {
  const t = useTranslations('home');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const banners = useAsync('home:banners', () => catalogRepository.listBanners(), initial.banners);
  const list = banners.status === 'success' ? banners.data : [];
  const hero = list.find((b) => b.kind === 'hero');
  const strip = list.find((b) => b.kind === 'strip');
  const tiles = list.filter((b) => b.kind === 'tile');

  return (
    <>
      {banners.status === 'loading' ? <HeroSkeleton /> : null}
      {banners.status === 'error' ? (
        <div className="bg-canvas">
          <div className="container-page">
            <ErrorState
              as="h1"
              title={states('errorTitle')}
              body={states('errorBody')}
              retryLabel={common('retry')}
              onRetry={banners.retry}
            />
          </div>
        </div>
      ) : null}
      {hero ? <Hero banner={hero} /> : null}

      <div className="container-page flex flex-col gap-24 pt-20">
        <CategoryTiles initial={initial.tiles} />
        <ProductRail
          id="featured"
          title={t('featuredTitle')}
          lead={t('featuredLead')}
          href="/shop"
          load={() => catalogRepository.getFeatured(8)}
          loadKey="home:featured"
          initial={initial.featured}
        />
      </div>

      {strip ? <PromoStrip banner={strip} /> : null}

      <div className="container-page flex flex-col gap-24 pt-24">
        <ProductRail
          id="new"
          title={t('newTitle')}
          lead={t('newLead')}
          href="/shop?new=1&sort=newest"
          load={() => catalogRepository.getNewArrivals(4)}
          loadKey="home:new"
          initial={initial.newArrivals}
        />
        {tiles.length > 0 ? <PromoTiles banners={tiles} /> : null}
        <ValuesStrip />
      </div>
    </>
  );
}
