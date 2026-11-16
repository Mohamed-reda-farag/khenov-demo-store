import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../globals.css';

export const metadata: Metadata = {
  title: 'ATHAR · أثر',
  icons: { icon: '/favicon.svg' },
};

/** Root layout for "/" only — the language redirect page. The real site lives under /[locale]. */
export default function EntryLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
