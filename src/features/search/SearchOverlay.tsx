'use client';

import { Clock, Search, Tag, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { IconButton } from '@/components/ui/IconButton';
import { Portal } from '@/components/ui/Portal';
import { useOverlayBehavior } from '@/components/ui/overlay';
import { galleryColorId } from '@/data/images';
import { catalogRepository, searchHistoryRepository } from '@/data/repository';
import { defaultColor } from '@/data/stock';
import { ProductImage } from '@/features/catalog/components/ProductImage';
import { Price } from '@/features/catalog/components/Price';
import { Link, useRouter } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';
import { moveActive, optionsForRecent, optionsForText, type SearchOption } from './search-options';

const SUGGESTION_LIMIT = 6;
const DEBOUNCE_MS = 200;

const rowClass =
  'flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-start text-sm';

/**
 * Full-width search panel opened from the header. A WAI-ARIA combobox: focus stays in the input
 * while Arrow keys move a highlighted row (`aria-activedescendant`), Enter opens it.
 */
export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const t = useTranslations('search');
  const format = useFormat();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = useId();
  const listId = useId();
  const [text, setText] = useState('');
  const [settledText, setSettledText] = useState('');
  const [active, setActive] = useState(-1);
  const [recentVersion, setRecentVersion] = useState(0);

  useOverlayBehavior(true, panelRef, onClose);

  const recent = useAsync(`recent:${recentVersion}`, () => searchHistoryRepository.list());
  const suggest = useAsync(`suggest:${settledText}`, () =>
    settledText ? catalogRepository.suggest(settledText, SUGGESTION_LIMIT) : Promise.resolve([]),
  );
  const categories = useAsync('search-categories', () => catalogRepository.listCategories());

  const term = text.trim();
  const recentTerms = recent.status === 'success' ? recent.data : [];
  const suggestions =
    suggest.status === 'success'
      ? suggest.data
      : suggest.status === 'loading'
        ? (suggest.previous ?? [])
        : [];
  const suggestFailed = suggest.status === 'error' && term !== '';
  const searching = term !== '' && (suggest.status === 'loading' || term !== settledText.trim());
  const options: SearchOption[] = term
    ? optionsForText(text, suggestFailed ? [] : suggestions)
    : optionsForRecent(recentTerms);
  const activeOption = options[active];
  const noMatches =
    term !== '' && !searching && !suggestFailed && options.every((o) => o.kind === 'all');

  const submit = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    void searchHistoryRepository.add(clean);
    onClose();
    router.push(`/search?q=${encodeURIComponent(clean)}`);
  };

  const open = (option: SearchOption) => {
    if (option.kind === 'recent' || option.kind === 'all') {
      submit(option.term);
      return;
    }
    onClose();
    router.push(
      option.kind === 'category'
        ? `/category/${option.category.id}`
        : `/product/${option.product.slug}`,
    );
  };

  const removeRecent = async (value: string) => {
    await searchHistoryRepository.remove(value);
    setRecentVersion((n) => n + 1);
    setActive(-1);
  };

  const onChange = (next: string) => {
    setText(next);
    setActive(-1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSettledText(next.trim()), DEBOUNCE_MS);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => moveActive(i, event.key === 'ArrowDown' ? 1 : -1, options.length));
    } else if (event.key === 'Enter' && activeOption) {
      event.preventDefault();
      open(activeOption);
    } else if (event.key === 'Delete' && activeOption?.kind === 'recent') {
      event.preventDefault();
      void removeRecent(activeOption.term);
    }
  };

  const statusText = searching
    ? t('searching')
    : term
      ? suggestFailed
        ? t('suggestionsFailed')
        : t('suggestionCount', {
            count: options.length - 1,
            countText: format.number(options.length - 1),
          })
      : '';

  return (
    <Portal>
      <div className="fixed inset-0 z-overlay">
        <div
          className="overlay-scrim absolute inset-0 bg-ink-900/50"
          data-open
          onClick={onClose}
          aria-hidden
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('dialogTitle')}
          tabIndex={-1}
          className="relative mx-auto flex max-h-[100dvh] w-full flex-col bg-paper shadow-overlay outline-none md:mt-4 md:max-h-[80dvh] md:max-w-2xl md:rounded-lg"
        >
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              submit(text);
            }}
            className="flex items-center gap-1 border-b border-sand-200 px-3 py-2"
          >
            <label htmlFor={inputId} className="sr-only">
              {t('inputLabel')}
            </label>
            <Search aria-hidden className="mx-2 size-5 shrink-0 text-ink-500" />
            <input
              id={inputId}
              data-autofocus
              type="search"
              role="combobox"
              aria-expanded={options.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={activeOption ? `${listId}-${activeOption.id}` : undefined}
              value={text}
              placeholder={t('placeholder')}
              autoComplete="off"
              enterKeyHint="search"
              maxLength={80}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={onKeyDown}
              className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {text ? (
              <IconButton
                label={t('clearInput')}
                onClick={() => {
                  onChange('');
                  setSettledText('');
                  document.getElementById(inputId)?.focus();
                }}
              >
                <X aria-hidden className="size-5" />
              </IconButton>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 shrink-0 rounded-pill px-3 text-sm font-medium hover:bg-sand-100"
            >
              {t('cancel')}
            </button>
          </form>

          <p role="status" aria-live="polite" className="sr-only">
            {statusText}
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {options.length > 0 ? (
              <>
                {!term ? (
                  <div className="flex items-center justify-between px-3 pt-1 pb-1">
                    <h2 className="text-xs font-semibold tracking-wide text-ink-500">
                      {t('recentHeading')}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        void searchHistoryRepository
                          .clear()
                          .then(() => setRecentVersion((n) => n + 1));
                      }}
                      className="min-h-11 px-2 text-xs font-medium text-accent-700 hover:underline"
                    >
                      {t('clearRecent')}
                    </button>
                  </div>
                ) : null}
                <ul
                  id={listId}
                  role="listbox"
                  aria-label={term ? t('suggestionsLabel') : t('recentHeading')}
                >
                  {options.map((option, index) => (
                    <li
                      key={option.id}
                      id={`${listId}-${option.id}`}
                      role="option"
                      aria-selected={index === active}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseMove={() => setActive(index)}
                      onClick={() => open(option)}
                      className={`${rowClass} ${index === active ? 'bg-sand-100' : ''}`}
                    >
                      <OptionRow option={option} onRemove={removeRecent} />
                    </li>
                  ))}
                </ul>
                {!term ? <p className="px-3 pt-2 text-xs text-ink-500">{t('deleteHint')}</p> : null}
              </>
            ) : null}

            {noMatches || (!term && options.length === 0) || suggestFailed ? (
              <div className="px-3 py-4">
                <p className="text-sm text-ink-700">
                  {suggestFailed
                    ? t('suggestionsFailed')
                    : term
                      ? t('noSuggestions', { term })
                      : t('recentEmpty')}
                </p>
              </div>
            ) : null}

            {!term || noMatches ? (
              <div className="px-3 pb-3">
                <h2 className="pt-2 pb-1 text-xs font-semibold tracking-wide text-ink-500">
                  {noMatches ? t('tryCategories') : t('browseCategories')}
                </h2>
                {categories.status === 'success' ? (
                  <ul className="flex flex-wrap gap-2">
                    {categories.data.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/category/${category.id}`}
                          onClick={onClose}
                          className="inline-flex min-h-11 items-center rounded-pill border border-sand-300 px-4 text-sm hover:border-ink-900"
                        >
                          {format.text(category.name)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Portal>
  );
}

function OptionRow({
  option,
  onRemove,
}: {
  option: SearchOption;
  onRemove: (term: string) => Promise<void>;
}) {
  const t = useTranslations('search');
  const format = useFormat();

  if (option.kind === 'recent') {
    return (
      <>
        <Clock aria-hidden className="size-5 shrink-0 text-ink-500" />
        <span className="min-w-0 flex-1 truncate">{option.term}</span>
        {/* Mouse and touch only: the input keeps focus, and keyboard users press Delete. */}
        <button
          type="button"
          tabIndex={-1}
          aria-label={t('removeRecent', { term: option.term })}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            void onRemove(option.term);
          }}
          className="-my-1 -me-2 grid size-11 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-sand-200 hover:text-ink-900"
        >
          <X aria-hidden className="size-4" />
        </button>
      </>
    );
  }
  if (option.kind === 'all') {
    return (
      <>
        <Search aria-hidden className="size-5 shrink-0 text-ink-500" />
        <span className="min-w-0 flex-1 truncate font-medium">
          {t('seeAll', { term: option.term })}
        </span>
      </>
    );
  }
  if (option.kind === 'category') {
    return (
      <>
        <Tag aria-hidden className="size-5 shrink-0 text-ink-500" />
        <span className="min-w-0 flex-1 truncate">{format.text(option.category.name)}</span>
        <span className="text-xs text-ink-500">{t('categoryTag')}</span>
      </>
    );
  }
  const { product } = option;
  const color = defaultColor(product);
  return (
    <>
      <span className="relative block aspect-[4/5] w-10 shrink-0 overflow-hidden rounded-sm bg-canvas">
        <ProductImage
          fill
          slug={product.slug}
          categoryId={product.categoryId}
          alt=""
          colorHex={color?.hex ?? '#8f8e89'}
          colorId={color ? galleryColorId(product, color.id) : undefined}
          sizes="40px"
        />
      </span>
      <span className="min-w-0 flex-1 truncate">{format.text(product.name)}</span>
      <Price amount={product.priceEGP} compareAt={product.compareAtPriceEGP} className="text-sm" />
    </>
  );
}
