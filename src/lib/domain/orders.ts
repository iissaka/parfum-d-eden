import type { OrderStatus, PaymentStatus } from './types';

/** Transitions autorisées du statut de commande. */
const STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

/** Transitions autorisées du statut de paiement. */
const PAYMENT_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  unpaid: ['paid', 'failed'],
  failed: ['paid'],
  paid: ['refunded'],
  refunded: [],
};

export class TransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransitionError';
  }
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrder(from, to)) {
    throw new TransitionError(`Transition de commande interdite : ${from} → ${to}`);
  }
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  return PAYMENT_TRANSITIONS[from].includes(to);
}

/** Le stock n'est remis en vente que pour une annulation avant expédition. */
export function shouldRestock(to: OrderStatus): boolean {
  return to === 'cancelled';
}

/**
 * Un encaissement manuel (paiement à la livraison) ne peut être tracé
 * qu'une fois le colis expédié ou livré.
 */
export function canMarkCashPaid(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'delivered';
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped: 'Expédiée / en livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  returned: 'Retournée',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Non payée',
  paid: 'Payée',
  failed: 'Échec du paiement',
  refunded: 'Remboursée',
};
