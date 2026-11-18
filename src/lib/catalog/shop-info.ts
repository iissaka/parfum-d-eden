import { isPaymentMethodEnabled } from '@/lib/config';
import type { Zone } from '@/lib/domain/types';
import { getStore } from '@/lib/store';

export interface ShopInfo {
  zones: Zone[];
  cashOnDelivery: boolean;
  /** Seuil de livraison offerte le plus bas parmi les zones actives (avec le nom de la zone), ou null. */
  freeShipping: { amount: number; zoneName: string } | null;
}

/**
 * Informations de réassurance affichées sur le site (bandeau, accueil, panier, fiche produit).
 * Elles sont toujours dérivées des données réelles : aucune promesse n'est écrite en dur.
 */
export async function getShopInfo(): Promise<ShopInfo> {
  const zones = (await getStore().listZones()).filter((z) => z.isActive);
  let freeShipping: ShopInfo['freeShipping'] = null;
  for (const zone of zones) {
    if (zone.freeShippingFrom !== null && (freeShipping === null || zone.freeShippingFrom < freeShipping.amount)) {
      freeShipping = { amount: zone.freeShippingFrom, zoneName: zone.name };
    }
  }
  return { zones, cashOnDelivery: isPaymentMethodEnabled('cash_on_delivery'), freeShipping };
}
