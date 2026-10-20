// Single shared admin password (ADMIN_PASSWORD). After login the browser keeps a cookie holding an
// HMAC of the password, so changing the password logs everyone out.
import type { AstroCookies } from 'astro';
import { getSecret } from 'astro:env/server';

export const COOKIE = 'ledi_admin';

/** In local development without ADMIN_PASSWORD the password is "admin". */
export const adminPassword = () => getSecret('ADMIN_PASSWORD') || (import.meta.env.DEV ? 'admin' : null);

const token = async (password: string) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('ledi-admin-v1'));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const sameText = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export async function login(cookies: AstroCookies, password: string, secure: boolean) {
  const expected = adminPassword();
  if (!expected || !sameText(password, expected)) return false;
  cookies.set(COOKIE, await token(expected), {
    path: '/',
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function isAdmin(cookies: AstroCookies) {
  const expected = adminPassword();
  const value = cookies.get(COOKIE)?.value;
  return Boolean(expected && value && sameText(value, await token(expected)));
}

/** Blocks writes coming from other websites (in addition to the SameSite cookie). */
export const sameOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
};
