import type { ReactNode } from 'react';

/** A template remounts on every navigation, which replays this short enter animation. */
export default function LocaleTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
