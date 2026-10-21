// Browser side: Wochenkarte photos and prices from /api/menu (edited on /admin).
export type PublicWeeklyPhoto = { id: string; location: 'both' | 'ledi' | 'due'; url: string };

export const euro = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

export async function loadMenu(location: 'ledi' | 'due') {
  try {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { weekly: PublicWeeklyPhoto[]; prices: Record<string, number> };
    return { weekly: data.weekly.filter((w) => w.location === 'both' || w.location === location), prices: data.prices, ok: true };
  } catch {
    return { weekly: [] as PublicWeeklyPhoto[], prices: {} as Record<string, number>, ok: false };
  }
}
