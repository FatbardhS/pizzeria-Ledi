// Admin login. The password is either one set on /admin → Konto (stored as a scrypt hash in Supabase)
// or, until then, ADMIN_PASSWORD from Vercel. If the stored password cannot be read, nobody gets in
// (no silent fallback to the Vercel password).
//
// Sessions: the cookie holds "<expiry>.<signature>"; the signature is an HMAC over the expiry and a
// session epoch, keyed with the password secret. Sessions end after 7 days, when the password changes,
// or when "Überall abmelden" rotates the epoch.
//
// Brute force: after 5 wrong passwords from one IP within 15 minutes that IP is locked for 15 minutes.
// IPs are only stored as a SHA-256 hash and the records are pruned after a day.
import type { AstroCookies } from 'astro';
import { getSecret } from 'astro:env/server';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { deleteSetting, getSetting, pruneSettings, setSetting } from './store';

export const COOKIE = 'ledi_admin';
const HASH_KEY = 'admin_password_hash';
const EPOCH_KEY = 'session_epoch';
const SESSION_DAYS = 7;
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const FAIL_PREFIX = 'login_fail:';

/** Fallback password from Vercel. In local development without it the password is "admin". */
// Trimmed: a value pasted into Vercel often carries a trailing space or line break.
const envPassword = () => getSecret('ADMIN_PASSWORD')?.trim() || (import.meta.env.DEV ? 'admin' : null);

/** The current secret: the stored hash if a password was set on /admin, else the Vercel password. Throws on database errors. */
const currentSecret = async () => {
  const hash = await getSetting(HASH_KEY);
  if (hash) return { hash, plain: null };
  const plain = envPassword();
  return plain ? { hash: null, plain } : null;
};
type Secret = NonNullable<Awaited<ReturnType<typeof currentSecret>>>;

export const hasPassword = async () => {
  try {
    return (await currentSecret()) !== null;
  } catch {
    return true; // A password may exist; the login form then reports the error.
  }
};

const hashPassword = (password: string) => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, 32).toString('hex')}`;
};

const sameText = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

const matches = (password: string, secret: Secret) => {
  if (secret.plain !== null) return sameText(password, secret.plain);
  const [, salt, hash] = secret.hash!.split('$');
  return sameText(scryptSync(password, Buffer.from(salt, 'hex'), 32).toString('hex'), hash);
};

const sign = async (secret: Secret, epoch: string, expires: number) => {
  const material = secret.hash ?? secret.plain!;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(material), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`ledi-admin-v2:${epoch}:${expires}`));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const epoch = async () => (await getSetting(EPOCH_KEY)) ?? '0';

const startSession = async (cookies: AstroCookies, secret: Secret, secure: boolean) => {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  cookies.set(COOKIE, `${expires}.${await sign(secret, await epoch(), expires)}`, {
    path: '/',
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
};

export async function isAdmin(cookies: AstroCookies) {
  const [exp, sig] = (cookies.get(COOKIE)?.value ?? '').split('.');
  const expires = Number(exp);
  if (!sig || !Number.isFinite(expires) || expires < Date.now()) return false;
  try {
    const secret = await currentSecret();
    return Boolean(secret && sameText(sig, await sign(secret, await epoch(), expires)));
  } catch {
    return false;
  }
}

// ---- Login attempt limit ----
type Fails = { n: number; first: number; until: number };
const failKey = (ip: string) => FAIL_PREFIX + createHash('sha256').update(`ledi:${ip}`).digest('hex').slice(0, 32);
const readFails = async (key: string): Promise<Fails> => {
  try {
    const raw = await getSetting(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { n: 0, first: Date.now(), until: 0 };
};

export type LoginResult = 'ok' | 'wrong' | 'locked' | 'error';

export async function login(cookies: AstroCookies, password: string, ip: string, secure: boolean): Promise<LoginResult> {
  const key = failKey(ip);
  const fails = await readFails(key);
  if (fails.until > Date.now()) return 'locked';

  let secret: Secret | null;
  try {
    secret = await currentSecret();
  } catch {
    return 'error';
  }
  if (secret && matches(password, secret)) {
    await deleteSetting(key).catch(() => {});
    await startSession(cookies, secret, secure);
    return 'ok';
  }

  const now = Date.now();
  const next: Fails = now - fails.first > WINDOW_MS ? { n: 1, first: now, until: 0 } : { ...fails, n: fails.n + 1 };
  if (next.n >= MAX_FAILS) next.until = now + WINDOW_MS;
  await setSetting(key, JSON.stringify(next)).catch(() => {});
  await pruneSettings(FAIL_PREFIX, new Date(now - 24 * 60 * 60 * 1000)).catch(() => {});
  await new Promise((r) => setTimeout(r, 600)); // Slows down scripted guessing.
  return next.until ? 'locked' : 'wrong';
}

/** Ends every admin session on every device. */
export async function logoutEverywhere() {
  await setSetting(EPOCH_KEY, randomBytes(8).toString('hex'));
}

/** Changes the password; returns an error message or null. Ends all other sessions, keeps this one. */
export async function changePassword(cookies: AstroCookies, current: string, next: string, secure: boolean) {
  const secret = await currentSecret();
  if (!secret || !matches(current, secret)) return 'Das aktuelle Passwort ist falsch.';
  if (next.length < 10) return 'Das neue Passwort muss mindestens 10 Zeichen haben.';
  const hash = hashPassword(next);
  await setSetting(HASH_KEY, hash);
  await startSession(cookies, { hash, plain: null }, secure);
  return null;
}

/** Blocks writes coming from other websites (in addition to the SameSite cookie). */
export const sameOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
};
