import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchIcon } from '@/components/ui/Icons';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductGrid } from '@/components/product/ProductCard';
import { searchCatalog } from '@/lib/catalog/catalog';
import { firstParam, type SearchParams } from '@/lib/catalog/search-params';
import { LINE_LINKS as SUGGESTIONS } from '@/config/navigation';

export const metadata: Metadata = {
  title: 'Recherche',
};

export default async function RecherchePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = firstParam(params, 'q')?.slice(0, 80);
  const results = q ? await searchCatalog({ q }) : [];

  return (
    <>
      <PageHeader title="Recherche" eyebrow="Trouver un parfum" center>
        <form method="get" action="/recherche" role="search" className="relative mx-auto mt-8 max-w-xl">
          <label className="sr-only" htmlFor="q">Rechercher un parfum</label>
          <SearchIcon width={20} height={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-plum" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ''}
            className="field rounded-full py-4 pl-14 pr-36 text-base"
            placeholder="Nom, famille…"
            autoFocus={!q}
          />
          <button type="submit" className="btn-primary btn-sm absolute right-2 top-1/2 -translate-y-1/2">Rechercher</button>
        </form>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="chip text-xs">{s.label}</Link>
          ))}
        </div>
      </PageHeader>

      <div className="container-page py-12 md:py-16">
        {q && results.length === 0 && (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-petal p-10 text-center">
            <p className="font-serif text-2xl text-plum">Aucun résultat pour « {q} ».</p>
            <p className="mt-2 text-sm">Vérifiez l’orthographe ou essayez un terme plus général.</p>
            <Link href="/boutique" className="btn-secondary mt-6">Parcourir la boutique</Link>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="border-b border-petal pb-4 text-sm" aria-live="polite">
              <span className="font-medium">{results.length}</span> résultat{results.length > 1 ? 's' : ''} pour « {q} »
            </p>
            <div className="mt-8">
              <ProductGrid items={results} />
            </div>
          </>
        )}

        {!q && (
          <p className="text-center text-sm">Saisissez le nom d’un parfum ou d’une gamme.</p>
        )}
      </div>
    </>
  );
}
