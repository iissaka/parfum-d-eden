import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { assertXof, formatFcfa } from '@/lib/utils/money';
import {
  computeDeliveryFee,
  computeSubtotal,
  computeTotal,
  evaluatePromotion,
} from '@/lib/domain/pricing';
import {
  assertOrderTransition,
  canMarkCashPaid,
  canTransitionOrder,
  canTransitionPayment,
  shouldRestock,
  TransitionError,
} from '@/lib/domain/orders';
import { hasPermission, isRole } from '@/lib/auth/permissions';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signSession, verifySession } from '@/lib/auth/session';
import { verifyPaymentSignature, WEBHOOK_TOLERANCE_SECONDS } from '@/lib/orders/webhook';
import { normalizeNigerPhone, normalizePhone } from '@/lib/domain/validation';
import { checkoutSchema } from '@/lib/domain/validation';
import { mergeCartLines, setCartLine } from '@/lib/domain/cart';
import { parseCartCookie } from '@/lib/cart/cart-cookie';
import { rateLimit, resetRateLimit } from '@/lib/utils/rate-limit';
import { generateOrderReference } from '@/lib/utils/ids';
import type { Promotion, Zone } from '@/lib/domain/types';

const NOW = new Date('2026-11-17T12:00:00.000Z');

const basePromo: Promotion = {
  id: 'p',
  code: 'TEST',
  discountType: 'percent',
  value: 10,
  startAt: null,
  endAt: null,
  usageLimit: null,
  usedCount: 0,
  minSubtotal: 0,
  isActive: true,
};

const zone: Zone = {
  id: 'z',
  name: 'Zone',
  city: 'Niamey',
  fee: 1000,
  freeShippingFrom: 25000,
  delayText: null,
  isActive: true,
};

describe('montants FCFA', () => {
  it('formate un montant entier', () => {
    expect(formatFcfa(25000)).toMatch(/25\D?000 FCFA/);
  });

  it('refuse les décimales et les montants négatifs', () => {
    expect(() => assertXof(10.5)).toThrow(RangeError);
    expect(() => assertXof(-1)).toThrow(RangeError);
    expect(() => assertXof(0)).not.toThrow();
  });
});

describe('calcul du panier et des remises', () => {
  it('calcule le sous-total à partir des prix serveur', () => {
    expect(
      computeSubtotal([
        { unitPriceXof: 25000, quantity: 2 },
        { unitPriceXof: 1000, quantity: 3 },
      ]),
    ).toBe(53000);
  });

  it('applique une remise en pourcentage arrondie vers le bas', () => {
    const result = evaluatePromotion(basePromo, 25005, NOW);
    expect(result).toEqual({ ok: true, discount: 2500, promotion: basePromo });
  });

  it('ne dépasse jamais le sous-total avec une remise fixe', () => {
    const result = evaluatePromotion({ ...basePromo, discountType: 'fixed', value: 50000 }, 20000, NOW);
    expect(result.ok && result.discount).toBe(20000);
  });

  it('refuse un code inactif, expiré, pas encore valide ou épuisé', () => {
    expect(evaluatePromotion({ ...basePromo, isActive: false }, 1000, NOW)).toEqual({ ok: false, reason: 'code_inactif' });
    expect(evaluatePromotion({ ...basePromo, endAt: '2026-01-01T00:00:00Z' }, 1000, NOW)).toEqual({ ok: false, reason: 'code_expire' });
    expect(evaluatePromotion({ ...basePromo, startAt: '2027-01-01T00:00:00Z' }, 1000, NOW)).toEqual({ ok: false, reason: 'code_pas_encore_valide' });
    expect(evaluatePromotion({ ...basePromo, usageLimit: 3, usedCount: 3 }, 1000, NOW)).toEqual({ ok: false, reason: 'code_epuise' });
  });

  it('exige le montant minimum du panier', () => {
    expect(evaluatePromotion({ ...basePromo, minSubtotal: 20000 }, 19999, NOW)).toEqual({ ok: false, reason: 'minimum_non_atteint' });
  });

  it('offre la livraison à partir du seuil de la zone', () => {
    expect(computeDeliveryFee(zone, 24999)).toBe(1000);
    expect(computeDeliveryFee(zone, 25000)).toBe(0);
  });

  it('calcule le total final sans passer sous zéro', () => {
    expect(computeTotal(10000, 2500, 1000)).toBe(8500);
    expect(computeTotal(0, 0, 1000)).toBe(1000);
  });
});

