'use client';

import { useEffect } from 'react';
import { preferencesRepository } from '@/data/repository';
import { routing } from '@/i18n/routing';
import { useRouter } from 'next/navigation';

/**
 * Static export has no middleware, so "/" redirects on the client:
 * the remembered language if there is one, otherwise Arabic (the default).
 * The <noscript> refresh covers visitors without JavaScript.
 */
export default function EntryPage() {
  const router = useRouter();

  useEffect(() => {
    const locale = preferencesRepository.getLocale() ?? routing.defaultLocale;
    const query = window.location.search;
    router.replace(`/${locale}/${query}`);
  }, [router]);

  return (
    <>
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=./${routing.defaultLocale}/`} />
      </noscript>
      <main className="grid min-h-dvh place-items-center">
        <p className="text-sm text-ink-500">
          <a href={`./${routing.defaultLocale}/`} className="underline">
            أثر · ATHAR
          </a>
        </p>
      </main>
    </>
  );
}
