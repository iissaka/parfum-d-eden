'use client';

import { useActionState, useState } from 'react';
import { lookupOrderAction } from '@/actions/tracking';
import { Notice } from '@/components/ui/Notice';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { formatPrice } from '@/lib/utils/money';
import type { TrackingResult } from '@/lib/orders/tracking';

export function TrackingForm() {
  const [state, formAction] = useActionState<TrackingResult | null, FormData>(lookupOrderAction, null);
  // Champs contrôlés : la référence et le téléphone restent saisis après une réponse d'erreur.
  const [reference, setReference] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <div className="space-y-8">
      <form action={formAction} className="card grid gap-5 md:grid-cols-2 md:items-start">
        <div>
          <label className="label" htmlFor="reference">Référence de commande</label>
          <input id="reference" name="reference" required value={reference} onChange={(e) => setReference(e.target.value)} placeholder="PE-XXXXXXXX" autoCapitalize="characters" className="field font-mono uppercase tracking-widest" />
          <p className="hint">Indiquée sur la page de confirmation.</p>
        </div>
        <div>
          <label className="label" htmlFor="phone">Téléphone de la commande</label>
          <input id="phone" name="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+33 6 12 34 56 78" className="field" />
        </div>
        <div className="md:col-span-2">
          <SubmitButton pendingLabel="Recherche…">Consulter le statut</SubmitButton>
        </div>
      </form>

      {state && !state.ok && (
        <Notice tone="error">{state.message}</Notice>
      )}

      {state && state.ok && (
        <section className="card space-y-6" aria-labelledby="resultat">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="resultat" className="font-serif text-2xl">
              Commande <span className="font-mono text-xl tracking-widest">{state.view.reference}</span>
            </h2>
            <span className="badge bg-ink text-canvas">{state.view.statusLabel}</span>
          </div>

          <dl className="grid gap-4 rounded-xl bg-petal-light/60 p-4 text-sm sm:grid-cols-3">
            <div><dt className="text-xs uppercase tracking-wider text-plum">Paiement</dt><dd className="mt-1 font-medium">{state.view.paymentLabel}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-plum">Total</dt><dd className="mt-1 font-medium">{formatPrice(state.view.total)}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-plum">Dernière mise à jour</dt><dd className="mt-1 font-medium">{new Date(state.view.updatedAt).toLocaleString('fr-FR')}</dd></div>
          </dl>

          <div>
            <h3 className="font-serif text-xl">Historique</h3>
            <ol className="mt-4 space-y-0">
              {state.view.history.map((event, index) => {
                const last = index === state.view.history.length - 1;
                return (
                  <li key={`${event.at}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
                    {!last && <span className="absolute left-[7px] top-4 h-full w-px bg-petal" aria-hidden="true" />}
                    <span
                      className={`relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full ring-4 ring-white ${last ? 'bg-plum' : 'bg-petal'}`}
                      aria-hidden="true"
                    />
                    <div className="text-sm">
                      <p className={last ? 'font-medium text-ink-soft' : ''}>{event.label}</p>
                      <p className="text-xs text-plum">{new Date(event.at).toLocaleString('fr-FR')}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}
