-- Run once in Supabase → SQL Editor.
-- Only the website's server (service role key) reads and writes these tables;
-- row level security is on with no policies, so the public API key cannot touch them.

create table if not exists weekly_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  price       numeric(6, 2) check (price >= 0),
  allergens   text,
  location    text not null default 'both' check (location in ('both', 'ledi', 'due')),
  active      boolean not null default true,
  sort        integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Prices for the regular menu (src/data/menu.ts), keyed by itemKey().
create table if not exists menu_prices (
  item_key   text primary key,
  price      numeric(6, 2) not null check (price >= 0),
  updated_at timestamptz not null default now()
);

alter table weekly_items enable row level security;
alter table menu_prices enable row level security;

-- Admin settings, e.g. the password set on /admin → Konto (stored as a scrypt hash).
create table if not exists admin_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);
alter table admin_settings enable row level security;
