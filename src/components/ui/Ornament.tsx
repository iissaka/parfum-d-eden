/** Ornement du visuel de lancement : deux filets dorés de part et d'autre d'un petit lotus. */
export function Ornament({ className = '', animated = false }: { className?: string; animated?: boolean }) {
  const line = `h-px flex-1 bg-gradient-to-r ${animated ? 'animate-draw-line' : ''}`;
  return (
    <div className={`flex items-center gap-3 text-mauve ${className}`} aria-hidden="true">
      <span className={`${line} origin-right from-transparent to-mauve`} />
      <svg viewBox="0 0 32 20" className="h-4 w-7 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.3}>
        <path d="M16 2c3 4 3 9 0 14-3-5-3-10 0-14Z" />
        <path d="M16 16c-2-5-6-8-11-8 0 5 4 8 11 8Z" />
        <path d="M16 16c2-5 6-8 11-8 0 5-4 8-11 8Z" />
        <path d="M4 18h24" />
      </svg>
      <span className={`${line} origin-left from-mauve to-transparent`} />
    </div>
  );
}
