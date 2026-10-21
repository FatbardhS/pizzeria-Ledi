// Serves a Wochenkarte photo from the private storage bucket. A photo never changes under its id,
// so browsers and the CDN may keep it for a year.
import type { APIRoute } from 'astro';
import { getWeeklyPhotoFile } from '../../../lib/store';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id ?? '';
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response('Not found', { status: 404 });
  const file = await getWeeklyPhotoFile(id);
  if (!file) return new Response('Not found', { status: 404 });
  return new Response(file.bytes, {
    headers: { 'Content-Type': file.type, 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
