// Logique pure du panier. Le cookie ne contient que des identifiants et des quantités :
// les prix sont toujours relus côté serveur.

export const MAX_LINE_QUANTITY = 20;
export const MAX_CART_LINES = 20;

export interface CartLine {
  /** Identifiant de variante. */
  v: string;
  /** Quantité. */
  q: number;
}

/** Fusionne les lignes identiques et applique les plafonds. */
export function mergeCartLines(lines: CartLine[]): CartLine[] {
  const totals = new Map<string, number>();
  for (const line of lines) {
    const next = Math.min(MAX_LINE_QUANTITY, (totals.get(line.v) ?? 0) + line.q);
    totals.set(line.v, next);
  }
  return [...totals.entries()]
    .slice(0, MAX_CART_LINES)
    .map(([v, q]) => ({ v, q }));
}

/** Définit la quantité d'une variante ; une quantité nulle retire la ligne. */
export function setCartLine(lines: CartLine[], variantId: string, quantity: number): CartLine[] {
  const others = lines.filter((line) => line.v !== variantId);
  if (quantity <= 0) {
    return others;
  }
  return mergeCartLines([...others, { v: variantId, q: Math.min(quantity, MAX_LINE_QUANTITY) }]);
}

export function countCartItems(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.q, 0);
}
