import { Layers, RotateCcw, Ruler, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

const VALUES = [
  { key: 'materials', Icon: Layers },
  { key: 'sizing', Icon: Ruler },
  { key: 'delivery', Icon: Truck },
  { key: 'returns', Icon: RotateCcw },
] as const;

/** Brand promises. Plain statements only: no statistics, awards or press logos. */
export function ValuesStrip() {
  const t = useTranslations('home');
  return (
    <section aria-labelledby="values-title">
      <h2 id="values-title" className="sr-only">
        {t('valuesTitle')}
      </h2>
      <ul className="grid gap-8 border-y border-sand-200 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(({ key, Icon }) => (
          <li key={key} className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sand-100">
              <Icon aria-hidden className="size-5" />
            </span>
            <div>
              <h3 className="font-display font-semibold">{t(`values.${key}.title`)}</h3>
              <p className="mt-1 text-sm text-ink-700">{t(`values.${key}.body`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
