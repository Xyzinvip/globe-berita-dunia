import { NewsArticle, NewsCategory } from '../types';

/**
 * Curated high-resolution Unsplash photo libraries organized by contextual topic
 */
const TOPIC_PHOTO_BANK: Record<string, string[]> = {
  wind_energy: [
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=900&q=80',
  ],
  solar_energy: [
    'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=900&q=80',
  ],
  gaming: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80',
  ],
  military_defense: [
    'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517976487507-59a5e11d6952?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?auto=format&fit=crop&w=900&q=80',
  ],
  sports_football: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80',
  ],
  economy_finance: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80',
  ],
  ai_semiconductor: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80',
  ],
  infrastructure_city: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80',
  ],
  diplomacy_politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=900&q=80',
  ],
  healthcare_medical: [
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=900&q=80',
  ],
  space_cosmos: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
  ],
  global_general: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=900&q=80',
  ],
};

// Known repeating placeholder photo IDs that should be replaced with contextual images
const GENERIC_PHOTO_IDS = [
  'photo-1504711434969', // Newspaper placeholder
  'photo-1466611653911', // Windmill placeholder 1
  'photo-1497435334941', // Windmill placeholder 2
  'photo-1486406146926', // Generic skyscraper
  'photo-1526374965328', // Matrix/code generic
  'photo-1585829365295', // Generic globe desk
];

function isGenericPlaceholder(url?: string): boolean {
  if (!url || !url.trim()) return true;
  return GENERIC_PHOTO_IDS.some((id) => url.includes(id));
}

/**
 * Deterministic string hash function to generate an integer index
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Detect primary topic key based on title & summary keywords
 */
function detectTopic(title: string, summary: string = '', category: string = ''): string {
  const text = `${title} ${summary} ${category}`.toLowerCase();

  // 1. Wind & Clean Energy
  if (
    text.includes('angin') ||
    text.includes('wind') ||
    text.includes('lepas pantai') ||
    text.includes('turbin')
  ) {
    return 'wind_energy';
  }

  // 2. Solar & Renewable Power
  if (
    text.includes('surya') ||
    text.includes('solar') ||
    text.includes('plts') ||
    text.includes('panas bumi') ||
    text.includes('geotermal')
  ) {
    return 'solar_energy';
  }

  // 3. Gaming & Esports
  if (
    text.includes('game') ||
    text.includes('gaming') ||
    text.includes('esport') ||
    text.includes('pembaruan konten')
  ) {
    return 'gaming';
  }

  // 4. Military, War, Defense & Missiles
  if (
    text.includes('rudal') ||
    text.includes('drone') ||
    text.includes('militer') ||
    text.includes('serangan') ||
    text.includes('cegat') ||
    text.includes('perang') ||
    text.includes('senjata') ||
    text.includes('konflik') ||
    text.includes('pertahanan') ||
    text.includes('yemen') ||
    text.includes('yaman') ||
    text.includes('gaza') ||
    text.includes('ukraina')
  ) {
    return 'military_defense';
  }

  // 5. Sports & Football
  if (
    text.includes('timnas') ||
    text.includes('juwayr') ||
    text.includes('sepak bola') ||
    text.includes('sepakbola') ||
    text.includes('pertandingan') ||
    text.includes('olahraga') ||
    text.includes('liga')
  ) {
    return 'sports_football';
  }

  // 6. Economy, Finance, Central Bank, Inflation, Stock
  if (
    text.includes('suku bunga') ||
    text.includes('the fed') ||
    text.includes('bank sentral') ||
    text.includes('rupiah') ||
    text.includes('inflasi') ||
    text.includes('ihsg') ||
    text.includes('investasi') ||
    text.includes('triliun') ||
    text.includes('keuangan') ||
    text.includes('bisnis') ||
    text.includes('ekonomi') ||
    text.includes('fiskal') ||
    text.includes('gdp')
  ) {
    return 'economy_finance';
  }

  // 7. AI, Semiconductor, Chips & Computing
  if (
    text.includes('semikonduktor') ||
    text.includes('chip') ||
    text.includes('kecerdasan buatan') ||
    text.includes('ai act') ||
    text.includes('komputasi') ||
    text.includes('teknologi') ||
    text.includes('processor')
  ) {
    return 'ai_semiconductor';
  }

  // 8. Infrastructure, City, Regional Development
  if (
    text.includes('infrastruktur') ||
    text.includes('bupati') ||
    text.includes('ikn') ||
    text.includes('nusantara') ||
    text.includes('pembangunan daerah') ||
    text.includes('konstruksi') ||
    text.includes('kota')
  ) {
    return 'infrastructure_city';
  }

  // 9. Diplomacy, Government, Summits
  if (
    text.includes('ktt') ||
    text.includes('pertemuan regional') ||
    text.includes('presiden') ||
    text.includes('perdana menteri') ||
    text.includes('diplomasi') ||
    text.includes('bilateral') ||
    text.includes('kesepakatan') ||
    text.includes('pemilu') ||
    text.includes('politik')
  ) {
    return 'diplomacy_politics';
  }

  // 10. Healthcare & Medical
  if (
    text.includes('kesehatan') ||
    text.includes('medis') ||
    text.includes('vaksin') ||
    text.includes('obat') ||
    text.includes('rumah sakit')
  ) {
    return 'healthcare_medical';
  }

  // 11. Space & Satellite
  if (
    text.includes('satelit') ||
    text.includes('antariksa') ||
    text.includes('roket') ||
    text.includes('astronomi')
  ) {
    return 'space_cosmos';
  }

  return 'global_general';
}

/**
 * Returns a unique, dynamic, and contextually relevant image URL for any news article
 */
export function getArticleThumbnail(article: Partial<NewsArticle>): string {
  // If article has a valid non-generic image, keep it
  if (article.imageUrl && !isGenericPlaceholder(article.imageUrl)) {
    return article.imageUrl;
  }

  // Detect appropriate topic bank
  const topic = detectTopic(article.title || '', article.summary || '', article.category as string || '');
  const bank = TOPIC_PHOTO_BANK[topic] || TOPIC_PHOTO_BANK.global_general;

  // Use a hash of article ID & Title to deterministically pick an image from the bank
  const hash = hashString(`${article.id || ''}:${article.title || 'news'}`);
  const index = hash % bank.length;

  return bank[index];
}

/**
 * Fallback image when an <img> tag encounters an error
 */
export function getCategoryFallbackImage(category?: NewsCategory | string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('ekonomi') || cat.includes('bisnis')) {
    return TOPIC_PHOTO_BANK.economy_finance[0];
  }
  if (cat.includes('teknologi') || cat.includes('sains')) {
    return TOPIC_PHOTO_BANK.ai_semiconductor[0];
  }
  if (cat.includes('pertahanan') || cat.includes('konflik')) {
    return TOPIC_PHOTO_BANK.military_defense[0];
  }
  if (cat.includes('energi') || cat.includes('iklim')) {
    return TOPIC_PHOTO_BANK.wind_energy[0];
  }
  if (cat.includes('olahraga')) {
    return TOPIC_PHOTO_BANK.sports_football[0];
  }
  return TOPIC_PHOTO_BANK.global_general[0];
}
