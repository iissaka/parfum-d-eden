import Image from 'next/image';
import Link from 'next/link';

/**
 * Flacon détouré posé sur un podium (deux niveaux, blanc et rose poudré).
 * Le podium fait toute la largeur du conteneur ; le haut du premier niveau est à 10 % de sa largeur
 * (viewBox 400×170, ellipse supérieure en y = 40), d'où la marge négative de 10 % du flacon.
 */
export function Pedestal({
  src,
  alt,
  width,
  height,
  href,
  priority = false,
  bottleClassName = 'h-72 md:h-96',
  className = 'w-72 md:w-96',
}: {
  src: string;
  alt: string;
  /** Dimensions réelles de l'image détourée (ratio). */
  width: number;
  height: number;
  href?: string;
  priority?: boolean;
  bottleClassName?: string;
  className?: string;
}) {
  const bottle = (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes="(min-width: 768px) 260px, 200px"
      className={`relative z-10 w-auto animate-fade-up drop-shadow-[0_18px_22px_rgba(94,67,83,0.28)] [animation-delay:350ms] [animation-duration:1.1s] ${bottleClassName}`}
    />
  );

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Halo lumineux derrière le flacon */}
      <div className="pointer-events-none absolute left-1/2 top-[8%] h-3/4 w-3/4 -translate-x-1/2 rounded-full bg-white/50 blur-3xl" aria-hidden="true" />

      {href ? (
        <Link href={href} className="relative z-10 block transition duration-500 hover:-translate-y-1.5" aria-label={alt}>
          {bottle}
        </Link>
      ) : (
        bottle
      )}

      <svg viewBox="0 0 400 170" className="relative -mt-[10%] w-full animate-fade-up [animation-delay:150ms]" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="pedestal-side" x1="0" x2="1">
            <stop offset="0" stopColor="#E6D5DE" />
            <stop offset="0.35" stopColor="#FFFFFF" />
            <stop offset="0.7" stopColor="#F6EEF2" />
            <stop offset="1" stopColor="#DCC7D2" />
          </linearGradient>
          <linearGradient id="pedestal-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#F3E8EE" />
          </linearGradient>
          <filter id="pedestal-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {/* Ombre au sol */}
        <ellipse cx="200" cy="158" rx="196" ry="10" fill="#7A5A6C" opacity="0.18" filter="url(#pedestal-blur)" />
        {/* Niveau inférieur */}
        <path d="M10 112 L10 138 A190 22 0 0 0 390 138 L390 112 Z" fill="url(#pedestal-side)" />
        <ellipse cx="200" cy="112" rx="190" ry="22" fill="url(#pedestal-top)" />
        {/* Niveau supérieur */}
        <path d="M62 40 L62 100 A138 20 0 0 0 338 100 L338 40 Z" fill="url(#pedestal-side)" />
        <ellipse cx="200" cy="40" rx="138" ry="20" fill="url(#pedestal-top)" />
        {/* Ombre de contact du flacon et liseré lumineux */}
        <ellipse cx="200" cy="42" rx="70" ry="7" fill="#7A5A6C" opacity="0.28" filter="url(#pedestal-blur)" />
        <ellipse cx="200" cy="40" rx="137" ry="19" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />
      </svg>
    </div>
  );
}
