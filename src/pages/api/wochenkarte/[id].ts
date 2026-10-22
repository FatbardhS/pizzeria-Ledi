// Serves a Wochenkarte photo from the private storage bucket. Hidden photos are only shown to staff.
// Public photos are cached briefly, so hiding or deleting one takes effect within a few minutes.
import type { APIRoute } from 'astro';
import { isAdmin } from '../../../lib/auth';
import { getWeeklyPhotoFile } from '../../../lib/store';

export const prerender = false;

const notFound = () => new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });

export const GET: APIRoute = async ({ params, cookies }) => {
  const id = params.id ?? '';
  if (!/^[0-9a-f-]{36}$/.test(id)) return notFound();
  const file = await getWeeklyPhotoFile(id).catch(() => null);
  if (!file) return notFound();
  if (!file.active) {
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
