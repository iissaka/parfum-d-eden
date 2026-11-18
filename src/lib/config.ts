import type { PaymentMethod } from '@/lib/domain/types';

/**
 * Modes de paiement réellement activables.
 * - Paiement à la livraison : solution de lancement, désactivable par variable d'environnement.
 * - Paiement mobile et carte : jamais activés tant qu'un prestataire n'a pas été vérifié
 *   (éligibilité du marchand confirmée par écrit) et intégré avec des notifications signées.
 */
export function isPaymentMethodEnabled(method: PaymentMethod): boolean {
  switch (method) {
    case 'cash_on_delivery':
      return process.env.PAYMENT_COD_ENABLED !== 'false';
    case 'mobile_money':
    case 'card':
      return false;
  }
}

export function getEnabledPaymentMethods(): PaymentMethod[] {
  return (['cash_on_delivery', 'mobile_money', 'card'] as const).filter(isPaymentMethodEnabled);
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}
