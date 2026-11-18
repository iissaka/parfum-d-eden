// JEU DE DONNÉES DE TEST — FICTIF.
// Utilisé uniquement par les tests unitaires (logique de commande, stock, catalogue),
// indépendamment du catalogue réel de la boutique (src/lib/store/seed.ts).

import type { SeedData } from '@/lib/store/seed';
import type { Collection, Product, Promotion, Variant, Zone } from '@/lib/domain/types';

const CREATED_AT = '2026-11-01T00:00:00.000Z';

export function createSeed(): SeedData {
  const products: Product[] = [
    {
      id: 'prod-01',
      slug: 'exemple-femme-floral',
      name: '[Exemple] Floral 01',
      description: null,
      family: 'Floral',
      gender: 'femme',
      isNew: true,
      isFeatured: true,
      isActive: true,
      createdAt: CREATED_AT,
    },
    {
      id: 'prod-02',
      slug: 'exemple-femme-fraiche',
      name: '[Exemple] Fraîche 02',
      description: null,
      family: 'Fraîche',
      gender: 'femme',
      isNew: true,
      isFeatured: false,
      isActive: true,
      createdAt: CREATED_AT,
    },
    {
      id: 'prod-03',
      slug: 'exemple-femme-oriental',
      name: '[Exemple] Oriental 03',
      description: null,
      family: 'Oriental',
      gender: 'femme',
      isNew: false,
      isFeatured: true,
      isActive: true,
      createdAt: CREATED_AT,
    },
    {
      id: 'prod-04',
      slug: 'exemple-homme-boise',
      name: '[Exemple] Boisé 04',
      description: null,
      family: 'Boisé',
      gender: 'homme',
      isNew: false,
      isFeatured: true,
      isActive: true,
      createdAt: CREATED_AT,
    },
    {
      id: 'prod-05',
      slug: 'exemple-homme-aromatique',
      name: '[Exemple] Aromatique 05',
      description: null,
      family: 'Aromatique',
      gender: 'homme',
      isNew: true,
      isFeatured: false,
      isActive: true,
      createdAt: CREATED_AT,
    },
    {
      id: 'prod-06',
      slug: 'exemple-mixte-ambre',
      name: '[Exemple] Ambré 06',
      description: null,
      family: 'Oriental',
      gender: 'mixte',
      isNew: false,
      isFeatured: false,
      isActive: true,
      createdAt: CREATED_AT,
    },
  ];

  const variants: Variant[] = [
    { id: 'var-01-50', productId: 'prod-01', format: '50 ml', sku: 'EX-01-50', priceXof: 25000, stock: 12, isActive: true },
    { id: 'var-01-100', productId: 'prod-01', format: '100 ml', sku: 'EX-01-100', priceXof: 38000, stock: 4, isActive: true },
    { id: 'var-02-50', productId: 'prod-02', format: '50 ml', sku: 'EX-02-50', priceXof: 22000, stock: 8, isActive: true },
    { id: 'var-02-100', productId: 'prod-02', format: '100 ml', sku: 'EX-02-100', priceXof: 32000, stock: 0, isActive: true },
    { id: 'var-03-50', productId: 'prod-03', format: '50 ml', sku: 'EX-03-50', priceXof: 27000, stock: 9, isActive: true },
    { id: 'var-04-50', productId: 'prod-04', format: '50 ml', sku: 'EX-04-50', priceXof: 26000, stock: 3, isActive: true },
    { id: 'var-05-50', productId: 'prod-05', format: '50 ml', sku: 'EX-05-50', priceXof: 24000, stock: 10, isActive: true },
    { id: 'var-05-100', productId: 'prod-05', format: '100 ml', sku: 'EX-05-100', priceXof: 35000, stock: 0, isActive: true },
    { id: 'var-06-50', productId: 'prod-06', format: '50 ml', sku: 'EX-06-50', priceXof: 28000, stock: 7, isActive: true },
  ];

  const collections: Collection[] = [
    {
      id: 'col-nouveautes',
      slug: 'nouveautes',
      name: 'Nouveautés',
      description: null,
      sortOrder: 1,
      isActive: true,
      productIds: ['prod-01', 'prod-02', 'prod-05'],
    },
    {
      id: 'col-signature',
      slug: 'signature',
      name: 'Signature',
      description: null,
      sortOrder: 2,
      isActive: true,
      productIds: ['prod-03', 'prod-04', 'prod-06'],
    },
  ];

  // Zones : montants et délais à confirmer. La zone « autres villes » reste désactivée
  // tant que le client ne l'a pas définie.
  const zones: Zone[] = [
    {
      id: 'zone-niamey-centre',
      name: 'Niamey — centre',
      city: 'Niamey',
      fee: 1000,
      freeShippingFrom: 25000,
      delayText: '24 à 48 h (indicatif, à confirmer)',
      isActive: true,
    },
    {
      id: 'zone-niamey-peripherie',
      name: 'Niamey — périphérie',
      city: 'Niamey',
      fee: 1500,
      freeShippingFrom: 30000,
      delayText: '48 à 72 h (indicatif, à confirmer)',
      isActive: true,
    },
    {
      id: 'zone-autres-villes',
      name: 'Autres villes (à définir)',
      city: 'Autres',
      fee: 3000,
      freeShippingFrom: null,
      delayText: null,
      isActive: false,
    },
  ];

  const promotions: Promotion[] = [
    {
      id: 'promo-bienvenue',
      code: 'BIENVENUE10',
      discountType: 'percent',
      value: 10,
      startAt: null,
      endAt: null,
      usageLimit: 100,
      usedCount: 0,
      minSubtotal: 20000,
      isActive: true,
    },
  ];

  return { products, variants, collections, zones, promotions };
}
