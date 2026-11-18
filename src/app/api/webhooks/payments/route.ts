import { NextResponse } from 'next/server';
import { z } from 'zod';
import { audit } from '@/lib/audit';
import { canTransitionPayment } from '@/lib/domain/orders';
import { getStore } from '@/lib/store';
import { verifyPaymentSignature } from '@/lib/orders/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16_000;

const eventSchema = z.object({
  eventId: z.string().min(1).max(120),
  reference: z.string().regex(/^PE-[A-Z2-9]{8}$/),
  amount: z.number().int().nonnegative(),
  status: z.enum(['succeeded', 'failed']),
});

/**
 * Point de réception des notifications de paiement.
 * Aucun prestataire n'est encore intégré : cette route refuse tout appel tant que
 * PAYMENT_WEBHOOK_SECRET n'est pas configuré. Le statut « payé » n'est défini qu'ici,
 * après vérification de la signature, du montant et de l'idempotence.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || secret.length < 32) {
    return NextResponse.json({ error: 'non_configure' }, { status: 503 });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'trop_volumineux' }, { status: 413 });
  }

  const timestamp = request.headers.get('x-timestamp');
  const signature = request.headers.get('x-signature');
  if (!timestamp || !signature || !verifyPaymentSignature({ secret, timestamp, rawBody, signature })) {
    await audit('webhook', 'payment.signature_rejected', null, {});
    return NextResponse.json({ error: 'signature_invalide' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'json_invalide' }, { status: 400 });
  }
  const parsed = eventSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'charge_invalide' }, { status: 400 });
  }
  const event = parsed.data;

  const store = getStore();
  if (await store.isWebhookEventProcessed(event.eventId)) {
    return NextResponse.json({ duplicate: true }, { status: 200 });
  }

  const order = await store.getOrder(event.reference);
  if (!order) {
    return NextResponse.json({ error: 'commande_inconnue' }, { status: 404 });
  }

  if (event.amount !== order.total) {
    await audit('webhook', 'payment.amount_mismatch', order.reference, { expected: order.total, received: event.amount });
    return NextResponse.json({ error: 'montant_incoherent' }, { status: 409 });
  }

  const target = event.status === 'succeeded' ? 'paid' : 'failed';
  if (canTransitionPayment(order.paymentStatus, target)) {
    await store.setPaymentStatus(order.reference, target);
    await audit('webhook', `payment.${target}`, order.reference, { eventId: event.eventId });
  }

  await store.markWebhookEventProcessed(event.eventId);
  return NextResponse.json({ received: true }, { status: 200 });
}
