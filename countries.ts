export interface CountryOption {
  code: string;
  es: string;
  en: string;
  aliases: string[];
}

export const COUNTRIES: CountryOption[] = [
  { code: 'none', es: 'Sin país (Universal)', en: 'No specific country (Universal)', aliases: [] },
  { code: 'TR', es: 'Turquía', en: 'Turkey', aliases: ['turquia', 'turquía', 'turkey', 'estambul', 'istanbul', 'ankara', 'capadocia', 'cappadocia', 'esmirna', 'izmir', 'antalya', 'bósforo', 'bosforo'] },
  { code: 'ES', es: 'España', en: 'Spain', aliases: ['españa', 'espana', 'spain', 'madrid', 'barcelona', 'sevilla', 'seville', 'valencia', 'granada', 'toledo', 'bilbao', 'ibiza', 'mallorca', 'malaga', 'málaga'] },
  { code: 'MX', es: 'México', en: 'Mexico', aliases: ['mexico', 'méxico', 'mejico', 'méjico', 'cdmx', 'ciudad de mexico', 'ciudad de méxico', 'cancun', 'cancún', 'guadalajara', 'monterrey', 'oaxaca', 'tulum', 'puebla', 'acapulco', 'yucatan', 'yucatán', 'riviera maya'] },
  { code: 'JP', es: 'Japón', en: 'Japan', aliases: ['japon', 'japón', 'japan', 'tokio', 'tokyo', 'kioto', 'kyoto', 'osaka', 'shibuya', 'shinjuku', 'hiroshima', 'akihabara', 'yokohama', 'hokkaido', 'nara'] },
  { code: 'FR', es: 'Francia', en: 'France', aliases: ['francia', 'france', 'paris', 'parís', 'lyon', 'marsella', 'marseille', 'niza', 'nice', 'burdeos', 'bordeaux', 'cannes', 'versalles', 'toulouse', 'estrasburgo'] },
  { code: 'IT', es: 'Italia', en: 'Italy', aliases: ['italia', 'italy', 'roma', 'rome', 'milan', 'milán', 'florencia', 'florence', 'venecia', 'venice', 'napoles', 'nápoles', 'naples', 'pisa', 'sicilia', 'sicily', 'amalfi', 'toscana', 'tuscany', 'verona'] },
  { code: 'DE', es: 'Alemania', en: 'Germany', aliases: ['alemania', 'germany', 'deutschland', 'berlin', 'berlín', 'munich', 'múnich', 'münchen', 'hamburgo', 'hamburg', 'frankfurt', 'colonia', 'cologne', 'stuttgart', 'dusseldorf'] },
  { code: 'US', es: 'Estados Unidos', en: 'United States', aliases: ['estados unidos', 'united states', 'eeuu', 'ee.uu.', 'ee uu', 'usa', 'nueva york', 'new york', 'manhattan', 'brooklyn', 'los angeles', 'los ángeles', 'miami', 'chicago', 'san francisco', 'las vegas', 'boston', 'seattle', 'hollywood', 'california', 'texas', 'florida'] },
  { code: 'GB', es: 'Reino Unido', en: 'United Kingdom', aliases: ['reino unido', 'united kingdom', 'gran bretaña', 'gran bretana', 'uk', 'inglaterra', 'england', 'escocia', 'scotland', 'londres', 'london', 'manchester', 'liverpool', 'edimburgo', 'edinburgh', 'oxford', 'cambridge'] },
  { code: 'CO', es: 'Colombia', en: 'Colombia', aliases: ['colombia', 'bogota', 'bogotá', 'medellin', 'medellín', 'cartagena', 'cali', 'barranquilla', 'santa marta', 'bucaramanga', 'eje cafetero'] },
  { code: 'AR', es: 'Argentina', en: 'Argentina', aliases: ['argentina', 'buenos aires', 'cordoba', 'córdoba', 'rosario', 'mendoza', 'bariloche', 'patagonia', 'ushuaia', 'mar del plata', 'salta'] },
  { code: 'BR', es: 'Brasil', en: 'Brazil', aliases: ['brasil', 'brazil', 'rio de janeiro', 'río de janeiro', 'sao paulo', 'são paulo', 'salvador de bahia', 'salvador de bahía', 'copacabana', 'ipanema', 'brasilia', 'brasília'] },
  { code: 'CA', es: 'Canadá', en: 'Canada', aliases: ['canada', 'canadá', 'toronto', 'vancouver', 'montreal', 'montréal', 'quebec', 'québec', 'ottawa', 'calgary'] },
  { code: 'CL', es: 'Chile', en: 'Chile', aliases: ['chile', 'santiago de chile', 'valparaiso', 'valparaíso', 'viña del mar', 'atacama', 'patagonia chilena'] },
  { code: 'PE', es: 'Perú', en: 'Peru', aliases: ['peru', 'perú', 'lima', 'cusco', 'cuzco', 'machu picchu', 'arequipa', 'trujillo', 'puno'] },
  { code: 'NL', es: 'Países Bajos', en: 'Netherlands', aliases: ['paises bajos', 'países bajos', 'netherlands', 'holanda', 'holland', 'amsterdam', 'ámsterdam', 'rotterdam', 'la haya', 'the hague', 'utrecht'] },
  { code: 'GR', es: 'Grecia', en: 'Greece', aliases: ['grecia', 'greece', 'atenas', 'athens', 'santorini', 'mykonos', 'mikonos', 'míkonos', 'creta', 'crete', 'rodas', 'rhodes'] },
  { code: 'EG', es: 'Egipto', en: 'Egypt', aliases: ['egipto', 'egypt', 'el cairo', 'cairo', 'alejandria', 'alejandría', 'alexandria', 'luxor', 'giza', 'guiza', 'asuan', 'aswán'] },
  { code: 'KR', es: 'Corea del Sur', en: 'South Korea', aliases: ['corea del sur', 'south korea', 'corea', 'korea', 'seul', 'seúl', 'seoul', 'busan', 'incheon', 'jeju'] },
  { code: 'TH', es: 'Tailandia', en: 'Thailand', aliases: ['tailandia', 'thailand', 'bangkok', 'phuket', 'chiang mai', 'pattaya', 'krabi', 'koh samui'] },
  { code: 'AU', es: 'Australia', en: 'Australia', aliases: ['australia', 'sidney', 'sídney', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide'] },
  { code: 'PT', es: 'Portugal', en: 'Portugal', aliases: ['portugal', 'lisboa', 'lisbon', 'oporto', 'porto', 'sintra', 'algarve', 'faro'] },
  { code: 'IS', es: 'Islandia', en: 'Iceland', aliases: ['islandia', 'iceland', 'reikiavik', 'reykjavik', 'reikiavic', 'blue lagoon'] },
  { code: 'MA', es: 'Marruecos', en: 'Morocco', aliases: ['marruecos', 'morocco', 'marrakech', 'marraquech', 'casablanca', 'rabat', 'fez', 'tanger', 'tánger', 'tangier', 'chefchaouen'] },
  { code: 'CU', es: 'Cuba', en: 'Cuba', aliases: ['cuba', 'la habana', 'havana', 'varadero', 'santiago de cuba', 'trinidad cuba'] },
  { code: 'AT', es: 'Austria', en: 'Austria', aliases: ['austria', 'viena', 'vienna', 'salzburgo', 'salzburg', 'innsbruck'] },
  { code: 'CH', es: 'Suiza', en: 'Switzerland', aliases: ['suiza', 'switzerland', 'zurich', 'zúrich', 'ginebra', 'geneva', 'basilea', 'lucerna', 'alpes suizos'] },
  { code: 'IE', es: 'Irlanda', en: 'Ireland', aliases: ['irlanda', 'ireland', 'dublin', 'dublín', 'galway', 'cork'] },
  { code: 'SE', es: 'Suecia', en: 'Sweden', aliases: ['suecia', 'sweden', 'estocolmo', 'stockholm', 'gotemburgo', 'gothenburg', 'malmo', 'malmö'] },
  { code: 'NO', es: 'Noruega', en: 'Norway', aliases: ['noruega', 'norway', 'oslo', 'bergen', 'tromso', 'tromsø', 'fiordos noruegos'] },
  { code: 'DK', es: 'Dinamarca', en: 'Denmark', aliases: ['dinamarca', 'denmark', 'copenhague', 'copenhagen', 'aarhus'] },
  { code: 'FI', es: 'Finlandia', en: 'Finland', aliases: ['finlandia', 'finland', 'helsinki', 'laponia', 'lapland', 'rovaniemi'] },
  { code: 'PL', es: 'Polonia', en: 'Poland', aliases: ['polonia', 'poland', 'varsovia', 'warsaw', 'cracovia', 'krakow', 'gdansk'] },
  { code: 'BE', es: 'Bélgica', en: 'Belgium', aliases: ['belgica', 'bélgica', 'belgium', 'bruselas', 'brussels', 'brujas', 'bruges', 'gante', 'ghent', 'amberes', 'antwerp'] },
  { code: 'SG', es: 'Singapur', en: 'Singapore', aliases: ['singapur', 'singapore', 'marina bay'] },
  { code: 'GT', es: 'Guatemala', en: 'Guatemala', aliases: ['guatemala', 'ciudad de guatemala', 'antigua guatemala', 'lago de atitlan', 'atitlán', 'tikal'] },
  { code: 'CR', es: 'Costa Rica', en: 'Costa Rica', aliases: ['costa rica', 'san jose costa rica', 'san josé costa rica', 'manuel antonio', 'monteverde'] },
  { code: 'DO', es: 'República Dominicana', en: 'Dominican Republic', aliases: ['republica dominicana', 'república dominicana', 'dominican republic', 'santo domingo', 'punta cana'] },
  { code: 'EC', es: 'Ecuador', en: 'Ecuador', aliases: ['ecuador', 'quito', 'guayaquil', 'galapagos', 'galápagos', 'cuenca ecuador'] },
  { code: 'UY', es: 'Uruguay', en: 'Uruguay', aliases: ['uruguay', 'montevideo', 'punta del este', 'colonia del sacramento'] },
  { code: 'BO', es: 'Bolivia', en: 'Bolivia', aliases: ['bolivia', 'la paz bolivia', 'santa cruz bolivia', 'santa cruz de la sierra', 'salar de uyuni', 'uyuni'] },
  { code: 'PA', es: 'Panamá', en: 'Panama', aliases: ['panama', 'panamá', 'ciudad de panama', 'ciudad de panamá', 'canal de panama', 'canal de panamá'] },
  { code: 'VN', es: 'Vietnam', en: 'Vietnam', aliases: ['vietnam', 'hanoi', 'hanói', 'ho chi minh', 'saigon', 'saigón', 'da nang', 'halong bay'] },
  { code: 'IN', es: 'India', en: 'India', aliases: ['india', 'nueva delhi', 'new delhi', 'delhi', 'mumbai', 'bombay', 'bangalore', 'taj mahal', 'jaipur', 'goa'] },
  { code: 'ID', es: 'Indonesia', en: 'Indonesia', aliases: ['indonesia', 'yakarta', 'jakarta', 'bali', 'ubud', 'seminyak', 'kuta', 'lombok'] },
  { code: 'ZA', es: 'Sudáfrica', en: 'South Africa', aliases: ['sudafrica', 'sudáfrica', 'south africa', 'ciudad del cabo', 'cape town', 'johannesburgo', 'johannesburg'] },
  { code: 'CN', es: 'China', en: 'China', aliases: ['china', 'pekin', 'pekín', 'beijing', 'shanghai', 'shanghái', 'hong kong', 'guangzhou', 'gran muralla'] },
  { code: 'NZ', es: 'Nueva Zelanda', en: 'New Zealand', aliases: ['nueva zelanda', 'new zealand', 'auckland', 'wellington', 'queenstown', 'christchurch'] },
];

/**
 * Clean text for robust geographic matching (lower case, remove accents, trim)
 */
function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface DetectedCountryResult {
  code: string;
  nameEs: string;
  nameEn: string;
  matchedKeyword: string;
}

/**
 * Detects explicit country or prominent unequivocal city from text.
 * Strictly avoids personal names (e.g. Juan, Francisco, Maria, etc.).
 */
export function detectCountryFromText(text: string): DetectedCountryResult | null {
  if (!text || !text.trim()) return null;

  const normalizedInput = ` ${normalizeText(text)} `;

  // Sort aliases by length descending so multi-word places ("reino unido", "nueva york", "rio de janeiro") match before single words
  for (const country of COUNTRIES) {
    if (country.code === 'none') continue;

    // Collect all search terms
    const terms = [
      country.es,
      country.en,
      ...country.aliases,
    ];

    // Sort longest terms first
    terms.sort((a, b) => b.length - a.length);

    for (const term of terms) {
      const normalizedTerm = normalizeText(term);
      if (!normalizedTerm || normalizedTerm.length < 3) continue;

      // Word boundary match
      const regex = new RegExp(`\\b${normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalizedInput)) {
        return {
          code: country.code,
          nameEs: country.es,
          nameEn: country.en,
          matchedKeyword: term,
        };
      }
    }
  }

  return null;
}
