'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CheckoutError, placeOrder } from '@/lib/orders/checkout';
import { readCart, writeCart } from '@/lib/cart/cart-cookie';
import { clientKeyFrom } from '@/lib/utils/request';

/**
 * Validation de la commande. Toute erreur renvoie un code générique vers le formulaire,
 * sans détail technique.
 */
export async function placeOrderAction(formData: FormData): Promise<void> {
  const clientKey = clientKeyFrom(await headers());
  const input = Object.fromEntries(formData.entries());
  const cart = await readCart();

  let reference: string;
  try {
    const placed = await placeOrder(input, cart, clientKey);
    reference = placed.reference;
  } catch (error) {
    if (error instanceof CheckoutError) {
      redirect(`/commande?erreur=${error.code}`);
    }
    console.error('[checkout] erreur inattendue');
    redirect('/commande?erreur=erreur_interne');
  }

  await writeCart([]);
  redirect(`/commande/confirmation?ref=${reference}`);
}
