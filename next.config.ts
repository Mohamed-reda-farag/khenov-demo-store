import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Fully static export: no server, no middleware.
 * `NEXT_PUBLIC_BASE_PATH` lets the same build be hosted under a sub-path
 * (e.g. GitHub Pages project sites). Leave it unset for a root domain.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  // One 404 for the whole static site: the app has two root layouts, so none can compose it.
  experimental: { globalNotFound: true },
  ...(basePath ? { basePath } : {}),
  images: {
    // Images are pre-optimized to WebP by `npm run images:optimize`.
    // The custom loader maps a requested width to the closest pre-built file,
    // so next/image still emits a responsive srcset without a server.
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
  },
};

export default withNextIntl(nextConfig);
