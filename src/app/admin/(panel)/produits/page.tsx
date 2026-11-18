import { updatePriceAction, updateStockAction } from '@/app/admin/actions';
import { requireAdmin } from '@/lib/auth/guard';
import { hasPermission } from '@/lib/auth/permissions';
import { formatFcfa } from '@/lib/utils/money';
import { getStore } from '@/lib/store';

export const metadata = { title: 'Produits et stocks' };

export default async function ProduitsPage() {
  const session = await requireAdmin('orders:read');
  const store = getStore();
  const products = await store.listProducts();
  const variants = await store.listVariants();
  const canStock = hasPermission(session.role, 'stock:write');
  const canPrice = hasPermission(session.role, 'catalog:write');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Produits et stocks</h1>
        <p className="mt-2 text-sm">
          Modification des prix et des stocks par variante. La création et la suppression de produits ne sont pas encore implémentées.
        </p>
      </div>

      {products.map((product) => (
        <section key={product.id} className="card space-y-4" aria-labelledby={`p-${product.id}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id={`p-${product.id}`} className="font-serif text-2xl">{product.name}</h2>
            <p className="text-xs">
              {product.gender} · {product.family ?? 'famille non renseignée'} · {product.isActive ? 'publié' : 'masqué'}
            </p>
          </div>

          <ul className="divide-y divide-petal">
            {variants.filter((v) => v.productId === product.id).map((variant) => (
              <li key={variant.id} className="grid gap-4 py-4 md:grid-cols-[1fr_auto_auto] md:items-end">
                <div className="text-sm">
                  <p className="font-medium">{variant.format}</p>
                  <p className="font-mono text-xs">{variant.sku} · {formatFcfa(variant.priceXof)}</p>
                </div>

                <form action={updateStockAction} className="flex items-end gap-2">
                  <input type="hidden" name="variantId" value={variant.id} />
                  <div>
                    <label className="label" htmlFor={`stock-${variant.id}`}>Stock</label>
                    <input id={`stock-${variant.id}`} name="stock" type="number" min={0} max={100000} defaultValue={variant.stock} disabled={!canStock} className="field w-28 py-2" />
                  </div>
                  <button type="submit" disabled={!canStock} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Enregistrer</button>
                </form>

                <form action={updatePriceAction} className="flex items-end gap-2">
                  <input type="hidden" name="variantId" value={variant.id} />
                  <div>
                    <label className="label" htmlFor={`price-${variant.id}`}>Prix (FCFA)</label>
                    <input id={`price-${variant.id}`} name="priceXof" type="number" min={0} step={100} defaultValue={variant.priceXof} disabled={!canPrice} className="field w-36 py-2" />
                  </div>
                  <button type="submit" disabled={!canPrice} className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">Enregistrer</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
