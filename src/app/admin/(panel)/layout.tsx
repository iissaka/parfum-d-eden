import Link from 'next/link';
import type { ReactNode } from 'react';
import { logoutAction } from '../login/actions';
import { requireAdmin } from '@/lib/auth/guard';
import { hasPermission } from '@/lib/auth/permissions';

const LINKS = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/commandes', label: 'Commandes' },
  { href: '/admin/produits', label: 'Produits et stocks' },
  { href: '/admin/livraison', label: 'Livraison' },
  { href: '/admin/promotions', label: 'Promotions' },
  { href: '/admin/journal', label: 'Journal' },
];

const ROLE_LABELS = {
  owner: 'Administrateur principal',
  manager: 'Gestionnaire de boutique',
  preparer: 'Préparateur',
  reader: 'Lecture seule',
} as const;

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  const canSeeJournal = hasPermission(session.role, 'audit:read');

  return (
    <div className="container-page grid gap-8 py-8 md:grid-cols-[13rem_1fr]">
      <aside className="space-y-4">
        <p className="text-xs">{ROLE_LABELS[session.role]}</p>
        <nav aria-label="Administration">
          <ul className="space-y-2 text-sm">
            {LINKS.filter((l) => l.href !== '/admin/journal' || canSeeJournal).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="block rounded-lg px-3 py-2 hover:bg-petal/60">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form action={logoutAction}>
          <button type="submit" className="btn-secondary w-full px-4 py-2 text-sm">Se déconnecter</button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
