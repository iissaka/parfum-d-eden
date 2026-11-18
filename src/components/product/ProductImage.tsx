import Image from 'next/image';
import { photoFor } from '@/lib/catalog/product-images';
import { PlaceholderImage } from '@/components/product/PlaceholderImage';

/**
 * Photo d'un produit (vignette carrée). Sans photo enregistrée, affiche l'illustration de flacon.
 * `imgClassName` s'applique à la photo (ex. : zoom au survol).
 */
export function ProductImage({
  slug,
  name,
  line,
  darkCap = false,
  compact = false,
  priority = false,
  sizes = '(min-width: 1024px) 25vw, 50vw',
  className = '',
  imgClassName = '',
}: {
  slug: string | null | undefined;
  name: string;
  line?: string | null;
  darkCap?: boolean;
  compact?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
}) {
  const photo = photoFor(slug);
  if (!photo) {
    return (
      <PlaceholderImage
        label={`Visuel indicatif : ${name}`}
        seed={slug ?? name}
        line={line}
        darkCap={darkCap}
        compact={compact}
        className={className}
      />
    );
  }
  return (
    <div className={`relative aspect-square overflow-hidden rounded-2xl ${photo.fit === 'contain' ? 'bg-white' : 'bg-petal-light'} ${className}`}>
      <Image
        src={photo.src}
        alt={name}
        fill
        priority={priority}
        sizes={sizes}
        className={`${photo.fit === 'contain' ? `object-contain ${compact ? 'p-1' : 'p-4'}` : 'object-cover'} ${imgClassName}`}
        style={photo.position ? { objectPosition: photo.position } : undefined}
      />
    </div>
  );
}
