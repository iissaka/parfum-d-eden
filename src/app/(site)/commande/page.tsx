import type { Metadata } from 'next';
import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import type { ReactNode } from 'react';
import { placeOrderAction } from '@/actions/checkout';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { ShieldIcon, TruckIcon, WalletIcon } from '@/components/ui/Icons';
import { Notice } from '@/components/ui/Notice';
import { ProductImage } from '@/components/product/ProductImage';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { readCart } from '@/lib/cart/cart-cookie';
import { buildCartView } from '@/lib/cart/cart-view';
import { CHECKOUT_MESSAGES, type CheckoutErrorCode } from '@/lib/orders/checkout';
import { getEnabledPaymentMethods } from '@/lib/config';
import { formatPrice } from '@/lib/utils/money';
import { getStore } from '@/lib/store';
import { firstParam, type SearchParams } from '@/lib/catalog/search-params';

export const metadata: Metadata = {
  title: 'Commande',
  robots: { index: false, follow: false },
};

const PAYMENT_LABELS = {
  cash_on_delivery: { label: 'Paiement à la livraison', hint: 'Vous réglez à la réception de votre commande.' },
  mobile_money: { label: 'Mobile money', hint: 'Paiement depuis votre téléphone.' },
  card: { label: 'Carte bancaire', hint: 'Paiement sécurisé par carte.' },
} as const;

