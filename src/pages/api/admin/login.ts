import type { APIRoute } from 'astro';
import { COOKIE, login, sameOrigin } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  if (!sameOrigin(request)) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  if (form.get('logout')) {
    cookies.delete(COOKIE, { path: '/' });
    return redirect('/admin', 303);
  }
  const ok = await login(cookies, String(form.get('password') ?? ''), url.protocol === 'https:');
  return redirect(ok ? '/admin' : '/admin?fehler=1', 303);
};
