// Limitation de débit en mémoire. Suffisante pour une seule instance.
// En production multi-instances, remplacer par un stockage partagé (ex. Redis ou table Supabase).

const buckets = new Map<string, number[]>();

/** Retourne true si l'action est autorisée, et enregistre la tentative. */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

export function resetRateLimit(): void {
  buckets.clear();
}
