import { beforeEach, describe, expect, it } from 'vitest';
import { placeOrder, CheckoutError } from '@/lib/orders/checkout';
import { buildCartView } from '@/lib/cart/cart-view';
import { lookupOrder } from '@/lib/orders/tracking';
import { searchCatalog, suggestProducts, getProductView } from '@/lib/catalog/catalog';
import { MemoryStore } from '@/lib/store/memory';
import { createSeed } from './fixtures/example-seed';
import { resetRateLimit } from '@/lib/utils/rate-limit';

const UUID = '6f1c1f0e-7a55-4a3e-9d2b-1c2d3e4f5a6b';
const UUID_2 = '7a2d2f1f-8b66-4b4f-8e3c-2d3e4f5a6b7c';

function form(overrides: Record<string, unknown> = {}) {
  return {
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
    idempotencyKey: UUID,
    ...overrides,
  };
}

const NOW = new Date('2026-11-17T12:00:00.000Z');

describe('parcours de commande (MemoryStore)', () => {
  let store: MemoryStore;

  beforeEach(() => {
    resetRateLimit();
    store = new MemoryStore(createSeed());
  });

  it('crée une commande avec des montants calculés côté serveur', async () => {
    const result = await placeOrder(form(), [{ v: 'var-01-50', q: 2 }], 'ip-1', store, NOW);
    expect(result.created).toBe(true);
    expect(result.total).toBe(50000);

    const order = await store.getOrder(result.reference);
    expect(order?.status).toBe('pending');
    expect(order?.paymentStatus).toBe('unpaid');
    expect(order?.lines[0].unitPriceXof).toBe(25000);
    expect(order?.customer.phone).toBe('+22790123456');
  });

  it('ignore les prix envoyés par le navigateur : seuls les identifiants comptent', async () => {
    const view = await buildCartView([{ v: 'var-01-50', q: 1 }], store);
    expect(view.subtotal).toBe(25000);
    const forged = await placeOrder(
      { ...form({ idempotencyKey: UUID_2 }), total: 1, price: 1 },
      [{ v: 'var-01-50', q: 1 }],
      'ip-2',
      store,
      NOW,
    );
    const order = await store.getOrder(forged.reference);
    // Sous-total 25 000 FCFA = seuil de livraison offerte en zone centre : frais à 0.
    expect(order?.deliveryFee).toBe(0);
    expect(order?.total).toBe(25000);
  });

  it('décrémente le stock et refuse une quantité supérieure au stock', async () => {
    await placeOrder(form(), [{ v: 'var-04-50', q: 3 }], 'ip-3', store, NOW);
    const variant = await store.getVariantById('var-04-50');
    expect(variant?.stock).toBe(0);

    await expect(
      placeOrder(form({ idempotencyKey: UUID_2 }), [{ v: 'var-04-50', q: 1 }], 'ip-3', store, NOW),
    ).rejects.toMatchObject({ code: 'stock_insuffisant' });
  });

  it('refuse un article épuisé dès la validation du panier', async () => {
    await expect(
      placeOrder(form(), [{ v: 'var-02-100', q: 1 }], 'ip-4', store, NOW),
    ).rejects.toBeInstanceOf(CheckoutError);
  });

  it('évite le doublon lors d’une double soumission (même clé d’idempotence)', async () => {
    const first = await placeOrder(form(), [{ v: 'var-06-50', q: 1 }], 'ip-5', store, NOW);
    const second = await placeOrder(form(), [{ v: 'var-06-50', q: 1 }], 'ip-5', store, NOW);
    expect(second.reference).toBe(first.reference);
    expect(second.created).toBe(false);
    expect((await store.getVariantById('var-06-50'))?.stock).toBe(6);
  });

  it('applique un code promotionnel valide et refuse un code inconnu', async () => {
    const ok = await placeOrder(
      form({ promoCode: 'bienvenue10' }),
      [{ v: 'var-01-50', q: 2 }],
      'ip-6',
      store,
      NOW,
    );
    const order = await store.getOrder(ok.reference);
    expect(order?.discount).toBe(5000);
    expect(order?.promotionCode).toBe('BIENVENUE10');
    expect((await store.getPromotionByCode('BIENVENUE10'))?.usedCount).toBe(1);

    await expect(
      placeOrder(form({ idempotencyKey: UUID_2, promoCode: 'INCONNU' }), [{ v: 'var-01-50', q: 1 }], 'ip-6', store, NOW),
    ).rejects.toMatchObject({ code: 'code_promo' });
  });

  it('refuse une zone inactive et un mode de paiement non activé', async () => {
    await expect(
      placeOrder(form({ zoneId: 'zone-autres-villes' }), [{ v: 'var-01-50', q: 1 }], 'ip-7', store, NOW),
    ).rejects.toMatchObject({ code: 'zone_invalide' });

    await expect(
      placeOrder(form({ paymentMethod: 'mobile_money' }), [{ v: 'var-01-50', q: 1 }], 'ip-7', store, NOW),
    ).rejects.toMatchObject({ code: 'paiement_indisponible' });
  });

  it('limite les tentatives de commande depuis une même source', async () => {
    for (let i = 0; i < 10; i++) {
      await placeOrder(form({ idempotencyKey: UUID }), [{ v: 'var-01-50', q: 1 }], 'ip-8', store, NOW).catch(() => undefined);
    }
    await expect(
      placeOrder(form({ idempotencyKey: UUID_2 }), [{ v: 'var-01-50', q: 1 }], 'ip-8', store, NOW),
    ).rejects.toMatchObject({ code: 'trop_de_tentatives' });
  });

  it('une annulation remet le stock en vente', async () => {
    const result = await placeOrder(form(), [{ v: 'var-03-50', q: 2 }], 'ip-9', store, NOW);
    expect((await store.getVariantById('var-03-50'))?.stock).toBe(7);
    await store.updateOrderStatus(result.reference, 'cancelled', 'test');
    expect((await store.getVariantById('var-03-50'))?.stock).toBe(9);
  });

  it('refuse une transition de statut interdite', async () => {
    const result = await placeOrder(form(), [{ v: 'var-03-50', q: 1 }], 'ip-10', store, NOW);
    await expect(store.updateOrderStatus(result.reference, 'delivered', 'test')).rejects.toThrow();
  });

  it('suivi de commande : exige la référence ET le téléphone de la commande', async () => {
    const result = await placeOrder(form(), [{ v: 'var-03-50', q: 1 }], 'ip-11', store, NOW);
    const good = await lookupOrder({ reference: result.reference, phone: '90123456' }, 'ip-11', store);
    expect(good.ok).toBe(true);
    if (good.ok) {
      expect(good.view.statusLabel).toBe('En attente');
    }
    const bad = await lookupOrder({ reference: result.reference, phone: '91111111' }, 'ip-11', store);
    expect(bad).toMatchObject({ ok: false });
  });
});

