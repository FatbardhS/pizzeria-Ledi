// Public: promotions running today (Berlin time), read by the homepage.
import type { APIRoute } from 'astro';
import { berlinToday, isRunning, listPromotions } from '../../../lib/store';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const today = berlinToday();
    const running = (await listPromotions()).filter((p) => isRunning(p, today));
    return Response.json(
      running.map(({ id, eyebrow, title, highlight, body, startsOn, endsOn, location, theme, hasPhoto }) => ({
        id,
        eyebrow,
        title,
        highlight,
        body,
        startsOn,
        endsOn,
        location,
        theme,
        photo: hasPhoto ? `/api/aktionen/${id}` : null,
      })),
      {
        headers: {
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Vercel-CDN-Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (e) {
    // Without the table (or the database) the homepage simply shows no promotion.
    console.error(e);
    return Response.json([], { status: 503 });
  }
};
