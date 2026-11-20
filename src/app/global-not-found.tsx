import type { Metadata } from 'next';
import Link from 'next/link';
import ar from '@/i18n/ar.json';
import en from '@/i18n/en.json';
import './globals.css';

export const metadata: Metadata = {
  title: `${ar.notFound.code} · ${en.notFound.code} — ATHAR · أثر`,
  robots: { index: false },
};

const PANELS = [
  { lang: 'ar', dir: 'rtl', text: ar.notFound, home: '/ar/', shop: '/ar/shop/' },
  { lang: 'en', dir: 'ltr', text: en.notFound, home: '/en/', shop: '/en/shop/' },
] as const;

const button =
  'inline-flex min-h-11 items-center rounded-pill border border-ink-900 px-5 text-sm font-medium';

/**
 * Shown by the static host for any address that matches no page. Without a server it cannot
 * know the visitor's language, so it speaks both and each half sets its own lang and direction.
 */
export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <main className="container-page grid min-h-dvh content-center gap-12 py-16 md:grid-cols-2">
          {PANELS.map((panel) => (
            <section
              key={panel.lang}
              lang={panel.lang}
              dir={panel.dir}
              className="flex flex-col items-start gap-3"
            >
              <p className="text-sm font-medium text-ink-500">{panel.text.code}</p>
              <h1 className="font-display text-3xl font-semibold">{panel.text.title}</h1>
              <p className="max-w-md text-ink-700">{panel.text.body}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <Link href={panel.home} className={`${button} bg-ink-900 text-paper`}>
                  {panel.text.home}
                </Link>
                <Link href={panel.shop} className={button}>
                  {panel.text.shop}
                </Link>
              </div>
            </section>
          ))}
        </main>
      </body>
    </html>
  );
}
