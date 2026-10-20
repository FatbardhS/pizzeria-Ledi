export type MenuItem = {
  nr?: string;
  name: string;
  desc?: string;
  allergens?: string;
  tags?: ('vegetarisch' | 'scharf' | 'Haus-Tipp')[];
};

export type MenuCategory = {
  id: string;
  title: string;
  subtitle: string;
  note?: string;
  group: 'speisen' | 'getraenke';
  items: MenuItem[];
};

export const menu: MenuCategory[] = [
  {
    id: 'pizze',
    title: 'Pizze',
    subtitle: 'Pizza · ø ca. 33 cm',
    note: 'Aus dem Steinofen, nach traditioneller Machart, ohne Blech gebacken. Wir belegen Ihre Pizza auch nach Wunsch – pro Extra 3,00 €.',
    group: 'speisen',
    items: [
      { nr: '01', name: 'Pizza Margherita', allergens: '16,24', desc: 'mit Tomatensauce, Käse und Basilikum', tags: ['vegetarisch'] },
      { nr: '02', name: 'Pizza Salame', allergens: '3,6,9,16,24,28', desc: 'mit Tomatensauce, Käse und Salami' },
      { nr: '03', name: 'Pizza Prosciutto', allergens: '7,8,9,16,24,28', desc: 'mit Tomatensauce, Käse und Vorderschinken*' },
      { nr: '04', name: 'Pizza Funghi', allergens: '16,24', desc: 'mit Tomatensauce, Käse und Champignons', tags: ['vegetarisch'] },
      { nr: '05', name: 'Pizza Hawaii', allergens: '7,8,9,16,24,28', desc: 'mit Tomatensauce, Käse, Vorderschinken* und Ananas' },
      { nr: '06', name: 'Pizza Vegetaria', allergens: '16,24', desc: 'mit Tomatensauce, Käse und frischem Gemüse', tags: ['vegetarisch'] },
      { nr: '07', name: 'Pizza Tonno', allergens: '16,21,24', desc: 'mit Tomatensauce, Käse und Thunfisch' },
      { nr: '08', name: 'Pizza Mista', allergens: '3,6,7,8,9,16,24,28', desc: 'mit Tomatensauce, Käse, Vorderschinken*, Salami, Champignons und Peperoni' },
      { nr: '09', name: 'Pizza Roma', allergens: '8,16,24', desc: 'mit Tomatensauce, Käse, Spinat und Gorgonzola', tags: ['vegetarisch'] },
      { nr: '10', name: 'Pizza Piccante', allergens: '3,6,9,16,24,28', desc: 'mit Tomatensauce, Käse, Champignons und pikanter Salami', tags: ['scharf'] },
      { nr: '11', name: 'Pizza Napoli', allergens: '16,24', desc: 'mit Tomatensauce, Käse, Sardellenfilets und Kapern' },
      { nr: '12', name: 'Pizza Calzone', allergens: '3,6,7,8,9,16,24,28', desc: 'gefüllte Pizza mit Champignons, Schinken* und Salami' },
      { nr: '13', name: 'Pizza Parma', allergens: '16,24', desc: 'mit Tomatensauce, Käse, Parmaschinken, Rucolasalat und Parmesan' },
      { nr: '14', name: 'Pizza Scampi', allergens: '16,18,24', desc: 'mit Tomatensauce, Käse, Scampi, Knoblauch – pikant', tags: ['scharf'] },
      { nr: '15', name: 'Pizza Fabrizio', allergens: '16,24', desc: 'mit Tomatensauce, Käse, Hähnchenbrustfilet und Spinat' },
      { nr: '16', name: 'Pizza Salmone', allergens: '8,16,21,24', desc: 'mit Tomatensauce, Käse, Lachs, Rucola und Crème fraîche' },
      { nr: '17', name: 'Pizza Frutti di Mare', allergens: '16,18,21,24,27', desc: 'mit Tomatensauce, Käse und Meeresfrüchten' },
      { nr: '18', name: 'Pizza Quattro Formaggi', allergens: '16,24', desc: 'mit Tomatensauce und 4 verschiedenen Käsesorten', tags: ['vegetarisch'] },
      { nr: '19', name: 'Pizza Caprese', allergens: '3,6,9,16,24,28', desc: 'mit Tomatensauce, Käse, Tomaten und Mozzarellascheiben' },
      { nr: '20', name: 'Pizza Carciofi e Pomodori secchi', allergens: '7,8,9,16,24,28', desc: 'mit Tomatensauce, Artischocken, getrockneten Tomaten, Rucola und Parmesan' },
      { nr: '21', name: 'Pizza Ledi', allergens: '16', desc: 'mit Tomatensauce, Salami piccante, Rucola, Parmesan und Trüffelöl', tags: ['Haus-Tipp'] },
    ],
  },
  {
    id: 'focaccia',
    title: 'Focaccia',
    subtitle: 'ø ca. 33 cm',
    group: 'speisen',
    items: [{ nr: '18', name: 'Pizzateig', allergens: '16', desc: 'mit Olivenöl und Rosmarin', tags: ['vegetarisch'] }],
  },
  {
    id: 'pasta',
    title: 'Pasta',
    subtitle: 'Teigwaren',
    group: 'speisen',
    items: [
      { nr: '61', name: 'Spaghetti o Penne al Pomodoro', allergens: '16', desc: 'Spaghetti oder kurze Nudeln in Tomatensauce und Basilikum', tags: ['vegetarisch'] },
      { nr: '62', name: 'Spaghetti Aglio Olio', allergens: '16', desc: 'Spaghetti mit Knoblauch, Olivenöl und scharfen Peperoni', tags: ['vegetarisch', 'scharf'] },
      { nr: '63', name: 'Spaghetti Carbonara', allergens: '7,8,9,16,24,26', desc: 'Spaghetti mit Vorderschinken* in Sahnesauce' },
      { nr: '64', name: 'Penne Spinat Gorgonzola', allergens: '16,24', desc: 'kurze Nudeln mit Spinat und Gorgonzola', tags: ['vegetarisch'] },
      { nr: '71', name: 'Penne all’Arrabbiata', allergens: '12,16', desc: 'kurze Nudeln mit Oliven, Kapern, Knoblauch in Tomaten-Basilikumsauce', tags: ['vegetarisch', 'scharf'] },
      { nr: '72', name: 'Penne Quattro Formaggi', allergens: '16,24', desc: 'kurze Nudeln mit 4 Käsesorten', tags: ['vegetarisch'] },
      { nr: '73', name: 'Penne con Verdura', allergens: '16,24', desc: 'kurze Nudeln mit frischem Gemüse in Tomaten-Sahnesauce', tags: ['vegetarisch'] },
      { nr: '82', name: 'Tagliatelle con Pollo e Funghi', allergens: '16,24', desc: 'Bandnudeln mit Hähnchenbruststreifen und Champignons in Sahnesauce' },
      { nr: '83', name: 'Lasagne al Forno', allergens: '16,24', desc: 'hausgemachter Nudelauflauf mit Hackfleisch, im Ofen überbacken' },
      { nr: '84', name: 'Tagliatelle con Filetto di Maiale', allergens: '16,24', desc: 'Bandnudeln mit Schweinespitzen in Tomaten-Sahne-Sauce' },
      { nr: '85', name: 'Tagliatelle Ledi', allergens: '16,24', desc: 'Bandnudeln mit Rinderfiletspitzen in Braten-Sauce', tags: ['Haus-Tipp'] },
      { nr: '86', name: 'Tagliatelle Salmone', allergens: '14,16,17,18,21,22,24,27', desc: 'Bandnudeln mit Lachs in Hummersauce' },
      { nr: '87', name: 'Spaghetti Scampi', allergens: '16,18,29', desc: 'Spaghetti mit Scampi und Cherrytomaten in Weißweinsauce' },
    ],
  },
  {
    id: 'antipasti',
    title: 'Antipasti',
    subtitle: 'Vorspeisen',
    group: 'speisen',
    items: [
      { nr: '32', name: 'Antipasto Misto', allergens: '3,6,9', desc: 'Parmaschinken, Salami piccante, Tomate-Mozzarella, getrocknete Tomaten, Artischocken, Paprika, Zucchini, Champignons, Rucola – dazu hausgemachtes Brot' },
      { nr: '33', name: 'Mozzarella Caprese', allergens: '24', desc: 'Büffelmozzarella mit frischen Tomaten und Basilikum auf Rucolasalat', tags: ['vegetarisch'] },
      { nr: '37', name: 'Carpaccio di Manzo', allergens: '24', desc: 'Rinder-Carpaccio mit Rucolasalat, Parmesanraspeln und Champignons' },
      { nr: '38', name: 'Bruschetta', desc: '6 Stück – Tomaten, Zwiebeln, Knoblauch, Basilikum', tags: ['vegetarisch'] },
      { nr: '39', name: 'Tomatensuppe', tags: ['vegetarisch'] },
      { nr: '40', name: 'Minestrone', desc: 'Gemüsesuppe', tags: ['vegetarisch'] },
    ],
  },
  {
    id: 'insalata',
    title: 'Insalata',
    subtitle: 'Salate',
    group: 'speisen',
    items: [
      { nr: '41', name: 'Insalata Pomodoro', desc: 'Tomatensalat mit Zwiebeln', tags: ['vegetarisch'] },
      { nr: '42', name: 'Insalata Mista', desc: 'gemischter Salat', tags: ['vegetarisch'] },
      { nr: '44', name: 'Insalata Pecorino', allergens: '8,24', desc: 'gemischter Salat mit Schafskäse und Oliven', tags: ['vegetarisch'] },
      { nr: '45', name: 'Insalata Tonno', allergens: '9,21,24', desc: 'gemischter Salat mit Thunfisch' },
      { nr: '46', name: 'Insalata Pollo e Funghi', desc: 'gemischter Salat mit gebratenem Hähnchenbrustfilet und Champignons' },
      { nr: '48', name: 'Rucola Parmigiano', allergens: '24', desc: 'Rucolasalat mit Parmesanraspeln und Cherrytomaten', tags: ['vegetarisch'] },
    ],
  },
  {
    id: 'pesce-carne',
    title: 'Pesce e Carne',
    subtitle: 'Fisch & Fleisch',
    note: 'Alle Gerichte werden mit gemischtem Salat serviert.',
    group: 'speisen',
    items: [
      { nr: '07', name: 'Salmone alla Griglia', desc: 'Lachs vom Grill, dazu Spinat und Kartoffeln' },
      { nr: '08', name: 'Dorade vom Grill', desc: 'mit Spinat und Kartoffeln' },
      { nr: '09', name: 'Scampi alla Griglia', desc: 'Salzwasser-Großgarnelen vom Grill (5 Stück) auf Rucola' },
      { nr: '10', name: 'Hähnchenbrust vom Grill', desc: 'mit Champignon-Sahne-Sauce, dazu Tagesgemüse' },
      { nr: '11', name: 'Entrecôte', desc: 'vom Grill mit Rosmarin und Knoblauch, dazu frisches Tagesgemüse' },
      { nr: '12', name: 'Saltimbocca alla Romana', desc: 'mit Parmaschinken und Salbei in Weißweinsoße, dazu frisches Tagesgemüse' },
      { nr: '13', name: 'Saltimbocca al Gorgonzola', desc: 'Schweinefiletmedaillons in Gorgonzolasauce, dazu frisches Tagesgemüse' },
    ],
  },
  {
    id: 'bambini',
    title: 'Per i Bambini',
    subtitle: 'Nur für Kinder',
    group: 'speisen',
    items: [
      { nr: '75', name: 'Spaghetti', allergens: '16,24', desc: 'mit Tomatensauce oder Butter' },
      { nr: '76', name: 'Kinderpizza Margherita', allergens: '16,24', desc: 'mit Tomatensauce, Käse und Basilikum' },
    ],
  },
  {
    id: 'dolci',
    title: 'Dolci',
    subtitle: 'Dessert',
    group: 'speisen',
    items: [
      { nr: '20', name: 'Tiramisu', allergens: '4,16,24', desc: 'hausgemacht', tags: ['Haus-Tipp'] },
      { nr: '21', name: 'Tartufo', allergens: '8,23' },
      { nr: '22', name: 'Cassata', allergens: '8,23' },
      { nr: '23', name: 'Tris Dessert', allergens: '4,8,16,23,24' },
    ],
  },
  {
    id: 'aperitivo',
    title: 'Aperitivo',
    subtitle: 'Aperitif',
    group: 'getraenke',
    items: [
      { name: 'Campari Orange', allergens: '1', desc: '0,2 l' },
      { name: 'Campari Soda', allergens: '1', desc: '0,2 l' },
      { name: 'Aperol Spritz', desc: 'Prosecco & Aperol · 0,2 l' },
      { name: 'Hugo', desc: '0,2 l' },
      { name: 'Prosecco', desc: '0,1 l · Flasche 0,75 l' },
      { name: 'Kir Royal', desc: '0,1 l' },
      { name: 'Bellini', desc: '0,1 l' },
      { name: 'Ramazzotti Rosato', desc: '0,1 l' },
      { name: 'Martini Bianco / Rosso / d’Oro', allergens: '2', desc: '4 cl' },
      { name: 'Sherry', allergens: '2', desc: '5 cl' },
    ],
  },
  {
    id: 'cocktails',
    title: 'Cocktails',
    subtitle: 'Cocktails & Longdrinks',
    group: 'getraenke',
    items: [
      { name: 'Mojito', desc: 'Limette, Minze, weißer Rohrzucker, Rum, Crushed Ice, Sodawasser' },
      { name: 'Caipirinha', desc: 'Cachaça, Limette, Rohrzucker, Crushed Ice' },
      { name: 'Mai Tai', desc: 'brauner und weißer Rum, Orangensaft, Grenadine, Limette (enthält Mandel- und Walnussextrakt)' },
      { name: 'Sex on the Beach', desc: 'Wodka, Orange, Ananas, Cranberry, Passionsfrucht, Pfirsich' },
      { name: 'Piña Colada', desc: 'weißer Rum, Ananassaft, Sahne, Kokosnuss (enthält Haselnussextrakt)' },
      { name: 'Tequila Sunrise', desc: 'Tequila, Grenadine, Orange (enthält Gluten und Schalenfrüchte)' },
      { name: 'Long Island Ice Tea', desc: 'Wodka, Gin, Rum, Triple Sec, Zitrone, Orange, Cola' },
      { name: 'Longdrinks', desc: 'Gin Tonic · Wodka Lemon · Wodka Cola · Wodka Red Bull · Cuba Libre · Bacardi Cola · Whiskey Cola · Jim Beam Cola · Red Label Cola' },
      { name: 'Virgin Colada', desc: 'alkoholfrei – Ananassaft, Sahne, Kokosnuss' },
      { name: 'Strawberry Colada', desc: 'alkoholfrei – Ananassaft, Sahne, Erdbeere, Zitrone, Kokosnuss' },
      { name: 'Sportsman', desc: 'alkoholfrei – Ananassaft, Maracuja-Nektar, Grenadine' },
    ],
  },
  {
    id: 'vini',
    title: 'Vini',
    subtitle: 'Offene Weine · 0,2 l / 0,5 l',
    group: 'getraenke',
    items: [
      { name: 'Grillo Sicilia', allergens: '29', desc: 'Weiß · trocken' },
      { name: 'Pinot Grigio', allergens: '29', desc: 'Weiß · trocken' },
      { name: 'Frizzantino', allergens: '29', desc: 'Weiß · lieblich' },
      { name: 'Weißweinschorle', allergens: '29' },
      { name: 'Merlot', allergens: '29', desc: 'Rot · trocken' },
      { name: 'Nero d’Avola (Sicilia)', allergens: '29', desc: 'Rot · trocken' },
      { name: 'Lambrusco', allergens: '29', desc: 'Rot · lieblich' },
      { name: 'Rosé', allergens: '29', desc: 'trocken' },
    ],
  },
  {
    id: 'birre',
    title: 'Birre',
    subtitle: 'Bier',
    group: 'getraenke',
    items: [
      { name: 'Krombacher vom Fass', allergens: '16', desc: '0,2 l / 0,4 l' },
      { name: 'Krušovice vom Fass', allergens: '16', desc: '0,3 l / 0,5 l' },
      { name: 'Alsterwasser', allergens: '6,16', desc: '0,2 l / 0,4 l' },
      { name: 'Herrenbräu / Herrenbräu Weizen', allergens: '16', desc: '0,5 l' },
      { name: 'Herrenbräu Kristallweizen', allergens: '16', desc: 'Fl. 0,5 l' },
      { name: 'König Pilsener alkoholfrei', allergens: '16', desc: 'Fl. 0,33 l' },
    ],
  },
  {
    id: 'analcoliche',
    title: 'Analcoliche',
    subtitle: 'Alkoholfreie Getränke',
    group: 'getraenke',
    items: [
      { name: 'San Pellegrino', desc: 'Fl. 0,25 l / 0,75 l' },
      { name: 'Acqua Panna (still)', desc: 'Fl. 0,25 l / 0,75 l' },
      { name: 'Tafelwasser mit / ohne Kohlensäure', desc: '0,2 l / 0,4 l' },
      { name: 'Coca-Cola · Cola light · Fanta · Sprite · Spezi · Fassbrause', allergens: '1,3,4,6,13,16', desc: '0,2 l / 0,4 l' },
      { name: 'Säfte', desc: 'Orange, Apfel, KiBa, Banane, Kirsch · 0,2 l / 0,4 l' },
      { name: 'Apfelsaftschorle', desc: '0,2 l / 0,4 l' },
      { name: 'Schweppes', allergens: '2,3,6', desc: 'Bitter Lemon, Tonic Water, Ginger Ale · 0,2 l' },
      { name: 'Bionade', desc: 'Holunder, Litschi, Kräuter, Ingwer-Orange, Naturtrübe Orange · Fl. 0,33 l' },
      { name: 'Orangina', allergens: '3,6', desc: 'Fl. 0,25 l' },
      { name: 'Malztrunk', allergens: '3', desc: 'Fl. 0,33 l' },
    ],
  },
  {
    id: 'caffe',
    title: 'Caffè & Tè',
    subtitle: 'Warme Getränke',
    group: 'getraenke',
    items: [
      { name: 'Espresso / Doppio / Macchiato', allergens: '4,24' },
      { name: 'Caffè Lungo', allergens: '4' },
      { name: 'Cappuccino', allergens: '4,24' },
      { name: 'Caffè Latte', allergens: '4,24', desc: 'Milchkaffee' },
      { name: 'Cioccolata Calda', allergens: '24', desc: 'Heiße Schokolade' },
      { name: 'Tee', desc: 'Schwarz, Pfefferminz, Kamille, Vanille, Jasmin' },
      { name: 'Grog', desc: 'Tee mit Rum' },
    ],
  },
  {
    id: 'digestivi',
    title: 'Digestivi',
    subtitle: 'Liköre, Grappa & Spirituosen · 2 cl',
    group: 'getraenke',
    items: [
      { name: 'Limoncello', allergens: '3' },
      { name: 'Sambuca' },
      { name: 'Amaretto', allergens: '3,25' },
      { name: 'Grappa della Casa / di Bocchino / di Prosecco' },
      { name: 'Ramazzotti · Averna · Fernet Branca · Fernet Menta', allergens: '3' },
      { name: 'Vecchia Romagna', allergens: '3,29', desc: 'Weinbrand' },
      { name: 'Jim Beam · Johnnie Walker Red Label', allergens: '3,16', desc: 'Whiskey' },
    ],
  },
];

export const allergenLegend =
  '1 Süßungsmittel · 2 chininhaltig · 3 mit Farbstoff · 4 koffeinhaltig · 5 taurinhaltig · 6 Antioxidationsmittel · 7 mit Phosphat · 8 mit Milcheiweiß · 9 mit Konservierungsstoffen · 10 gewachst · 11 geschwefelt · 12 geschwärzt · 13 enthält eine Phenylalaninquelle · 14 mit Geschmacksverstärker · 15 Formfleisch aus Vorderschinkenanteilen · 16 glutenhaltiges Getreide · 17 Sellerie · 18 Krebstiere · 19 Lupine · 20 Sesam · 21 Fisch · 22 Senf · 23 Erdnüsse · 24 Milch · 25 Schalenfrüchte (Nüsse) · 26 Eier · 27 Weichtiere · 28 Soja · 29 enthält Sulfite';

/** Stable id for a dish, used for its price in the database (menu_prices.item_key). */
export const itemKey = (cat: MenuCategory, item: MenuItem) =>
  `${cat.id}-${
    item.nr ??
    item.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }`;
