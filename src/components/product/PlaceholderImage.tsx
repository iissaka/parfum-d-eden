// Aucune photographie produit n'est encore fournie : on n'en invente pas.
// Illustration de flacon (BottleArt) en attendant les photos autorisées ; remplacer par next/image ensuite.

import { BottleArt, shapeForLine } from '@/components/product/BottleArt';

const TONES = ['bg-petal-light', 'bg-mauve-light/60', 'bg-petal/70'] as const;

/** Teinte stable par produit, pour rythmer les grilles sans dépendre de l'ordre d'affichage. */
function toneFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

export function PlaceholderImage({
  label = 'Visuel indicatif',
  seed,
  line,
  darkCap = false,
  compact = false,
  className = '',
}: {
  label?: string;
  /** Sert à choisir la teinte (ex. : slug du produit). */
  seed?: string;
  /** Gamme du produit : détermine la forme du flacon. */
  line?: string | null;
  darkCap?: boolean;
  /** Vignette (panier, récapitulatif) : sans légende. */
  compact?: boolean;
  className?: string;
}) {
  const key = seed ?? label;
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl ${toneFor(key)} ${className}`}
    >
      {/* Halo lumineux derrière le flacon */}
      <div className="absolute left-1/2 top-[42%] h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-2xl" aria-hidden="true" />
      <BottleArt seed={key} shape={shapeForLine(line)} darkCap={darkCap} className="relative h-[86%] w-auto drop-shadow-sm" />
      {!compact && (
        <span className="absolute bottom-2.5 left-0 right-0 text-center text-[0.55rem] uppercase tracking-[0.25em] text-plum/80">
          Visuel indicatif
        </span>
      )}
    </div>
  );
}
