// Types métier partagés. Aucune dépendance vers Next.js : ce module reste testable seul.

export const GENDERS = ['femme', 'homme', 'mixte'] as const;
export type Gender = (typeof GENDERS)[number];

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  family: string | null;
  gender: Gender;
  isNew: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Variant {
  id: string;
  productId: string;
  format: string;
  sku: string;
  /** Prix en FCFA, entier. */
  priceXof: number;
  stock: number;
  isActive: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  productIds: string[];
}

export interface Zone {
  id: string;
  name: string;
  city: string;
  fee: number;
  /** Montant à partir duquel la livraison est offerte, ou null. */
  freeShippingFrom: number | null;
  delayText: string | null;
  isActive: boolean;
}

export const DISCOUNT_TYPES = ['percent', 'fixed'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export interface Promotion {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  startAt: string | null;
  endAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  minSubtotal: number;
  isActive: boolean;
}

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ['cash_on_delivery', 'mobile_money', 'card'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface OrderLine {
  variantId: string;
  productName: string;
  format: string;
  sku: string;
  unitPriceXof: number;
  quantity: number;
}

export interface StatusEvent {
  at: string;
  from: OrderStatus | null;
  to: OrderStatus;
  actor: string;
}

export interface Order {
  reference: string;
  idempotencyKey: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customer: {
    name: string;
    phone: string;
    email: string | null;
    newsletterConsent: boolean;
  };
  delivery: {
    zoneId: string;
    zoneName: string;
    district: string;
    address: string;
    notes: string | null;
  };
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  promotionCode: string | null;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  history: StatusEvent[];
}

export interface AuditEntry {
  at: string;
  actor: string;
  action: string;
  target: string | null;
  details: Record<string, unknown>;
}
