// Weekly menu photos, menu prices and admin settings. Production uses Supabase (see supabase/schema.sql);
// local development without Supabase keys falls back to an in-memory store that resets on restart.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSecret } from 'astro:env/server';

export type WeeklyLocation = 'both' | 'ledi' | 'due';

/** A photo of the weekly menu (Wochenkarte), shown on the Speisekarte of one or both locations. */
export type WeeklyPhoto = {
  id: string;
  location: WeeklyLocation;
  active: boolean;
  createdAt: string;
};

const BUCKET = 'wochenkarte';

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
const memory = {
  photos: [] as (WeeklyPhoto & { bytes: Uint8Array; type: string })[],
  prices: {} as Record<string, number>,
};
const devOnly = () => {
  if (!import.meta.env.DEV) throw new Error('Supabase ist nicht eingerichtet (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen).');
};

const toPhoto = (row: Record<string, unknown>): WeeklyPhoto => ({
  id: String(row.id),
  location: row.location as WeeklyLocation,
  active: Boolean(row.active),
  createdAt: String(row.created_at),
});

/** Newest first. */
export async function listWeeklyPhotos(): Promise<WeeklyPhoto[]> {
  const supabase = db();
  if (!supabase) {
    if (!import.meta.env.DEV) return [];
    return memory.photos.map(({ bytes, type, ...p }) => p).reverse();
  }
  const { data, error } = await supabase.from('weekly_photos').select('id, location, active, created_at').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(toPhoto);
}

export async function addWeeklyPhoto(bytes: Uint8Array, type: string, location: WeeklyLocation): Promise<WeeklyPhoto> {
  const supabase = db();
  const id = crypto.randomUUID();
  if (!supabase) {
    devOnly();
    const photo = { id, location, active: true, createdAt: new Date().toISOString() };
    memory.photos.push({ ...photo, bytes, type });
    return photo;
  }
  const path = `${id}.${type === 'image/webp' ? 'webp' : 'jpg'}`;
  const upload = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: type });
  if (upload.error) throw new Error(upload.error.message);
  const { data, error } = await supabase.from('weekly_photos').insert({ id, path, location }).select('id, location, active, created_at').single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(error.message);
  }
  return toPhoto(data);
}

export async function updateWeeklyPhoto(id: string, fields: { location?: WeeklyLocation; active?: boolean }): Promise<WeeklyPhoto> {
  const supabase = db();
  if (!supabase) {
    devOnly();
    const photo = memory.photos.find((p) => p.id === id);
    if (!photo) throw new Error('Foto nicht gefunden');
    Object.assign(photo, fields);
    const { bytes, type, ...rest } = photo;
    return rest;
  }
  const { data, error } = await supabase.from('weekly_photos').update(fields).eq('id', id).select('id, location, active, created_at').single();
  if (error) throw new Error(error.message);
  return toPhoto(data);
}

export async function deleteWeeklyPhoto(id: string): Promise<void> {
  const supabase = db();
  if (!supabase) {
    devOnly();
    memory.photos = memory.photos.filter((p) => p.id !== id);
    return;
  }
  const { data } = await supabase.from('weekly_photos').select('path').eq('id', id).maybeSingle();
  const { error } = await supabase.from('weekly_photos').delete().eq('id', id);
  if (error) throw new Error(error.message);
  if (data?.path) await supabase.storage.from(BUCKET).remove([data.path]);
}

/** The image itself, for /api/wochenkarte/[id] (the bucket is private). */
export async function getWeeklyPhotoFile(id: string): Promise<{ bytes: Uint8Array; type: string; active: boolean } | null> {
  const supabase = db();
  if (!supabase) {
    const photo = import.meta.env.DEV ? memory.photos.find((p) => p.id === id) : undefined;
    return photo ? { bytes: photo.bytes, type: photo.type, active: photo.active } : null;
  }
  const { data } = await supabase.from('weekly_photos').select('path, active').eq('id', id).maybeSingle();
  if (!data?.path) return null;
  const file = await supabase.storage.from(BUCKET).download(data.path);
  if (file.error || !file.data) return null;
  return { bytes: new Uint8Array(await file.data.arrayBuffer()), type: file.data.type || 'image/jpeg', active: Boolean(data.active) };
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

// ---- Admin settings (password hash, session epoch, login attempts) ----
const settings = new Map<string, { value: string; updatedAt: number }>();
const missingTable = (code?: string) => code === '42P01' || code === 'PGRST205';

/**
 * Returns null when the setting does not exist (or the admin_settings table was never created).
 * Any other database error throws, so callers fail closed instead of falling back to defaults.
 */
export async function getSetting(key: string): Promise<string | null> {
  const supabase = db();
  if (!supabase) return import.meta.env.DEV ? (settings.get(key)?.value ?? null) : null;
  const { data, error } = await supabase.from('admin_settings').select('value').eq('key', key).maybeSingle();
  if (error) {
    if (missingTable(error.code)) return null;
    throw new Error(`admin_settings: ${error.message}`);
  }
  return data?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const supabase = db();
  if (!supabase) {
    devOnly();
    settings.set(key, { value, updatedAt: Date.now() });
    return;
  }
  const { error } = await supabase.from('admin_settings').upsert({ key, value, updated_at: new Date().toISOString() });
  if (error)
    throw new Error(
      missingTable(error.code) || /admin_settings/.test(error.message)
        ? 'Die Tabelle admin_settings fehlt – bitte den SQL-Code aus supabase/schema.sql erneut in Supabase ausführen.'
        : error.message,
    );
}

export async function deleteSetting(key: string): Promise<void> {
  const supabase = db();
  if (!supabase) {
    settings.delete(key);
    return;
  }
  await supabase.from('admin_settings').delete().eq('key', key);
}

/** Removes settings whose key starts with `prefix` and that were last written before `before`. */
export async function pruneSettings(prefix: string, before: Date): Promise<void> {
  const supabase = db();
  if (!supabase) {
    for (const [k, v] of settings) if (k.startsWith(prefix) && v.updatedAt < before.getTime()) settings.delete(k);
    return;
  }
  await supabase.from('admin_settings').delete().like('key', `${prefix}%`).lt('updated_at', before.toISOString());
}
