import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Blossoms } from '@/components/home/Blossoms';
import { Pedestal } from '@/components/product/Pedestal';
import { ProductImage } from '@/components/product/ProductImage';
import { ArrowRightIcon, PackageIcon, WalletIcon, SparkleIcon } from '@/components/ui/Icons';
import { NewsletterForm } from '@/components/marketing/NewsletterForm';
import { Price } from '@/components/ui/Price';
import { ProductTabs } from '@/components/product/ProductTabs';
import { reassuranceItems } from '@/components/marketing/Reassurance';
import { Reveal } from '@/components/ui/Reveal';
import { summarizeProducts, type ProductSummary } from '@/lib/catalog/catalog';
import { getShopInfo } from '@/lib/catalog/shop-info';
import { getStore } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Accueil',
  description: 'Le Parfum d’Eden : notre collection de lancement. Musc Tahara, El Nabil, huile concentrée, Kenzie.',
};

const TAGLINE = 'L’élégance à chaque fragrance.';

/** Pétales décoratifs du hero : positions et rythmes fixes (rendu identique serveur / client). */
const PETALS = [
  { left: '8%', delay: '0s', duration: '16s', size: 12 },
  { left: '30%', delay: '6s', duration: '19s', size: 9 },
  { left: '52%', delay: '3s', duration: '17s', size: 11 },
  { left: '70%', delay: '9s', duration: '20s', size: 8 },
  { left: '88%', delay: '5s', duration: '15s', size: 12 },
];

/** « La gamme Kenzie : eaux de parfum. » → « eaux de parfum » (vide si la description ne dit rien de plus). */
function subtitleOf(description: string | null): string {
  return (description ?? '').replace(/^La gamme [^:,.]+[:,.]?\s*/, '').replace(/\.$/, '').trim();
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Reveal>
      <div className="text-center">
        <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-ink-soft md:text-base">{subtitle}</p>}
      </div>
    </Reveal>
  );
}

