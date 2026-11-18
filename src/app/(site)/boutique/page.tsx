import type { Metadata } from 'next';
import Link from 'next/link';
import { FilterPanel } from '@/components/catalog/FilterPanel';
import { CloseIcon } from '@/components/ui/Icons';
import { LineVideoSection } from '@/components/media/LineVideoSection';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductGrid } from '@/components/product/ProductCard';
import { listFamilies, searchCatalog, type CatalogFilters } from '@/lib/catalog/catalog';
import { formatPrice } from '@/lib/utils/money';
import { parseCatalogFilters, type SearchParams } from '@/lib/catalog/search-params';

export const metadata: Metadata = {
  title: 'Boutique',
  description: 'Parcourez le catalogue, filtrez par famille, genre et prix.',
};

const GENDERS = [
  { value: '', label: 'Tous' },
  { value: 'femme', label: 'Femme' },
  { value: 'homme', label: 'Homme' },
  { value: 'mixte', label: 'Mixte' },
] as const;

/** Paramètres d'URL correspondant aux filtres courants (tri par défaut omis). */
function toQuery(filters: CatalogFilters): Record<string, string> {
  const q: Record<string, string> = {};
  if (filters.q) q.q = filters.q;
  if (filters.gender) q.genre = filters.gender;
  if (filters.family) q.famille = filters.family;
  if (filters.maxPrice) q.prix_max = String(filters.maxPrice);
  if (filters.sort && filters.sort !== 'nouveautes') q.tri = filters.sort;
  return q;
}

function hrefWith(base: Record<string, string>, changes: Record<string, string | null>): string {
  const next = { ...base };
  for (const [key, value] of Object.entries(changes)) {
    if (value) next[key] = value;
    else delete next[key];
  }
  const qs = new URLSearchParams(next).toString();
  return qs ? `/boutique?${qs}` : '/boutique';
}

export default async function BoutiquePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = parseCatalogFilters(params);
  const [results, families] = await Promise.all([searchCatalog(filters), listFamilies()]);
  const query = toQuery(filters);

  const active = [
    filters.q && { key: 'q', label: `« ${filters.q} »` },
    filters.gender && { key: 'genre', label: GENDERS.find((g) => g.value === filters.gender)?.label ?? filters.gender },
    filters.family && { key: 'famille', label: filters.family },
    filters.maxPrice && { key: 'prix_max', label: `Jusqu’à ${formatPrice(filters.maxPrice)}` },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <>
      <PageHeader
        title="Boutique"
        eyebrow="Le catalogue"
        crumbs={[{ href: '/', label: 'Accueil' }, { label: 'Boutique' }]}
        intro="Tous nos parfums, à filtrer par gamme, univers et budget."
      >
        {/* Raccourcis par gamme */}
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Gammes">
          {[{ value: '', label: 'Toutes les gammes' }, ...families.map((f) => ({ value: f, label: f }))].map((g) => {
            const isActive = (filters.family ?? '') === g.value;
            return (
              <Link
                key={g.label}
                href={hrefWith(query, { famille: g.value || null })}
                aria-current={isActive ? 'true' : undefined}
                className={`chip transition duration-300 hover:-translate-y-0.5 ${isActive ? 'chip-active' : ''}`}
              >
                {g.label}
              </Link>
            );
          })}
        </nav>
      </PageHeader>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[16rem_1fr] lg:gap-12 lg:py-14">
        <aside aria-label="Filtres" className="lg:sticky lg:top-28 lg:h-fit">
          <FilterPanel activeCount={active.length}>
            <form method="get" action="/boutique" role="search" className="space-y-5 rounded-2xl bg-white/70 p-5 ring-1 ring-petal lg:bg-transparent lg:p-0 lg:ring-0">
              <div>
                <label className="label" htmlFor="q">Recherche</label>
                <input id="q" name="q" type="search" defaultValue={filters.q ?? ''} className="field" placeholder="Nom, famille…" />
              </div>
              <div>
                <label className="label" htmlFor="genre">Genre</label>
                <select id="genre" name="genre" defaultValue={filters.gender ?? ''} className="field">
                  <option value="">Tous</option>
                  <option value="femme">Femme</option>
                  <option value="homme">Homme</option>
                  <option value="mixte">Mixte</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="famille">Gamme</label>
                <select id="famille" name="famille" defaultValue={filters.family ?? ''} className="field">
                  <option value="">Toutes</option>
                  {families.map((family) => (
                    <option key={family} value={family}>{family}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="prix_max">Prix maximum (FCFA)</label>
                <input id="prix_max" name="prix_max" type="number" min={0} step={1000} inputMode="numeric" defaultValue={filters.maxPrice ?? ''} className="field" placeholder="Ex. : 30000" />
              </div>
              <div>
                <label className="label" htmlFor="tri">Trier par</label>
                <select id="tri" name="tri" defaultValue={filters.sort} className="field">
                  <option value="nouveautes">Nouveautés</option>
                  <option value="prix_croissant">Prix croissant</option>
                  <option value="prix_decroissant">Prix décroissant</option>
                  <option value="nom">Nom</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button type="submit" className="btn-primary w-full">Appliquer</button>
                {active.length > 0 && (
                  <Link href="/boutique" className="btn-secondary w-full">Effacer les filtres</Link>
                )}
              </div>
            </form>
          </FilterPanel>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-petal pb-4">
            <p className="text-sm" aria-live="polite">
              <span className="font-medium">{results.length}</span> parfum{results.length > 1 ? 's' : ''}
            </p>
            {active.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Filtres actifs">
                {active.map((f) => (
                  <li key={f.key}>
                    <Link href={hrefWith(query, { [f.key]: null })} className="chip py-1.5 text-xs" aria-label={`Retirer le filtre ${f.label}`}>
                      {f.label}
                      <CloseIcon width={12} height={12} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {results.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-petal p-10 text-center">
              <p className="font-serif text-2xl text-plum">Aucun parfum ne correspond à ces critères.</p>
              <p className="mt-2 text-sm">Essayez d’élargir votre recherche ou de retirer un filtre.</p>
              <Link href="/boutique" className="btn-secondary mt-6">Effacer les filtres</Link>
            </div>
          ) : (
            <div className="mt-8">
              <ProductGrid items={results} dense />
            </div>
          )}
        </div>
      </div>

      {/* Vidéo Musc Tahara, dès que des parfums de la gamme sont affichés */}
      {results.some((r) => r.product.family === 'Musc Tahara') && (
        <LineVideoSection line="Musc Tahara" className="container-page pb-16" />
      )}
    </>
  );
}
