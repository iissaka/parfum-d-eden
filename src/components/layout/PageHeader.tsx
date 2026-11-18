import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRightIcon } from '@/components/ui/Icons';
import { Ornament } from '@/components/ui/Ornament';

type Crumb = { href?: string; label: string };

const TONES = {
  satin: 'satin border-b border-mauve/40',
  sand: 'paper bg-petal',
  rose: 'satin border-b border-mauve/40',
  ivory: 'paper bg-canvas',
} as const;

/** En-tête de page commun : fil d'Ariane, sur-titre, titre et introduction, sur une bande de couleur. */
export function PageHeader({
  title,
  eyebrow,
  intro,
  crumbs,
  tone = 'satin',
  center = false,
  children,
}: {
  title: string;
  eyebrow?: string;
  intro?: ReactNode;
  crumbs?: Crumb[];
  tone?: keyof typeof TONES;
  center?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className={TONES[tone]}>
      <div className={`container-page py-10 md:py-14 ${center ? 'text-center' : ''}`}>
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Fil d’Ariane" className={`mb-6 ${center ? 'flex justify-center' : ''}`}>
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-soft">
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRightIcon width={12} height={12} className="text-plum" />}
                  {c.href ? (
                    <Link href={c.href} className="link">{c.label}</Link>
                  ) : (
                    <span aria-current="page">{c.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow animate-fade-up text-plum">{eyebrow}</p>}
        <h1 className={`display mt-2 animate-fade-up italic [animation-delay:120ms] ${center ? 'mx-auto' : ''}`}>{title}</h1>
        <Ornament animated className={`mt-5 w-48 ${center ? 'mx-auto' : ''}`} />
        {intro && (
          <div className={`mt-4 max-w-2xl animate-fade-up text-base leading-relaxed [animation-delay:240ms] md:text-lg ${center ? 'mx-auto' : ''}`}>{intro}</div>
        )}
        {children && <div className="animate-fade-up [animation-delay:360ms]">{children}</div>}
      </div>
    </section>
  );
}
