import type { Banner, Category, Collection, ColorOption } from '../types';

export const COLORS = {
  white: { id: 'white', name: { ar: 'أبيض', en: 'White' }, hex: '#FFFFFF' },
  ivory: { id: 'ivory', name: { ar: 'عاجي', en: 'Ivory' }, hex: '#F1ECE2' },
  black: { id: 'black', name: { ar: 'أسود', en: 'Black' }, hex: '#1A1A1A' },
  sand: { id: 'sand', name: { ar: 'رملي', en: 'Sand' }, hex: '#CDB690' },
  beige: { id: 'beige', name: { ar: 'بيج', en: 'Beige' }, hex: '#A5947F' },
  brown: { id: 'brown', name: { ar: 'بني', en: 'Brown' }, hex: '#5A3A35' },
  olive: { id: 'olive', name: { ar: 'زيتي', en: 'Olive' }, hex: '#6B6E3C' },
  terracotta: { id: 'terracotta', name: { ar: 'طوبي', en: 'Terracotta' }, hex: '#B5532E' },
  navy: { id: 'navy', name: { ar: 'كحلي', en: 'Navy' }, hex: '#1F2C4A' },
  stone: { id: 'stone', name: { ar: 'رمادي حجري', en: 'Stone' }, hex: '#8F8E89' },
  tan: { id: 'tan', name: { ar: 'عسلي', en: 'Tan' }, hex: '#A86B32' },
  cobalt: { id: 'cobalt', name: { ar: 'أزرق كوبالت', en: 'Cobalt' }, hex: '#2D4FCB' },
} as const satisfies Record<string, ColorOption>;

export type ColorKey = keyof typeof COLORS;

export const CATEGORIES: readonly Category[] = [
  {
    id: 'sneakers',
    slug: 'sneakers',
    name: { ar: 'سنيكرز', en: 'Sneakers' },
    blurb: { ar: 'للمشي اليومي بأناقة هادئة', en: 'Everyday pairs with a quiet confidence' },
    coverSlug: 'nile-low',
  },
  {
    id: 'running',
    slug: 'running',
    name: { ar: 'جري', en: 'Running' },
    blurb: { ar: 'خفة وتثبيت لكل كيلومتر', en: 'Light, stable, built for every kilometre' },
    coverSlug: 'sprint-delta',
  },
  {
    id: 'boots',
    slug: 'boots',
    name: { ar: 'بوت', en: 'Boots' },
    blurb: { ar: 'جلد متين لأيام الشتاء', en: 'Hard-wearing leather for cooler days' },
    coverSlug: 'atlas-chelsea',
  },
  {
    id: 'sandals',
    slug: 'sandals',
    name: { ar: 'صنادل', en: 'Sandals' },
    blurb: { ar: 'راحة مفتوحة للشمس والبحر', en: 'Open comfort for sun and sea' },
    coverSlug: 'dahab-strap',
  },
  {
    id: 'classic',
    slug: 'classic',
    name: { ar: 'كلاسيك', en: 'Classics' },
    blurb: { ar: 'تفاصيل راقية للمكتب والمناسبات', en: 'Refined shapes for work and occasions' },
    coverSlug: 'zamalek-loafer',
  },
];

export const COLLECTIONS: readonly Collection[] = [
  {
    id: 'desert-light',
    slug: 'desert-light',
    name: { ar: 'ضوء الصحراء', en: 'Desert Light' },
    blurb: {
      ar: 'ألوان رملية وخامات دافئة مستوحاة من الغروب على الكثبان',
      en: 'Sandy tones and warm materials drawn from dusk over the dunes',
    },
  },
  {
    id: 'after-dark',
    slug: 'after-dark',
    name: { ar: 'بعد الغروب', en: 'After Dark' },
    blurb: {
      ar: 'قطع داكنة بخطوط حادة لليالي المدينة',
      en: 'Dark, sharp-lined pieces for city nights',
    },
  },
  {
    id: 'daily-classics',
    slug: 'daily-classics',
    name: { ar: 'كلاسيكيات اليوم', en: 'Daily Classics' },
    blurb: {
      ar: 'الأحذية التي ترافقك كل يوم دون تفكير',
      en: 'The pairs you reach for every day without thinking',
    },
  },
];

export const BANNERS: readonly Banner[] = [
  {
    id: 'hero-desert-light',
    kind: 'hero',
    title: { ar: 'ضوء الصحراء', en: 'Desert Light' },
    subtitle: {
      ar: 'مجموعة بألوان الرمل والعسل لأيام الشتاء المشمسة',
      en: 'A sand-and-honey collection for sunny winter days',
    },
    cta: { ar: 'اكتشف المجموعة', en: 'Explore the collection' },
    href: '/collection/desert-light',
    tone: 'sand',
    silhouette: 'sneaker',
    productSlug: 'dune-court',
  },
  {
    id: 'strip-shipping',
    kind: 'strip',
    title: {
      ar: 'شحن مجاني للطلبات فوق ٢٬٠٠٠ ج.م',
      en: 'Free shipping on orders over EGP 2,000',
    },
    subtitle: { ar: 'تجريبي', en: 'Demo' },
    cta: { ar: 'تسوّق الآن', en: 'Shop now' },
    href: '/shop',
    tone: 'ink',
    silhouette: 'sneaker',
  },
  {
    id: 'tile-first-order',
    kind: 'tile',
    title: { ar: 'خصم ١٠٪ على أول طلب', en: '10% off your first order' },
    subtitle: {
      ar: 'استخدم الكود ATHAR10 عند الدفع — كود تجريبي',
      en: 'Use code ATHAR10 at checkout — demo code',
    },
    cta: { ar: 'ابدأ التسوق', en: 'Start shopping' },
    href: '/shop',
    tone: 'blush',
    silhouette: 'loafer',
    productSlug: 'zamalek-loafer',
  },
  {
    id: 'tile-running',
    kind: 'tile',
    title: { ar: 'وصل حديثًا في الجري', en: 'New in running' },
    subtitle: {
      ar: 'ابدأ موسمك بحذاء أخف وأكثر ثباتًا',
      en: 'Start your season in something lighter and steadier',
    },
    cta: { ar: 'شاهد الجري', en: 'See running' },
    href: '/category/running?sort=newest',
    tone: 'mist',
    silhouette: 'runner',
    productSlug: 'sprint-delta',
  },
];
