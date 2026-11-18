import Image from 'next/image';
import Link from 'next/link';
import { readCart } from '@/lib/cart/cart-cookie';
import { countCartItems } from '@/lib/domain/cart';
import { BagIcon, PackageIcon, SearchIcon } from '@/components/ui/Icons';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { MAIN_NAV, MOBILE_NAV, MOBILE_SECONDARY } from '@/config/navigation';
import { SITE } from '@/config/site';

export async function SiteHeader() {
  const count = countCartItems(await readCart());

  return (
    <header className="sticky top-0 z-40 border-b border-petal bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3 md:h-[4.5rem]">
        {/* Marque : peut rétrécir ; les actions, elles, ne rétrécissent jamais (le bouton menu reste visible). */}
        <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label="Le Parfum d’Eden, accueil">
          <Image
            src={SITE.logo}
            alt=""
            width={44}
            height={44}
            priority
            className="h-9 w-9 shrink-0 rounded-full ring-1 ring-petal transition duration-500 group-hover:rotate-6 md:h-10 md:w-10"
          />
          {/* Mobile : deux lignes compactes. À partir de sm : une ligne en capitales espacées. */}
          <span className="flex min-w-0 flex-col font-serif leading-none text-ink sm:hidden">
            <span className="text-[0.7rem] uppercase tracking-[0.2em]">Le Parfum</span>
            <span className="text-xl italic">d’Eden</span>
          </span>
          <span className="hidden truncate font-serif text-base uppercase tracking-[0.18em] text-ink sm:inline md:text-lg">
            Le Parfum d’Eden
          </span>
        </Link>

        {/* Navigation centrale */}
        <nav aria-label="Navigation principale" className="hidden items-center gap-5 lg:flex xl:gap-7">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative py-2 text-sm text-ink-soft transition after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-plum after:transition after:duration-300 hover:text-plum hover:after:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          <Link href="/recherche" className="icon-btn" aria-label="Rechercher">
            <SearchIcon width={20} height={20} />
          </Link>
          <Link href="/suivi-commande" className="icon-btn hidden sm:inline-flex" aria-label="Suivre ma commande">
            <PackageIcon width={20} height={20} />
          </Link>
          <Link href="/panier" className="icon-btn" aria-label={count > 0 ? `Panier, ${count} article(s)` : 'Panier vide'}>
            <BagIcon width={21} height={21} />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-5 min-w-[1.25rem] animate-scale-in items-center justify-center rounded-full bg-plum px-1 text-[0.65rem] font-medium text-white">
                {count}
              </span>
            )}
          </Link>
          <div className="lg:hidden">
            <MobileMenu items={MOBILE_NAV} secondary={MOBILE_SECONDARY} />
          </div>
        </div>
      </div>
    </header>
  );
}
