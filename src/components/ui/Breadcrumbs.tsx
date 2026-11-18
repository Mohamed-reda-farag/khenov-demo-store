import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from '@/i18n/navigation';

export interface Crumb {
  label: string;
  /** Locale-less route. Omit on the current page. */
  href?: string;
}

/** The chevron separator flips in RTL so it always points along the reading direction. */
export function Breadcrumbs({ items, label }: { items: readonly Crumb[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-1 text-sm text-ink-500">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <li aria-hidden className="grid place-items-center">
                <ChevronRight className="size-4 rtl:-scale-x-100" />
              </li>
            ) : null}
            <li>
              {item.href ? (
                <Link
                  href={item.href}
                  className="-mx-1.5 inline-flex min-h-11 items-center px-1.5 underline-offset-4 hover:text-ink-900 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className="inline-flex min-h-11 items-center text-ink-900"
                >
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
