'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { readCart, writeCart } from '@/lib/cart/cart-cookie';
import { MAX_LINE_QUANTITY, setCartLine } from '@/lib/domain/cart';
import { getStore } from '@/lib/store';

const addSchema = z.object({
  variantId: z.string().min(1).max(64),
  quantity: z.coerce.number().int().min(1).max(MAX_LINE_QUANTITY),
});

const updateSchema = z.object({
  variantId: z.string().min(1).max(64),
  quantity: z.coerce.number().int().min(0).max(MAX_LINE_QUANTITY),
});

/** Ajout au panier : le stock est vérifié ici, et à nouveau à la commande. */
export async function addToCartAction(formData: FormData): Promise<void> {
  const parsed = addSchema.safeParse({
    variantId: formData.get('variantId'),
    quantity: formData.get('quantity'),
  });
  if (!parsed.success) {
    redirect('/boutique');
  }
  const { variantId, quantity } = parsed.data;

  const store = getStore();
  const variant = await store.getVariantById(variantId);
  const product = variant ? await store.getProductById(variant.productId) : null;
  if (!variant || !product || !variant.isActive || !product.isActive) {
    redirect('/boutique');
  }

  const current = await readCart();
  const alreadyInCart = current.find((line) => line.v === variant.id)?.q ?? 0;
  if (alreadyInCart + quantity > variant.stock) {
    redirect(`/parfum/${product.slug}?erreur=stock`);
  }

  await writeCart(setCartLine(current, variant.id, alreadyInCart + quantity));
  revalidatePath('/panier');
  redirect(`/parfum/${product.slug}?ajoute=1`);
}

/** Modifie la quantité d'une ligne ; 0 retire l'article. */
export async function updateCartLineAction(formData: FormData): Promise<void> {
  const parsed = updateSchema.safeParse({
    variantId: formData.get('variantId'),
    quantity: formData.get('quantity'),
  });
  if (!parsed.success) {
    return;
  }
  const current = await readCart();
  await writeCart(setCartLine(current, parsed.data.variantId, parsed.data.quantity));
  revalidatePath('/panier');
}
