/** The help pages, in the order they appear in the footer and in the side menu. */
export const HELP_PAGES = [
  { slug: 'shipping', href: '/help/shipping', titleKey: 'shipping' },
  { slug: 'returns', href: '/help/returns', titleKey: 'returns' },
  { slug: 'size-guide', href: '/help/size-guide', titleKey: 'sizeGuide' },
  { slug: 'contact', href: '/help/contact', titleKey: 'contact' },
  { slug: 'privacy', href: '/help/privacy', titleKey: 'privacy' },
] as const;

export type HelpSlug = (typeof HELP_PAGES)[number]['slug'];
