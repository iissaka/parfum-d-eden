'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { audit } from '@/lib/audit';
import { requireAdmin } from '@/lib/auth/guard';
import { hasPermission } from '@/lib/auth/permissions';
import { canMarkCashPaid } from '@/lib/domain/orders';
import { ORDER_STATUSES, DISCOUNT_TYPES } from '@/lib/domain/types';
import { referenceSchema } from '@/lib/domain/validation';
import { getStore } from '@/lib/store';

const intField = (min: number, max: number) => z.coerce.number().int().min(min).max(max);
const checkbox = z
  .union([z.literal('on'), z.undefined()])
  .transform((value) => value === 'on');

function refresh(paths: string[]): void {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const session = await requireAdmin('orders:update_status');
  const reference = referenceSchema.parse(formData.get('reference'));
  const to = z.enum(ORDER_STATUSES).parse(formData.get('status'));
  if ((to === 'cancelled' || to === 'returned') && !hasPermission(session.role, 'orders:cancel')) {
    throw new Error('Accès refusé');
  }

  await getStore().updateOrderStatus(reference, to, session.sub);
  await audit(session.sub, 'order.status', reference, { to });
  refresh(['/admin/commandes', `/admin/commandes/${reference}`, '/admin', '/admin/produits']);
}

/** Encaissement manuel (paiement à la livraison) : tracé dans le journal. */
export async function markCashPaidAction(formData: FormData): Promise<void> {
  const session = await requireAdmin('orders:mark_paid');
  const reference = referenceSchema.parse(formData.get('reference'));
  const store = getStore();
  const order = await store.getOrder(reference);
  if (!order || order.paymentMethod !== 'cash_on_delivery' || !canMarkCashPaid(order.status)) {
    throw new Error('Encaissement impossible pour cette commande');
  }

  await store.setPaymentStatus(reference, 'paid');
  await audit(session.sub, 'order.cash_collected_manual', reference, {
    note: 'Confirmation manuelle de l’encaissement, pas une notification de prestataire',
  });
  refresh(['/admin/commandes', `/admin/commandes/${reference}`]);
}

export async function updateStockAction(formData: FormData): Promise<void> {
  const session = await requireAdmin('stock:write');
  const variantId = z.string().min(1).max(64).parse(formData.get('variantId'));
  const stock = intField(0, 100_000).parse(formData.get('stock'));
  await getStore().setVariantStock(variantId, stock);
  await audit(session.sub, 'stock.updated', variantId, { stock });
  refresh(['/admin/produits', '/admin']);
}

export async function updatePriceAction(formData: FormData): Promise<void> {
  const session = await requireAdmin('catalog:write');
  const variantId = z.string().min(1).max(64).parse(formData.get('variantId'));
  const priceXof = intField(0, 10_000_000).parse(formData.get('priceXof'));
  await getStore().setVariantPrice(variantId, priceXof);
  await audit(session.sub, 'price.updated', variantId, { priceXof });
  refresh(['/admin/produits']);
}

export async function saveZoneAction(formData: FormData): Promise<void> {
  const session = await requireAdmin('zones:write');
  const input = z
    .object({
      id: z.string().min(1).max(64).optional(),
      name: z.string().trim().min(2).max(80),
      city: z.string().trim().min(2).max(60),
      fee: intField(0, 1_000_000),
      freeShippingFrom: z
        .string()
        .optional()
        .transform((v) => (v ? Number(v) : null))
        .pipe(z.number().int().nonnegative().nullable()),
      delayText: z.string().trim().max(120).optional().transform((v) => v || null),
      isActive: checkbox,
    })
    .parse({
      id: formData.get('id') || undefined,
      name: formData.get('name'),
      city: formData.get('city'),
      fee: formData.get('fee'),
      freeShippingFrom: formData.get('freeShippingFrom') || '',
      delayText: formData.get('delayText') ?? '',
      isActive: formData.get('isActive') ?? undefined,
    });

  const id = input.id ?? `zone-${randomBytes(6).toString('hex')}`;
  await getStore().upsertZone({
    id,
    name: input.name,
    city: input.city,
    fee: input.fee,
    freeShippingFrom: input.freeShippingFrom,
    delayText: input.delayText,
    isActive: input.isActive,
  });
  await audit(session.sub, 'zone.saved', id, { fee: input.fee, isActive: input.isActive });
  refresh(['/admin/livraison', '/livraison', '/commande']);
}

export async function savePromotionAction(formData: FormData): Promise<void> {
  const session = await requireAdmin('promotions:write');
  const input = z
    .object({
      code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,40}$/),
      discountType: z.enum(DISCOUNT_TYPES),
      value: intField(1, 10_000_000),
      startAt: z.string().optional().transform((v) => (v ? new Date(v).toISOString() : null)),
      endAt: z.string().optional().transform((v) => (v ? new Date(v).toISOString() : null)),
      usageLimit: z.string().optional().transform((v) => (v ? Number(v) : null)).pipe(z.number().int().positive().nullable()),
      minSubtotal: intField(0, 10_000_000),
      isActive: checkbox,
    })
    .refine((v) => v.discountType !== 'percent' || v.value <= 100, 'Pourcentage au-delà de 100')
    .parse({
      code: formData.get('code'),
      discountType: formData.get('discountType'),
      value: formData.get('value'),
      startAt: formData.get('startAt') || undefined,
      endAt: formData.get('endAt') || undefined,
      usageLimit: formData.get('usageLimit') || '',
      minSubtotal: formData.get('minSubtotal') || '0',
      isActive: formData.get('isActive') ?? undefined,
    });

  const store = getStore();
  const existing = await store.getPromotionByCode(input.code);
  await store.upsertPromotion({
    id: existing?.id ?? `promo-${randomBytes(6).toString('hex')}`,
    code: input.code,
    discountType: input.discountType,
    value: input.value,
    startAt: input.startAt,
    endAt: input.endAt,
    usageLimit: input.usageLimit,
    usedCount: existing?.usedCount ?? 0,
    minSubtotal: input.minSubtotal,
    isActive: input.isActive,
  });
  await audit(session.sub, 'promotion.saved', input.code, { value: input.value, discountType: input.discountType });
  refresh(['/admin/promotions', '/commande']);
}
