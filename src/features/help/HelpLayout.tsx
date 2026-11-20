import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Link } from '@/i18n/navigation';
import { HELP_PAGES, type HelpSlug } from './help-pages';

/** Shared frame for every help page: breadcrumbs, title, side menu and the demo reminder. */
export function HelpLayout({
  slug,
  intro,
  children,
}: {
  slug: HelpSlug;
  intro?: string;
  children: ReactNode;
}) {
  const t = useTranslations('help');
  const nav = useTranslations('nav');
  const current = HELP_PAGES.find((page) => page.slug === slug);
  const title = t(`pages.${current?.titleKey ?? 'shipping'}`);

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumbs
        label={nav('breadcrumb')}
        items={[{ label: nav('home'), href: '/' }, { label: t('title') }, { label: title }]}
      />
      <div className="mt-6 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label={t('navLabel')} className="lg:sticky lg:top-28 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0">
            {HELP_PAGES.map((page) => (
              <li key={page.slug}>
                <Link
                  href={page.href}
                  aria-current={page.slug === slug ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center rounded-pill px-4 text-sm lg:rounded-md ${
                    page.slug === slug
                      ? 'bg-ink-900 font-medium text-paper'
                      : 'bg-sand-100 text-ink-700 hover:bg-sand-200 lg:bg-transparent'
                  }`}
                >
                  {t(`pages.${page.titleKey}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="max-w-3xl">
          <h1 className="sm:text-4xl font-display text-3xl font-semibold">{title}</h1>
          {intro ? <p className="mt-3 text-lg text-ink-700">{intro}</p> : null}
          <p className="mt-6 flex items-start gap-3 rounded-md bg-sand-100 p-4 text-sm text-ink-700">
            <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
            {t('demoBanner')}
          </p>
          <div className="mt-10 flex flex-col gap-10">{children}</div>
        </article>
      </div>
    </div>
  );
}

/** One titled block of help text. */
export function HelpSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-ink-700">{children}</div>
    </section>
  );
}
