'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, MenuIcon } from '@/components/ui/Icons';
import { Ornament } from '@/components/ui/Ornament';

type NavItem = { href: string; label: string };

/** Menu mobile plein écran : se ferme à la navigation, avec Échap, et bloque le défilement de la page. */
export function MobileMenu({ items, secondary }: { items: NavItem[]; secondary: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Le panneau est rendu dans <body> : le flou du header (backdrop-filter) casserait le position: fixed.
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="icon-btn -mr-2"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Ouvrir le menu"
        onClick={() => setOpen(true)}
      >
        <MenuIcon width={22} height={22} />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-white [animation-duration:350ms]"
          >
            <div className="flex h-16 items-center justify-between border-b border-petal px-4">
              <Link href="/" onClick={close} className="flex min-w-0 items-center gap-2.5" aria-label="Accueil">
                <Image src="/brand/logo.png" alt="" width={40} height={40} className="h-9 w-9 shrink-0 rounded-full ring-1 ring-petal" />
                <span className="flex flex-col font-serif leading-none text-ink">
                  <span className="text-[0.7rem] uppercase tracking-[0.2em]">Le Parfum</span>
                  <span className="text-xl italic">d’Eden</span>
                </span>
              </Link>
              <button type="button" className="icon-btn" aria-label="Fermer le menu" onClick={close}>
                <CloseIcon width={24} height={24} />
              </button>
            </div>

            <nav aria-label="Navigation mobile" className="flex flex-1 flex-col overflow-y-auto px-8 pb-10 pt-8">
              <ul className="text-center">
                {items.map((item, i) => (
                  <li key={item.href} className="animate-fade-up" style={{ animationDelay: `${80 + i * 70}ms` }}>
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={pathname === item.href ? 'page' : undefined}
                      className="block py-3 font-serif text-3xl leading-tight text-ink transition hover:text-plum aria-[current=page]:text-plum"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <Ornament className="mx-auto my-8 w-full max-w-xs animate-fade-in [animation-delay:400ms]" />

              <p className="eyebrow animate-fade-up text-center text-plum [animation-delay:450ms]">Nos gammes &amp; services</p>
              <ul className="mx-auto mt-5 grid w-full max-w-sm grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {secondary.map((item, i) => (
                  <li key={item.href} className="animate-fade-up" style={{ animationDelay: `${500 + i * 35}ms` }}>
                    <Link href={item.href} onClick={close} className="text-ink-soft transition hover:text-ink hover:underline hover:decoration-mauve hover:underline-offset-4">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mt-auto pt-10 text-center font-serif text-xl italic text-ink/80">
                L’élégance à chaque fragrance.
              </p>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
