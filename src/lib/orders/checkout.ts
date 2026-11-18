import type { CartLine } from '@/lib/domain/cart';
import { PROMO_MESSAGES, computeDeliveryFee, computeTotal, evaluatePromotion, type PromoReason } from '@/lib/domain/pricing';
import type { Order } from '@/lib/domain/types';
import { checkoutSchema } from '@/lib/domain/validation';
import { buildCartView } from '@/lib/cart/cart-view';
import { isPaymentMethodEnabled } from '@/lib/config';
import { generateOrderReference } from '@/lib/utils/ids';
import { audit } from '@/lib/audit';
import { rateLimit } from '@/lib/utils/rate-limit';
import { sendOrderConfirmation } from '@/lib/orders/notify';
import { getStore, PromotionUnavailableError, StockError, type Store } from '@/lib/store';

export type CheckoutErrorCode =
  | 'formulaire_invalide'
  | 'panier_vide'
  | 'stock_insuffisant'
  | 'zone_invalide'
  | 'paiement_indisponible'
  | 'code_promo'
  | 'trop_de_tentatives'
  | 'erreur_interne';

export const CHECKOUT_MESSAGES: Record<CheckoutErrorCode, string> = {
  formulaire_invalide: 'Certaines informations sont incomplètes ou invalides. Vérifiez le formulaire.',
  panier_vide: 'Votre panier est vide.',
  stock_insuffisant: 'Un ou plusieurs articles ne sont plus disponibles en quantité suffisante. Mettez votre panier à jour.',
  zone_invalide: 'La zone de livraison choisie n’est pas disponible.',
  paiement_indisponible: 'Ce mode de paiement n’est pas disponible actuellement.',
  code_promo: 'Le code promotionnel n’a pas pu être appliqué.',
  trop_de_tentatives: 'Trop de tentatives. Patientez quelques minutes avant de réessayer.',
  erreur_interne: 'Une erreur est survenue. Votre commande n’a pas été enregistrée. Réessayez.',
};

export class CheckoutError extends Error {
  constructor(
    readonly code: CheckoutErrorCode,
    readonly promoReason?: PromoReason,
  ) {
    super(code);
    this.name = 'CheckoutError';
  }
}

export interface PlacedOrder {
  reference: string;
  total: number;
  created: boolean;
}

/**
 * Crée une commande. Tous les montants sont recalculés côté serveur.
 * Les données du formulaire et du panier sont traitées comme non fiables.
 */
export async function placeOrder(
  input: unknown,
  cart: CartLine[],
  clientKey: string,
  store: Store = getStore(),
  now: Date = new Date(),
): Promise<PlacedOrder> {
  if (!rateLimit(`checkout:${clientKey}`, 10, 10 * 60 * 1000, now.getTime())) {
    throw new CheckoutError('trop_de_tentatives');
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    throw new CheckoutError('formulaire_invalide');
  }
  const data = parsed.data;

  if (cart.length === 0) {
    throw new CheckoutError('panier_vide');
  }
  const view = await buildCartView(cart, store);
  if (view.lines.length === 0) {
    throw new CheckoutError('panier_vide');
  }
  if (view.blocking) {
    throw new CheckoutError('stock_insuffisant');
  }

  const zone = await store.getZone(data.zoneId);
  if (!zone || !zone.isActive) {
    throw new CheckoutError('zone_invalide');
  }
  if (!isPaymentMethodEnabled(data.paymentMethod)) {
    throw new CheckoutError('paiement_indisponible');
  }

  const promoRecord = data.promoCode ? await store.getPromotionByCode(data.promoCode) : null;
  if (data.promoCode && !promoRecord) {
    throw new CheckoutError('code_promo', 'code_inconnu');
  }
  const promo = evaluatePromotion(promoRecord, view.subtotal, now);
  if (!promo.ok) {
    throw new CheckoutError('code_promo', promo.reason);
  }

  const deliveryFee = computeDeliveryFee(zone, view.subtotal);
  const total = computeTotal(view.subtotal, promo.discount, deliveryFee);
  const nowIso = now.toISOString();

  const order: Order = {
    reference: generateOrderReference(),
    idempotencyKey: data.idempotencyKey,
    status: 'pending',
    paymentMethod: data.paymentMethod,
    paymentStatus: 'unpaid',
    customer: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      newsletterConsent: data.newsletter,
    },
    delivery: {
      zoneId: zone.id,
      zoneName: zone.name,
      district: data.district,
      address: data.address,
      notes: data.notes,
    },
    lines: view.lines.map((line) => ({
      variantId: line.variantId,
      productName: line.productName,
      format: line.format,
      sku: line.sku,
      unitPriceXof: line.unitPriceXof,
      quantity: line.quantity,
    })),
    subtotal: view.subtotal,
    discount: promo.discount,
    promotionCode: promo.promotion?.code ?? null,
    deliveryFee,
    total,
    createdAt: nowIso,
    updatedAt: nowIso,
    history: [{ at: nowIso, from: null, to: 'pending', actor: 'client' }],
  };

  try {
    const result = await store.createOrder(order);
    if (result.created) {
      await audit('client', 'order.created', result.order.reference, { total: result.order.total });
      void sendOrderConfirmation(result.order).catch(() => undefined);
    }
    return { reference: result.order.reference, total: result.order.total, created: result.created };
  } catch (error) {
    if (error instanceof StockError) {
      throw new CheckoutError('stock_insuffisant');
    }
    if (error instanceof PromotionUnavailableError) {
      throw new CheckoutError('code_promo', 'code_epuise');
    }
    throw new CheckoutError('erreur_interne');
  }
}

export function promoMessage(reason: PromoReason | undefined): string {
  return reason ? PROMO_MESSAGES[reason] : CHECKOUT_MESSAGES.code_promo;
}
