import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/domain/orders';
import type { OrderStatus, PaymentStatus } from '@/lib/domain/types';
import { normalizePhone, trackingSchema } from '@/lib/domain/validation';
import { getStore, type Store } from '@/lib/store';
import { rateLimit } from '@/lib/utils/rate-limit';

export interface TrackingView {
  reference: string;
  status: OrderStatus;
  statusLabel: string;
  paymentLabel: string;
  paymentStatus: PaymentStatus;
  total: number;
  placedAt: string;
  updatedAt: string;
  history: { at: string; label: string }[];
}

export type TrackingResult =
  | { ok: true; view: TrackingView }
  | { ok: false; message: string };

const GENERIC_FAILURE = 'Aucune commande ne correspond à ces informations.';

/**
 * Consultation publique : la référence seule ne suffit pas, le téléphone
 * de la commande doit aussi correspondre. Le message d'échec ne distingue pas les cas.
 */
export async function lookupOrder(
  input: unknown,
  clientKey: string,
  store: Store = getStore(),
  now = Date.now(),
): Promise<TrackingResult> {
  if (!rateLimit(`tracking:${clientKey}`, 10, 15 * 60 * 1000, now)) {
    return { ok: false, message: 'Trop de tentatives. Patientez quelques minutes.' };
  }
  const parsed = trackingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Vérifiez la référence et le numéro de téléphone.' };
  }
  const phone = normalizePhone(parsed.data.phone);
  const order = await store.getOrder(parsed.data.reference);
  if (!order || !phone || order.customer.phone !== phone) {
    return { ok: false, message: GENERIC_FAILURE };
  }
  return {
    ok: true,
    view: {
      reference: order.reference,
      status: order.status,
      statusLabel: ORDER_STATUS_LABELS[order.status],
      paymentLabel: PAYMENT_STATUS_LABELS[order.paymentStatus],
      paymentStatus: order.paymentStatus,
      total: order.total,
      placedAt: order.createdAt,
      updatedAt: order.updatedAt,
      history: order.history.map((event) => ({
        at: event.at,
        label: ORDER_STATUS_LABELS[event.to],
      })),
    },
  };
}
