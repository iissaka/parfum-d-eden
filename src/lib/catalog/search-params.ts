import { GENDERS, type Gender } from '@/lib/domain/types';
import type { CatalogFilters, SortKey } from '@/lib/catalog/catalog';

export type SearchParams = Record<string, string | string[] | undefined>;

const SORTS: readonly SortKey[] = ['nouveautes', 'prix_croissant', 'prix_decroissant', 'nom'];

export function firstParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  const single = Array.isArray(value) ? value[0] : value;
  const trimmed = single?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseCatalogFilters(params: SearchParams): CatalogFilters {
  const genre = firstParam(params, 'genre');
  const sort = firstParam(params, 'tri');
  const maxPrice = Number(firstParam(params, 'prix_max'));
  return {
    q: firstParam(params, 'q')?.slice(0, 80),
    gender: (GENDERS as readonly string[]).includes(genre ?? '') ? (genre as Gender) : undefined,
    family: firstParam(params, 'famille')?.slice(0, 60),
    maxPrice: Number.isSafeInteger(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
    sort: (SORTS as readonly string[]).includes(sort ?? '') ? (sort as SortKey) : 'nouveautes',
    collectionSlug: firstParam(params, 'collection')?.slice(0, 64),
  };
}