export default async function HomePage() {
  const store = getStore();
  const [collections, products, info] = await Promise.all([
    store.listCollections(),
    store.listProducts().then((list) => list.filter((p) => p.isActive)),
    getShopInfo(),
  ]);
  const summaries = await summarizeProducts(store, products);
  const byId = new Map(summaries.map((s) => [s.product.id, s]));

  // Gammes = collections actives, hors « collection de lancement » qui les regroupe toutes.
  const lines = collections
    .filter((c) => c.isActive && c.slug !== 'lancement')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      collection: c,
      items: c.productIds.map((id) => byId.get(id)).filter((s): s is ProductSummary => Boolean(s)),
    }))
    .filter((l) => l.items.length > 0);

  // Barre d'avantages : uniquement des engagements vérifiables dans la configuration.
  const benefits = [
    info.cashOnDelivery && { icon: <WalletIcon width={22} height={22} />, title: 'Paiement à la livraison', text: 'Vous réglez à la réception' },
    { icon: <span className="font-serif text-lg leading-none">€</span>, title: 'Prix en euros et FCFA', text: 'Parité fixe 1 € = 655,957 FCFA' },
    { icon: <PackageIcon width={22} height={22} />, title: 'Suivi de commande', text: 'Une référence unique, suivie en ligne' },
  ].filter(Boolean) as { icon: ReactNode; title: string; text: string }[];

  const featured = lines.map((l) => l.items[0]).filter(Boolean);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="blush relative overflow-hidden">
        <div className="motion-decor pointer-events-none absolute inset-0" aria-hidden="true">
          {PETALS.map((p, i) => (
            <span
              key={i}
              className="absolute -top-8 animate-petal rounded-[70%_0_70%_0] bg-white/80 shadow-sm"
              style={{ left: p.left, width: p.size, height: p.size * 1.4, animationDelay: p.delay, animationDuration: p.duration }}
            />
          ))}
        </div>

        <div className="container-page relative grid min-h-[30rem] items-center gap-8 py-14 md:grid-cols-2 md:py-16 lg:min-h-[34rem]">
          <div className="relative z-10 text-center md:text-left">
            <p className="eyebrow animate-fade-up text-plum-deep [animation-delay:100ms]">Le Parfum d’Eden · Collection de lancement</p>
            <h1 className="mt-4 animate-fade-up font-serif text-5xl leading-[1.05] text-ink [animation-delay:200ms] md:text-6xl lg:text-7xl">
              Découvrez votre <span className="italic">parfum signature</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md animate-fade-up text-base leading-relaxed text-ink-soft [animation-delay:350ms] md:mx-0 md:text-lg">
              Quatre gammes, dix fragrances, des prix en euros et en FCFA. {TAGLINE}
            </p>
            <div className="mt-8 flex animate-fade-up flex-col items-center gap-3 [animation-delay:500ms] sm:flex-row md:justify-start">
              <Link href="/collections/lancement" className="btn-primary group pr-5">
                Découvrir la collection <span className="btn-arrow"><ArrowRightIcon width={14} height={14} /></span>
              </Link>
              <Link href="/trouver-mon-parfum" className="btn-light">Trouver mon parfum</Link>
            </div>
          </div>

          {/* Visuel : le flacon seul, posé sur un podium, entre des branches fleuries */}
          <div className="relative mx-auto flex w-full max-w-md items-end justify-center pt-6">
            <Blossoms className="absolute -right-6 top-0 w-44 animate-fade-in opacity-90 [animation-delay:600ms] md:w-60" />
            <Blossoms flip className="absolute -left-8 top-16 w-32 animate-fade-in opacity-80 [animation-delay:800ms] md:w-44" />
            <Pedestal
              src="/products/cutout/marshmallow.png"
              alt="Kenzie Marshmallow Dream"
              width={563}
              height={1029}
              href="/parfum/marshmallow"
              priority
              className="w-72 md:w-[24rem]"
              bottleClassName="h-72 md:h-[23rem]"
            />
          </div>
        </div>
      </section>

      {/* ---------- Barre d'avantages ---------- */}
      <section aria-label="Nos avantages" className="bg-petal-light">
        <ul className={`container-page grid max-w-xs divide-petal py-5 sm:max-w-7xl sm:divide-x ${benefits.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {benefits.map((b, i) => (
            <li key={b.title} className="flex animate-fade-up items-center gap-3 py-3 sm:justify-center sm:px-4" style={{ animationDelay: `${600 + i * 100}ms` }}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-plum shadow-sm">{b.icon}</span>
              <span>
                <span className="block text-sm font-medium text-ink">{b.title}</span>
                <span className="block text-xs text-ink-soft">{b.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Nos gammes (par catégorie) ---------- */}
      <section id="gammes" className="container-page section scroll-mt-24">
        <SectionTitle title="Nos gammes" subtitle="Quatre univers pour une collection de lancement tout en élégance." />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {lines.map((line, i) => {
            const subtitle = subtitleOf(line.collection.description);
            const first = line.items[0];
            const min = Math.min(...line.items.map((s) => s.minPrice).filter((p) => p > 0));
            return (
              <Reveal key={line.collection.id} delay={i * 100}>
                <Link
                  href={`/collections/${line.collection.slug}`}
                  className="group relative flex h-full min-h-[13rem] items-stretch overflow-hidden rounded-2xl bg-mauve-light/60 transition duration-500 hover:-translate-y-1 hover:bg-mauve-light hover:shadow-[0_20px_40px_-24px_rgb(94_67_83/0.6)]"
                >
                  <div className="relative z-10 flex flex-1 flex-col justify-between p-5">
                    <div>
                      <p className="text-xs text-plum">{line.items.length} fragrance{line.items.length > 1 ? 's' : ''}</p>
                      <h3 className="mt-1 font-serif text-2xl leading-tight">{line.collection.name}</h3>
                      {subtitle && <p className="mt-1 text-xs italic text-ink-soft first-letter:uppercase">{subtitle}</p>}
                      {Number.isFinite(min) && <p className="mt-2 text-xs"><Price xof={min} from /></p>}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-plum">
                      Découvrir
                      <ArrowRightIcon width={14} height={14} className="transition duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                  <div className="relative flex w-[46%] items-center p-3">
                    {first && (
                      <ProductImage
                        slug={first.product.slug}
                        name={first.product.name}
                        line={line.collection.name}
                        darkCap={first.product.gender === 'homme'}
                        sizes="200px"
                        className="w-full rounded-xl shadow-sm"
                        imgClassName="transition duration-700 group-hover:scale-110"
                      />
                    )}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- Notre collection (onglets par gamme) ---------- */}
      <section className="container-page pb-16 md:pb-20">
        <SectionTitle title="Notre collection" subtitle="Toutes nos fragrances de lancement, à filtrer par gamme." />
        <div className="mt-8">
          <ProductTabs items={summaries} lines={lines.map((l) => l.collection.name)} />
        </div>
      </section>

      {/* ---------- Bandeau quiz ---------- */}
      <section className="container-page pb-16 md:pb-20">
        <Reveal>
          <div className="blush relative grid items-center overflow-hidden rounded-3xl md:grid-cols-[1.2fr_1fr]">
            <div className="relative z-10 p-8 md:p-12">
              <h2 className="font-serif text-3xl leading-tight md:text-4xl">Trouvez votre parfum signature</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft md:text-base">
                Gamme, style, budget : répondez à trois questions et découvrez les fragrances qui vous correspondent.
              </p>
              <Link href="/trouver-mon-parfum" className="btn-primary group mt-6 pr-5">
                Faire le quiz <span className="btn-arrow"><ArrowRightIcon width={14} height={14} /></span>
              </Link>
            </div>
            <div className="relative flex items-end justify-center px-6 pb-6 pt-4 md:h-full md:pb-8">
              <Blossoms className="absolute -right-4 top-0 w-40 opacity-90 md:w-52" />
              <Pedestal
                src="/products/cutout/arabiyat-elhem.png"
                alt="Arabiyat Elham, huile concentrée de parfum"
                width={283}
                height={795}
                href="/parfum/arabiyat-elhem"
                className="w-56 md:w-64"
                bottleClassName="h-48 md:h-56"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- Pourquoi nous ---------- */}
      <section className="bg-petal-light">
        <div className="container-page section">
          <SectionTitle title="Pourquoi Le Parfum d’Eden ?" subtitle="Une commande simple et transparente, du choix du parfum jusqu’à la livraison." />
          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {reassuranceItems(info).map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <Link href={item.href} className="group flex flex-col items-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-plum shadow-sm ring-1 ring-petal transition duration-500 group-hover:-translate-y-1 group-hover:bg-plum group-hover:text-white">
                    {item.icon}
                  </span>
                  <h3 className="mt-4 font-serif text-xl">{item.title}</h3>
                  <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-ink-soft md:text-sm">{item.text}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Éditorial ---------- */}
      <section className="container-page section">
        <div className="grid items-stretch gap-6 md:grid-cols-2">
          <Reveal>
            <div className="relative grid h-full grid-cols-3 items-center gap-3 overflow-hidden rounded-3xl bg-mauve-light/70 px-5 pb-6 pt-12 md:min-h-[18rem] md:p-8">
              <Blossoms className="absolute -left-6 -top-4 z-10 w-44 opacity-90" />
              {featured.slice(0, 3).map((s, i) => (
                <Link key={s.product.id} href={`/parfum/${s.product.slug}`} className={`group block ${i === 1 ? 'md:-translate-y-4' : 'md:translate-y-4'}`}>
                  <ProductImage
                    slug={s.product.slug}
                    name={s.product.name}
                    line={s.product.family}
                    darkCap={s.product.gender === 'homme'}
                    sizes="200px"
                    className="rounded-2xl shadow-md ring-4 ring-white/70"
                    imgClassName="transition duration-700 group-hover:scale-110"
                  />
                </Link>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex h-full flex-col justify-center rounded-3xl bg-petal-light p-8 md:p-12">
              <p className="eyebrow text-plum">Notre maison</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">L’art des belles fragrances</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Musc Tahara, El Nabil, huile concentrée de parfum et eaux de parfum Kenzie : notre collection de
                lancement réunit quatre gammes et dix fragrances. {TAGLINE}
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {lines.map((l) => (
                  <li key={l.collection.id} className="flex items-center justify-between border-b border-petal pb-2">
                    <Link href={`/collections/${l.collection.slug}`} className="font-serif text-lg text-ink transition hover:text-plum">
                      {l.collection.name}
                    </Link>
                    <span className="text-xs text-plum">{l.items.length} fragrance{l.items.length > 1 ? 's' : ''}</span>
                  </li>
                ))}
              </ul>
              <Link href="/collections/lancement" className="btn-primary group mt-7 self-start pr-5">
                Découvrir <span className="btn-arrow"><ArrowRightIcon width={14} height={14} /></span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Galerie ---------- */}
      <section className="container-page pb-16 md:pb-20">
        <SectionTitle title="Suivez-nous" subtitle="Compte Instagram officiel : à renseigner par la marque." />
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {summaries.slice(0, 4).map((s, i) => (
            <Reveal key={s.product.id} delay={i * 80}>
              <Link href={`/parfum/${s.product.slug}`} className="group block overflow-hidden rounded-2xl">
                <ProductImage
                  slug={s.product.slug}
                  name={s.product.name}
                  line={s.product.family}
                  darkCap={s.product.gender === 'homme'}
                  compact
                  imgClassName="transition duration-700 group-hover:scale-105"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Newsletter ---------- */}
      <section className="container-page pb-16 md:pb-20">
        <Reveal>
          <div className="blush relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl px-6 py-10 text-center md:flex-row md:justify-between md:px-12 md:text-left">
            <SparkleIcon width={120} height={120} className="pointer-events-none absolute -right-6 -top-8 text-white/40" />
            <div className="relative">
              <h2 className="font-serif text-3xl leading-tight">Rejoignez le club Le Parfum d’Eden</h2>
              <p className="mt-2 max-w-md text-sm text-ink-soft">Nouveautés et offres en avant-première, directement dans votre boîte mail.</p>
            </div>
            <div className="relative w-full max-w-md">
              <NewsletterForm />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
