import type { LocaleText, Review } from '../types';
import { PRODUCTS } from './products';

/**
 * Fictional sample reviews. They are generic on purpose (no claims about a purchase),
 * written by nobody, and shown in the UI with a "sample" label.
 */

const NAMES: readonly LocaleText[] = [
  { ar: 'ليلى', en: 'Layla' },
  { ar: 'كريم', en: 'Karim' },
  { ar: 'سلمى', en: 'Salma' },
  { ar: 'يوسف', en: 'Youssef' },
  { ar: 'هالة', en: 'Hala' },
  { ar: 'عمر', en: 'Omar' },
  { ar: 'دينا', en: 'Dina' },
  { ar: 'مازن', en: 'Mazen' },
  { ar: 'رنا', en: 'Rana' },
  { ar: 'طارق', en: 'Tarek' },
];

interface Template {
  rating: number;
  title: LocaleText;
  body: LocaleText;
}

const TEMPLATES: readonly Template[] = [
  {
    rating: 5,
    title: { ar: 'مريح من أول يوم', en: 'Comfortable from day one' },
    body: {
      ar: 'لم أحتج إلى فترة تعوّد. المقاس مضبوط والخامة تبدو متينة، وأنوي طلب لون آخر.',
      en: 'No break-in period needed. The size is spot on and the materials feel solid. I plan to try another colour.',
    },
  },
  {
    rating: 5,
    title: { ar: 'تفاصيل نظيفة', en: 'Clean details' },
    body: {
      ar: 'الخياطة مرتبة والشكل أنيق على القدم. يناسب الملابس الرسمية والعادية.',
      en: 'Tidy stitching and a sharp shape on the foot. It works with both dressy and casual outfits.',
    },
  },
  {
    rating: 5,
    title: { ar: 'يستحق السعر', en: 'Worth the price' },
    body: {
      ar: 'الجودة أعلى مما توقعت بهذا السعر، وخفيف بما يكفي للمشي الطويل.',
      en: 'Better quality than I expected at this price, and light enough for long walks.',
    },
  },
  {
    rating: 4,
    title: { ar: 'اختيار موفق', en: 'A good pick' },
    body: {
      ar: 'شكله أجمل في الواقع. النعل متماسك، لكن أنصح بتجربة مقاس أكبر إن كانت قدمك عريضة.',
      en: 'Looks even better in person. The sole feels sturdy, though I would go up half a size with wide feet.',
    },
  },
  {
    rating: 4,
    title: { ar: 'يومي وعملي', en: 'Practical for every day' },
    body: {
      ar: 'ارتديته أسبوعًا كاملًا بلا أي إزعاج. التهوية جيدة والنعل لا ينزلق.',
      en: 'Wore them for a full week with no complaints. Breathes well and the sole grips.',
    },
  },
  {
    rating: 4,
    title: { ar: 'قريب من الكمال', en: 'Very close to perfect' },
    body: {
      ar: 'تصميم هادئ وخامة جميلة. أتمنى لو توفرت ألوان أكثر.',
      en: 'A calm design and lovely materials. I only wish there were more colours.',
    },
  },
  {
    rating: 4,
    title: { ar: 'راحة تدوم', en: 'Comfort that lasts' },
    body: {
      ar: 'بعد ساعات طويلة على قدميّ ما زال مريحًا. اللون كما في الصور تقريبًا.',
      en: 'Still comfortable after long hours on my feet. The colour is close to the photos.',
    },
  },
  {
    rating: 3,
    title: { ar: 'جيد مع ملاحظة', en: 'Good, with one note' },
    body: {
      ar: 'الجودة جيدة لكن المقاس أصغر قليلًا من المعتاد عندي. جرّب مقاسًا أكبر.',
      en: 'Good quality, but it runs a little small for me. Consider sizing up.',
    },
  },
];

const REFERENCE_DATE = Date.UTC(2026, 10, 16);
const DAY = 86_400_000;

function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function reviewsFor(productId: string, createdAt: string, index: number): Review[] {
  const created = Date.parse(`${createdAt}T00:00:00Z`);
  return [0, 1, 2].map((k) => {
    const template = TEMPLATES[(index * 3 + k * 2 + (k === 2 ? 5 : 0)) % TEMPLATES.length];
    const author = NAMES[(index * 7 + k * 3) % NAMES.length];
    if (!template || !author) throw new Error('review seed tables are empty');
    const date = Math.min(created + (2 + k * 5) * DAY, REFERENCE_DATE - k * DAY);
    return {
      id: `${productId}-r${k + 1}`,
      productId,
      author,
      rating: template.rating,
      title: template.title,
      body: template.body,
      date: isoDate(Math.max(created, date)),
    };
  });
}

export const REVIEWS: readonly Review[] = PRODUCTS.flatMap((p, index) =>
  reviewsFor(p.id, p.createdAt, index),
);
