import type { CartLine } from '@/lib/domain/cart';
import { computeSubtotal } from '@/lib/domain/pricing';
import { getStore, type Store } from '@/lib/store';

export type CartLineStatus = 'ok' | 'stock_insuffisant' | 'indisponible';

export interface CartViewLine {
  variantId: string;
  productName: string;
  productSlug: string | null;
  format: string;
  sku: string;
  unitPriceXof: number;
  quantity: number;
  availableStock: number;
  lineTotal: number;
  status: CartLineStatus;
}

export interface CartView {
  lines: CartViewLine[];
  /** Sous-total des lignes disponibles, recalculé à partir des prix serveur. */
  subtotal: number;
  /** Vrai si au moins une ligne bloque la commande. */
  blocking: boolean;
  itemCount: number;
}

/** Reconstruit le panier à partir des prix et stocks serveur. Jamais à partir du navigateur. */
export async function buildCartView(lines: CartLine[], store: Store = getStore()): Promise<CartView> {
  const viewLines: CartViewLine[] = [];

  for (const line of lines) {
    const variant = await store.getVariantById(line.v);
    const product = variant ? await store.getProductById(variant.productId) : null;

    if (!variant || !product || !variant.isActive || !product.isActive) {
      viewLines.push({
        variantId: line.v,
        productName: 'Article indisponible',
        productSlug: null,
        format: '',
        sku: '',
        unitPriceXof: 0,
        quantity: line.q,
        availableStock: 0,
        lineTotal: 0,
        status: 'indisponible',
      });
      continue;
    }

    const status: CartLineStatus = variant.stock >= line.q ? 'ok' : 'stock_insuffisant';
    viewLines.push({
      variantId: variant.id,
      productName: product.name,
      productSlug: product.slug,
      format: variant.format,
      sku: variant.sku,
      unitPriceXof: variant.priceXof,
      quantity: line.q,
      availableStock: variant.stock,
      lineTotal: variant.priceXof * line.q,
      status,
    });
  }

  const orderable = viewLines.filter((l) => l.status === 'ok');
  return {
    lines: viewLines,
    subtotal: computeSubtotal(orderable.map((l) => ({ unitPriceXof: l.unitPriceXof, quantity: l.quantity }))),
    blocking: viewLines.some((l) => l.status !== 'ok'),
    itemCount: viewLines.reduce((sum, l) => sum + l.quantity, 0),
  };
}
