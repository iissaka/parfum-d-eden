// Illustration vectorielle de flacon, en attendant les photos des produits.
// La forme dépend de la gamme, la teinte du parfum dépend du produit : chaque visuel est stable et distinct.

export type BottleShape = 'square' | 'round' | 'tall' | 'dropper';

const LIQUIDS = ['#EBC9A6', '#F0CED6', '#D8C0DE', '#EADBB3', '#D9AE8C', '#E6C1CF', '#CDB3D6'] as const;

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Forme de flacon associée à chaque gamme (valeur par défaut : flacon carré). */
export function shapeForLine(line: string | null | undefined): BottleShape {
  switch ((line ?? '').toLowerCase()) {
    case 'musc tahara':
      return 'round';
    case 'el nabil':
      return 'tall';
    case 'huile concentrée':
      return 'dropper';
    default:
      return 'square';
  }
}

export function BottleArt({
  seed,
  shape = 'square',
  darkCap = false,
  className = '',
}: {
  seed: string;
  shape?: BottleShape;
  /** Bouchon noir (gammes homme), sinon doré. */
  darkCap?: boolean;
  className?: string;
}) {
  const liquid = LIQUIDS[hash(seed) % LIQUIDS.length];
  const id = `b-${seed.replace(/[^a-z0-9]/gi, '')}-${shape}`;

  // Géométrie du corps et du bouchon selon la forme.
  const body = {
    square: { x: 58, y: 100, w: 84, h: 112, r: 12 },
    round: { x: 52, y: 98, w: 96, h: 112, r: 46 },
    tall: { x: 70, y: 78, w: 60, h: 134, r: 10 },
    dropper: { x: 72, y: 122, w: 56, h: 90, r: 9 },
  }[shape];
  const neckW = shape === 'dropper' ? 16 : 20;
  const neckY = body.y - 12;
  const cap =
    shape === 'dropper'
      ? { x: 84, y: neckY - 50, w: 32, h: 50, r: 10 }
      : shape === 'round'
        ? { x: 78, y: neckY - 34, w: 44, h: 34, r: 8 }
        : shape === 'tall'
          ? { x: 80, y: neckY - 40, w: 40, h: 40, r: 5 }
          : { x: 74, y: neckY - 30, w: 52, h: 30, r: 6 };
  const liquidTop = body.y + body.h * 0.28;

  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={`${id}-liquid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={liquid} stopOpacity="0.75" />
          <stop offset="1" stopColor={liquid} />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" x2="1">
          {darkCap ? (
            <>
              <stop offset="0" stopColor="#3a3236" />
              <stop offset="0.45" stopColor="#6a5c64" />
              <stop offset="1" stopColor="#1f1a1d" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#B8935F" />
              <stop offset="0.45" stopColor="#F0DCB4" />
              <stop offset="1" stopColor="#A47E4B" />
            </>
          )}
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x={body.x} y={body.y} width={body.w} height={body.h} rx={body.r} />
        </clipPath>
      </defs>

      {/* Socle et ombre */}
      <ellipse cx="100" cy="236" rx="78" ry="9" fill="#7A5A6C" opacity="0.12" />
      <rect x="30" y="212" width="140" height="24" rx="6" fill="#EFE3E8" />
      <rect x="30" y="212" width="140" height="5" rx="2.5" fill="#fff" opacity="0.7" />

      {/* Col */}
      <rect x={100 - neckW / 2} y={neckY} width={neckW} height="14" rx="3" fill={darkCap ? '#4a3f45' : '#C9A877'} />

      {/* Corps : verre + parfum */}
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={body.x} y={body.y} width={body.w} height={body.h} fill="#fff" opacity="0.5" />
        <rect x={body.x} y={liquidTop} width={body.w} height={body.h} fill={`url(#${id}-liquid)`} />
        <rect x={body.x} y={body.y} width={body.w} height={body.h} fill={`url(#${id}-glass)`} />
        {/* Reflet vertical */}
        <rect x={body.x + body.w * 0.14} y={body.y + 8} width={body.w * 0.09} height={body.h - 16} rx="4" fill="#fff" opacity="0.55" />
      </g>
      <rect x={body.x} y={body.y} width={body.w} height={body.h} rx={body.r} fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.5" />

      {/* Étiquette */}
      {shape !== 'dropper' && (
        <g>
          <rect x={100 - body.w * 0.3} y={body.y + body.h * 0.46} width={body.w * 0.6} height={body.h * 0.24} rx="2" fill="#fff" opacity="0.82" />
          <rect x={100 - body.w * 0.18} y={body.y + body.h * 0.53} width={body.w * 0.36} height="2" rx="1" fill="#7A5A6C" opacity="0.6" />
          <rect x={100 - body.w * 0.12} y={body.y + body.h * 0.6} width={body.w * 0.24} height="1.5" rx="0.75" fill="#7A5A6C" opacity="0.4" />
        </g>
      )}

      {/* Bouchon */}
      <rect x={cap.x} y={cap.y} width={cap.w} height={cap.h} rx={cap.r} fill={`url(#${id}-cap)`} />
      <rect x={cap.x + cap.w * 0.18} y={cap.y + 4} width={cap.w * 0.12} height={cap.h - 8} rx="2" fill="#fff" opacity="0.35" />
    </svg>
  );
}
