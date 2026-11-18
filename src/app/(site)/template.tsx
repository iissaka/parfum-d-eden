import type { ReactNode } from 'react';

/** Transition douce à chaque changement de page (le gabarit est remonté à chaque navigation). */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
