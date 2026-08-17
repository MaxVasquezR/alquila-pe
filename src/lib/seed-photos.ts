/**
 * Fotos de seed por tipo de bien — URLs Unsplash específicas por keyword.
 * En producción los dueños suben fotos reales vía /api/uploads.
 */

type PhotoSet = string[];

const CATALOG: Record<string, PhotoSet> = {
  taladro: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80",
  ],
  rotomartillo: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80",
  ],
  sierra: [
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80",
  ],
  compresor: [
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1548337138-e87d889eb601?auto=format&fit=crop&w=800&q=80",
  ],
  escalera: [
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80",
  ],
  andamio: [
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
  ],
  lijadora: [
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80",
  ],
  generador: [
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1473341603779-ce8693bd63c9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1548337138-e87d889eb601?auto=format&fit=crop&w=800&q=80",
  ],
  silla: [
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493666438817-866a91392ca3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80",
  ],
  mesa: [
    "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80",
  ],
  toldo: [
    "https://images.unsplash.com/photo-1519710884004-0c2d1865d15d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1493666438817-866a91392ca3?auto=format&fit=crop&w=800&q=80",
  ],
  carpa: [
    "https://images.unsplash.com/photo-1519710884004-0c2d1865d15d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80",
  ],
  camara: [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1510127034890-ba27508e70d0?auto=format&fit=crop&w=800&q=80",
  ],
  macbook: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
  ],
  proyector: [
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
  ],
  ps5: [
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80",
  ],
  consola: [
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=800&q=80",
  ],
  drone: [
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1508614589047-eb105316f9c9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507584335423-0b1f2a4a1c6d?auto=format&fit=crop&w=800&q=80",
  ],
  tablet: [
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
  ],
};

const CATEGORY_FALLBACK: Record<string, PhotoSet> = {
  herramientas: CATALOG.taladro,
  eventos: CATALOG.silla,
  tecnologia: CATALOG.camara,
  hogar: CATALOG.mesa,
  movilidad: CATALOG.taladro,
};

const KEYWORDS = Object.keys(CATALOG).sort((a, b) => b.length - a.length);

function matchKeyword(titulo: string): string | null {
  const t = titulo.toLowerCase();
  for (const kw of KEYWORDS) {
    if (t.includes(kw)) return kw;
  }
  return null;
}

export function pickPhotos(titulo: string, categoria: string): string[] {
  const kw = matchKeyword(titulo);
  if (kw && CATALOG[kw]) return CATALOG[kw];
  return CATEGORY_FALLBACK[categoria] ?? CATALOG.taladro;
}

export function photosJson(titulo: string, categoria: string): string {
  return JSON.stringify(pickPhotos(titulo, categoria));
}
