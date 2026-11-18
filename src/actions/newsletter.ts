'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { audit } from '@/lib/audit';
import { rateLimit } from '@/lib/utils/rate-limit';
import { clientKeyFrom } from '@/lib/utils/request';

export type NewsletterState = { ok: boolean; message: string } | null;

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  consent: z.literal('on'),
});

/**
 * Inscription à la lettre d'information.
 * Provisoire : l'inscription est tracée dans le journal d'administration (action « newsletter.inscription »)
 * en attendant le choix d'un service d'e-mailing par la marque. Voir docs/DECISIONS.md (D23).
 */
export async function subscribeNewsletterAction(_previous: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = schema.safeParse({ email: formData.get('email'), consent: formData.get('consent') });
  if (!parsed.success) {
    return { ok: false, message: 'Indiquez une adresse e-mail valide et acceptez de recevoir nos nouveautés.' };
  }
  const key = clientKeyFrom(await headers());
  if (!rateLimit(`newsletter:${key}`, 5, 60 * 60 * 1000)) {
    return { ok: false, message: 'Trop de tentatives. Réessayez plus tard.' };
  }
  await audit('visiteur', 'newsletter.inscription', parsed.data.email, { consentement: true });
  return { ok: true, message: 'Merci ! Votre inscription est bien enregistrée.' };
}
