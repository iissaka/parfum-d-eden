'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import type { ProductSummary } from '@/lib/catalog/catalog';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { ProductCard } from '@/components/product/ProductCard';

/** Grille de produits filtrée par onglets (gammes). Les cartes sont déjà rendues : le filtre est instantané. */
export function ProductTabs({ items, lines, limit = 8 }: { items: ProductSummary[]; lines: string[]; limit?: number }) {
  const [active, setActive] = useState<string>('');
  const baseId = useId();
  const tabs = [{ key: '', label: 'Tous' }, ...lines.map((l) => ({ key: l, label: l }))];
  const visible = items.filter((s) => !active || s.product.family === active).slice(0, limit);
  const moreHref = active ? `/boutique?famille=${encodeURIComponent(active)}` : '/boutique';

  return (
    <div>
      <div role="tablist" aria-label="Filtrer par gamme" className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key || 'tous'}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.key || 'tous'}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              onClick={() => setActive(tab.key)}
              className={`rounded-full px-5 py-2 text-xs font-medium uppercase tracking-[0.14em] transition duration-300 ${
                selected ? 'bg-plum text-white shadow-sm' : 'bg-white text-ink-soft ring-1 ring-petal hover:ring-plum'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
        {visible.map((s, i) => (
          <div key={`${active}-${s.product.id}`} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <ProductCard summary={s} />
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <Link href={moreHref} className="btn-primary group">
          Voir tout <span className="btn-arrow"><ArrowRightIcon width={14} height={14} /></span>
        </Link>
      </div>
    </div>
  );
}
