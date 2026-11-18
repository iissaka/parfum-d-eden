import Link from 'next/link';
import type { ProductSummary } from '@/lib/catalog/catalog';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { ProductImage } from '@/components/product/ProductImage';
import { Price } from '@/components/ui/Price';
import { Reveal } from '@/components/ui/Reveal';

export function ProductCard({ summary }: { summary: ProductSummary }) {
  const { product, minPrice, maxPrice, inStock } = summary;

  return (
    <article className="group">
      <Link href={`/parfum/${product.slug}`} className="block rounded-2xl">
        <div className="relative overflow-hidden rounded-2xl transition duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_-20px_rgb(94_67_83/0.5)]">
          <ProductImage
            slug={product.slug}
            name={product.name}
            line={product.family}
            darkCap={product.gender === 'homme'}
            className={`[&>svg]:transition [&>svg]:duration-700 group-hover:[&>svg]:-translate-y-1.5 group-hover:[&>svg]:scale-105 ${inStock ? '' : 'opacity-70'}`}
            imgClassName="transition duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.isNew && <span className="badge bg-white/90 text-plum">Nouveau</span>}
            {!inStock && <span className="badge bg-ink text-white">Épuisé</span>}
          </div>
          {/* Invitation qui glisse depuis le bas au survol */}
          <span className="absolute inset-x-3 bottom-3 flex translate-y-[130%] items-center justify-center gap-2 rounded-full bg-plum py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-white opacity-0 transition duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            Découvrir <ArrowRightIcon width={14} height={14} />
          </span>
        </div>

        <div className="mt-3 space-y-0.5 px-0.5">
          <h3 className="font-serif text-lg leading-snug text-ink md:text-xl">{product.name}</h3>
          {product.family && <p className="text-xs text-plum">{product.family}</p>}
          <p className="pt-0.5 text-sm text-ink-soft">
            {minPrice <= 0 ? 'Prix à venir' : <Price xof={minPrice} from={minPrice !== maxPrice} />}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({ items, dense = false }: { items: ProductSummary[]; dense?: boolean }) {
  const cols = dense ? 3 : 4;
  return (
    <div
      className={`grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 ${dense ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'}`}
    >
      {items.map((s, i) => (
        <Reveal key={s.product.id} delay={(i % cols) * 90}>
          <ProductCard summary={s} />
        </Reveal>
      ))}
    </div>
  );
}
