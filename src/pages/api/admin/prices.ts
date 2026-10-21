import type { APIRoute } from 'astro';
import { isAdmin, sameOrigin } from '../../../lib/auth';
import { savePrices } from '../../../lib/store';

export const prerender = false;

/** Body: { prices: { [itemKey]: number | null } } */
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAdmin(cookies))) return new Response('Nicht angemeldet', { status: 401 });
  if (!sameOrigin(request)) return new Response('Forbidden', { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.prices !== 'object') return new Response('Ungültige Daten', { status: 400 });
  const prices: Record<string, number | null> = {};
  for (const [key, value] of Object.entries(body.prices as Record<string, unknown>)) {
    if (!/^[a-z0-9-]{1,120}$/.test(key)) return new Response(`Ungültiger Schlüssel: ${key}`, { status: 400 });
    if (value === null || value === '') prices[key] = null;
    else {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0 || n > 9999) return new Response(`Ungültiger Preis bei ${key}`, { status: 400 });
      prices[key] = Math.round(n * 100) / 100;
    }
  }
  try {
    await savePrices(prices);
    return new Response(null, { status: 204 });
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }
};
