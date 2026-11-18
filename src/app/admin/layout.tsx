import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SITE } from '@/config/site';

export const metadata: Metadata = {
  title: { default: 'Administration', template: `%s | Administration ${SITE.name}` },
  robots: { index: false, follow: false },
};

/** Gabarit de l'administration : distinct de la boutique (pas de panier ni de menu client). */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-petal bg-white">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
            <Image src={SITE.logo} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full" />
            <span className="truncate font-serif text-lg text-ink">
              {SITE.name} <span className="text-sm text-plum">· Administration</span>
            </span>
          </Link>
          <Link href="/" className="shrink-0 text-sm text-plum hover:underline hover:underline-offset-4">
            Voir la boutique
          </Link>
        </div>
      </header>
      <main id="contenu" className="flex-1 bg-canvas">
        {children}
      </main>
    </>
  );
}
