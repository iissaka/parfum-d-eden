import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/guard';
import { hasPermission } from '@/lib/auth/permissions';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/domain/orders';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/domain/types';
import { formatFcfa } from '@/lib/utils/money';
import { getStore } from '@/lib/store';
import { firstParam, type SearchParams } from '@/lib/catalog/search-params';

export const metadata = { title: 'Commandes' };

export default async function CommandesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requireAdmin('orders:read');
  const params = await searchParams;
  const statusFilter = firstParam(params, 'statut');
  const status = (ORDER_STATUSES as readonly string[]).includes(statusFilter ?? '') ? (statusFilter as OrderStatus) : undefined;
  const q = firstParam(params, 'q')?.toUpperCase();

  const orders = (await getStore().listOrders()).filter((o) => {
    if (status && o.status !== status) return false;
    if (q && !o.reference.includes(q) && !o.customer.phone.includes(q)) return false;
    return true;
  });
  const canExport = hasPermission(session.role, 'orders:export');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Commandes</h1>
        {canExport && (
          <a href="/admin/commandes/export" className="btn-secondary px-4 py-2 text-sm">Exporter en CSV</a>
        )}
      </div>

      <form method="get" className="card grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="statut">Statut</label>
          <select id="statut" name="statut" defaultValue={status ?? ''} className="field">
            <option value="">Tous</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="q">Référence ou téléphone</label>
          <input id="q" name="q" defaultValue={q ?? ''} className="field" />
        </div>
        <button type="submit" className="btn-primary px-4 py-2">Filtrer</button>
      </form>

      {orders.length === 0 ? (
        <p className="card">Aucune commande.</p>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="sr-only">Liste des commandes</caption>
            <thead className="border-b border-petal text-xs uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">Référence</th>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Client</th>
                <th scope="col" className="px-4 py-3">Statut</th>
                <th scope="col" className="px-4 py-3">Paiement</th>
                <th scope="col" className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.reference} className="border-b border-petal/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/commandes/${o.reference}`} className="font-mono underline underline-offset-4">{o.reference}</Link>
                  </td>
                  <td className="px-4 py-3">{new Date(o.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3">{o.customer.name}</td>
                  <td className="px-4 py-3">{ORDER_STATUS_LABELS[o.status]}</td>
                  <td className="px-4 py-3">{PAYMENT_STATUS_LABELS[o.paymentStatus]}</td>
                  <td className="px-4 py-3 text-right">{formatFcfa(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