describe('transitions de commande', () => {
  it('autorise le parcours normal', () => {
    expect(canTransitionOrder('pending', 'confirmed')).toBe(true);
    expect(canTransitionOrder('confirmed', 'preparing')).toBe(true);
    expect(canTransitionOrder('preparing', 'shipped')).toBe(true);
    expect(canTransitionOrder('shipped', 'delivered')).toBe(true);
  });

  it('interdit de sauter une étape ou de quitter un statut final', () => {
    expect(canTransitionOrder('pending', 'delivered')).toBe(false);
    expect(canTransitionOrder('cancelled', 'pending')).toBe(false);
    expect(() => assertOrderTransition('delivered', 'cancelled')).toThrow(TransitionError);
  });

  it('remet le stock en vente uniquement pour une annulation', () => {
    expect(shouldRestock('cancelled')).toBe(true);
    expect(shouldRestock('returned')).toBe(false);
  });

  it('définit les transitions de paiement', () => {
    expect(canTransitionPayment('unpaid', 'paid')).toBe(true);
    expect(canTransitionPayment('paid', 'unpaid')).toBe(false);
  });

  it('encaissement manuel seulement après expédition', () => {
    expect(canMarkCashPaid('pending')).toBe(false);
    expect(canMarkCashPaid('preparing')).toBe(false);
    expect(canMarkCashPaid('delivered')).toBe(true);
  });
});

describe('rôles et permissions', () => {
  it('le préparateur ne peut ni annuler ni encaisser', () => {
    expect(hasPermission('preparer', 'orders:update_status')).toBe(true);
    expect(hasPermission('preparer', 'orders:cancel')).toBe(false);
    expect(hasPermission('preparer', 'orders:mark_paid')).toBe(false);
    expect(hasPermission('preparer', 'orders:export')).toBe(false);
  });

  it('le lecteur ne peut rien modifier', () => {
    expect(hasPermission('reader', 'orders:read')).toBe(true);
    expect(hasPermission('reader', 'catalog:write')).toBe(false);
  });

  it('le propriétaire a toutes les permissions', () => {
    expect(hasPermission('owner', 'stock:write')).toBe(true);
    expect(hasPermission('owner', 'zones:write')).toBe(true);
  });

  it('valide les noms de rôle', () => {
    expect(isRole('manager')).toBe(true);
    expect(isRole('admin')).toBe(false);
  });
});

describe('mots de passe et sessions', () => {
  it('vérifie un mot de passe haché', () => {
    const hash = hashPassword('mot-de-passe-long-123');
    expect(verifyPassword('mot-de-passe-long-123', hash)).toBe(true);
    expect(verifyPassword('mauvais-mot-de-passe', hash)).toBe(false);
  });

  it('rejette un hash mal formé', () => {
    expect(verifyPassword('x', 'n-importe-quoi')).toBe(false);
  });

  const key = 'a'.repeat(40);

  it('accepte une session valide et refuse une session altérée ou expirée', () => {
    const now = Date.now();
    const token = signSession({ sub: 'admin@example.com', role: 'owner', exp: now + 60_000 }, key);
    expect(verifySession(token, key, now)?.role).toBe('owner');

    const [body] = token.split('.');
    const forgedBody = Buffer.from(JSON.stringify({ sub: 'x', role: 'owner', exp: now + 60_000 })).toString('base64url');
    expect(verifySession(`${forgedBody}.${token.split('.')[1]}`, key, now)).toBeNull();
    expect(verifySession(body + '.zzz', key, now)).toBeNull();
    expect(verifySession(token, key, now + 120_000)).toBeNull();
    expect(verifySession(token, 'b'.repeat(40), now)).toBeNull();
  });
});

