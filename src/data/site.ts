const IMG = 'https://pizzeria-ledi.de/wp-content/uploads';

export type LocationId = 'ledi' | 'due';

/**
 * Opening times per weekday (0 = Sunday … 6 = Saturday), in minutes after midnight; `null` = closed.
 * Footer, live "open now" badge, reservation slots and Google data all read from this.
 */
export type Schedule = Record<number, { open: number; close: number } | null>;

const evening = { open: 15 * 60, close: 23 * 60 };

const maps = (street: string, postalCode: string) => {
  const q = encodeURIComponent(`${street}, ${postalCode} Berlin`);
  return {
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
    mapEmbed: `https://www.google.com/maps?q=${q}&output=embed`,
  };
};

/** Shared by both restaurants. */
export const brand = {
  since: 'März 2011',
  social: {
    facebook: 'https://de-de.facebook.com/pizzerialedi/',
    instagram: 'https://www.instagram.com/ledipizzeria',
  },
  weeklyMenuPdf: `${IMG}/2024/01/SwiftScan-10.01.2024-18.26.pdf`,
};

export const locations = {
  ledi: {
    id: 'ledi' as const,
    name: 'Pizzeria Ledi',
    shortName: 'Ledi',
    label: 'Das Original',
    heroEyebrow: 'Trattoria · seit 2011',
    aboutIntro: `Seit ${brand.since} findet man in dieser gemütlichen Pizzeria eine ganz ursprüngliche Art der Pizza:`,
    phone: '030 63962115',
    phoneHref: 'tel:+493063962115',
    email: 'info@pizzeria-ledi.de',
    address: { street: 'Weitlingstraße 28', postalCode: '10317', city: '10317 Berlin' },
    ...maps('Weitlingstraße 28', '10317'),
    orderUrl: 'https://www.foodbooking.com/api/fb/_dd_o_j_v',
    reviewUrl: 'https://g.page/r/CQ12vECMDbsuEAo/review?id',
    schedule: { 0: evening, 1: null, 2: evening, 3: evening, 4: evening, 5: evening, 6: evening } as Schedule,
    hours: [
      { days: 'Montag', time: 'Ruhetag', closed: true },
      { days: 'Dienstag – Sonntag', time: '15:00 – 23:00', closed: false },
    ],
    hoursShort: 'Di – So · 15:00 – 23:00',
  },
  due: {
    id: 'due' as const,
    name: 'Pizzeria Ledi Due',
    shortName: 'Ledi Due',
    label: 'Neu',
    heroEyebrow: 'Neu in Lichtenberg · Lückstraße 34',
    aboutIntro: `Seit ${brand.since} backen wir Pizza auf ganz ursprüngliche Art – und jetzt auch in der Lückstraße:`,
    phone: '030 63962115',
    phoneHref: 'tel:+493063962115',
    email: 'info@pizzeria-ledi-ug.de',
    address: { street: 'Lückstraße 34', postalCode: '10317', city: '10317 Berlin' },
    ...maps('Lückstraße 34', '10317'),
    orderUrl: 'https://www.foodbooking.com/api/fb/_dd_o_j_v',
    reviewUrl: 'https://g.page/r/CQ12vECMDbsuEAo/review?id',
    schedule: { 0: { open: 12 * 60, close: 23 * 60 }, 1: null, 2: evening, 3: evening, 4: evening, 5: evening, 6: evening } as Schedule,
    hours: [
      { days: 'Montag', time: 'Ruhetag', closed: true },
      { days: 'Dienstag – Samstag', time: '15:00 – 23:00', closed: false },
      { days: 'Sonntag', time: '12:00 – 23:00', closed: false },
    ],
    hoursShort: 'Di – Sa 15–23 · So 12–23 Uhr',
  },
} satisfies Record<LocationId, unknown>;

export type Location = (typeof locations)[LocationId];

/** For `getStaticPaths` in src/pages/[loc]/*. */
export const locationPaths = () =>
  Object.values(locations).map((location) => ({ params: { loc: location.id }, props: { location } }));

