import Link from 'next/link';
import { notFound } from 'next/navigation';
import { markCashPaidAction, updateOrderStatusAction } from '@/app/admin/actions';
import { requireAdmin } from '@/lib/auth/guard';
import { hasPermission } from '@/lib/auth/permissions';
import {
  canMarkCashPaid,
  canTransitionOrder,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/domain/orders';
import { ORDER_STATUSES } from '@/lib/domain/types';
import { formatFcfa } from '@/lib/utils/money';
import { getStore } from '@/lib/store';

export const metadata = { title: 'Détail de commande' };

export default async function CommandeDetailPage({ params }: { params: Promise<{ reference: string }> }) {
  const session = await requireAdmin('orders:read');
  const { reference } = await params;
  const order = await getStore().getOrder(reference.toUpperCase());
  if (!order) {
    notFound();
  }

  const canUpdate = hasPermission(session.role, 'orders:update_status');
  const canCancel = hasPermission(session.role, 'orders:cancel');
  const canCash = hasPermission(session.role, 'orders:mark_paid');
  const nextStatuses = ORDER_STATUSES.filter(
    (s) => canTransitionOrder(order.status, s) && (canCancel || (s !== 'cancelled' && s !== 'returned')),
  );

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/admin/commandes" className="underline underline-offset-4">← Commandes</Link>
      </nav>
      <h1 className="font-mono text-3xl">{order.reference}</h1>
      <p className="text-sm">Créée le {new Date(order.createdAt).toLocaleString('fr-FR')}</p>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-2 text-sm">
          <h2 className="font-serif text-xl">Client et livraison</h2>
          <p>{order.customer.name}</p>
          <p>{order.customer.phone}</p>
          {order.customer.email && <p>{order.customer.email}</p>}
          <p>{order.delivery.zoneName} — {order.delivery.district}</p>
          <p>{order.delivery.address}</p>
          {order.delivery.notes && <p className="italic">{order.delivery.notes}</p>}
        </div>

        <div className="card space-y-2 text-sm">
          <h2 className="font-serif text-xl">Statut</h2>
          <p>Commande : <strong>{ORDER_STATUS_LABELS[order.status]}</strong></p>
          <p>Paiement : <strong>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</strong> ({order.paymentMethod === 'cash_on_delivery' ? 'à la livraison' : order.paymentMethod})</p>
          <p>Newsletter : {order.customer.newsletterConsent ? 'consentement donné' : 'non'}</p>
        </div>
      </section>

      <section className="card overflow-x-auto p-0" aria-labelledby="lignes">
        <h2 id="lignes" className="px-5 pt-5 font-serif text-xl">Articles</h2>
        <table className="mt-3 w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-petal text-xs uppercase">
            <tr>
              <th scope="col" className="px-5 py-2">Produit</th>
              <th scope="col" className="px-5 py-2">SKU</th>
              <th scope="col" className="px-5 py-2 text-right">Prix</th>
              <th scope="col" className="px-5 py-2 text-right">Qté</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={line.variantId} className="border-b border-petal/60">
                <td className="px-5 py-2">{line.productName} — {line.format}</td>
                <td className="px-5 py-2 font-mono">{line.sku}</td>
                <td className="px-5 py-2 text-right">{formatFcfa(line.unitPriceXof)}</td>
                <td className="px-5 py-2 text-right">{line.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="grid gap-1 px-5 py-4 text-sm sm:ml-auto sm:max-w-xs">
          <div className="flex justify-between"><dt>Sous-total</dt><dd>{formatFcfa(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Remise {order.promotionCode ? `(${order.promotionCode})` : ''}</dt><dd>−{formatFcfa(order.discount)}</dd></div>
          <div className="flex justify-between"><dt>Livraison</dt><dd>{formatFcfa(order.deliveryFee)}</dd></div>
          <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatFcfa(order.total)}</dd></div>
        </dl>
      </section>

      {canUpdate && nextStatuses.length > 0 && (
        <section className="card space-y-3" aria-labelledby="changer-statut">
          <h2 id="changer-statut" className="font-serif text-xl">Changer le statut</h2>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <form key={s} action={updateOrderStatusAction}>
                <input type="hidden" name="reference" value={order.reference} />
                <input type="hidden" name="status" value={s} />
                <button type="submit" className="btn-secondary px-4 py-2 text-sm">{ORDER_STATUS_LABELS[s]}</button>
              </form>
            ))}
          </div>
        </section>
      )}

      {canCash && order.paymentMethod === 'cash_on_delivery' && canMarkCashPaid(order.status) && order.paymentStatus !== 'paid' && (
        <section className="card space-y-3" aria-labelledby="encaissement">
          <h2 id="encaissement" className="font-serif text-xl">Encaissement à la livraison</h2>
          <p className="text-sm">Confirmez uniquement si le montant a été encaissé. Cette action est tracée dans le journal.</p>
          <form action={markCashPaidAction}>
            <input type="hidden" name="reference" value={order.reference} />
            <button type="submit" className="btn-primary px-4 py-2 text-sm">Marquer comme encaissée</button>
          </form>
        </section>
      )}

      <section className="card space-y-2 text-sm" aria-labelledby="historique">
        <h2 id="historique" className="font-serif text-xl">Historique</h2>
        <ol className="space-y-1">
          {order.history.map((event, i) => (
            <li key={`${event.at}-${i}`}>
              {new Date(event.at).toLocaleString('fr-FR')} — {ORDER_STATUS_LABELS[event.to]} ({event.actor})
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