describe('notifications de paiement signées', () => {
  const secret = 's'.repeat(32);
  const body = '{"eventId":"evt_1","reference":"PE-ABCDEFGH","amount":8500,"status":"succeeded"}';
  const now = 1_800_000_000;

  function sign(timestamp: string, raw: string): string {
    return `sha256=${createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest('hex')}`;
  }

  it('accepte une signature correcte et récente', () => {
    const ts = String(now);
    expect(
      verifyPaymentSignature({ secret, timestamp: ts, rawBody: body, signature: sign(ts, body), nowSeconds: now }),
    ).toBe(true);
  });

  it('refuse une signature altérée, un corps modifié ou une notification trop ancienne', () => {
    const ts = String(now);
    expect(
      verifyPaymentSignature({ secret, timestamp: ts, rawBody: body + ' ', signature: sign(ts, body), nowSeconds: now }),
    ).toBe(false);
    const old = String(now - WEBHOOK_TOLERANCE_SECONDS - 1);
    expect(
      verifyPaymentSignature({ secret, timestamp: old, rawBody: body, signature: sign(old, body), nowSeconds: now }),
    ).toBe(false);
  });
});

describe('téléphone et validation du formulaire', () => {
  it('normalise les numéros nigériens', () => {
    expect(normalizeNigerPhone('90 12 34 56')).toBe('+22790123456');
    expect(normalizeNigerPhone('+227 90 12 34 56')).toBe('+22790123456');
    expect(normalizeNigerPhone('0022790123456')).toBe('+22790123456');
    expect(normalizeNigerPhone('123')).toBeNull();
  });

  it('accepte les numéros internationaux', () => {
    expect(normalizePhone('+33 6 12 34 56 78')).toBe('+33612345678');
    expect(normalizePhone('06 12 34 56 78')).toBe('+33612345678');
    expect(normalizePhone('0033612345678')).toBe('+33612345678');
    expect(normalizePhone('+1 (415) 555-0100')).toBe('+14155550100');
    expect(normalizePhone('+0 12345678')).toBeNull();
    expect(normalizePhone('+12')).toBeNull();
  });

  const valid = {
    name: 'Aminata Test',
    phone: '90123456',
    email: '',
    zoneId: 'zone-niamey-centre',
    district: 'Plateau',
    address: 'Rue de la Paix, près du marché',
    notes: '',
    paymentMethod: 'cash_on_delivery',
    promoCode: '',
    termsAccepted: 'on',
    idempotencyKey: '6f1c1f0e-7a55-4a3e-9d2b-1c2d3e4f5a6b',
  };

  it('accepte un formulaire valide et normalise le téléphone', () => {
    const result = checkoutSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe('+22790123456');
      expect(result.data.email).toBeNull();
      expect(result.data.newsletter).toBe(false);
    }
  });

  it('refuse sans consentement aux conditions ou avec un mode de paiement inconnu', () => {
    expect(checkoutSchema.safeParse({ ...valid, termsAccepted: undefined }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, paymentMethod: 'cash' }).success).toBe(false);
  });
});

describe('panier', () => {
  it('fusionne les lignes identiques et plafonne les quantités', () => {
    expect(mergeCartLines([{ v: 'a', q: 15 }, { v: 'a', q: 15 }])).toEqual([{ v: 'a', q: 20 }]);
  });

  it('met à jour une quantité et retire la ligne à zéro', () => {
    const lines = [{ v: 'a', q: 1 }, { v: 'b', q: 2 }];
    expect(setCartLine(lines, 'a', 4)).toEqual([{ v: 'b', q: 2 }, { v: 'a', q: 4 }]);
    expect(setCartLine(lines, 'b', 0)).toEqual([{ v: 'a', q: 1 }]);
  });

  it('ignore un cookie altéré', () => {
    expect(parseCartCookie('pas du json')).toEqual([]);
    expect(parseCartCookie('[{"v":"a","q":999}]')).toEqual([]);
    expect(parseCartCookie('[{"v":"a","q":2}]')).toEqual([{ v: 'a', q: 2 }]);
  });
});

describe('limitation de débit et références', () => {
  it('bloque au-delà de la limite puis se réinitialise', () => {
    resetRateLimit();
    expect(rateLimit('k', 2, 1000, 0)).toBe(true);
    expect(rateLimit('k', 2, 1000, 1)).toBe(true);
    expect(rateLimit('k', 2, 1000, 2)).toBe(false);
    expect(rateLimit('k', 2, 1000, 5000)).toBe(true);
  });

  it('génère des références publiques au format attendu, sans caractères ambigus', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateOrderReference()).toMatch(/^PE-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
    }
  });
});
