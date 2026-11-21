import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from '@/i18n/navigation';

export interface Crumb {
  label: string;
  /** Locale-less route. Omit on the current page. */
  href?: string;
}

/**
 * The chevron separator flips in RTL so it always points along the reading direction. The trail
 * stays on one line (the current page's name is truncated) so a late-loading font can never
 * make it wrap and push the page down.
 */
export function Breadcrumbs({ items, label }: { items: readonly Crumb[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="flex items-center gap-x-1 text-sm text-ink-500">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <li aria-hidden className="grid shrink-0 place-items-center">
                <ChevronRight className="size-4 rtl:-scale-x-100" />
              </li>
            ) : null}
            <li className={item.href ? 'shrink-0' : 'min-w-0'}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="-mx-1.5 inline-flex min-h-11 items-center px-1.5 underline-offset-4 hover:text-ink-900 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="flex min-h-11 items-center text-ink-900">
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
