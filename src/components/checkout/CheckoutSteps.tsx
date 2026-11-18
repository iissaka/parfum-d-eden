import { CheckIcon } from '@/components/ui/Icons';

const STEPS = ['Panier', 'Livraison et paiement', 'Confirmation'] as const;

/** Indicateur de progression du tunnel de commande (1 = panier, 2 = commande, 3 = confirmation). */
export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Étapes de la commande" className="mx-auto max-w-xl">
      <ol className="flex items-center">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const done = step < current;
          const active = step === current;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2" aria-current={active ? 'step' : undefined}>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    done || active ? 'bg-plum text-canvas' : 'bg-white text-plum ring-1 ring-petal'
                  }`}
                >
                  {done ? <CheckIcon width={16} height={16} /> : step}
                </span>
                <span className={`whitespace-nowrap text-[0.7rem] ${active ? 'font-medium text-ink-soft' : 'text-plum'}`}>
                  {label}
                </span>
              </div>
              {step < STEPS.length && (
                <span className={`mx-2 mb-6 h-px flex-1 ${done ? 'bg-plum' : 'bg-petal'}`} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
