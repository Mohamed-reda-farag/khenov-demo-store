import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ComingSoon } from '@/features/shell/ComingSoon';
import { routing } from '@/i18n/routing';

/** Routes owned by later milestones. Each gets its own page file there and wins over this one. */
const PLANNED_ROUTES: string[][] = [
  ['shop'],
  ['search'],
  ['wishlist'],
  ['account'],
  ['cart'],
  ['checkout'],
  ['help', 'shipping'],
  ['help', 'returns'],
  ['help', 'size-guide'],
];

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => PLANNED_ROUTES.map((slug) => ({ locale, slug })));
}

export default async function PlannedRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <ComingSoon />;
}