function Section({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="card">
      <legend className="sr-only">{title}</legend>
      <div className="mb-6 flex items-center gap-3" aria-hidden="true">
        <span className="step-dot">{step}</span>
        <span className="font-serif text-2xl text-plum">{title}</span>
      </div>
      {children}
    </fieldset>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="container-page max-w-xl py-20 text-center">{children}</div>;
}

export default async function CommandePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const errorCode = firstParam(params, 'erreur') as CheckoutErrorCode | undefined;
  const cart = await buildCartView(await readCart());

  if (cart.lines.length === 0) {
    return (
      <EmptyState>
        <h1 className="heading">Commande</h1>
        <p className="mt-4">Votre panier est vide.</p>
        <Link href="/boutique" className="btn-primary mt-8">Découvrir la boutique</Link>
      </EmptyState>
    );
  }
  if (cart.blocking) {
    return (
      <EmptyState>
        <h1 className="heading">Commande</h1>
        <div className="mt-6 text-left">
          <Notice tone="error">Certains articles ne sont plus disponibles en quantité suffisante.</Notice>
        </div>
        <Link href="/panier" className="btn-primary mt-8">Revoir le panier</Link>
      </EmptyState>
    );
  }

  const zones = await getStore().listZones();
  const methods = getEnabledPaymentMethods();
  const activeZones = zones.filter((z) => z.isActive);
  // Clé d'idempotence générée à chaque affichage : un double clic renvoie la même commande.
  const idempotencyKey = randomUUID();

  return (
    <div className="container-page py-10 md:py-14">
      <CheckoutSteps current={2} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <div>
          <h1 className="heading">Finaliser ma commande</h1>
          <p className="mt-2 text-sm">
            Commande en tant qu’invité, sans création de compte. Les champs marqués d’un * sont obligatoires.
          </p>

          {errorCode && (
            <div className="mt-6">
              <Notice tone="error">{CHECKOUT_MESSAGES[errorCode] ?? CHECKOUT_MESSAGES.erreur_interne}</Notice>
            </div>
          )}

          <form action={placeOrderAction} className="mt-8 space-y-6">
            <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

            <Section step={1} title="Coordonnées">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label" htmlFor="name">Nom complet *</label>
                  <input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="phone">Téléphone *</label>
                  <input id="phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" placeholder="+33 6 12 34 56 78" className="field" />
                  <p className="hint">Obligatoire pour la livraison. Avec l’indicatif du pays (ex. +227, +33).</p>
                </div>
                <div className="md:col-span-2">
                  <label className="label" htmlFor="email">E-mail (facultatif)</label>
                  <input id="email" name="email" type="email" autoComplete="email" className="field" />
                </div>
              </div>
            </Section>

            <Section step={2} title="Livraison">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label" htmlFor="zoneId">Zone de livraison *</label>
                  <select id="zoneId" name="zoneId" required className="field" defaultValue="">
                    <option value="" disabled>Choisir une zone</option>
                    {activeZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} — {formatPrice(zone.fee)}
                        {zone.freeShippingFrom !== null ? ` (offerte dès ${formatPrice(zone.freeShippingFrom)})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="hint">Les frais exacts sont appliqués et recalculés par le serveur à la validation.</p>
                </div>
                <div>
                  <label className="label" htmlFor="district">Quartier *</label>
                  <input id="district" name="district" required minLength={2} maxLength={120} className="field" />
                </div>
                <div className="md:col-span-2">
                  <label className="label" htmlFor="address">Adresse et repères *</label>
                  <textarea id="address" name="address" required minLength={5} maxLength={300} rows={3} className="field" placeholder="Rue, bâtiment, point de repère proche…" />
                </div>
                <div className="md:col-span-2">
                  <label className="label" htmlFor="notes">Instructions de livraison (facultatif)</label>
                  <input id="notes" name="notes" maxLength={300} className="field" placeholder="Horaires, accès…" />
                </div>
              </div>
            </Section>

            <Section step={3} title="Paiement">
              <div className="grid gap-3">
                {methods.map((method, index) => (
                  <label key={method} className="option-tile justify-start">
                    <input type="radio" name="paymentMethod" value={method} required defaultChecked={index === 0} className="h-4 w-4 accent-plum" />
                    <WalletIcon width={22} height={22} className="text-plum" />
                    <span>
                      <span className="block font-medium">{PAYMENT_LABELS[method].label}</span>
                      <span className="block text-xs">{PAYMENT_LABELS[method].hint}</span>
                    </span>
                  </label>
                ))}
                {methods.length === 0 && <p>Aucun mode de paiement n’est disponible actuellement.</p>}
              </div>
            </Section>

            <Section step={4} title="Code promotionnel">
              <div className="max-w-xs">
                <label className="label" htmlFor="promoCode">Code (facultatif)</label>
                <input id="promoCode" name="promoCode" maxLength={40} autoCapitalize="characters" className="field uppercase" />
                <p className="hint">La remise est vérifiée et appliquée à la validation.</p>
              </div>
            </Section>

            <div className="space-y-3 rounded-2xl border border-petal p-5 text-sm">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" name="termsAccepted" required className="mt-0.5 h-4 w-4 accent-plum" />
                <span>
                  J’ai lu et j’accepte les{' '}
                  <Link href="/cgv" className="link">conditions générales de vente</Link> *
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" name="newsletter" className="mt-0.5 h-4 w-4 accent-plum" />
                <span>Je souhaite recevoir les nouveautés par e-mail (facultatif, non coché par défaut).</span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/panier" className="link text-center text-sm">Retour au panier</Link>
              <SubmitButton className="w-full sm:w-auto sm:min-w-[16rem]">Valider ma commande</SubmitButton>
            </div>
          </form>
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit" aria-labelledby="recap">
          <div className="card space-y-5">
            <h2 id="recap" className="font-serif text-2xl">Récapitulatif</h2>
            <ul className="space-y-4">
              {cart.lines.map((line) => (
                <li key={line.variantId} className="flex items-center gap-3 text-sm">
                  <div className="relative w-14 shrink-0">
                    <ProductImage slug={line.productSlug} name={line.productName} compact sizes="56px" className="rounded-lg" />
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-plum px-1 text-[0.65rem] text-canvas">
                      {line.quantity}
                    </span>
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{line.productName}</span>
                    {line.format && <span className="block text-xs">{line.format}</span>}
                  </span>
                  <span className="shrink-0">{formatPrice(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-petal pt-4 text-sm">
              <div className="flex justify-between">
                <dt>Sous-total</dt>
                <dd className="font-medium">{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Livraison</dt>
                <dd>Selon la zone</dd>
              </div>
            </dl>
            <p className="text-xs leading-relaxed">
              Frais de livraison selon la zone choisie, remise éventuelle : le total exact est calculé et enregistré par le serveur à la validation.
            </p>
            <ul className="space-y-2 border-t border-petal pt-4 text-xs">
              <li className="flex items-center gap-2"><TruckIcon width={16} height={16} className="text-plum" /> Livraison dans la zone choisie</li>
              <li className="flex items-center gap-2"><ShieldIcon width={16} height={16} className="text-plum" /> Prix et stocks vérifiés à la validation</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
