-- ==================================================================
-- Le Parfum d'Eden — schéma initial (PostgreSQL / Supabase)
--
-- Principes :
--  * RLS activé sur toutes les tables.
--  * Lecture publique limitée au catalogue actif.
--  * Toutes les écritures passent par le serveur Next.js avec la clé
--    service_role (jamais exposée au navigateur).
--  * Les montants sont des entiers en FCFA (XOF).
-- ==================================================================

create extension if not exists "pgcrypto";

-- ---------- Catalogue ----------------------------------------------

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  description text,
  family text,
  gender text not null default 'mixte' check (gender in ('femme', 'homme', 'mixte')),
  is_new boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists product_collections (
  product_id uuid not null references products(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete restrict,
  format text not null,
  sku text unique not null,
  price_xof integer not null check (price_xof >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  sort_order int not null default 0
);

-- ---------- Livraison et promotions ----------------------------------

create table if not exists delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  fee_xof integer not null check (fee_xof >= 0),
  free_shipping_from_xof integer check (free_shipping_from_xof is null or free_shipping_from_xof >= 0),
  delay_text text,
  is_active boolean not null default true
);

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code = upper(code)),
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  value integer not null check (value > 0),
  start_at timestamptz,
  end_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  min_subtotal_xof integer not null default 0 check (min_subtotal_xof >= 0),
  is_active boolean not null default true,
  check (discount_type <> 'percent' or value <= 100)
);

-- ---------- Commandes ------------------------------------------------

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  public_reference text unique not null check (public_reference ~ '^PE-[A-Z2-9]{8}$'),
  idempotency_key uuid unique not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned')),
  payment_method text not null check (payment_method in ('cash_on_delivery', 'mobile_money', 'card')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  newsletter_consent boolean not null default false,
  delivery_zone_id uuid references delivery_zones(id) on delete restrict,
  delivery_zone_name text not null,
  delivery_district text not null,
  delivery_address text not null,
  delivery_notes text,
  promotion_code text,
  subtotal_xof integer not null check (subtotal_xof >= 0),
  discount_xof integer not null default 0 check (discount_xof >= 0),
  delivery_fee_xof integer not null default 0 check (delivery_fee_xof >= 0),
  total_xof integer not null check (total_xof >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  product_name_snapshot text not null,
  format_snapshot text not null,
  sku_snapshot text not null,
  unit_price_xof_snapshot integer not null check (unit_price_xof_snapshot >= 0),
  quantity integer not null check (quantity > 0)
);

create table if not exists order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor text not null,
  created_at timestamptz not null default now()
);

-- ---------- Paiements, journal, administration -----------------------

create table if not exists payment_webhook_events (
  event_id text primary key,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  actor text not null,
  action text not null,
  target text,
  details jsonb not null default '{}'::jsonb, -- jamais de mot de passe, jeton ou secret
  created_at timestamptz not null default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('owner', 'manager', 'preparer', 'reader')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Sécurité : RLS ------------------------------------------

alter table collections enable row level security;
alter table products enable row level security;
alter table product_collections enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table delivery_zones enable row level security;
alter table promotions enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;
alter table payment_webhook_events enable row level security;
alter table audit_logs enable row level security;
alter table admin_users enable row level security;

-- Lecture publique limitée au catalogue actif.
create policy "collections actives en lecture publique" on collections
  for select using (is_active);
create policy "produits actifs en lecture publique" on products
  for select using (is_active);
create policy "variantes actives en lecture publique" on product_variants
  for select using (is_active);
create policy "liens produits-collections en lecture publique" on product_collections
  for select using (true);
create policy "images en lecture publique" on product_images
  for select using (true);
create policy "zones actives en lecture publique" on delivery_zones
  for select using (is_active);

-- Aucune politique pour orders, order_items, promotions, audit_logs,
-- admin_users, payment_webhook_events : accès uniquement via service_role.

-- ---------- Décrément de stock atomique ------------------------------

-- Reçoit un tableau JSON [{"variant_id": "...", "quantity": n}, ...].
-- Verrouille les lignes par ordre croissant (évite les interblocages) et
-- échoue si une variante est inactive ou en stock insuffisant.
create or replace function decrement_stock(lines jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    select (x ->> 'variant_id')::uuid as variant_id,
           (x ->> 'quantity')::int    as qty
    from jsonb_array_elements(lines) as x
    order by 1
  loop
    update product_variants
       set stock_quantity = stock_quantity - r.qty
     where id = r.variant_id
       and is_active
       and stock_quantity >= r.qty;

    if not found then
      raise exception 'STOCK_INSUFFISANT:%', r.variant_id using errcode = 'P0001';
    end if;
  end loop;
end;
$$;

revoke execute on function decrement_stock(jsonb) from public, anon, authenticated;