describe('catalogue', () => {
  const store = new MemoryStore(createSeed());

  it('filtre par genre en incluant les produits mixtes', async () => {
    const femme = await searchCatalog({ gender: 'femme' }, store);
    expect(femme.every((r) => r.product.gender === 'femme' || r.product.gender === 'mixte')).toBe(true);
  });

  it('recherche sans tenir compte des accents et trie par prix', async () => {
    const results = await searchCatalog({ q: 'boise', sort: 'prix_croissant' }, store);
    expect(results.map((r) => r.product.slug)).toEqual(['exemple-homme-boise']);
    const all = await searchCatalog({ sort: 'prix_croissant' }, store);
    const prices = all.map((r) => r.minPrice);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });

  it('renvoie une fiche produit avec ses variantes actives', async () => {
    const view = await getProductView('exemple-femme-floral', store);
    expect(view?.variants.map((v) => v.format)).toEqual(['50 ml', '100 ml']);
    expect(await getProductView('inexistant', store)).toBeNull();
  });

  it('suggestions : basées sur la famille et le budget uniquement', async () => {
    const suggestions = await suggestProducts({ family: 'Oriental', budgetMax: 30000 }, store);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every((s) => s.minPrice <= 30000)).toBe(true);
    expect(suggestions[0].product.family).toBe('Oriental');
  });
});
