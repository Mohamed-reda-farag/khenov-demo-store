'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

/** Search field that waits for a pause in typing before it changes the URL. */
export function SearchBox({
  value,
  onSearch,
}: {
  value: string;
  onSearch: (text: string) => void;
}) {
  const t = useTranslations('shop');
  const id = useId();
  const [text, setText] = useState(value);
  const lastPushed = useRef(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  // Follow the URL when it changes from elsewhere (clear all, a chip, the back button).
  useEffect(() => {
    if (value !== lastPushed.current) {
      lastPushed.current = value;
      setText(value);
    }
  }, [value]);

  const push = (next: string) => {
    if (timer.current) clearTimeout(timer.current);
    const clean = next.trim();
    if (clean === lastPushed.current) return;
    lastPushed.current = clean;
    onSearchRef.current(clean);
  };

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        push(text);
      }}
      className="relative"
    >
      <label htmlFor={id} className="sr-only">
        {t('searchLabel')}
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-ink-500"
      />
      <input
        id={id}
        type="search"
        value={text}
        placeholder={t('searchPlaceholder')}
        autoComplete="off"
        enterKeyHint="search"
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => push(next), 350);
        }}
        className="h-12 w-full rounded-pill border border-sand-300 bg-paper ps-12 pe-12 text-base [&::-webkit-search-cancel-button]:hidden"
      />
      {text ? (
        <button
          type="button"
          aria-label={t('clearSearch')}
          onClick={() => {
            setText('');
            push('');
          }}
          className="absolute end-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full hover:bg-sand-100"
        >
          <X aria-hidden className="size-5" />
        </button>
      ) : null}
    </form>
  );
}
