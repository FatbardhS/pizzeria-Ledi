import type { APIRoute } from 'astro';
import { changePassword, isAdmin, sameOrigin } from '../../../lib/auth';

export const prerender = false;

/** Body: { current: string, next: string } */
export const POST: APIRoute = async ({ request, cookies, url }) => {
  if (!(await isAdmin(cookies))) return new Response('Nicht angemeldet', { status: 401 });
  if (!sameOrigin(request)) return new Response('Forbidden', { status: 403 });
  const body = await request.json().catch(() => null);
  const current = typeof body?.current === 'string' ? body.current.trim() : '';
  const next = typeof body?.next === 'string' ? body.next.trim() : '';
  try {
    const error = await changePassword(cookies, current, next, url.protocol === 'https:');
    return error ? new Response(error, { status: 400 }) : new Response(null, { status: 204 });
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }
};
