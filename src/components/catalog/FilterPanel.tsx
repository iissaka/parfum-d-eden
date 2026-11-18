'use client';

import { useId, useState, type ReactNode } from 'react';
import { FilterIcon } from '@/components/ui/Icons';

/** Filtres : repliables sur mobile, toujours visibles sur grand écran. Le contenu est rendu une seule fois. */
export function FilterPanel({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <button
        type="button"
        className="btn-secondary w-full lg:hidden"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <FilterIcon width={18} height={18} />
        {open ? 'Masquer les filtres' : 'Filtrer et trier'}
        {activeCount > 0 && <span className="rounded-full bg-plum px-2 py-0.5 text-xs text-canvas">{activeCount}</span>}
      </button>
      <div id={id} className={`${open ? 'block' : 'hidden'} mt-4 lg:mt-0 lg:block`}>
        {children}
      </div>
    </div>
  );
}
