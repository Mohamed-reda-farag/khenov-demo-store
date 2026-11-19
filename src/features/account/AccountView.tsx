'use client';

import { UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { ResetDemoButton } from '@/features/demo/ResetDemo';
import { OrdersList } from '@/features/orders/OrdersList';
import { LanguageSwitcher } from '@/features/shell/LanguageSwitcher';
import { AddressesSection } from './AddressesSection';

/** "Account-lite": there is no login. Everything shown belongs to the demo visitor and lives in this browser. */
export function AccountView() {
  const t = useTranslations('account');
  return (
    <div className="container-page max-w-4xl py-8 sm:py-12">
      <header className="mb-10 flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-sand-100 text-ink-700">
          <UserRound aria-hidden className="size-7" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold">{t('title')}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-ink-500">
            <Badge tone="dark">{t('demoUser')}</Badge>
            {t('noLoginNote')}
          </p>
        </div>
      </header>

      <nav aria-label={t('sections')} className="mb-8 flex flex-wrap gap-2">
        {(['orders', 'addresses', 'settings'] as const).map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className="inline-flex min-h-11 items-center rounded-pill border border-sand-300 px-5 text-sm font-medium hover:bg-sand-100"
          >
            {t(`${id}Title`)}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-14">
        <section id="orders" aria-labelledby="orders-title" className="scroll-mt-28">
          <h2 id="orders-title" className="mb-4 font-display text-2xl font-semibold">
            {t('ordersTitle')}
          </h2>
          <OrdersList />
        </section>

        <AddressesSection />

        <section id="settings" aria-labelledby="settings-title" className="scroll-mt-28">
          <h2 id="settings-title" className="mb-4 font-display text-2xl font-semibold">
            {t('settingsTitle')}
          </h2>
          <div className="divide-y divide-sand-200 rounded-lg border border-sand-200">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-medium">{t('languageTitle')}</p>
                <p className="text-sm text-ink-500">{t('languageBody')}</p>
              </div>
              <LanguageSwitcher className="border border-sand-300" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-medium">{t('resetTitle')}</p>
                <p className="text-sm text-ink-500">{t('resetBody')}</p>
              </div>
              <ResetDemoButton className="font-medium" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
