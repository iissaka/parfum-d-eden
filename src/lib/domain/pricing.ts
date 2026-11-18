import { assertXof } from '@/lib/utils/money';
import type { Promotion, Zone } from './types';

export type PromoReason =
  | 'code_inconnu'
  | 'code_inactif'
  | 'code_pas_encore_valide'
  | 'code_expire'
  | 'code_epuise'
  | 'minimum_non_atteint';

export const PROMO_MESSAGES: Record<PromoReason, string> = {
  code_inconnu: 'Ce code promotionnel n’existe pas.',
  code_inactif: 'Ce code promotionnel n’est plus actif.',
  code_pas_encore_valide: 'Ce code promotionnel n’est pas encore valide.',
  code_expire: 'Ce code promotionnel est expiré.',
  code_epuise: 'Ce code promotionnel a atteint sa limite d’utilisation.',
  minimum_non_atteint: 'Le montant minimum du panier n’est pas atteint pour ce code.',
};

export type PromoResult =
  | { ok: true; discount: number; promotion: Promotion | null }
  | { ok: false; reason: PromoReason };

export function computeSubtotal(lines: { unitPriceXof: number; quantity: number }[]): number {
  let total = 0;
  for (const line of lines) {
    assertXof(line.unitPriceXof, 'prix unitaire');
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new RangeError('quantité invalide');
    }
    total += line.unitPriceXof * line.quantity;
  }
  return total;
}

/**
 * Évalue un code promotionnel côté serveur.
 * Une remise ne peut jamais dépasser le sous-total.
 */
export function evaluatePromotion(
  promo: Promotion | null,
  subtotal: number,
  now: Date,
): PromoResult {
  if (!promo) {
    return { ok: true, discount: 0, promotion: null };
  }
  if (!promo.isActive) {
    return { ok: false, reason: 'code_inactif' };
  }
  const time = now.getTime();
  if (promo.startAt && time < Date.parse(promo.startAt)) {
    return { ok: false, reason: 'code_pas_encore_valide' };
  }
  if (promo.endAt && time > Date.parse(promo.endAt)) {
    return { ok: false, reason: 'code_expire' };
  }
  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
    return { ok: false, reason: 'code_epuise' };
  }
  if (subtotal < promo.minSubtotal) {
    return { ok: false, reason: 'minimum_non_atteint' };
  }
  const raw =
    promo.discountType === 'percent'
      ? Math.floor((subtotal * promo.value) / 100)
      : promo.value;
  return { ok: true, discount: Math.min(raw, subtotal), promotion: promo };
}

export function computeDeliveryFee(zone: Zone, subtotal: number): number {
  if (zone.freeShippingFrom !== null && subtotal >= zone.freeShippingFrom) {
    return 0;
  }
  return zone.fee;
}

export function computeTotal(subtotal: number, discount: number, deliveryFee: number): number {
  assertXof(subtotal, 'sous-total');
  assertXof(discount, 'remise');
  assertXof(deliveryFee, 'frais de livraison');
  return Math.max(0, subtotal - discount) + deliveryFee;
}
