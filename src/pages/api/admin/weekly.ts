import type { APIRoute } from 'astro';
import { isAdmin, sameOrigin } from '../../../lib/auth';
import { addWeeklyPhoto, deleteWeeklyPhoto, listWeeklyPhotos, updateWeeklyPhoto, type WeeklyLocation } from '../../../lib/store';

export const prerender = false;

const MAX_BYTES = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB; the admin page shrinks photos well below this.
const TYPES = ['image/jpeg', 'image/webp', 'image/png'];

const guard = async (request: Request, cookies: Parameters<typeof isAdmin>[0]) =>
  !(await isAdmin(cookies)) ? new Response('Nicht angemeldet', { status: 401 })
  : !sameOrigin(request) ? new Response('Forbidden', { status: 403 })
  : null;

const location = (v: unknown): WeeklyLocation | undefined => (v === 'ledi' || v === 'due' || v === 'both' ? v : undefined);
const fail = (e: unknown) => new Response((e as Error).message, { status: 500 });

export const GET: APIRoute = async ({ request, cookies }) =>
  (await guard(request, cookies)) ?? Response.json(await listWeeklyPhotos());

/** Upload: multipart form with `photo` (image file) and `location`. */
export const POST: APIRoute = async ({ request, cookies }) => {
  const denied = await guard(request, cookies);
  if (denied) return denied;
  const form = await request.formData().catch(() => null);
  const file = form?.get('photo');
  if (!(file instanceof File) || !file.size) return new Response('Bitte ein Foto auswählen.', { status: 400 });
  if (!TYPES.includes(file.type)) return new Response('Bitte ein JPG-, PNG- oder WebP-Foto hochladen.', { status: 400 });
  if (file.size > MAX_BYTES) return new Response('Das Foto ist zu groß (max. 4 MB).', { status: 400 });
  try {
    return Response.json(await addWeeklyPhoto(new Uint8Array(await file.arrayBuffer()), file.type, location(form!.get('location')) ?? 'both'));
  } catch (e) {
    return fail(e);
  }
};

/** Change location or visibility: { id, location?, active? } */
export const PATCH: APIRoute = async ({ request, cookies }) => {
  const denied = await guard(request, cookies);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (typeof body?.id !== 'string') return new Response('id fehlt', { status: 400 });
  const fields: { location?: WeeklyLocation; active?: boolean } = {};
  if (location(body.location)) fields.location = location(body.location);
  if (typeof body.active === 'boolean') fields.active = body.active;
  try {
    return Response.json(await updateWeeklyPhoto(body.id, fields));
  } catch (e) {
    return fail(e);
  }
};

export const DELETE: APIRoute = async ({ request, cookies, url }) => {
  const denied = await guard(request, cookies);
  if (denied) return denied;
  const id = url.searchParams.get('id');
  if (!id) return new Response('id fehlt', { status: 400 });
  try {
    await deleteWeeklyPhoto(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return fail(e);
  }
};
