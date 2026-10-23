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

// ---- Promotions (Aktionen) ----
export const PROMO_THEMES = ['none', 'christmas', 'newyear', 'easter', 'valentine', 'summer', 'autumn'] as const;
export type PromoTheme = (typeof PROMO_THEMES)[number];

/** A seasonal promotion card on the homepage, shown from `startsOn` to `endsOn` (YYYY-MM-DD, inclusive). */
export type Promotion = {
  id: string;
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  startsOn: string;
  endsOn: string;
  location: WeeklyLocation;
  theme: PromoTheme;
  hasPhoto: boolean;
  active: boolean;
  createdAt: string;
};
export type PromotionFields = Omit<Promotion, 'id' | 'hasPhoto' | 'createdAt'>;
/** A new photo, or `null` to remove the current one; leave out to keep it. */
export type PromotionPhoto = { bytes: Uint8Array; type: string } | null;

const PROMO_COLUMNS = 'id, eyebrow, title, highlight, body, starts_on, ends_on, location, theme, photo_path, active, created_at';
const promoMemory = [] as (Promotion & { photo?: { bytes: Uint8Array; type: string } })[];

const toPromotion = (row: Record<string, unknown>): Promotion => ({
  id: String(row.id),
  eyebrow: String(row.eyebrow ?? ''),
  title: String(row.title),
  highlight: String(row.highlight ?? ''),
  body: String(row.body ?? ''),
  startsOn: String(row.starts_on),
  endsOn: String(row.ends_on),
  location: row.location as WeeklyLocation,
  theme: row.theme as PromoTheme,
  hasPhoto: Boolean(row.photo_path),
  active: Boolean(row.active),
  createdAt: String(row.created_at),
});
const fromFields = (f: PromotionFields) => ({
  eyebrow: f.eyebrow,
  title: f.title,
  highlight: f.highlight,
  body: f.body,
  starts_on: f.startsOn,
  ends_on: f.endsOn,
  location: f.location,
  theme: f.theme,
  active: f.active,
});
const promoTableError = (message: string) =>
  /promotions/.test(message) ? 'Die Tabelle promotions fehlt – bitte den SQL-Code aus supabase/schema.sql erneut in Supabase ausführen.' : message;

/** Earliest start first. */
export async function listPromotions(): Promise<Promotion[]> {
  const supabase = db();
  if (!supabase) {
    if (!import.meta.env.DEV) return [];
    return promoMemory.map(({ photo, ...p }) => p).sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  }
  const { data, error } = await supabase.from('promotions').select(PROMO_COLUMNS).order('starts_on');
  if (error) throw new Error(promoTableError(error.message));
  return data.map(toPromotion);
}

/** Creates a promotion (no `id`) or updates one. */
export async function savePromotion(id: string | null, fields: PromotionFields, photo?: PromotionPhoto): Promise<Promotion> {
  const supabase = db();
  if (!supabase) {
    devOnly();
    let promo = promoMemory.find((p) => p.id === id);
    if (!promo) {
      if (id) throw new Error('Aktion nicht gefunden');
      promo = { id: crypto.randomUUID(), hasPhoto: false, createdAt: new Date().toISOString(), ...fields };
      promoMemory.push(promo);
    }
    Object.assign(promo, fields);
    if (photo !== undefined) promo.photo = photo ?? undefined;
    promo.hasPhoto = Boolean(promo.photo);
    const { photo: _, ...rest } = promo;
    return rest;
  }

  const promoId = id ?? crypto.randomUUID();
  const { data: old } = id ? await supabase.from('promotions').select('photo_path').eq('id', id).maybeSingle() : { data: null };
  if (id && !old) throw new Error('Aktion nicht gefunden');
  const row: Record<string, unknown> = { id: promoId, ...fromFields(fields) };
  if (photo) {
    row.photo_path = `aktionen/${promoId}-${Date.now()}.${photo.type === 'image/webp' ? 'webp' : 'jpg'}`;
    const upload = await supabase.storage.from(BUCKET).upload(String(row.photo_path), photo.bytes, { contentType: photo.type });
    if (upload.error) throw new Error(upload.error.message);
  } else if (photo === null) row.photo_path = null;

  const { data, error } = await supabase.from('promotions').upsert(row).select(PROMO_COLUMNS).single();
  if (error) {
    if (photo) await supabase.storage.from(BUCKET).remove([String(row.photo_path)]);
    throw new Error(promoTableError(error.message));
  }
  if (photo !== undefined && old?.photo_path) await supabase.storage.from(BUCKET).remove([old.photo_path]);
  return toPromotion(data);
}

export async function deletePromotion(id: string): Promise<void> {
  const supabase = db();
  if (!supabase) {
    devOnly();
    const i = promoMemory.findIndex((p) => p.id === id);
    if (i >= 0) promoMemory.splice(i, 1);
    return;
  }
  const { data } = await supabase.from('promotions').select('photo_path').eq('id', id).maybeSingle();
  const { error } = await supabase.from('promotions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  if (data?.photo_path) await supabase.storage.from(BUCKET).remove([data.photo_path]);
}

/** The promotion photo, for /api/aktionen/[id]. `visible` is false for hidden or not (yet) running promotions. */
export async function getPromotionPhoto(id: string): Promise<{ bytes: Uint8Array; type: string; visible: boolean } | null> {
  const supabase = db();
  const today = berlinToday();
  if (!supabase) {
    const promo = import.meta.env.DEV ? promoMemory.find((p) => p.id === id) : undefined;
    return promo?.photo ? { ...promo.photo, visible: isRunning(promo, today) } : null;
  }
  const { data } = await supabase.from('promotions').select('photo_path, active, starts_on, ends_on').eq('id', id).maybeSingle();
  if (!data?.photo_path) return null;
  const file = await supabase.storage.from(BUCKET).download(data.photo_path);
  if (file.error || !file.data) return null;
  return {
    bytes: new Uint8Array(await file.data.arrayBuffer()),
    type: file.data.type || 'image/jpeg',
    visible: isRunning({ active: data.active, startsOn: data.starts_on, endsOn: data.ends_on }, today),
  };
}

/** Today's date in Berlin as YYYY-MM-DD (the server runs in UTC). */
export const berlinToday = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
export const isRunning = (p: Pick<Promotion, 'active' | 'startsOn' | 'endsOn'>, today: string) =>
  p.active && p.startsOn <= today && today <= p.endsOn;

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
