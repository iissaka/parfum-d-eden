import type { Collection, Gender, Product, Variant } from '@/lib/domain/types';
import { getStore, type Store } from '@/lib/store';

export interface ProductSummary {
  product: Product;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
}

export type SortKey = 'nouveautes' | 'prix_croissant' | 'prix_decroissant' | 'nom';

export interface CatalogFilters {
  q?: string;
  gender?: Gender;
  family?: string;
  maxPrice?: number;
  sort?: SortKey;
  collectionSlug?: string;
}

export interface ProductView {
  product: Product;
  variants: Variant[];
  collections: Collection[];
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function summarize(product: Product, variants: Variant[]): ProductSummary {
  const active = variants.filter((v) => v.isActive);
  const prices = active.map((v) => v.priceXof);
  return {
    product,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    inStock: active.some((v) => v.stock > 0),
  };
}

export async function summarizeProducts(store: Store, products: Product[]): Promise<ProductSummary[]> {
  const result: ProductSummary[] = [];
  for (const product of products) {
    const variants = await store.listVariantsForProduct(product.id);
    result.push(summarize(product, variants));
  }
  return result;
}

export async function searchCatalog(
  filters: CatalogFilters,
  store: Store = getStore(),
): Promise<ProductSummary[]> {
  let products = (await store.listProducts()).filter((p) => p.isActive);

  if (filters.collectionSlug) {
    const collection = await store.getCollectionBySlug(filters.collectionSlug);
    if (!collection) {
      return [];
    }
    products = products.filter((p) => collection.productIds.includes(p.id));
  }
  if (filters.gender) {
    const gender = filters.gender;
    products = products.filter((p) => p.gender === gender || p.gender === 'mixte');
  }
  if (filters.family) {
    const family = normalize(filters.family);
    products = products.filter((p) => normalize(p.family ?? '') === family);
  }
  if (filters.q) {
    const query = normalize(filters.q);
    products = products.filter((p) =>
      normalize(`${p.name} ${p.family ?? ''} ${p.description ?? ''}`).includes(query),
    );
  }

  let results = await summarizeProducts(store, products);
  if (filters.maxPrice !== undefined) {
    const max = filters.maxPrice;
    results = results.filter((r) => r.minPrice <= max);
  }

  switch (filters.sort) {
    case 'prix_croissant':
      results.sort((a, b) => a.minPrice - b.minPrice);
      break;
    case 'prix_decroissant':
      results.sort((a, b) => b.minPrice - a.minPrice);
      break;
    case 'nom':
      results.sort((a, b) => a.product.name.localeCompare(b.product.name, 'fr'));
      break;
    default:
      results.sort((a, b) => {
        if (a.product.isNew !== b.product.isNew) {
          return a.product.isNew ? -1 : 1;
        }
        return b.product.createdAt.localeCompare(a.product.createdAt);
      });
  }
  return results;
}

export async function getProductView(slug: string, store: Store = getStore()): Promise<ProductView | null> {
  const product = await store.getProductBySlug(slug);
  if (!product || !product.isActive) {
    return null;
  }
  const variants = (await store.listVariantsForProduct(product.id)).filter((v) => v.isActive);
  const collections = (await store.listCollections()).filter((c) => c.productIds.includes(product.id));
  return { product, variants, collections };
}

export async function listFamilies(store: Store = getStore()): Promise<string[]> {
  const products = await store.listProducts();
  const families = new Set(products.filter((p) => p.isActive && p.family).map((p) => p.family as string));
  return [...families].sort((a, b) => a.localeCompare(b, 'fr'));
}

export interface Suggestion extends ProductSummary {
  reasons: string[];
}

/**
 * Suggestions simples fondées uniquement sur les attributs renseignés dans le catalogue.
 * Ce ne sont pas des analyses olfactives ni une garantie de satisfaction.
 */
export async function suggestProducts(
  criteria: { family?: string; gender?: Gender; budgetMax?: number },
  store: Store = getStore(),
): Promise<Suggestion[]> {
  const products = (await store.listProducts()).filter((p) => p.isActive);
  const summaries = await summarizeProducts(store, products);
  const family = criteria.family ? normalize(criteria.family) : null;

  const scored: { suggestion: Suggestion; score: number }[] = [];
  for (const summary of summaries) {
    if (criteria.budgetMax !== undefined && summary.minPrice > criteria.budgetMax) {
      continue;
    }
    const reasons: string[] = [];
    let score = 0;
    if (family && normalize(summary.product.family ?? '') === family) {
      score += 2;
      reasons.push(`Gamme ${summary.product.family}`);
    }
    if (criteria.gender && (summary.product.gender === criteria.gender || summary.product.gender === 'mixte')) {
      score += 1;
      reasons.push('Correspond à votre choix de style');
    }
    if (criteria.budgetMax !== undefined) {
      reasons.push('Dans votre budget');
    }
    if (summary.product.isFeatured) {
      score += 0.5;
    }
    if (!summary.inStock) {
      score -= 3;
    }
    scored.push({ suggestion: { ...summary, reasons }, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((entry) => entry.suggestion);
}
