import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { AnnouncementBar } from '@/features/shell/AnnouncementBar';
import { AppProviders } from '@/features/shell/AppProviders';
import { Footer } from '@/features/shell/Footer';
import { Header } from '@/features/shell/Header';
import { DIRECTION, routing } from '@/i18n/routing';
import '../globals.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'),
    title: t('title'),
    description: t('description'),
    icons: { icon: '/favicon.svg' },
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/`])),
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbfaf7',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <html lang={locale} dir={DIRECTION[locale]}>
      <body>
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only z-toast rounded-pill bg-ink-900 text-paper focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:px-5 focus:py-3"
          >
            {t('skipToContent')}
          </a>
          <AppProviders>
            <AnnouncementBar />
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
