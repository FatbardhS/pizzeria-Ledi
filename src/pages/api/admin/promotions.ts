import type { APIRoute } from 'astro';
import { isAdmin, sameOrigin } from '../../../lib/auth';
import {
  PROMO_THEMES,
  deletePromotion,
  listPromotions,
  savePromotion,
  type PromoTheme,
  type PromotionFields,
  type PromotionPhoto,
  type WeeklyLocation,
} from '../../../lib/store';

export const prerender = false;

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/webp', 'image/png'];

const guard = async (request: Request, cookies: Parameters<typeof isAdmin>[0]) =>
  !(await isAdmin(cookies)) ? new Response('Nicht angemeldet', { status: 401 })
  : !sameOrigin(request) ? new Response('Forbidden', { status: 403 })
  : null;

const bad = (msg: string) => new Response(msg, { status: 400 });
const fail = (e: unknown) => new Response((e as Error).message, { status: 500 });
const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? '').trim().slice(0, max);
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

export const GET: APIRoute = async ({ request, cookies }) =>
  (await guard(request, cookies)) ?? Response.json(await listPromotions());

/**
 * Create or update: multipart form with `id` (empty for new), `eyebrow`, `title`, `highlight`, `body`,
 * `startsOn`, `endsOn`, `location`, `theme`, `active`, and optionally `photo` (file) or `removePhoto=1`.
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  const denied = await guard(request, cookies);
  if (denied) return denied;
  const form = await request.formData().catch(() => null);
  if (!form) return bad('Ungültige Anfrage');

  const location = String(form.get('location'));
  const theme = String(form.get('theme'));
  const fields: PromotionFields = {
    eyebrow: text(form, 'eyebrow', 60),
    title: text(form, 'title', 120),
    highlight: text(form, 'highlight', 80),
    body: text(form, 'body', 400),
    startsOn: text(form, 'startsOn', 10),
    endsOn: text(form, 'endsOn', 10),
    location: (['both', 'ledi', 'due'].includes(location) ? location : 'both') as WeeklyLocation,
    theme: (PROMO_THEMES as readonly string[]).includes(theme) ? (theme as PromoTheme) : 'none',
    active: form.get('active') !== '0',
  };
  if (!fields.title) return bad('Bitte eine Überschrift eingeben.');
  if (!isDate(fields.startsOn) || !isDate(fields.endsOn)) return bad('Bitte Start- und Enddatum wählen.');
  if (fields.endsOn < fields.startsOn) return bad('Das Enddatum liegt vor dem Startdatum.');

  let photo: PromotionPhoto | undefined;
  const file = form.get('photo');
  if (file instanceof File && file.size) {
    if (!TYPES.includes(file.type)) return bad('Bitte ein JPG-, PNG- oder WebP-Foto hochladen.');
    if (file.size > MAX_BYTES) return bad('Das Foto ist zu groß (max. 4 MB).');
    photo = { bytes: new Uint8Array(await file.arrayBuffer()), type: file.type };
  } else if (form.get('removePhoto') === '1') photo = null;

  const id = text(form, 'id', 36) || null;
  try {
    return Response.json(await savePromotion(id, fields, photo));
  } catch (e) {
    return fail(e);
  }
};

export const DELETE: APIRoute = async ({ request, cookies, url }) => {
  const denied = await guard(request, cookies);
  if (denied) return denied;
  const id = url.searchParams.get('id');
  if (!id) return bad('id fehlt');
  try {
    await deletePromotion(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return fail(e);
  }
};
