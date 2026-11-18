/**
 * Photos des produits (dossier public/products), par slug.
 *
 * ⚠ DROITS : ces visuels proviennent des sites officiels des marques (voir `source`).
 * Ils sont utilisés en développement pour illustrer le catalogue. Avant la mise en ligne,
 * obtenir l'autorisation écrite de la marque ou du distributeur, ou les remplacer par des
 * photos réalisées par la boutique. Voir docs/DECISIONS.md (D25).
 */
// Versions détourées (fond transparent, reflet retiré) dans public/products/cutout/ :
// marshmallow, arabiyat-elhem, ambre-lychee, apple-exotic — utilisées sur l'accueil (flacon posé sur un podium).
// Mêmes conditions de droits que les photos d'origine.

export interface ProductPhoto {
  src: string;
  /** cover : photo d'ambiance recadrée ; contain : packshot sur fond blanc, affiché en entier. */
  fit: 'cover' | 'contain';
  /** Point de recadrage pour « cover » (CSS object-position). */
  position?: string;
  source: string;
}

const GRIS_MONTAIGNE = 'grismontaigne.fr (Gris Montaigne Paris)';
const EL_NABIL = 'me.maisonelnabil.com (Maison El Nabil)';
const ARABIYAT = 'myperfumes.ae (Arabiyat / My Perfumes)';
const VOLARE = 'volareperfumes.com (Volaré)';

export const PRODUCT_PHOTOS: Record<string, ProductPhoto> = {
  'nuage-sucre': { src: '/products/nuage-sucre.webp', fit: 'cover', position: 'center 62%', source: GRIS_MONTAIGNE },
  'vanille-bourbon': { src: '/products/vanille-bourbon.webp', fit: 'cover', position: 'center 62%', source: GRIS_MONTAIGNE },
  'sweet-candy': { src: '/products/sweet-candy.webp', fit: 'cover', position: 'center 62%', source: GRIS_MONTAIGNE },
  'oud-cachemire': { src: '/products/oud-cachemire.webp', fit: 'cover', position: 'center 60%', source: GRIS_MONTAIGNE },
  prince: { src: '/products/prince.jpg', fit: 'cover', position: 'center', source: EL_NABIL },
  'elixir-of-dubai': { src: '/products/elixir-of-dubai.jpg', fit: 'cover', position: 'center', source: EL_NABIL },
  'arabiyat-elhem': { src: '/products/arabiyat-elhem.jpg', fit: 'contain', source: ARABIYAT },
  'apple-exotic': { src: '/products/apple-exotic.jpg', fit: 'contain', source: VOLARE },
  'ambre-lychee': { src: '/products/ambre-lychee.jpg', fit: 'contain', source: VOLARE },
  marshmallow: { src: '/products/marshmallow.jpg', fit: 'contain', source: VOLARE },
};

export function photoFor(slug: string | null | undefined): ProductPhoto | null {
  return slug ? PRODUCT_PHOTOS[slug] ?? null : null;
}
