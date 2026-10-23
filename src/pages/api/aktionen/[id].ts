// Serves a promotion photo from the private storage bucket. Photos of hidden or not running promotions are only shown to staff.
import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/auth';
import { getPromotionPhoto } from '../../../lib/store';

export const prerender = false;

const notFound = () => new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });

export const GET: APIRoute = async ({ params, cookies }) => {
  const id = params.id ?? '';
  if (!/^[0-9a-f-]{36}$/.test(id)) return notFound();
  const file = await getPromotionPhoto(id).catch(() => null);
  if (!file) return notFound();
  if (!file.visible) {
    if (!(await isAdmin(cookies))) return notFound();
    return new Response(file.bytes, { headers: { 'Content-Type': file.type, 'Cache-Control': 'private, no-store' } });
  }
  return new Response(file.bytes, {
    headers: {
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=3600',
      'Vercel-CDN-Cache-Control': 's-maxage=300',
    },
  });
};
