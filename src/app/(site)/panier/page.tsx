import type { Metadata } from 'next';
import Link from 'next/link';
import { updateCartLineAction } from '@/actions/cart';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { ArrowRightIcon, BagIcon, ShieldIcon, TrashIcon } from '@/components/ui/Icons';
import { Notice } from '@/components/ui/Notice';
import { ProductImage } from '@/components/product/ProductImage';
import { Price } from '@/components/ui/Price';
import { readCart } from '@/lib/cart/cart-cookie';
import { buildCartView } from '@/lib/cart/cart-view';
import { formatPrice } from '@/lib/utils/money';
import { MAX_LINE_QUANTITY } from '@/lib/domain/cart';
import { getShopInfo } from '@/lib/catalog/shop-info';

export const metadata: Metadata = {
  title: 'Panier',
  robots: { index: false, follow: false },
};

export default async function PanierPage() {
  const [view, info] = await Promise.all([readCart().then(buildCartView), getShopInfo()]);

  if (view.lines.length === 0) {
    return (
      <div className="container-page flex flex-col items-center py-20 text-center md:py-28">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-petal-light text-plum">
          <BagIcon width={32} height={32} />
        </span>
        <h1 className="heading mt-6">Votre panier</h1>
        <p className="mt-3 max-w-sm">Votre panier est vide.</p>
        <p className="mt-1 max-w-sm text-sm">Découvrez nos parfums ou laissez-vous guider par notre questionnaire.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/boutique" className="btn-primary">Découvrir la boutique</Link>
          <Link href="/trouver-mon-parfum" className="btn-secondary">Trouver mon parfum</Link>
        </div>
      </div>
    );
  }

  const free = info.freeShipping;
  const remaining = free ? Math.max(0, free.amount - view.subtotal) : 0;
  const progress = free ? Math.min(100, Math.round((view.subtotal / free.amount) * 100)) : 0;

  return (
    <div className="container-page py-10 md:py-14">
      <CheckoutSteps current={1} />

      <div className="mt-10 flex items-baseline justify-between gap-4">
        <h1 className="heading">Votre panier</h1>
        <p className="text-sm">{view.itemCount} article{view.itemCount > 1 ? 's' : ''}</p>
      </div>

      {view.blocking && (
        <div className="mt-6">
          <Notice tone="error">
            Certains articles ne sont plus disponibles en quantité suffisante. Ajustez votre panier avant de commander.
          </Notice>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <ul className="divide-y divide-petal border-y border-petal">
          {view.lines.map((line) => (
            <li key={line.variantId} className="flex gap-4 py-6 md:gap-6">
              <div className="w-20 shrink-0 md:w-28">
                <ProductImage slug={line.productSlug} name={line.productName} compact sizes="112px" className="rounded-xl" />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    {line.productSlug ? (
                      <Link href={`/parfum/${line.productSlug}`} className="font-serif text-xl text-plum hover:underline hover:underline-offset-4 md:text-2xl">
                        {line.productName}
                      </Link>
                    ) : (
                      <p className="font-serif text-xl text-plum md:text-2xl">{line.productName}</p>
                    )}
                    {line.format && (
                      <p className="mt-1 text-sm">{line.format} · {formatPrice(line.unitPriceXof)} l’unité</p>
                    )}
                    {line.status === 'stock_insuffisant' && (
                      <p className="mt-2 text-sm font-medium" role="alert">
                        Stock disponible : {line.availableStock}. Réduisez la quantité.
                      </p>
                    )}
                    {line.status === 'indisponible' && (
                      <p className="mt-2 text-sm font-medium" role="alert">Cet article n’est plus disponible.</p>
                    )}
                  </div>
                  <p className="shrink-0 text-right"><Price xof={line.lineTotal} className="flex-col items-end" /></p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <form action={updateCartLineAction} className="flex items-center gap-2">
                    <input type="hidden" name="variantId" value={line.variantId} />
                    <label className="sr-only" htmlFor={`qty-${line.variantId}`}>Quantité de {line.productName}</label>
                    <select id={`qty-${line.variantId}`} name="quantity" defaultValue={line.quantity} className="field w-20 py-2">
                      {Array.from({ length: MAX_LINE_QUANTITY + 1 }, (_, i) => i).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn-secondary btn-sm">Mettre à jour</button>
                  </form>
                  <form action={updateCartLineAction}>
                    <input type="hidden" name="variantId" value={line.variantId} />
                    <input type="hidden" name="quantity" value="0" />
                    <button type="submit" className="inline-flex items-center gap-1.5 text-xs text-plum hover:underline hover:underline-offset-4">
                      <TrashIcon width={14} height={14} /> Retirer
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside aria-labelledby="summary" className="lg:sticky lg:top-28 lg:h-fit">
          <div className="card space-y-5">
            <h2 id="summary" className="font-serif text-2xl">Récapitulatif</h2>

            {free && (
              <div className="space-y-2">
                <p className="text-sm">
                  {remaining > 0 ? (
                    <>Plus que <span className="font-medium">{formatPrice(remaining)}</span> pour la livraison offerte ({free.zoneName}).</>
                  ) : (
                    <>Livraison offerte atteinte pour la zone {free.zoneName}.</>
                  )}
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-petal" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progression vers la livraison offerte">
                  <div className="h-full rounded-full bg-plum" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <dl className="space-y-2 border-t border-petal pt-4 text-sm">
              <div className="flex justify-between">
                <dt>Sous-total ({view.itemCount} article{view.itemCount > 1 ? 's' : ''})</dt>
                <dd className="font-medium">{formatPrice(view.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Livraison</dt>
                <dd>Selon la zone</dd>
              </div>
            </dl>
            <div className="flex items-baseline justify-between border-t border-petal pt-4">
              <span className="font-serif text-xl text-plum">Total estimé</span>
              <Price xof={view.subtotal} className="flex-col items-end font-serif text-3xl text-plum" />
            </div>
            <p className="text-xs leading-relaxed">
              Frais de livraison et remise éventuelle : calculés à l’étape de commande.
            </p>

            {view.blocking ? (
              <span className="btn-primary w-full cursor-not-allowed opacity-50" aria-disabled="true">Commander</span>
            ) : (
              <Link href="/commande" className="btn-primary w-full">
                Commander <ArrowRightIcon width={16} height={16} />
              </Link>
            )}
            <Link href="/boutique" className="link block text-center text-sm">Continuer mes achats</Link>

            <p className="flex items-center gap-2 border-t border-petal pt-4 text-xs">
              <ShieldIcon width={18} height={18} className="shrink-0 text-plum" />
              Prix et stocks vérifiés par le serveur à la validation.
              {info.cashOnDelivery && ' Paiement à la livraison.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