export const navFor = (loc: LocationId) => [
  { label: 'Home', href: `/${loc}` },
  { label: 'Speisekarte', href: `/${loc}/speisekarte` },
  { label: 'Reservierung', href: `/${loc}/reservierung` },
  { label: 'Galerie', href: `/${loc}/galerie` },
  { label: 'Kontakt', href: `/${loc}#kontakt` },
];

export const images = {
  logo: `${IMG}/2021/08/logoledi.png`,
  hero: `${IMG}/2021/08/arthur-brognoli-MjnQ2LqzfJk-unsplash-scaled-1.jpeg`,
  outside: `${IMG}/2021/09/Aussenbereich_5.jpg`,
  gallery: [
    { src: `${IMG}/2021/09/Innenbereich_4.jpg`, alt: 'Innenbereich der Trattoria' },
    { src: `${IMG}/2021/09/Caramelle-Bon-Bon-Nudel-gefu%CC%88llt-mit-Mascarpone-und-Walnu%CC%88ssen-in-Gorgonzola-Sahnesauce-auf-Rucola-und-Parmesan.jpg`, alt: 'Caramelle gefüllt mit Mascarpone und Walnüssen in Gorgonzola-Sahnesauce' },
    { src: `${IMG}/2021/09/Innenbereich_3.jpg`, alt: 'Gemütlicher Gastraum' },
    { src: `${IMG}/2021/09/Entrecote%CC%81-vom-Grill-mit-Rosmarin-Knoblauch-dazu-und-frischem-Tages-Gemu%CC%88se.jpg`, alt: 'Entrecôte vom Grill mit Rosmarin und Tagesgemüse' },
    { src: `${IMG}/2021/09/Grossgarnelen-vom-Grill-auf-Rucola.jpg`, alt: 'Großgarnelen vom Grill auf Rucola' },
    { src: `${IMG}/2021/09/Innenbereich_5.jpg`, alt: 'Tische im Innenbereich' },
    { src: `${IMG}/2021/09/Triangolini-Rote-Bete-gefu%CC%88llt-mit-Ziegenka%CC%88se-und-Honig-in-Butter-Salbeisauce.jpg`, alt: 'Rote-Bete-Triangolini mit Ziegenkäse und Honig' },
    { src: `${IMG}/2021/09/Schweinefiletmedaillon-mit-Salbeibutter-und-frischem-Tages-Gemu%CC%88se.jpg`, alt: 'Schweinefiletmedaillons mit Salbeibutter' },
    { src: `${IMG}/2021/09/Rote-Bete-Kartoffelgnochi-gefu%CC%88llt-mit-Mascarpone-und-Walnu%CC%88ssen-in-leichte-Tomatensauce.jpg`, alt: 'Rote-Bete-Gnocchi mit Mascarpone und Walnüssen' },
  ],
};

export const reviews = [
  {
    title: 'Service nett & flott, tadellos!',
    text: 'Wirklich gute Pizza: Dünner Boden, klassischer Steinofen, richtig guter Teig, gut belegt – umso bemerkenswerter, wenn man das umliegende Pizza-Angebot vergleicht!',
    author: 'Florian S.',
  },
  {
    title: 'Hervorragende Wochenkarte',
    text: 'Die Caramelle und Rote-Beete-Gnocchi waren wahnsinnig lecker. Der Service war unglaublich nett. Im Innenhof kann man gemütlich und ruhig sitzen.',
    author: 'Who knows',
  },
  {
    title: 'Sehr gute Pizza',
    text: 'Personal sehr zuvorkommend. Man kann gemütlich essen, die Preise sind angemessen. Der Inhaber hat den Laden sehr gut im Griff, auch wenn es voll ist.',
    author: 'Andreas H.',
  },
  {
    title: 'Sehr netter Laden',
    text: 'Speisen und Getränke sind vorzüglich. Bedienung ist super. Macht weiter so und bis zum nächsten Mal!',
    author: 'Kerstin B.',
  },
];
