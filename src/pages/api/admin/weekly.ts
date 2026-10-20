import type { APIRoute } from 'astro';
import { isAdmin, sameOrigin } from '../../../lib/auth';
import { deleteWeekly, listWeekly, saveWeekly, type WeeklyInput } from '../../../lib/store';

export const prerender = false;

const guard = async (request: Request, cookies: Parameters<typeof isAdmin>[0]) =>
  !(await isAdmin(cookies)) ? new Response('Nicht angemeldet', { status: 401 })
  : !sameOrigin(request) ? new Response('Forbidden', { status: 403 })
  : null;

const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

export const GET: APIRoute = async ({ request, cookies }) =>
  (await guard(request, cookies)) ?? Response.json(await listWeekly());

export const POST: APIRoute = async ({ request, cookies }) => {
  const denied = await guard(request, cookies);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const name = text(body?.name, 120);
  const price = body?.price === null || body?.price === '' || body?.price === undefined ? null : Number(body.price);
  if (!name) return new Response('Name fehlt', { status: 400 });
  if (price !== null && (!Number.isFinite(price) || price < 0 || price > 9999)) return new Response('Ungültiger Preis', { status: 400 });
  const item: WeeklyInput = {
    id: typeof body.id === 'string' && body.id ? body.id : undefined,
    name,
    description: text(body.description, 400),
    price: price === null ? null : Math.round(price * 100) / 100,
    allergens: text(body.allergens, 60),
    location: ['ledi', 'due'].includes(body.location) ? body.location : 'both',
    active: body.active !== false,
    sort: Number.isInteger(body.sort) ? body.sort : 0,
  };
  try {
    return Response.json(await saveWeekly(item));
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request, cookies, url }) => {
  const denied = await guard(request, cookies);
  if (denied) return denied;
  const id = url.searchParams.get('id');
  if (!id) return new Response('id fehlt', { status: 400 });
  await deleteWeekly(id);
  return new Response(null, { status: 204 });
};
