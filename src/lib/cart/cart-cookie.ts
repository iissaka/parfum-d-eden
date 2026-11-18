import { cookies } from 'next/headers';
import { z } from 'zod';
import { mergeCartLines, type CartLine } from '@/lib/domain/cart';
import { cartLineSchema } from '@/lib/domain/validation';

// Lecture / écriture du panier dans un cookie httpOnly. Le cookie ne contient
// que des identifiants et des quantités : les prix sont recalculés côté serveur.
export const CART_COOKIE = 'pe_cart';
const CART_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function parseCartCookie(raw: string | undefined): CartLine[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = z.array(cartLineSchema).max(20).safeParse(JSON.parse(raw));
    return parsed.success ? mergeCartLines(parsed.data) : [];
  } catch {
    return [];
  }
}

export async function readCart(): Promise<CartLine[]> {
  const store = await cookies();
  return parseCartCookie(store.get(CART_COOKIE)?.value);
}

export async function writeCart(lines: CartLine[]): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, JSON.stringify(mergeCartLines(lines)), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CART_MAX_AGE_SECONDS,
  });
}
