import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { ORDER_STATUS_LABELS } from '@/lib/domain/orders';
import { formatFcfa } from '@/lib/utils/money';
import { getStore } from '@/lib/store';

export const metadata = { title: 'Tableau de bord' };

const LOW_STOCK_THRESHOLD = 5;

export default async function DashboardPage() {
  await requireAdmin('orders:read');
  const store = getStore();
  const [orders, variants, products] = await Promise.all([
    store.listOrders(),
    store.listVariants(),
    store.listProducts(),
  ]);

  const productName = new Map(products.map((p) => [p.id, p.name]));
  const active = orders.filter((o) => o.status !== 'cancelled');
  const toProcess = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed');
  const lowStock = variants.filter((v) => v.isActive && v.stock <= LOW_STOCK_THRESHOLD);
  const orderedTotal = active.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">Tableau de bord</h1>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Indicateurs">
        <div className="card">
          <p className="text-sm">Commandes (hors annulées)</p>
          <p className="font-serif text-3xl">{active.length}</p>
        </div>
        <div className="card">
          <p className="text-sm">Montant commandé (hors annulées)</p>
          <p className="font-serif text-3xl">{formatFcfa(orderedTotal)}</p>
          <p className="mt-1 text-xs">Montant des commandes enregistrées, avant encaissement.</p>
        </div>
        <div className="card">
          <p className="text-sm">À traiter</p>
          <p className="font-serif text-3xl">{toProcess.length}</p>
        </div>
      </section>

      <section className="card space-y-3" aria-labelledby="a-traiter">
        <div className="flex items-center justify-between">
          <h2 id="a-traiter" className="font-serif text-2xl">Commandes à traiter</h2>
          <Link href="/admin/commandes" className="text-sm underline underline-offset-4">Toutes les commandes</Link>
        </div>
        {toProcess.length === 0 ? (
          <p className="text-sm">Aucune commande en attente.</p>
        ) : (
          <ul className="divide-y divide-petal text-sm">
            {toProcess.slice(0, 8).map((o) => (
              <li key={o.reference} className="flex justify-between py-2">
                <Link href={`/admin/commandes/${o.reference}`} className="underline underline-offset-4">{o.reference}</Link>
                <span>{ORDER_STATUS_LABELS[o.status]} · {formatFcfa(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card space-y-3" aria-labelledby="stock-faible">
        <h2 id="stock-faible" className="font-serif text-2xl">Stocks faibles (≤ {LOW_STOCK_THRESHOLD})</h2>
        {lowStock.length === 0 ? (
          <p className="text-sm">Aucun stock faible.</p>
        ) : (
          <ul className="divide-y divide-petal text-sm">
            {lowStock.map((v) => (
              <li key={v.id} className="flex justify-between py-2">
                <span>{productName.get(v.productId)} — {v.format}</span>
                <span className="font-medium">{v.stock}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
