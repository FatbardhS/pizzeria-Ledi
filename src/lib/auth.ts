// Admin login. The password is either one set on /admin → Konto (stored as a scrypt hash in Supabase)
// or, until then, ADMIN_PASSWORD from Vercel. After login the browser keeps a cookie holding an HMAC
// derived from that secret, so changing the password logs everyone out.
import type { AstroCookies } from 'astro';
import { getSecret } from 'astro:env/server';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { getSetting, setSetting } from './store';

export const COOKIE = 'ledi_admin';
const HASH_KEY = 'admin_password_hash';

/** Fallback password from Vercel. In local development without it the password is "admin". */
// Trimmed: a value pasted into Vercel often carries a trailing space or line break.
const envPassword = () => getSecret('ADMIN_PASSWORD')?.trim() || (import.meta.env.DEV ? 'admin' : null);

/** The current secret: the stored hash if a password was set on /admin, else the Vercel password. */
const currentSecret = async () => {
  const hash = await getSetting(HASH_KEY);
  if (hash) return { hash, plain: null };
  const plain = envPassword();
  return plain ? { hash: null, plain } : null;
};

export const hasPassword = async () => (await currentSecret()) !== null;

const hashPassword = (password: string) => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, 32).toString('hex')}`;
};

const sameText = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

const matches = (password: string, secret: NonNullable<Awaited<ReturnType<typeof currentSecret>>>) => {
  if (secret.plain !== null) return sameText(password, secret.plain);
  const [, salt, hash] = secret.hash!.split('$');
  return sameText(scryptSync(password, Buffer.from(salt, 'hex'), 32).toString('hex'), hash);
};

const token = async (secret: string) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('ledi-admin-v1'));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const setCookie = async (cookies: AstroCookies, secret: string, secure: boolean) =>
  cookies.set(COOKIE, await token(secret), {
    path: '/',
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
  });

export async function login(cookies: AstroCookies, password: string, secure: boolean) {
  const secret = await currentSecret();
  if (!secret || !matches(password, secret)) return false;
  await setCookie(cookies, secret.hash ?? secret.plain!, secure);
  return true;
}

export async function isAdmin(cookies: AstroCookies) {
  const secret = await currentSecret();
  const value = cookies.get(COOKIE)?.value;
  return Boolean(secret && value && sameText(value, await token(secret.hash ?? secret.plain!)));
}

/** Changes the password; returns an error message or null. Keeps this browser logged in. */
export async function changePassword(cookies: AstroCookies, current: string, next: string, secure: boolean) {
  const secret = await currentSecret();
  if (!secret || !matches(current, secret)) return 'Das aktuelle Passwort ist falsch.';
  if (next.length < 8) return 'Das neue Passwort muss mindestens 8 Zeichen haben.';
  const hash = hashPassword(next);
  await setSetting(HASH_KEY, hash);
  await setCookie(cookies, hash, secure);
  return null;
}

/** Blocks writes coming from other websites (in addition to the SameSite cookie). */
export const sameOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
};
