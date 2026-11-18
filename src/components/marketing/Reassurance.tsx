import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatPrice } from '@/lib/utils/money';
import type { ShopInfo } from '@/lib/catalog/shop-info';
import { PackageIcon, SparkleIcon, TruckIcon, WalletIcon } from '@/components/ui/Icons';

type Item = { icon: ReactNode; title: string; text: string; href: string };

/** Engagements affichés, construits à partir des données réelles de la boutique. */
export function reassuranceItems(info: ShopInfo): Item[] {
  return [
    {
      icon: <TruckIcon width={24} height={24} />,
      title: 'Livraison',
      text:
        info.zones.length > 0
          ? info.freeShipping
            ? `${info.zones.map((z) => z.name).join(', ')}. Offerte dès ${formatPrice(info.freeShipping.amount)} (${info.freeShipping.zoneName}).`
            : `${info.zones.map((z) => z.name).join(', ')}.`
          : 'Zones de livraison à confirmer.',
      href: '/livraison',
    },
    {
      icon: <WalletIcon width={24} height={24} />,
      title: 'Paiement',
      text: info.cashOnDelivery ? 'Vous payez à la réception de votre commande.' : 'Modes de paiement à confirmer.',
      href: '/faq',
    },
    {
      icon: <PackageIcon width={24} height={24} />,
      title: 'Suivi',
      text: 'Une référence unique pour suivre votre commande en ligne.',
      href: '/suivi-commande',
    },
    {
      icon: <SparkleIcon width={24} height={24} />,
      title: 'Conseil',
      text: 'Trois questions pour trouver le parfum qui vous ressemble.',
      href: '/trouver-mon-parfum',
    },
  ];
}

export function ReassuranceBar({ info }: { info: ShopInfo }) {
  return (
    <section aria-label="Nos engagements" className="border-b border-mauve/40 bg-white/40">
      <ul className="container-page grid grid-cols-2 lg:grid-cols-4">
        {reassuranceItems(info).map((item) => (
          <li key={item.title}>
            <Link href={item.href} className="group flex h-full items-start gap-3 px-1 py-6 md:px-4">
              <span className="mt-0.5 text-plum transition duration-300 group-hover:-translate-y-0.5">{item.icon}</span>
              <span>
                <span className="block font-serif text-lg italic text-ink group-hover:underline group-hover:decoration-mauve group-hover:underline-offset-4">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft md:text-sm">{item.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
