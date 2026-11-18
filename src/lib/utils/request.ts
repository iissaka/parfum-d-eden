/** Identifie le client pour la limitation de débit (IP derrière le proxy, sinon « inconnu »). */
export function clientKeyFrom(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim();
  return ip && ip.length > 0 && ip.length <= 64 ? ip : 'inconnu';
}
