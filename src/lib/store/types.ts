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

export class StockError extends Error {
  constructor(
    readonly variantId: string,
    readonly available: number,
  ) {
    super('STOCK_INSUFFISANT');
    this.name = 'StockError';
  }
}

export class PromotionUnavailableError extends Error {
  constructor() {
    super('PROMOTION_INDISPONIBLE');
    this.name = 'PromotionUnavailableError';
  }
}

/**
 * Contrat d'accès aux données. Deux implémentations sont prévues :
 *  - MemoryStore (développement et tests) ;
 *  - SupabaseStore (production), à écrire selon supabase/migrations/0001_init.sql.
 * Toute écriture composée (commande + stock + promotion) doit être atomique.
 */
export interface Store {
  listProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  listVariants(): Promise<Variant[]>;
  listVariantsForProduct(productId: string): Promise<Variant[]>;
  getVariantById(id: string): Promise<Variant | null>;
  listCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<Collection | null>;
  listZones(): Promise<Zone[]>;
  getZone(id: string): Promise<Zone | null>;
  listPromotions(): Promise<Promotion[]>;
  getPromotionByCode(code: string): Promise<Promotion | null>;
  upsertPromotion(promo: Promotion): Promise<void>;
  upsertZone(zone: Zone): Promise<void>;
  setVariantStock(variantId: string, stock: number): Promise<void>;
  setVariantPrice(variantId: string, priceXof: number): Promise<void>;
  /** Crée la commande, décrémente le stock et l'usage promo. Idempotent sur idempotencyKey. */
  createOrder(order: Order): Promise<{ order: Order; created: boolean }>;
  listOrders(): Promise<Order[]>;
  getOrder(reference: string): Promise<Order | null>;
  updateOrderStatus(reference: string, to: OrderStatus, actor: string): Promise<Order>;
  setPaymentStatus(reference: string, to: PaymentStatus): Promise<Order>;
  isWebhookEventProcessed(eventId: string): Promise<boolean>;
  markWebhookEventProcessed(eventId: string): Promise<void>;
  appendAudit(entry: AuditEntry): Promise<void>;
  listAudit(limit: number): Promise<AuditEntry[]>;
}
