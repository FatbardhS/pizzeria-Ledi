-- Run once in Supabase → SQL Editor.
-- Only the website's server (service role key) reads and writes these tables;
-- row level security is on with no policies, so the public API key cannot touch them.

-- Wochenkarte photos uploaded on /admin. The image files live in the private storage bucket "wochenkarte".
create table if not exists weekly_photos (
  id         uuid primary key default gen_random_uuid(),
  path       text not null,
  location   text not null default 'both' check (location in ('both', 'ledi', 'due')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('wochenkarte', 'wochenkarte', false)
on conflict (id) do nothing;

-- Prices for the regular menu (src/data/menu.ts), keyed by itemKey().
create table if not exists menu_prices (
  item_key   text primary key,
  price      numeric(6, 2) not null check (price >= 0),
  updated_at timestamptz not null default now()
);

alter table weekly_photos enable row level security;
alter table menu_prices enable row level security;

-- Admin settings, e.g. the password set on /admin → Konto (stored as a scrypt hash).
create table if not exists admin_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);
alter table admin_settings enable row level security;

-- Promotions (Aktionen) shown as a card on the homepage between their start and end date.
-- Optional photos live in the same private bucket "wochenkarte", under "aktionen/".
create table if not exists promotions (
  id         uuid primary key default gen_random_uuid(),
  eyebrow    text not null default '',
  title      text not null,
  highlight  text not null default '',
  body       text not null default '',
  starts_on  date not null,
  ends_on    date not null,
  location   text not null default 'both' check (location in ('both', 'ledi', 'due')),
  theme      text not null default 'none' check (theme in ('none', 'christmas', 'newyear', 'easter', 'valentine', 'summer', 'autumn')),
  photo_path text,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
alter table promotions enable row level security;
