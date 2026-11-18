import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductCard } from '@/components/product/ProductCard';
import { CheckIcon } from '@/components/ui/Icons';
import { listFamilies, suggestProducts } from '@/lib/catalog/catalog';
import { firstParam, type SearchParams } from '@/lib/catalog/search-params';
import { GENDERS, type Gender } from '@/lib/domain/types';

export const metadata: Metadata = {
  title: 'Trouver mon parfum',
  description: 'Un questionnaire simple pour découvrir des parfums adaptés à vos goûts.',
};

export default async function TrouverPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const family = firstParam(params, 'famille')?.slice(0, 60);
  const genre = firstParam(params, 'genre');
  const budget = Number(firstParam(params, 'budget'));
  const gender = (GENDERS as readonly string[]).includes(genre ?? '') ? (genre as Gender) : undefined;
  const budgetMax = Number.isSafeInteger(budget) && budget > 0 ? budget : undefined;
  const hasCriteria = Boolean(family || gender || budgetMax);

  const [families, suggestions] = await Promise.all([
    listFamilies(),
    hasCriteria ? suggestProducts({ family, gender, budgetMax }) : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader
        title="Trouver mon parfum"
        eyebrow="Conseil personnalisé"
        tone="rose"
        crumbs={[{ href: '/', label: 'Accueil' }, { label: 'Trouver mon parfum' }]}
        intro={
          <>
            Répondez à quelques questions facultatives. Les suggestions reposent uniquement sur les informations
            renseignées dans notre catalogue : ce sont des propositions, sans garantie de satisfaction.
          </>
        }
      />

      <div className="container-page py-12 md:py-16">
        <form method="get" action="/trouver-mon-parfum" className="card mx-auto max-w-4xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <span className="step-dot">1</span>
              <label className="label mt-3 font-serif text-xl font-normal" htmlFor="famille">Gamme préférée</label>
              <select id="famille" name="famille" defaultValue={family ?? ''} className="field">
                <option value="">Indifférent</option>
                {families.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <span className="step-dot">2</span>
              <label className="label mt-3 font-serif text-xl font-normal" htmlFor="genre-q">Style</label>
              <select id="genre-q" name="genre" defaultValue={gender ?? ''} className="field">
                <option value="">Indifférent</option>
                <option value="femme">Femme</option>
                <option value="homme">Homme</option>
                <option value="mixte">Mixte</option>
              </select>
            </div>
            <div>
              <span className="step-dot">3</span>
              <label className="label mt-3 font-serif text-xl font-normal" htmlFor="budget">Budget maximum (FCFA)</label>
              <input id="budget" name="budget" type="number" min={0} step={1000} inputMode="numeric" defaultValue={budgetMax ?? ''} className="field" placeholder="Ex. : 30000" />
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-petal pt-6 sm:flex-row sm:items-center">
            <button type="submit" className="btn-primary">Voir les suggestions</button>
            {hasCriteria && <Link href="/trouver-mon-parfum" className="link text-center text-sm">Recommencer</Link>}
          </div>
        </form>

        {hasCriteria && suggestions.length === 0 && (
          <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-dashed border-petal p-10 text-center">
            <p className="font-serif text-2xl text-plum">Aucune suggestion pour ces critères.</p>
            <Link href="/boutique" className="btn-secondary mt-6">Parcourir toute la boutique</Link>
          </div>
        )}

        {suggestions.length > 0 && (
          <section className="mt-16" aria-labelledby="suggestions">
            <p className="eyebrow text-center text-plum">Pour vous</p>
            <h2 id="suggestions" className="heading mt-2 text-center">Nos suggestions</h2>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {suggestions.map((s) => (
                <div key={s.product.id}>
                  <ProductCard summary={s} />
                  {s.reasons.length > 0 && (
                    <ul className="mt-3 space-y-1 text-xs">
                      {s.reasons.map((reason) => (
                        <li key={reason} className="flex items-center gap-1.5">
                          <CheckIcon width={13} height={13} className="shrink-0 text-plum" /> {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
