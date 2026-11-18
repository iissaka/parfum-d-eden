// CATALOGUE DE LANCEMENT — d'après la liste fournie par la marque (« Notre collection de lancement »).
//
// Confirmés par la liste : noms des parfums, gammes, contenances, « pour homme » (El Nabil),
// « mixte » (huile concentrée), « eaux de parfum » (Kenzie).
//
// ⚠ PROVISOIRES, À REMPLACER PAR LA MARQUE (modifiables aussi depuis l'administration) :
//  - PRIX : non fournis. Valeurs de travail : 5 ml = 5 000 FCFA, 12 ml = 8 000 FCFA, 30 ml = 15 000 FCFA.
//  - STOCKS : non fournis (10 unités par défaut).
//  - GENRE de Musc Tahara et Kenzie : non précisé, classé « mixte » par défaut.
//  - Zones de livraison et code promotionnel : valeurs d'exemple.

import type { Collection, Gender, Product, Promotion, Variant, Zone } from '@/lib/domain/types';

export interface SeedData {
  products: Product[];
  variants: Variant[];
  collections: Collection[];
  zones: Zone[];
  promotions: Promotion[];
}

const CREATED_AT = '2026-11-01T00:00:00.000Z';
const DEFAULT_STOCK = 10;

/** Prix de travail par contenance (FCFA), en attendant la grille tarifaire de la marque. */
const PROVISIONAL_PRICE: Record<string, number> = { '5 ml': 5000, '12 ml': 8000, '30 ml': 15000 };

interface Line {
  slug: string;
  name: string;
  description: string;
  format: string;
  gender: Gender;
  products: { slug: string; name: string }[];
}

/** Les quatre gammes de la collection de lancement. */
export const LINES: Line[] = [
  {
    slug: 'musc-tahara',
    name: 'Musc Tahara',
    description: 'La gamme Musc Tahara.',
    format: '12 ml',
    gender: 'mixte',
    products: [
      { slug: 'nuage-sucre', name: 'Nuage Sucré' },
      { slug: 'vanille-bourbon', name: 'Vanille Bourbon' },
      { slug: 'sweet-candy', name: 'Sweet Candy' },
      { slug: 'oud-cachemire', name: 'Oud Cachemire' },
    ],
  },
  {
    slug: 'el-nabil',
    name: 'El Nabil',
    description: 'La gamme El Nabil, pour homme.',
    format: '5 ml',
    gender: 'homme',
    products: [
      { slug: 'prince', name: 'Prince' },
      { slug: 'elixir-of-dubai', name: 'Élixir of Dubai' },
    ],
  },
  {
    slug: 'huile-concentree',
    name: 'Huile concentrée',
    description: 'Huile concentrée de parfum, mixte.',
    format: '12 ml',
    gender: 'mixte',
    products: [{ slug: 'arabiyat-elhem', name: 'Arabiyat Elhem' }],
  },
  {
    slug: 'kenzie',
    name: 'Kenzie',
    description: 'La gamme Kenzie : eaux de parfum.',
    format: '30 ml',
    gender: 'mixte',
    products: [
      { slug: 'apple-exotic', name: 'Apple Exotic' },
      { slug: 'ambre-lychee', name: 'Ambre Lychee' },
      { slug: 'marshmallow', name: 'Marshmallow' },
    ],
  },
];

export function createSeed(): SeedData {
  const products: Product[] = [];
  const variants: Variant[] = [];
  const collections: Collection[] = [];

  LINES.forEach((line, lineIndex) => {
    const ids: string[] = [];
    for (const item of line.products) {
      const id = `prod-${item.slug}`;
      ids.push(id);
      products.push({
        id,
        slug: item.slug,
        name: item.name,
        description: `${line.description} Flacon de ${line.format}.`,
        // Le champ « family » porte la gamme : c'est le classement fourni par la marque.
        family: line.name,
        gender: line.gender,
        isNew: true,
        isFeatured: false,
        isActive: true,
        createdAt: CREATED_AT,
      });
      variants.push({
        id: `var-${item.slug}`,
        productId: id,
        format: line.format,
        sku: `${line.slug}-${item.slug}`.toUpperCase(),
        priceXof: PROVISIONAL_PRICE[line.format],
        stock: DEFAULT_STOCK,
        isActive: true,
      });
    }
    collections.push({
      id: `col-${line.slug}`,
      slug: line.slug,
      name: line.name,
      description: line.description,
      sortOrder: lineIndex + 1,
      isActive: true,
      productIds: ids,
    });
  });

  collections.unshift({
    id: 'col-lancement',
    slug: 'lancement',
    name: 'Collection de lancement',
    description: 'Nos premiers parfums : quatre gammes, dix fragrances.',
    sortOrder: 0,
    isActive: true,
    productIds: products.map((p) => p.id),
  });

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
