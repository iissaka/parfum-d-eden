'use client';

import { useActionState } from 'react';
import { subscribeNewsletterAction, type NewsletterState } from '@/actions/newsletter';
import { ArrowRightIcon, CheckIcon } from '@/components/ui/Icons';

export function NewsletterForm() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribeNewsletterAction, null);

  if (state?.ok) {
    return (
      <p role="status" className="flex items-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-medium text-plum">
        <CheckIcon width={18} height={18} /> {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="w-full max-w-md">
      <label htmlFor="newsletter-email" className="sr-only">Votre adresse e-mail</label>
      <div className="flex items-center rounded-full bg-white p-1.5 shadow-sm ring-1 ring-white focus-within:ring-2 focus-within:ring-plum">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Votre adresse e-mail"
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-ink-soft placeholder:text-plum/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="S’inscrire"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-plum text-white transition hover:bg-plum-deep disabled:opacity-60"
        >
          {pending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
          ) : (
            <ArrowRightIcon width={18} height={18} />
          )}
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
        <input type="checkbox" name="consent" required className="mt-0.5 h-3.5 w-3.5 accent-plum" />
        <span>J’accepte de recevoir les nouveautés par e-mail. Désinscription possible à tout moment.</span>
      </label>
      {state && !state.ok && (
        <p role="alert" className="mt-2 text-xs font-medium text-plum-deep">{state.message}</p>
      )}
    </form>
  );
}
