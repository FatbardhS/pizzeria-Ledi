import type { APIRoute } from 'astro';
import { COOKIE, isAdmin, login, logoutEverywhere, sameOrigin } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, url, clientAddress }) => {
  if (!sameOrigin(request)) return new Response('Forbidden', { status: 403 });
  const form = await request.formData().catch(() => null);
  if (!form) return redirect('/admin?fehler=1', 303);

  const logout = form.get('logout');
  if (logout) {
    if (logout === 'all' && (await isAdmin(cookies))) await logoutEverywhere().catch(() => {});
    cookies.delete(COOKIE, { path: '/' });
    return redirect('/admin', 303);
  }

  const ip = clientAddress || request.headers.get('x-real-ip') || 'unknown';
  const result = await login(cookies, String(form.get('password') ?? '').trim(), ip, url.protocol === 'https:');
  const target = { ok: '/admin', wrong: '/admin?fehler=1', locked: '/admin?gesperrt=1', error: '/admin?serverfehler=1' }[result];
  return redirect(target, 303);
};
