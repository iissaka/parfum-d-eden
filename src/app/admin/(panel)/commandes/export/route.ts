import { requireAdmin } from '@/lib/auth/guard';
import { audit } from '@/lib/audit';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/domain/orders';
import { getStore } from '@/lib/store';
import { csvCell } from '@/lib/utils/csv';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const session = await requireAdmin('orders:export');
  const orders = await getStore().listOrders();

  const header = ['reference', 'date', 'statut', 'paiement', 'client', 'telephone', 'zone', 'total_fcfa'];
  const rows = orders.map((o) => [
    o.reference,
    o.createdAt,
    ORDER_STATUS_LABELS[o.status],
    PAYMENT_STATUS_LABELS[o.paymentStatus],
    o.customer.name,
    o.customer.phone,
    o.delivery.zoneName,
    o.total,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n');

  await audit(session.sub, 'orders.exported', null, { count: orders.length });
  return new Response(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="commandes.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
