/**
 * Les montants sont stockés et calculés en FCFA (XOF), entiers.
 * L'affichage en euros utilise la parité fixe officielle : 1 € = 655,957 FCFA.
 */
export const XOF_PER_EUR = 655.957;

/** Formate un montant entier en FCFA, par exemple « 25 000 FCFA ». */
export function formatFcfa(amount: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`;
}

/** Convertit un montant FCFA en euros, arrondi au centime. */
export function xofToEur(amount: number): number {
  return Math.round((amount / XOF_PER_EUR) * 100) / 100;
}

/** Formate un montant FCFA en euros, par exemple « 38,11 € ». */
export function formatEur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(xofToEur(amount));
}

/** Double affichage, par exemple « 38,11 € · 25 000 FCFA ». */
export function formatPrice(amount: number): string {
  return `${formatEur(amount)} · ${formatFcfa(amount)}`;
}

/** Vérifie qu'un montant est un entier positif (pas de décimales en FCFA). */
export function assertXof(amount: number, label = 'montant'): void {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError(`${label} invalide : entier positif attendu`);
  }
}
