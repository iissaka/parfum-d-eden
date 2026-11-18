import { formatEur, formatFcfa } from '@/lib/utils/money';

/** Prix affiché en euros et en FCFA (montant de référence en FCFA). */
export function Price({ xof, from = false, className = '' }: { xof: number; from?: boolean; className?: string }) {
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className="font-medium">
        {from && 'Dès '}
        {formatEur(xof)}
      </span>
      <span className="text-[0.8em] font-normal text-plum">{formatFcfa(xof)}</span>
    </span>
  );
}
