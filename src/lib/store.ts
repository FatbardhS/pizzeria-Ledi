// Weekly menu and menu prices. Production uses Supabase (see supabase/schema.sql);
// local development without Supabase keys falls back to an in-memory store that resets on restart.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSecret } from 'astro:env/server';

export type WeeklyLocation = 'both' | 'ledi' | 'due';

export type WeeklyItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  allergens: string | null;
  location: WeeklyLocation;
  active: boolean;
  sort: number;
};

export type WeeklyInput = Omit<WeeklyItem, 'id'> & { id?: string };

let client: SupabaseClient | null | undefined;
const db = () => {
  if (client === undefined) {
    const raw = getSecret('SUPABASE_URL')?.trim();
    const key = getSecret('SUPABASE_SERVICE_ROLE_KEY')?.trim();
    // Accept the API URL copied with a path (e.g. ".../rest/v1/"): the client needs only the origin.
    const url = raw ? new URL(raw).origin : undefined;
    client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  }
  return client;
};

export const isConfigured = () => db() !== null;

// ---- In-memory fallback (development only) ----
const memory = { weekly: [] as WeeklyItem[], prices: {} as Record<string, number> };
const devOnly = () => {
  if (!import.meta.env.DEV) throw new Error('Supabase ist nicht eingerichtet (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen).');
};

const toItem = (row: Record<string, unknown>): WeeklyItem => ({
  id: String(row.id),
  name: String(row.name),
  description: (row.description as string) ?? null,
  price: row.price === null || row.price === undefined ? null : Number(row.price),
  allergens: (row.allergens as string) ?? null,
  location: row.location as WeeklyLocation,
  active: Boolean(row.active),
  sort: Number(row.sort ?? 0),
});

const bySort = (a: WeeklyItem, b: WeeklyItem) => a.sort - b.sort || a.name.localeCompare(b.name, 'de');

export async function listWeekly(): Promise<WeeklyItem[]> {
  const supabase = db();
  if (!supabase) {
    if (!import.meta.env.DEV) return [];
    return [...memory.weekly].sort(bySort);
  }
  const { data, error } = await supabase.from('weekly_items').select('*').order('sort').order('name');
  if (error) throw new Error(error.message);
  return data.map(toItem);
}

export async function saveWeekly(input: WeeklyInput): Promise<WeeklyItem> {
  const supabase = db();
  const { id, ...fields } = input;
  if (!supabase) {
    devOnly();
    const item = { ...fields, id: id ?? crypto.randomUUID() };
    memory.weekly = [...memory.weekly.filter((w) => w.id !== item.id), item];
    return item;
  }
  const query = id
    ? supabase.from('weekly_items').update(fields).eq('id', id)
    : supabase.from('weekly_items').insert(fields);
  const { data, error } = await query.select().single();
  if (error) throw new Error(error.message);
  return toItem(data);
}

export async function deleteWeekly(id: string): Promise<void> {
  const supabase = db();
  if (!supabase) {
    devOnly();
    memory.weekly = memory.weekly.filter((w) => w.id !== id);
    return;
  }
  const { error } = await supabase.from('weekly_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listPrices(): Promise<Record<string, number>> {
  const supabase = db();
  if (!supabase) return import.meta.env.DEV ? { ...memory.prices } : {};
  const { data, error } = await supabase.from('menu_prices').select('item_key, price');
  if (error) throw new Error(error.message);
  return Object.fromEntries(data.map((r) => [r.item_key, Number(r.price)]));
}

/** Saves several prices at once; `null` removes a price (the dish is then not orderable). */
export async function savePrices(prices: Record<string, number | null>): Promise<void> {
  const entries = Object.entries(prices);
  const supabase = db();
  if (!supabase) {
    devOnly();
    for (const [key, price] of entries) {
      if (price === null) delete memory.prices[key];
      else memory.prices[key] = price;
    }
    return;
  }
  const upserts = entries
    .filter(([, p]) => p !== null)
    .map(([item_key, price]) => ({ item_key, price, updated_at: new Date().toISOString() }));
  const removals = entries.filter(([, p]) => p === null).map(([key]) => key);
  if (upserts.length) {
    const { error } = await supabase.from('menu_prices').upsert(upserts);
    if (error) throw new Error(error.message);
  }
  if (removals.length) {
    const { error } = await supabase.from('menu_prices').delete().in('item_key', removals);
    if (error) throw new Error(error.message);
  }
}
