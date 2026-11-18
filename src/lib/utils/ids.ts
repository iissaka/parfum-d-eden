import { randomInt } from 'node:crypto';

// Alphabet sans caractères ambigus (0/O, 1/I).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Référence publique de commande, non séquentielle et difficile à deviner. */
export function generateOrderReference(): string {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `PE-${code}`;
}
