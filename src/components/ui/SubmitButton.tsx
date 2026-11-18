'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

/** Bouton d'envoi qui se désactive pendant la requête (évite les doubles soumissions). */
export function SubmitButton({
  children,
  pendingLabel = 'Envoi en cours…',
  className = 'w-full md:w-auto',
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`btn-primary ${className}`} disabled={pending} aria-busy={pending}>
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/40 border-t-canvas" aria-hidden="true" />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}
