-- ============================================================================
-- Jeevikaa Couture — Supabase PostgreSQL Schema
-- Run this ONCE in your Supabase SQL Editor:
--    https://supabase.com/dashboard/project/qvhejskltvwklrtlybya/sql/new
-- Then hit the app; it will auto-seed categories, products, testimonials & admin.
-- ============================================================================

create extension if not exists pgcrypto;

-- Categories ----------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  banner text,
  thumbnail text,
  status text default 'active',
  display_order int default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz default now()
);

-- Products ------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sku text,
  category text,
  description text,
  short_description text,
  price int not null default 0,
  discount_price int,
  offer_percentage int default 0,
  stock int default 0,
  material text,
  fabric text,
  colors jsonb default '[]'::jsonb,
  sizes jsonb default '[]'::jsonb,
  images jsonb default '[]'::jsonb,
  thumbnail text,
  tags jsonb default '[]'::jsonb,
  trending bool default false,
  featured bool default false,
  best_seller bool default false,
  new_arrival bool default false,
  hot_deal bool default false,
  rating numeric default 4.7,
  review_count int default 0,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz
);

create index if not exists idx_products_category on products(category);
create index if not exists idx_products_created on products(created_at desc);

-- Orders --------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  customer jsonb not null,
  items jsonb not null,
  subtotal int not null,
  shipping int default 0,
  discount int default 0,
  total int not null,
  payment_method text,
  utr_number text,
  status text default 'placed',
  payment_status text,
  status_history jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz
);

create index if not exists idx_orders_created on orders(created_at desc);
create index if not exists idx_orders_order_id on orders(order_id);

-- Admins --------------------------------------------------------------------
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  role text default 'super_admin',
  password_hash text not null,
  created_at timestamptz default now()
);

-- Testimonials --------------------------------------------------------------
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text,
  location text,
  rating int default 5,
  text text,
  image text,
  created_at timestamptz default now()
);

-- Newsletter ----------------------------------------------------------------
create table if not exists newsletter (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- Settings (used for seed flag & site config) ------------------------------
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb,
  updated_at timestamptz default now()
);

-- Wishlist / Reviews / Coupons (optional — for future use) -----------------
create table if not exists wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  customer_name text,
  rating int,
  review text,
  photos jsonb default '[]'::jsonb,
  admin_reply text,
  status text default 'approved',
  created_at timestamptz default now()
);

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text,
  discount_value int,
  min_order int,
  max_discount int,
  expires_at timestamptz,
  usage_limit int,
  used_count int default 0,
  status text default 'active',
  created_at timestamptz default now()
);
