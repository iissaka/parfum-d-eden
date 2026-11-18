import { MemoryStore } from './memory';
import { createSeed } from './seed';
import type { Store } from './types';

export { PromotionUnavailableError, StockError } from './types';
export type { Store } from './types';

// Stocké sur globalThis pour survivre aux rechargements à chaud de Next.js en développement.
const globalForStore = globalThis as unknown as { __peStore?: Store; __peWarned?: boolean };

/**
 * Retourne l'accès aux données configuré.
 * Par défaut : MemoryStore avec des données d'exemple FICTIVES.
 * En production, brancher ici le SupabaseStore (voir docs/ARCHITECTURE.md).
 */
export function getStore(): Store {
  if (!globalForStore.__peStore) {
    if (process.env.NODE_ENV === 'production' && !globalForStore.__peWarned) {
      globalForStore.__peWarned = true;
      console.warn(
        '[store] Stockage en mémoire actif en production : les données ne sont pas persistantes.',
      );
    }
    globalForStore.__peStore = new MemoryStore(createSeed());
  }
  return globalForStore.__peStore;
}
