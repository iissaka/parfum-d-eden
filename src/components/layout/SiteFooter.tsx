import Image from 'next/image';
import Link from 'next/link';
import { FOOTER_COLUMNS as COLUMNS } from '@/config/navigation';
import { SITE } from '@/config/site';
import { getEnabledPaymentMethods } from '@/lib/config';

export function SiteFooter() {
  const year = new Date().getFullYear();
  const cod = getEnabledPaymentMethods().length > 0;

  return (
    <footer className="on-dark bg-ink text-canvas">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src={SITE.logo} alt="" width={44} height={44} className="h-10 w-10 rounded-full" />
            <span className="font-serif text-lg uppercase tracking-[0.18em]">{SITE.name}</span>
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-canvas/85">
            Parfumerie en ligne.
            <span className="mt-1 block font-serif text-xl italic text-mauve">{SITE.tagline}</span>
          </p>
          <p className="mt-4 text-sm text-canvas/80">
            Coordonnées et réseaux officiels : <span className="italic">à renseigner</span>.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="eyebrow text-mauve">{col.title}</p>
            <ul className="mt-5 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-canvas/85 transition hover:text-mauve hover:underline hover:decoration-mauve hover:underline-offset-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-mauve/20">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-canvas/70 sm:flex-row sm:justify-between">
          <p>© {year} Le Parfum d’Eden. Tous droits réservés.</p>
          <p>Paiement proposé : {cod ? 'à la livraison' : 'à confirmer'} · Prix en euros et en FCFA (1 € = 655,957 FCFA)</p>
        </div>
      </div>
    </footer>
  );
}
