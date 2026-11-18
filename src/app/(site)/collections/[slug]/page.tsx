import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LineVideoSection } from '@/components/media/LineVideoSection';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductGrid } from '@/components/product/ProductCard';
import { searchCatalog } from '@/lib/catalog/catalog';
import { getStore } from '@/lib/store';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getStore().getCollectionBySlug(slug);
  return collection
    ? { title: collection.name, description: collection.description ?? `Collection ${collection.name}.` }
    : { title: 'Collection introuvable' };
}

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const collection = await getStore().getCollectionBySlug(slug);
  if (!collection || !collection.isActive) {
    notFound();
  }
  const results = await searchCatalog({ collectionSlug: slug, sort: 'nouveautes' });

  return (
    <>
      <PageHeader
        title={collection.name}
        eyebrow="Collection"
        crumbs={[{ href: '/', label: 'Accueil' }, { href: '/boutique', label: 'Boutique' }, { label: collection.name }]}
        intro={collection.description ?? undefined}
      />

      <div className="container-page py-12 md:py-16">
        <p className="border-b border-petal pb-4 text-sm">
          <span className="font-medium">{results.length}</span> parfum{results.length > 1 ? 's' : ''}
        </p>
        {results.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-petal p-10 text-center">
            <p className="font-serif text-2xl text-plum">Aucun parfum dans cette collection pour le moment.</p>
            <Link href="/boutique" className="btn-secondary mt-6">Voir toute la boutique</Link>
          </div>
        ) : (
          <div className="mt-8">
            <ProductGrid items={results} />
          </div>
        )}
      </div>

      <LineVideoSection line={collection.name} className="container-page pb-16" />
    </>
  );
}
