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

/**
 * Adresse publique du site (sans slash final), dans cet ordre :
 * 1. NEXT_PUBLIC_SITE_URL si elle est définie (nom de domaine définitif) ;
 * 2. l'adresse de production fournie automatiquement par Vercel ;
 * 3. l'adresse du déploiement Vercel courant (aperçus) ;
 * 4. le serveur local de développement.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}
