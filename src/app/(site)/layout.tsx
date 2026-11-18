import type { ReactNode } from 'react';
import { SiteShell } from '@/components/layout/SiteShell';

/** Gabarit de la boutique publique (groupe de routes « (site) », absent des URL). */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
