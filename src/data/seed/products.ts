import { hasPhotos, IMAGE_MANIFEST, type PhotoManifest } from '../images';
import type { LocaleText, Product, ProductColor, SizeStock } from '../types';
import { COLORS, type ColorKey } from './catalog-meta';

/* ---------- deterministic stock generation (same result on every build) ---------- */

type StockProfile = 'normal' | 'scarce' | 'soldout';

function lcg(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function buildSizes(
  range: readonly [number, number],
  seed: number,
  profile: StockProfile,
): SizeStock[] {
  const next = lcg(seed);
  const sizes: SizeStock[] = [];
  if (profile === 'soldout') {
    for (let size = range[0]; size <= range[1]; size += 1) sizes.push({ size, stock: 0 });
    return sizes;
  }
  for (let size = range[0]; size <= range[1]; size += 1) {
    const roll = next();
    let stock: number;
    if (profile === 'scarce') {
      stock = roll < 0.55 ? 0 : roll < 0.9 ? 1 + Math.floor(next() * 2) : 4;
    } else {
      stock =
        roll < 0.14 ? 0 : roll < 0.3 ? 1 + Math.floor(next() * 3) : 4 + Math.floor(next() * 11);
    }
    sizes.push({ size, stock });
  }
  if (sizes.every((s) => s.stock === 0)) {
    const middle = Math.floor(sizes.length / 2);
    sizes[middle] = { size: sizes[middle]?.size ?? range[0], stock: 3 };
  }
  return sizes;
}

const MATERIALS = {
  leather: { ar: 'جلد طبيعي · نعل مطاطي', en: 'Full-grain leather · rubber outsole' },
  suede: { ar: 'جلد سويد · نعل مطاطي', en: 'Suede leather · rubber outsole' },
  canvas: { ar: 'قماش قطني ثقيل · نعل مطاطي', en: 'Heavy cotton canvas · rubber outsole' },
  mesh: { ar: 'شبك هندسي خفيف · نعل رغوي', en: 'Engineered mesh · foam midsole' },
  trail: { ar: 'شبك مقوّى · نعل بنتوءات', en: 'Reinforced mesh · lugged outsole' },
  sandal: { ar: 'جلد ناعم · بطانة مبطنة', en: 'Soft leather · cushioned footbed' },
  cork: { ar: 'فلين طبيعي · أشرطة جلدية', en: 'Natural cork · leather straps' },
  slide: { ar: 'رغوة EVA مرنة · سطح محزز', en: 'Flexible EVA foam · textured footbed' },
  dress: { ar: 'جلد مصقول · نعل جلدي', en: 'Polished leather · leather sole' },
} as const satisfies Record<string, LocaleText>;

interface ProductInput {
  slug: string;
  name: LocaleText;
  categoryId: Product['categoryId'];
  collections: readonly string[];
  tagline: LocaleText;
  description: LocaleText;
  materials: LocaleText;
  price: number;
  compareAt?: number;
  colors: readonly ColorKey[];
  sizeRange: readonly [number, number];
  rating: number;
  reviews: number;
  isNew?: boolean;
  featured?: boolean;
  createdAt: string;
  /** Stock shape for every colour. 'soldout' empties the whole product. */
  profile?: StockProfile;
}

/**
 * Each colour gets its own deterministic stock. A colour is sold only when it has photos
 * (see data/images.ts); every other colour is sold out until photos exist for it.
 */
function buildColors(input: ProductInput, index: number, manifest: PhotoManifest): ProductColor[] {
  return input.colors.map((key, colorIndex) => {
    const soldOut = input.profile === 'soldout' || !hasPhotos(input.slug, key, manifest);
    const profile: StockProfile = soldOut ? 'soldout' : (input.profile ?? 'normal');
    return {
      ...COLORS[key],
      sizes: buildSizes(input.sizeRange, 7919 * (index + 3) + colorIndex * 104729, profile),
    };
  });
}

function product(input: ProductInput, index: number, manifest: PhotoManifest): Product {
  const number = String(index + 1).padStart(3, '0');
  return {
    id: `p${number}`,
    slug: input.slug,
    sku: `ATR-${number}`,
    name: input.name,
    categoryId: input.categoryId,
    collectionIds: input.collections,
    tagline: input.tagline,
    description: input.description,
    materials: input.materials,
    priceEGP: input.price,
    ...(input.compareAt ? { compareAtPriceEGP: input.compareAt } : {}),
    colors: buildColors(input, index, manifest),
    rating: input.rating,
    reviewCount: input.reviews,
    isNew: input.isNew ?? false,
    isFeatured: input.featured ?? false,
    createdAt: input.createdAt,
  };
}

const INPUTS: readonly ProductInput[] = [
  /* ---------------- Sneakers ---------------- */
  {
    slug: 'nile-low',
    name: { ar: 'نيل لو', en: 'Nile Low' },
    categoryId: 'sneakers',
    collections: ['daily-classics'],
    tagline: { ar: 'الأبيض الذي يناسب كل شيء', en: 'The white pair that goes with everything' },
    description: {
      ar: 'سنيكرز منخفض بخطوط نظيفة وجلد ناعم يزداد جمالًا مع الاستخدام، ونعل مرن يناسب المشي طوال اليوم.',
      en: 'A low-top with clean lines and soft leather that looks better with wear, on a flexible sole made for all-day walking.',
    },
    materials: MATERIALS.leather,
    price: 1850,
    colors: ['white', 'ivory', 'sand'],
    sizeRange: [38, 46],
    rating: 4.6,
    reviews: 212,
    isNew: true,
    featured: true,
    createdAt: '2026-11-04',
  },
  {
    slug: 'dune-court',
    name: { ar: 'دون كورت', en: 'Dune Court' },
    categoryId: 'sneakers',
    collections: ['desert-light'],
    tagline: { ar: 'روح الملاعب بلمسة رملية', en: 'Court spirit in a sandy palette' },
    description: {
      ar: 'تصميم مستوحى من أحذية الملاعب القديمة بألوان الرمل، مع نعل مطاطي يمنحك ثباتًا على الأرصفة المبتلة.',
      en: 'A vintage court silhouette in desert tones, with a rubber sole that keeps its grip on wet pavements.',
    },
    materials: MATERIALS.suede,
    price: 2150,
    colors: ['sand', 'black', 'ivory'],
    sizeRange: [38, 46],
    rating: 4.7,
    reviews: 148,
    featured: true,
    createdAt: '2026-08-19',
  },
  {
    slug: 'corniche-hi',
    name: { ar: 'كورنيش هاي', en: 'Corniche Hi' },
    categoryId: 'sneakers',
    collections: ['after-dark'],
    tagline: { ar: 'رقبة عالية لنزهات الليل', en: 'A high top for night walks' },
    description: {
      ar: 'سنيكرز عالي الرقبة يثبّت الكاحل ويمنح إطلالتك حضورًا قويًا، بسحاب جانبي لسهولة الارتداء.',
      en: 'A high-top that supports the ankle and gives any outfit presence, with a side zip for easy on and off.',
    },
    materials: MATERIALS.leather,
    price: 2450,
    colors: ['black', 'ivory', 'navy'],
    sizeRange: [39, 46],
    rating: 4.5,
    reviews: 96,
    createdAt: '2026-06-02',
  },
  {
    slug: 'souk-canvas',
    name: { ar: 'سوق كانفاس', en: 'Souk Canvas' },
    categoryId: 'sneakers',
    collections: ['daily-classics'],
    tagline: { ar: 'خفيف، ملوّن، ولا يحتاج تعريفًا', en: 'Light, colourful, needs no introduction' },
    description: {
      ar: 'حذاء قماشي بخامة قطنية ثقيلة وألوان ترابية، يتحمل الاستخدام اليومي ويسهل غسله.',
      en: 'A canvas shoe in heavy cotton and earthy colours that takes daily use and washes easily.',
    },
    materials: MATERIALS.canvas,
    price: 1450,
    colors: ['navy', 'terracotta', 'ivory'],
    sizeRange: [36, 45],
    rating: 4.3,
    reviews: 301,
    createdAt: '2026-03-14',
  },
  {
    slug: 'oasis-leather',
    name: { ar: 'واحة ليذر', en: 'Oasis Leather' },
    categoryId: 'sneakers',
    collections: ['desert-light'],
    tagline: { ar: 'أرقى ما في مجموعتنا من السنيكرز', en: 'Our most refined sneaker' },
    description: {
      ar: 'جلد كامل الحبة ببطانة جلدية وخياطة يدوية دقيقة، حذاء واحد يصلح للمكتب وللسهرة.',
      en: 'Full-grain leather with a leather lining and precise hand stitching: one pair for the office and the evening.',
    },
    materials: MATERIALS.leather,
    price: 3200,
    compareAt: 3600,
    colors: ['ivory', 'olive', 'black'],
    sizeRange: [39, 46],
    rating: 4.8,
    reviews: 87,
    featured: true,
    createdAt: '2026-05-21',
  },
  {
    slug: 'maadi-retro',
    name: { ar: 'المعادي ريترو', en: 'Maadi Retro' },
    categoryId: 'sneakers',
    collections: ['daily-classics'],
    tagline: { ar: 'نكهة السبعينات بدرجات هادئة', en: 'Seventies flavour in quiet shades' },
    description: {
      ar: 'تصميم ريترو بحواف متباينة ونعل مائل قليلًا، يعطي إطلالتك البسيطة طابعًا مميزًا.',
      en: 'A retro profile with contrast edges and a slightly wedged sole that gives simple outfits a character of their own.',
    },
    materials: MATERIALS.suede,
    price: 2050,
    colors: ['terracotta', 'cobalt', 'navy'],
    sizeRange: [37, 45],
    rating: 4.4,
    reviews: 64,
    isNew: true,
    createdAt: '2026-10-27',
  },

  /* ---------------- Running ---------------- */
  {
    slug: 'sprint-delta',
    name: { ar: 'سبرنت دلتا', en: 'Delta Sprint' },
    categoryId: 'running',
    collections: ['after-dark'],
    tagline: { ar: 'سرعة بلا ثقل', en: 'Speed without the weight' },
    description: {
      ar: 'حذاء جري سريع بنعل رغوي مرتد ومقدمة مرنة، مصمم للسباقات القصيرة والتمارين السريعة.',
      en: 'A fast runner with a responsive foam midsole and a flexible forefoot, made for short races and quick sessions.',
    },
    materials: MATERIALS.mesh,
    price: 3450,
    colors: ['black', 'cobalt', 'ivory'],
    sizeRange: [38, 46],
    rating: 4.7,
    reviews: 176,
    isNew: true,
    featured: true,
    createdAt: '2026-11-09',
  },
  {
    slug: 'cairo-tempo',
    name: { ar: 'تمبو القاهرة', en: 'Cairo Tempo' },
    categoryId: 'running',
    collections: [],
    tagline: { ar: 'رفيق التمارين اليومية', en: 'Your everyday training partner' },
    description: {
      ar: 'حذاء تدريب متوازن يجمع بين التهوية والتثبيت، مناسب للمسافات المتوسطة على الأسفلت.',
      en: 'A balanced trainer with airy mesh and steady support, suited to mid-distance road runs.',
    },
    materials: MATERIALS.mesh,
    price: 2750,
    colors: ['stone', 'terracotta'],
    sizeRange: [38, 46],
    rating: 4.5,
    reviews: 132,
    createdAt: '2026-04-11',
  },
  {
    slug: 'nile-trail',
    name: { ar: 'ترايل النيل', en: 'Nile Trail' },
    categoryId: 'running',
    collections: ['desert-light'],
    tagline: { ar: 'للدروب الترابية والرمال المتماسكة', en: 'For dirt paths and packed sand' },
    description: {
      ar: 'نعل ببروزات عميقة وحماية للمقدمة وبطانة سريعة الجفاف، لجري آمن خارج الأسفلت.',
      en: 'A deep-lugged outsole, a protected toe and a quick-dry lining for confident running off the tarmac.',
    },
    materials: MATERIALS.trail,
    price: 3150,
    colors: ['olive', 'black', 'navy'],
    sizeRange: [39, 46],
    rating: 4.6,
    reviews: 59,
    createdAt: '2026-07-08',
  },
  {
    slug: 'pace-light',
    name: { ar: 'بيس لايت', en: 'Pace Light' },
    categoryId: 'running',
    collections: [],
    tagline: { ar: 'البداية المثالية للمبتدئين', en: 'The ideal first running shoe' },
    description: {
      ar: 'خفيف الوزن وسهل الارتداء مع توسيد مريح، اختيار ممتاز لمن يبدأ رحلته مع الجري.',
      en: 'Lightweight and easy to wear with comfortable cushioning, a great choice for anyone starting out.',
    },
    materials: MATERIALS.mesh,
    price: 1950,
    compareAt: 2400,
    colors: ['ivory', 'cobalt'],
    sizeRange: [37, 45],
    rating: 4.2,
    reviews: 240,
    createdAt: '2026-02-23',
  },
  {
    slug: 'marathon-pro',
    name: { ar: 'ماراثون برو', en: 'Marathon Pro' },
    categoryId: 'running',
    collections: ['after-dark'],
    tagline: { ar: 'مصمم للمسافات الطويلة', en: 'Built for the long haul' },
    description: {
      ar: 'توسيد سميك وصفيحة تدفع للأمام لتقليل الإجهاد في الكيلومترات الأخيرة. الكمية محدودة.',
      en: 'Thick cushioning and a forward-driving plate to reduce fatigue in the final kilometres. Limited quantities.',
    },
    materials: MATERIALS.mesh,
    price: 3900,
    colors: ['black', 'terracotta', 'cobalt'],
    sizeRange: [39, 46],
    rating: 4.9,
    reviews: 41,
    isNew: true,
    featured: true,
    createdAt: '2026-11-12',
    profile: 'scarce',
  },

  /* ---------------- Boots ---------------- */
  {
    slug: 'siwa-chukka',
    name: { ar: 'سيوة تشوكا', en: 'Siwa Chukka' },
    categoryId: 'boots',
    collections: ['desert-light'],
    tagline: { ar: 'بوت قصير بروح الصحراء', en: 'An ankle boot with desert soul' },
    description: {
      ar: 'جلد سويد ناعم وربط بسيط بنعل كريب مريح، يناسب الجينز والقطن على حد سواء.',
      en: 'Soft suede with simple lacing on a comfortable crepe sole, equally at home with denim or chinos.',
    },
    materials: MATERIALS.suede,
    price: 3250,
    colors: ['tan', 'black', 'beige'],
    sizeRange: [39, 46],
    rating: 4.6,
    reviews: 73,
    createdAt: '2026-09-15',
  },
  {
    slug: 'atlas-chelsea',
    name: { ar: 'أطلس تشيلسي', en: 'Atlas Chelsea' },
    categoryId: 'boots',
    collections: ['after-dark'],
    tagline: { ar: 'خط واحد نظيف وحضور كامل', en: 'One clean line, full presence' },
    description: {
      ar: 'بوت تشيلسي بجانبين مطاطيين مرنين وجلد مصقول، يُلبس بسهولة ويبقى أنيقًا في أي مناسبة.',
      en: 'A Chelsea boot with elastic side panels and polished leather that slips on easily and stays sharp anywhere.',
    },
    materials: MATERIALS.dress,
    price: 3800,
    colors: ['black', 'tan'],
    sizeRange: [39, 46],
    rating: 4.8,
    reviews: 58,
    featured: true,
    createdAt: '2026-09-02',
  },
  {
    slug: 'sinai-hiker',
    name: { ar: 'سيناء هايكر', en: 'Sinai Hiker' },
    categoryId: 'boots',
    collections: ['desert-light'],
    tagline: { ar: 'لرحلات الجبال والمسارات الوعرة', en: 'For mountain trips and rough trails' },
    description: {
      ar: 'بوت رحلات بنعل عميق التشبث وحماية للكاحل، مقاوم للرذاذ ومصمم للمشي لساعات. الكمية محدودة.',
      en: 'A hiking boot with a deep-grip sole and ankle protection, splash-resistant and made for hours on foot. Limited quantities.',
    },
    materials: MATERIALS.trail,
    price: 4600,
    colors: ['olive', 'tan', 'black'],
    sizeRange: [40, 46],
    rating: 4.7,
    reviews: 36,
    isNew: true,
    createdAt: '2026-10-30',
    profile: 'scarce',
  },
  {
    slug: 'alex-work',
    name: { ar: 'إسكندرية ورك', en: 'Alex Work' },
    categoryId: 'boots',
    collections: ['daily-classics'],
    tagline: { ar: 'متين كما ينبغي للعمل', en: 'Tough, the way work boots should be' },
    description: {
      ar: 'بوت عمل بخياطة مضاعفة ونعل مقاوم للانزلاق، يتحمل الاستخدام الشاق يومًا بعد يوم.',
      en: 'A work boot with double stitching and a slip-resistant sole that handles hard use day after day.',
    },
    materials: MATERIALS.leather,
    price: 2650,
    compareAt: 3100,
    colors: ['tan', 'brown', 'black'],
    sizeRange: [40, 46],
    rating: 4.3,
    reviews: 112,
    createdAt: '2026-01-30',
  },

  /* ---------------- Sandals ---------------- */
  {
    slug: 'sahel-slide',
    name: { ar: 'ساحل سلايد', en: 'Sahel Slide' },
    categoryId: 'sandals',
    collections: ['daily-classics'],
    tagline: { ar: 'اخلعه وارتديه بلا تفكير', en: 'Slip on, no thinking required' },
    description: {
      ar: 'شبشب من رغوة خفيفة بسطح محزز لا ينزلق، مثالي للشاطئ والمسبح والمنزل.',
      en: 'A lightweight foam slide with a textured, grippy footbed, ideal for the beach, the pool and home.',
    },
    materials: MATERIALS.slide,
    price: 750,
    colors: ['sand', 'black', 'ivory'],
    sizeRange: [36, 45],
    rating: 4.4,
    reviews: 388,
    featured: true,
    createdAt: '2026-04-28',
  },
  {
    slug: 'dahab-strap',
    name: { ar: 'دهب ستراب', en: 'Dahab Strap' },
    categoryId: 'sandals',
    collections: ['desert-light'],
    tagline: { ar: 'شرائط قابلة للتعديل لثبات كامل', en: 'Adjustable straps for a secure fit' },
    description: {
      ar: 'صندل بثلاثة أشرطة قابلة للتعديل وبطانة مبطنة، يرافقك في المشي الطويل صيفًا.',
      en: 'A sandal with three adjustable straps and a cushioned footbed that keeps up on long summer walks.',
    },
    materials: MATERIALS.sandal,
    price: 1250,
    colors: ['tan', 'cobalt', 'black'],
    sizeRange: [36, 45],
    rating: 4.5,
    reviews: 154,
    isNew: true,
    createdAt: '2026-10-18',
  },
  {
    slug: 'luxor-leather',
    name: { ar: 'الأقصر ليذر', en: 'Luxor Leather' },
    categoryId: 'sandals',
    collections: [],
    tagline: { ar: 'جلد ناعم بتصميم مفتوح', en: 'Soft leather, open design' },
    description: {
      ar: 'صندل جلدي بإبزيم معدني وقاعدة تتشكل مع قدمك مع الوقت لراحة تزداد يومًا بعد يوم.',
      en: 'A leather sandal with a metal buckle and a footbed that moulds to your foot for comfort that grows over time.',
    },
    materials: MATERIALS.sandal,
    price: 1650,
    colors: ['tan', 'black', 'olive'],
    sizeRange: [36, 45],
    rating: 4.6,
    reviews: 92,
    createdAt: '2026-05-09',
  },
  {
    slug: 'marsa-cork',
    name: { ar: 'مرسى كورك', en: 'Marsa Cork' },
    categoryId: 'sandals',
    collections: ['desert-light'],
    tagline: { ar: 'فلين طبيعي خفيف', en: 'Light, natural cork' },
    description: {
      ar: 'قاعدة من الفلين الطبيعي تدعم القوس وتمتص الصدمات، بأشرطة جلدية ناعمة.',
      en: 'A natural cork footbed that supports the arch and absorbs impact, with soft leather straps.',
    },
    materials: MATERIALS.cork,
    price: 1100,
    compareAt: 1350,
    colors: ['sand', 'olive', 'beige'],
    sizeRange: [36, 44],
    rating: 4.2,
    reviews: 131,
    createdAt: '2026-03-30',
  },

  /* ---------------- Classics ---------------- */
  {
    slug: 'zamalek-loafer',
    name: { ar: 'زمالك لوفر', en: 'Zamalek Loafer' },
    categoryId: 'classic',
    collections: ['daily-classics'],
    tagline: { ar: 'اللوفر الذي يصلح كل يوم', en: 'The loafer for every day' },
    description: {
      ar: 'لوفر جلدي بقالب مريح من أول يوم وبطانة ناعمة، يرتقي بإطلالة العمل والعطلة.',
      en: 'A leather loafer on a last that is comfortable from day one, with a soft lining that lifts both workwear and weekends.',
    },
    materials: MATERIALS.dress,
    price: 2850,
    colors: ['black', 'tan', 'brown'],
    sizeRange: [39, 46],
    rating: 4.7,
    reviews: 121,
    featured: true,
    createdAt: '2026-07-22',
  },
  {
    slug: 'khan-derby',
    name: { ar: 'خان ديربي', en: 'Khan Derby' },
    categoryId: 'classic',
    collections: ['after-dark'],
    tagline: { ar: 'ربط مفتوح وأناقة محسوبة', en: 'Open lacing, measured elegance' },
    description: {
      ar: 'حذاء ديربي بخياطة جودير ونعل جلدي قابل للتجديد، لمن يبحث عن قطعة تدوم لسنوات.',
      en: 'A derby with Goodyear-style construction and a resolable leather sole for anyone who wants a pair that lasts for years.',
    },
    materials: MATERIALS.dress,
    price: 3600,
    colors: ['black', 'tan', 'brown'],
    sizeRange: [40, 46],
    rating: 4.8,
    reviews: 49,
    createdAt: '2026-08-05',
  },
  {
    slug: 'giza-oxford',
    name: { ar: 'الجيزة أكسفورد', en: 'Giza Oxford' },
    categoryId: 'classic',
    collections: ['after-dark'],
    tagline: {
      ar: 'للمناسبات التي لا تقبل أنصاف الحلول',
      en: 'For occasions that allow no half measures',
    },
    description: {
      ar: 'أكسفورد كلاسيكي بمقدمة ناعمة ولمعان هادئ، يكمل البدلة الرسمية بلا مبالغة.',
      en: 'A classic Oxford with a smooth toe and a subtle shine that completes a formal suit without excess.',
    },
    materials: MATERIALS.dress,
    price: 3950,
    colors: ['black', 'tan', 'brown'],
    sizeRange: [40, 46],
    rating: 4.6,
    reviews: 33,
    isNew: true,
    createdAt: '2026-11-01',
  },
  {
    slug: 'heliopolis-penny',
    name: { ar: 'مصر الجديدة بيني', en: 'Heliopolis Penny' },
    categoryId: 'classic',
    collections: ['daily-classics'],
    tagline: { ar: 'تفصيل صغير يصنع الفرق', en: 'A small detail that makes the difference' },
    description: {
      ar: 'لوفر بيني بشريط مميز وجلد مدبوغ نباتيًا، يمنحك مظهرًا أنيقًا بلا تكلّف.',
      en: 'A penny loafer with its signature strap and vegetable-tanned leather for an effortless polished look.',
    },
    materials: MATERIALS.leather,
    price: 2350,
    colors: ['tan', 'black', 'brown'],
    sizeRange: [38, 45],
    rating: 4.4,
    reviews: 77,
    createdAt: '2026-06-18',
  },
  {
    slug: 'garden-city-mule',
    name: { ar: 'جاردن سيتي ميول', en: 'Garden City Mule' },
    categoryId: 'classic',
    collections: ['daily-classics'],
    tagline: { ar: 'مفتوح من الخلف ومريح من الأمام', en: 'Open at the back, easy at the front' },
    description: {
      ar: 'ميول جلدي بلا رباط ولا كعب مغلق، خيار سهل للأيام الدافئة والمواعيد السريعة.',
      en: 'A leather mule with no laces and no closed heel, an easy choice for warm days and quick errands.',
    },
    materials: MATERIALS.sandal,
    price: 2150,
    compareAt: 2600,
    colors: ['sand', 'black'],
    sizeRange: [36, 42],
    rating: 4.3,
    reviews: 58,
    createdAt: '2026-02-10',
    profile: 'soldout',
  },
];

/** The catalogue as the given photo manifest makes it (tests pass their own manifest). */
export const buildProducts = (manifest: PhotoManifest): Product[] =>
  INPUTS.map((input, index) => product(input, index, manifest));

export const PRODUCTS: readonly Product[] = buildProducts(IMAGE_MANIFEST);

/** Slug and colour ids per product, for the photo naming rules. */
export const PHOTO_PRODUCTS = INPUTS.map((input) => ({ slug: input.slug, colorIds: input.colors }));
