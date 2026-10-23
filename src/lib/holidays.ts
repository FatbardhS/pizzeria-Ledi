// Holidays and occasions in Germany, for planning promotions on /admin. Calculated, so no external service is needed.
// "Feiertag" means a public holiday in Berlin; everything else is an occasion that is good for a promotion.
import type { PromoTheme } from './store';

export type Holiday = {
  date: string; // YYYY-MM-DD
  name: string;
  publicHoliday: boolean;
  theme: PromoTheme;
  /** Suggested promotion: start this many days before, end on `promoEnd` (default: the day itself). */
  leadDays: number;
  promoEnd?: string;
  eyebrow: string;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);
const day = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const plus = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

/** Easter Sunday (Gregorian calendar, anonymous algorithm). */
const easter = (y: number) => {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  return day(y, Math.floor((h + l - 7 * m + 114) / 31), ((h + l - 7 * m + 114) % 31) + 1);
};

/** The n-th Sunday of a month. */
const sunday = (y: number, m: number, n: number) => {
  const first = day(y, m, 1);
  return plus(first, ((7 - first.getUTCDay()) % 7) + (n - 1) * 7);
};

export function holidaysOfYear(y: number): Holiday[] {
  const e = easter(y);
  const christmas = day(y, 12, 25);
  const advent1 = plus(christmas, -((christmas.getUTCDay() || 7) + 21));
  const h = (date: Date, name: string, publicHoliday: boolean, theme: PromoTheme, leadDays: number, eyebrow: string, promoEnd?: Date): Holiday => ({
    date: iso(date),
    name,
    publicHoliday,
    theme,
    leadDays,
    eyebrow,
    promoEnd: promoEnd && iso(promoEnd),
  });
  return [
    h(day(y, 1, 1), 'Neujahr', true, 'newyear', 0, 'Frohes neues Jahr'),
    h(day(y, 2, 14), 'Valentinstag', false, 'valentine', 10, 'Valentinstag bei Ledi'),
    h(day(y, 3, 8), 'Internationaler Frauentag', true, 'none', 7, 'Zum Frauentag'),
    h(plus(e, -2), 'Karfreitag', true, 'easter', 0, 'Ostern bei Ledi'),
    h(e, 'Ostersonntag', false, 'easter', 14, 'Ostern bei Ledi', plus(e, 1)),
    h(plus(e, 1), 'Ostermontag', true, 'easter', 0, 'Ostern bei Ledi'),
    h(day(y, 5, 1), 'Tag der Arbeit', true, 'summer', 7, 'Langes Wochenende'),
    h(sunday(y, 5, 2), 'Muttertag', false, 'valentine', 10, 'Zum Muttertag'),
    h(plus(e, 39), 'Christi Himmelfahrt / Vatertag', true, 'summer', 7, 'Zum Vatertag'),
    h(plus(e, 49), 'Pfingstsonntag', false, 'summer', 7, 'Pfingsten bei Ledi', plus(e, 50)),
    h(plus(e, 50), 'Pfingstmontag', true, 'summer', 0, 'Pfingsten bei Ledi'),
    h(day(y, 6, 21), 'Sommeranfang', false, 'summer', 0, 'Sommer bei Ledi', day(y, 8, 31)),
    h(day(y, 10, 3), 'Tag der Deutschen Einheit', true, 'autumn', 5, 'Langes Wochenende'),
    h(day(y, 10, 31), 'Halloween', false, 'autumn', 7, 'Halloween bei Ledi'),
    h(day(y, 11, 11), 'Martinstag', false, 'autumn', 10, 'Herbst bei Ledi'),
    h(advent1, '1. Advent', false, 'christmas', 0, 'Weihnachten bei Ledi', day(y, 12, 23)),
    h(day(y, 12, 6), 'Nikolaus', false, 'christmas', 7, 'Nikolaus bei Ledi'),
    h(day(y, 12, 24), 'Heiligabend', false, 'christmas', 21, 'Weihnachten bei Ledi', day(y, 12, 26)),
    h(christmas, '1. Weihnachtstag', true, 'christmas', 0, 'Weihnachten bei Ledi', day(y, 12, 26)),
    h(day(y, 12, 26), '2. Weihnachtstag', true, 'christmas', 0, 'Weihnachten bei Ledi'),
    h(day(y, 12, 31), 'Silvester', false, 'newyear', 21, 'Silvester bei Ledi'),
  ].sort((a, b) => a.date.localeCompare(b.date));
}

/** Holidays from `today` (YYYY-MM-DD) through the next `days` days. */
export function upcomingHolidays(today: string, days = 365): Holiday[] {
  const y = Number(today.slice(0, 4));
  const until = iso(plus(new Date(`${today}T00:00:00Z`), days));
  return [...holidaysOfYear(y), ...holidaysOfYear(y + 1)].filter((h) => h.date >= today && h.date <= until);
}

/** Start date of the suggested promotion: `leadDays` before the holiday, but not in the past. */
export const suggestedStart = (h: Holiday, today: string) => {
  const start = iso(plus(new Date(`${h.date}T00:00:00Z`), -h.leadDays));
  return start < today ? today : start;
};
