// Public: this week's dishes and the menu prices, read by the Speisekarte and the order page.
import type { APIRoute } from 'astro';
import { listPrices, listWeekly } from '../../lib/store';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const [weekly, prices] = await Promise.all([listWeekly(), listPrices()]);
    return Response.json(
      { weekly: weekly.filter((w) => w.active).map(({ active, sort, ...w }) => w), prices },
      {
        headers: {
          // Browsers always ask again; Vercel's CDN reuses the answer for 30 s, so admin changes show up within a minute.
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Vercel-CDN-Cache-Control': 's-maxage=30, stale-while-revalidate=60',
        },
      },
    );
  } catch (e) {
    console.error(e);
    return Response.json({ weekly: [], prices: {} }, { status: 503 });
  }
};
