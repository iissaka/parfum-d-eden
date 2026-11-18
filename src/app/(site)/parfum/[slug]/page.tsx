import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addToCartAction } from '@/actions/cart';
import { ArrowRightIcon, ChevronRightIcon } from '@/components/ui/Icons';
import { Notice } from '@/components/ui/Notice';
import { LineVideoSection } from '@/components/media/LineVideoSection';
import { ProductImage } from '@/components/product/ProductImage';
import { Price } from '@/components/ui/Price';
import { ProductGrid } from '@/components/product/ProductCard';
import { reassuranceItems } from '@/components/marketing/Reassurance';
import { getProductView, searchCatalog } from '@/lib/catalog/catalog';
import { formatPrice } from '@/lib/utils/money';
import { siteUrl } from '@/lib/config';
import { GENDERS } from '@/lib/domain/types';
import { type SearchParams } from '@/lib/catalog/search-params';
import { getShopInfo } from '@/lib/catalog/shop-info';

type Params = { slug: string };

const GENDER_LABELS: Record<(typeof GENDERS)[number], string> = {
  femme: 'Femme',
  homme: 'Homme',
  mixte: 'Mixte',
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const view = await getProductView(slug);
  if (!view) {
    return { title: 'Parfum introuvable' };
  }
  return {
    title: view.product.name,
    description: view.product.description ?? `${view.product.name}, ${view.product.family ?? 'parfum'} : formats et disponibilité.`,
    alternates: { canonical: `${siteUrl()}/parfum/${view.product.slug}` },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const view = await getProductView(slug);
  if (!view) {
    notFound();
  }
  const { product, variants } = view;
  const prices = variants.map((v) => v.priceXof);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const anyInStock = variants.some((v) => v.stock > 0);
  const firstAvailableId = variants.find((v) => v.stock > 0)?.id;

  // « Vous aimerez aussi » : même famille d'abord, complété par les nouveautés.
  const [info, sameFamily, others] = await Promise.all([
    getShopInfo(),
    product.family ? searchCatalog({ family: product.family }) : Promise.resolve([]),
    searchCatalog({ sort: 'nouveautes' }),
  ]);
  const related = [...sameFamily, ...others]
    .filter((s, i, all) => s.product.id !== product.id && all.findIndex((o) => o.product.id === s.product.id) === i)
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    brand: { '@type': 'Brand', name: 'Le Parfum d’Eden' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'XOF',
      lowPrice: prices.length ? minPrice : undefined,
      highPrice: prices.length ? maxPrice : undefined,
      offerCount: variants.length,
      availability: anyInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <div className="container-page pt-6 md:pt-8">
        <nav aria-label="Fil d’Ariane">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs">
            <li><Link href="/" className="link">Accueil</Link></li>
            <li aria-hidden="true"><ChevronRightIcon width={12} height={12} className="text-plum" /></li>
            <li><Link href="/boutique" className="link">Boutique</Link></li>
            <li aria-hidden="true"><ChevronRightIcon width={12} height={12} className="text-plum" /></li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>
      </div>

      <div className="container-page grid gap-10 py-8 md:grid-cols-2 md:gap-14 lg:gap-20">
        {/* Visuel */}
        <div className="md:sticky md:top-28 md:h-fit">
          <div className="relative animate-scale-in">
            <ProductImage
              slug={product.slug}
              name={product.name}
              line={product.family}
              darkCap={product.gender === 'homme'}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="rounded-3xl [&>svg]:animate-float"
            />
            {product.isNew && <span className="badge absolute left-4 top-4 bg-plum text-canvas">Nouveau</span>}
          </div>
        </div>

        {/* Informations et achat */}
        <div className="animate-fade-up [animation-delay:150ms]">
          <p className="eyebrow text-plum">
            {[product.family ? `Gamme ${product.family}` : null, GENDER_LABELS[product.gender]].filter(Boolean).join(' · ')}
          </p>
          <h1 className="display mt-3">{product.name}</h1>
          <p className="mt-4 text-2xl text-ink-soft">
            {prices.length === 0 ? 'Prix à venir' : <Price xof={minPrice} from={minPrice !== maxPrice} />}
          </p>
          <p className="mt-6 max-w-prose leading-relaxed">
            {product.description ?? <span className="italic">Description à venir.</span>}
          </p>

          {query.ajoute && (
            <div className="mt-6 space-y-3">
              <Notice tone="success">Article ajouté au panier.</Notice>
              <div className="flex flex-wrap gap-3">
                <Link href="/panier" className="btn-primary btn-sm">Voir le panier</Link>
                <Link href="/boutique" className="btn-secondary btn-sm">Continuer mes achats</Link>
              </div>
            </div>
          )}
          {query.erreur === 'stock' && (
            <div className="mt-6">
              <Notice tone="error">Cette quantité n’est pas disponible.</Notice>
            </div>
          )}

          {variants.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-petal p-6">Aucun format disponible pour le moment.</p>
          ) : (
            <form action={addToCartAction} className="mt-8 space-y-6 border-t border-petal pt-8">
              <fieldset>
                <legend className="label">Format</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {variants.map((variant) => {
                    const available = variant.stock > 0;
                    const low = available && variant.stock <= 3;
                    return (
                      <label key={variant.id} className="option-tile">
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="variantId"
                            value={variant.id}
                            defaultChecked={variant.id === firstAvailableId}
                            disabled={!available}
                            className="h-4 w-4 accent-plum"
                          />
                          <span className="font-medium">{variant.format}</span>
                        </span>
                        <span className="text-right">
                          <Price xof={variant.priceXof} className="justify-end" />
                          <span className={`block text-xs ${available ? 'text-ink' : 'text-plum'}`}>
                            {!available ? 'Épuisé' : low ? `Plus que ${variant.stock}` : 'Disponible'}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="flex items-end gap-3">
                <div className="w-28 shrink-0">
                  <label className="label" htmlFor="quantity">Quantité</label>
                  <select id="quantity" name="quantity" defaultValue="1" className="field">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary min-h-[3.25rem] flex-1" disabled={!anyInStock}>
                  {anyInStock ? 'Ajouter au panier' : 'Épuisé'}
                </button>
              </div>
            </form>
          )}

          {/* Réassurance */}
          <ul className="mt-8 grid gap-3 rounded-2xl bg-white/70 p-5 ring-1 ring-petal sm:grid-cols-2">
            {reassuranceItems(info).slice(0, 3).map((item) => (
              <li key={item.title} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 text-plum">{item.icon}</span>
                <span>
                  <span className="block font-medium text-plum">{item.title}</span>
                  <span className="text-xs leading-relaxed">{item.text}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* Détails */}
          <div className="mt-8 border-t border-petal">
            <details className="accordion" open>
              <summary>Caractéristiques</summary>
              <div className="pb-5 text-sm leading-relaxed">
                <dl className="grid grid-cols-[8rem_1fr] gap-y-2">
                  <dt className="text-plum">Univers</dt>
                  <dd>{GENDER_LABELS[product.gender]}</dd>
                  {product.family && (
                    <>
                      <dt className="text-plum">Gamme</dt>
                      <dd>{product.family}</dd>
                    </>
                  )}
                  <dt className="text-plum">Formats</dt>
                  <dd>{variants.map((v) => v.format).join(', ') || '—'}</dd>
                </dl>
              </div>
            </details>
            <details className="accordion">
              <summary>Livraison et retours</summary>
              <div className="pb-5 text-sm leading-relaxed">
                <ul className="space-y-1">
                  {info.zones.map((z) => (
                    <li key={z.id}>
                      {z.name} : {formatPrice(z.fee)}
                      {z.freeShippingFrom !== null && `, offerte dès ${formatPrice(z.freeShippingFrom)}`}
                      {z.delayText && ` · ${z.delayText}`}
                    </li>
                  ))}
                  {info.zones.length === 0 && <li>Zones de livraison à confirmer.</li>}
                </ul>
                <Link href="/livraison" className="link mt-3 inline-block">Voir la page dédiée</Link>
              </div>
            </details>
            {view.collections.length > 0 && (
              <details className="accordion">
                <summary>Collections</summary>
                <div className="flex flex-wrap gap-2 pb-5">
                  {view.collections.map((c) => (
                    <Link key={c.id} href={`/collections/${c.slug}`} className="chip">{c.name}</Link>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </div>

      <LineVideoSection line={product.family} className="container-page pb-6 pt-4" />

      {related.length > 0 && (
        <section className="paper mt-8 bg-petal" aria-labelledby="related">
          <div className="container-page section">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-plum">À découvrir aussi</p>
                <h2 id="related" className="heading mt-2">Vous aimerez aussi</h2>
              </div>
              <Link href="/boutique" className="group inline-flex items-center gap-2 text-sm font-medium text-plum">
                <span className="link">Toute la boutique</span>
                <ArrowRightIcon width={16} height={16} className="transition group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-10">
              <ProductGrid items={related} />
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  );
}
