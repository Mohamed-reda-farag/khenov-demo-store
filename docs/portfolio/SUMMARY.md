# Project summary

**Label: Demo.** ATHAR is a fictional store built by KHENOV to show its work. It is not a client project, and it makes no claim
about sales, users or results.

## One-line card text

- **AR:** «أثر»: متجر أحذية خيالي بلغتين (عربي RTL وإنجليزي) يعرض رحلة تسوّق كاملة من التصفح إلى الطلب. عرض تجريبي من KHENOV.
- **EN:** ATHAR: a fictional bilingual (Arabic RTL and English) shoe store showing a complete shopping journey, from browsing to order. A demo by KHENOV.

## Tags

`E-commerce` · `Next.js` · `Arabic / RTL` · `Accessibility` (in Arabic: تجارة إلكترونية · Next.js · عربي RTL · إتاحة)

## English

**Goal.** Show how a modern online shop for the Egyptian market can feel when it is fast, fully bilingual and accessible, without
a backend that a visitor has to trust or wait for.

**Solution.** A complete storefront for a fictional footwear brand, built as a static site. The shopper can browse and filter
products, see real photos per colour, check stock by size, use a cart with promo codes and free-shipping rules, go through checkout
with Egyptian addresses and cash-on-delivery or a simulated card, and follow an order through its stages. All of it works offline
from the server's point of view: data is a fictional catalogue and the shopper's own choices are kept in their browser.

**Key features**

- Arabic first with full right-to-left layout, Arabic plurals and digits, and an English version with one click.
- Product pages with a gallery, zoom, colour swatches that only offer colours that have photos, size and stock hints.
- Cart, promo codes, shipping rules and a checkout with clear error handling.
- Order timeline, saved addresses, wishlist and search with recent searches.
- Every screen has loading, empty, error and success states, which you can trigger with `?demo=error`.
- Help pages (shipping, returns, size guide, contact and FAQ, privacy) and a localized 404.
- Keyboard-friendly, axe-checked page structure, reduced-motion support, 44 px touch targets.
- Fast: pages carry their real content in the HTML; mobile Lighthouse performance 89–99 in lab tests on a local server.

**Technologies.** Next.js (App Router, static export), React, TypeScript (strict), Tailwind CSS with design tokens, next-intl,
Zustand, Zod, Vitest, hosted as static files.

**Honest notes.** The store, its products, prices, reviews and orders are invented. Nothing is sold, no payment is processed and
nothing the visitor types leaves their browser. Photos come from Unsplash and Pexels and are credited in the repository.

## بالعربية

**الهدف.** إظهار كيف يمكن أن يبدو متجر إلكتروني حديث للسوق المصري: سريع، بلغتين كاملتين، وسهل الاستخدام للجميع، من غير خادم
يضطر الزائر إلى انتظاره أو الوثوق به.

**الحل.** واجهة متجر كاملة لعلامة أحذية خيالية، مبنية كموقع ثابت. يستطيع الزائر تصفح المنتجات وتصفيتها، ورؤية صور حقيقية لكل لون،
ومعرفة المتاح من كل مقاس، واستخدام سلة بأكواد خصم وقواعد شحن مجاني، وإتمام طلب بعناوين مصرية وبالدفع عند الاستلام أو ببطاقة
محاكاة، ومتابعة الطلب عبر مراحله. البيانات كتالوج خيالي، وما يختاره الزائر يُحفظ في متصفحه فقط.

**أهم المزايا**

- العربية أولًا بتخطيط RTL كامل وأرقام وجموع عربية، ونسخة إنجليزية بضغطة واحدة.
- صفحة منتج بمعرض صور وتكبير وألوان لا تُعرض منها إلا الألوان التي لها صور، وإشارات للمقاس والمخزون.
- سلة وأكواد خصم وقواعد شحن، وإتمام طلب بمعالجة واضحة للأخطاء.
- جدول زمني للطلب، وعناوين محفوظة، ومفضلة، وبحث مع آخر عمليات البحث.
- لكل شاشة حالات التحميل والفراغ والخطأ والنجاح، ويمكن إظهار الخطأ بـ `?demo=error`.
- صفحات مساعدة (الشحن، الاسترجاع، دليل المقاسات، التواصل والأسئلة، الخصوصية) وصفحة 404 بلغة الزائر.
- تصفح بلوحة المفاتيح، وبنية صفحات اجتازت فحص axe، ودعم تقليل الحركة، وأهداف لمس بحجم ٤٤ بكسل.
- سريع: الصفحات تحمل محتواها الحقيقي في الـ HTML، وأداء Lighthouse للموبايل بين ٨٩ و٩٩ في اختبار معملي على خادم محلي.

**التقنيات.** Next.js (App Router وتصدير ثابت) وReact وTypeScript (strict) وTailwind بنظام tokens وnext-intl وZustand وZod وVitest،
ويُستضاف كملفات ثابتة.

**ملاحظات صريحة.** المتجر ومنتجاته وأسعاره وتقييماته وطلباته مُختلقة. لا يُباع شيء، ولا يتم أي دفع، ولا يغادر ما يكتبه الزائر
متصفحه. الصور من Unsplash وPexels ومصادرها مسجلة في المستودع.
