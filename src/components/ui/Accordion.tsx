'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

/** Disclosure list. Opening is instant; only the chevron animates (transform). */
export function Accordion({
  items,
  defaultOpen = [],
}: {
  items: readonly AccordionItem[];
  defaultOpen?: readonly string[];
}) {
  const base = useId();
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set(defaultOpen));

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="divide-y divide-sand-200 border-y border-sand-200">
      {items.map((item) => {
        const expanded = open.has(item.id);
        const buttonId = `${base}-${item.id}-button`;
        const panelId = `${base}-${item.id}-panel`;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 text-start font-medium"
              >
                {item.title}
                <ChevronDown
                  aria-hidden
                  className={`size-5 shrink-0 transition-transform dur-base ease-brand ${
                    expanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!expanded}
              className="pb-5 text-sm text-ink-700"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
