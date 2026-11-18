import {
  assertOrderTransition,
  canTransitionPayment,
  shouldRestock,
} from '@/lib/domain/orders';
import type {
  AuditEntry,
  Collection,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Promotion,
  Variant,
  Zone,
} from '@/lib/domain/types';
import type { SeedData } from './seed';
import { PromotionUnavailableError, StockError, type Store } from './types';

const clone = <T>(value: T): T => structuredClone(value);

/**
 * Implémentation en mémoire : développement et tests uniquement.
 * Les données sont perdues au redémarrage. Les écritures sont sérialisées
 * (file d'attente) pour simuler l'atomicité d'une transaction.
 */
export class MemoryStore implements Store {
  private readonly products: Product[];
  private readonly variants: Variant[];
  private readonly collections: Collection[];
  private readonly zones: Zone[];
  private readonly promotions = new Map<string, Promotion>();
  private readonly orders = new Map<string, Order>();
  private readonly idempotency = new Map<string, string>();
  private readonly webhookEvents = new Set<string>();
  private readonly auditLog: AuditEntry[] = [];
  private queue: Promise<unknown> = Promise.resolve();

  constructor(seed: SeedData) {
    this.products = clone(seed.products);
    this.variants = clone(seed.variants);
    this.collections = clone(seed.collections);
    this.zones = clone(seed.zones);
    for (const promo of seed.promotions) {
      this.promotions.set(promo.code, clone(promo));
    }
  }

  private serialize<T>(task: () => T): Promise<T> {
    const run = this.queue.then(() => task());
    this.queue = run.catch(() => undefined);
    return run;
  }

  private requireOrder(reference: string): Order {
    const order = this.orders.get(reference);
    if (!order) {
      throw new Error(`Commande introuvable : ${reference}`);
    }
    return order;
  }

  private requireVariant(variantId: string): Variant {
    const variant = this.variants.find((v) => v.id === variantId);
    if (!variant) {
      throw new Error(`Variante introuvable : ${variantId}`);
    }
    return variant;
  }

  async listProducts(): Promise<Product[]> {
    return clone(this.products);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = this.products.find((p) => p.slug === slug);
    return product ? clone(product) : null;
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id);
    return product ? clone(product) : null;
  }

  async listVariants(): Promise<Variant[]> {
    return clone(this.variants);
  }

  async listVariantsForProduct(productId: string): Promise<Variant[]> {
    return clone(this.variants.filter((v) => v.productId === productId));
  }

  async getVariantById(id: string): Promise<Variant | null> {
    const variant = this.variants.find((v) => v.id === id);
    return variant ? clone(variant) : null;
  }

  async listCollections(): Promise<Collection[]> {
    return clone(this.collections);
  }

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    const collection = this.collections.find((c) => c.slug === slug);
    return collection ? clone(collection) : null;
  }

  async listZones(): Promise<Zone[]> {
    return clone(this.zones);
  }

  async getZone(id: string): Promise<Zone | null> {
    const zone = this.zones.find((z) => z.id === id);
    return zone ? clone(zone) : null;
  }

  async listPromotions(): Promise<Promotion[]> {
    return clone([...this.promotions.values()]);
  }

  async getPromotionByCode(code: string): Promise<Promotion | null> {
    const promo = this.promotions.get(code);
    return promo ? clone(promo) : null;
  }

  upsertPromotion(promo: Promotion): Promise<void> {
    return this.serialize(() => {
      const existing = this.promotions.get(promo.code);
      this.promotions.set(promo.code, {
        ...clone(promo),
        usedCount: existing ? existing.usedCount : promo.usedCount,
      });
    });
  }

  upsertZone(zone: Zone): Promise<void> {
    return this.serialize(() => {
      const index = this.zones.findIndex((z) => z.id === zone.id);
      if (index === -1) {
        this.zones.push(clone(zone));
      } else {
        this.zones[index] = clone(zone);
      }
    });
  }

  setVariantStock(variantId: string, stock: number): Promise<void> {
    return this.serialize(() => {
      this.requireVariant(variantId).stock = stock;
    });
  }

  setVariantPrice(variantId: string, priceXof: number): Promise<void> {
    return this.serialize(() => {
      this.requireVariant(variantId).priceXof = priceXof;
    });
  }

  createOrder(order: Order): Promise<{ order: Order; created: boolean }> {
    return this.serialize(() => {
      const known = this.idempotency.get(order.idempotencyKey);
      if (known) {
        return { order: clone(this.requireOrder(known)), created: false };
      }
      if (this.orders.has(order.reference)) {
        throw new Error('COLLISION_REFERENCE');
      }

      for (const line of order.lines) {
        const variant = this.variants.find((v) => v.id === line.variantId);
        if (!variant || !variant.isActive) {
          throw new StockError(line.variantId, 0);
        }
        if (variant.stock < line.quantity) {
          throw new StockError(line.variantId, variant.stock);
        }
      }

      const promo = order.promotionCode ? this.promotions.get(order.promotionCode) : undefined;
      if (order.promotionCode && !promo) {
        throw new PromotionUnavailableError();
      }
      if (promo && promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
        throw new PromotionUnavailableError();
      }

      for (const line of order.lines) {
        this.requireVariant(line.variantId).stock -= line.quantity;
      }
      if (promo) {
        promo.usedCount += 1;
      }

      this.orders.set(order.reference, clone(order));
      this.idempotency.set(order.idempotencyKey, order.reference);
      return { order: clone(order), created: true };
    });
  }

  async listOrders(): Promise<Order[]> {
    const all = [...this.orders.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return clone(all);
  }

  async getOrder(reference: string): Promise<Order | null> {
    const order = this.orders.get(reference);
    return order ? clone(order) : null;
  }

  updateOrderStatus(reference: string, to: OrderStatus, actor: string): Promise<Order> {
    return this.serialize(() => {
      const order = this.requireOrder(reference);
      assertOrderTransition(order.status, to);
      if (shouldRestock(to)) {
        for (const line of order.lines) {
          const variant = this.variants.find((v) => v.id === line.variantId);
          if (variant) {
            variant.stock += line.quantity;
          }
        }
      }
      const at = new Date().toISOString();
      order.history.push({ at, from: order.status, to, actor });
      order.status = to;
      order.updatedAt = at;
      return clone(order);
    });
  }

  setPaymentStatus(reference: string, to: PaymentStatus): Promise<Order> {
    return this.serialize(() => {
      const order = this.requireOrder(reference);
      if (!canTransitionPayment(order.paymentStatus, to)) {
        throw new Error(`Transition de paiement interdite : ${order.paymentStatus} → ${to}`);
      }
      order.paymentStatus = to;
      order.updatedAt = new Date().toISOString();
      return clone(order);
    });
  }

  async isWebhookEventProcessed(eventId: string): Promise<boolean> {
    return this.webhookEvents.has(eventId);
  }

  markWebhookEventProcessed(eventId: string): Promise<void> {
    return this.serialize(() => {
      this.webhookEvents.add(eventId);
    });
  }

  appendAudit(entry: AuditEntry): Promise<void> {
    return this.serialize(() => {
      this.auditLog.push(clone(entry));
    });
  }

  async listAudit(limit: number): Promise<AuditEntry[]> {
    return clone(this.auditLog.slice(-limit).reverse());
  }

  /** Utilitaire de test : insère une commande déjà construite. */
  async seedOrder(order: Order): Promise<void> {
    await this.createOrder(order);
  }
}
