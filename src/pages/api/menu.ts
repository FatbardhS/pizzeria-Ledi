// Public: Wochenkarte photos and menu prices, read by the Speisekarte and the order page.
import type { APIRoute } from 'astro';
import { listPrices, listWeeklyPhotos } from '../../lib/store';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // One failing part (e.g. a table not created yet) must not hide the other.
    const [photoResult, priceResult] = await Promise.allSettled([listWeeklyPhotos(), listPrices()]);
    if (photoResult.status === 'rejected') console.error(photoResult.reason);
    if (priceResult.status === 'rejected') console.error(priceResult.reason);
    if (photoResult.status === 'rejected' && priceResult.status === 'rejected') throw priceResult.reason;
    const photos = photoResult.status === 'fulfilled' ? photoResult.value : [];
    const prices = priceResult.status === 'fulfilled' ? priceResult.value : {};
    return Response.json(
      {
        weekly: photos.filter((p) => p.active).map((p) => ({ id: p.id, location: p.location, url: `/api/wochenkarte/${p.id}` })),
        prices,
      },
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
