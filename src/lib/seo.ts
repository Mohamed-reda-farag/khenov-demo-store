import type { Metadata } from 'next';
import { routing, type AppLocale } from '@/i18n/routing';

/** Sub-path the build is hosted under (empty on a root domain). Metadata URLs are not prefixed by Next. */
export const BASE_PATH = process.env['NEXT_PUBLIC_BASE_PATH'] ?? '';
export const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000';

/**
 * ATHAR is a fictional store, so by default no page asks to be indexed: invented products and
 * prices must not turn up in real search results. A deployment that really wants indexing (a
 * portfolio showcase, say) sets NEXT_PUBLIC_ALLOW_INDEXING=true at build time.
 */
const ALLOW_INDEXING = process.env['NEXT_PUBLIC_ALLOW_INDEXING'] === 'true';

const OG_LOCALE: Record<AppLocale, string> = { ar: 'ar_EG', en: 'en_US' };

export const withBase = (path: string): string => `${BASE_PATH}${path}`;

/** Locale-prefixed, base-path-aware address of a page; `path` is locale-less and ends with "/". */
export const pageUrl = (locale: AppLocale, path: string): string => withBase(`/${locale}${path}`);

interface PageMetadataInput {
  locale: AppLocale;
  /** Locale-less route ending in "/", e.g. "/shop/" or "/product/nile-low/". */
  path: string;
  title: string;
  description: string;
  /** Public path of a share image (without the base path). */
  image?: string | undefined;
}

/** Title, description, canonical, hreflang, Open Graph and robots for one page in one language. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
}: PageMetadataInput): Metadata {
  const images = image ? [withBase(image)] : [];
  return {
    title,
    description,
    alternates: {
      canonical: pageUrl(locale, path),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, pageUrl(l, path)])),
        'x-default': pageUrl(routing.defaultLocale, path),
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'ATHAR · أثر',
      url: pageUrl(locale, path),
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images,
    },
    twitter: { card: images.length > 0 ? 'summary_large_image' : 'summary', title, description },
    robots: ALLOW_INDEXING ? { index: true, follow: true } : { index: false, follow: false },
  };
}
