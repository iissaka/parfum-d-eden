import { z } from 'zod';
import { PAYMENT_METHODS } from './types';
import { MAX_LINE_QUANTITY } from './cart';

/** Format international E.164 : « + » suivi de 8 à 15 chiffres (indicatif pays compris). */
export const INTERNATIONAL_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

/**
 * Normalise un numéro saisi au format international (+XXXXXXXX), ou renvoie null.
 * Clientèle internationale : tout indicatif est accepté. Raccourcis tolérés :
 *  - 00… → +… ;
 *  - 8 chiffres sans indicatif → Niger (+227) ;
 *  - 10 chiffres commençant par 0 → France (+33).
 */
export function normalizePhone(input: string): string | null {
  let candidate = input.replace(/[\s.\-()]/g, '');
  if (candidate.startsWith('00')) {
    candidate = `+${candidate.slice(2)}`;
  }
  if (/^\d{8}$/.test(candidate)) {
    candidate = `+227${candidate}`;
  } else if (/^0[1-9]\d{8}$/.test(candidate)) {
    candidate = `+33${candidate.slice(1)}`;
  }
  return INTERNATIONAL_PHONE_REGEX.test(candidate) ? candidate : null;
}

/** @deprecated Nom historique, conservé pour compatibilité : utiliser normalizePhone. */
export const normalizeNigerPhone = normalizePhone;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'nom').max(80),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(25)
    .transform((value, ctx) => {
      const normalized = normalizePhone(value);
      if (!normalized) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'telephone' });
        return z.NEVER;
      }
      return normalized;
    }),
  email: z
    .union([z.literal(''), z.string().trim().email().max(120)])
    .optional()
    .transform((value) => (value ? value : null)),
  zoneId: z.string().min(1).max(64),
  district: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(300),
  notes: optionalText(300),
  paymentMethod: z.enum(PAYMENT_METHODS),
  promoCode: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) => (value ? value.toUpperCase() : null)),
  termsAccepted: z.literal('on'),
  newsletter: z
    .literal('on')
    .optional()
    .transform((value) => value === 'on'),
  idempotencyKey: z.string().uuid(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const cartLineSchema = z.object({
  v: z.string().min(1).max(64),
  q: z.number().int().min(1).max(MAX_LINE_QUANTITY),
});

export const trackingSchema = z.object({
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^PE-[A-Z2-9]{8}$/),
  phone: z.string().trim().min(8).max(25),
});

export const referenceSchema = z.string().regex(/^PE-[A-Z2-9]{8}$/);
