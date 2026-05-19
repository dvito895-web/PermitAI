/**
 * /api/cadastre-proxy — Récupère LA parcelle cadastrale exacte au point cliqué.
 *
 * GET ?lon=...&lat=...
 *
 * STRATÉGIE (point-in-polygon côté IGN) :
 *   1) Appel API IGN apicarto avec geom={"type":"Point","coordinates":[lon,lat]}
 *      → renvoie LA parcelle contenant le point (1 feature max).
 *   2) Si vide : fallback avec un Polygon de 10m autour du point (capture les bords).
 *
 * ⚠️ IMPORTANT — Le format `?lon=&lat=&bbox=` est IGNORÉ par l'API IGN
 *    et renvoie ~1000 parcelles aléatoires (toutes celles avec même section/numéro
 *    à travers la France). Toujours utiliser `geom=...` (GeoJSON encodé URL).
 */
import { NextRequest, NextResponse } from 'next/server';

const IGN_BASE = 'https://apicarto.ign.fr/api/cadastre/parcelle';
const BUFFER_DEG = 0.00009; // ≈ 10m en latitude France

interface IgnFeature {
  type: string;
  geometry: any;
  properties: Record<string, any>;
}

function buildPointUrl(lon: number, lat: number): string {
  const geom = JSON.stringify({ type: 'Point', coordinates: [lon, lat] });
  return `${IGN_BASE}?geom=${encodeURIComponent(geom)}&source_ign=PCI`;
}

function buildBufferUrl(lon: number, lat: number): string {
  // Carré 10m autour du point (fallback si Point ne tombe pas exactement dans une parcelle)
  const ring = [
    [lon - BUFFER_DEG, lat - BUFFER_DEG],
    [lon + BUFFER_DEG, lat - BUFFER_DEG],
    [lon + BUFFER_DEG, lat + BUFFER_DEG],
    [lon - BUFFER_DEG, lat + BUFFER_DEG],
    [lon - BUFFER_DEG, lat - BUFFER_DEG],
  ];
  const geom = JSON.stringify({ type: 'Polygon', coordinates: [ring] });
  return `${IGN_BASE}?geom=${encodeURIComponent(geom)}&source_ign=PCI`;
}

async function fetchIgn(url: string): Promise<IgnFeature[]> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'PermitAI/1.0' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const d = await res.json();
    return Array.isArray(d.features) ? d.features : [];
  } catch {
    return [];
  }
}

function normalize(f: IgnFeature) {
  const p = f.properties || {};
  // Contenance IGN apicarto est déjà en m² (entier). Pas de centiares.
  // Voir doc : https://apicarto.ign.fr/api/doc/cadastre — champ "contenance" = surface en m²
  const surfaceRaw = p.contenance ?? p.contenancedgfip;
  const surface = Number.isFinite(Number(surfaceRaw)) ? Math.round(Number(surfaceRaw)) : 0;

  return {
    ...f,
    properties: {
      ...p,
      contenance:      surface,
      contenancedgfip: surface,
      surface_m2:      surface,
      section:  (p.section  || p.sec || '').trim(),
      numero:   (p.numero   || p.num || '').trim(),
      nom_com:  p.nom_com   || p.commune || '',
      code_com: p.code_com  || p.code_commune || '',
      code_insee: p.code_insee || `${p.code_dep || ''}${p.code_com || ''}`,
      idu:      p.idu || '',
    },
  };
}

export async function GET(req: NextRequest) {
  const lon = req.nextUrl.searchParams.get('lon');
  const lat = req.nextUrl.searchParams.get('lat');
  if (!lon || !lat) {
    return NextResponse.json({ error: 'lon et lat requis', features: [] }, { status: 400 });
  }

  const lonF = parseFloat(lon);
  const latF = parseFloat(lat);
  if (!Number.isFinite(lonF) || !Number.isFinite(latF)) {
    return NextResponse.json({ error: 'lon/lat must be numeric', features: [] }, { status: 400 });
  }

  // 1) Essai point-in-polygon (le plus précis)
  let features = await fetchIgn(buildPointUrl(lonF, latF));

  // 2) Fallback : buffer 10m si le point est sur une limite/voirie
  if (features.length === 0) {
    features = await fetchIgn(buildBufferUrl(lonF, latF));
  }

  if (features.length === 0) {
    return NextResponse.json({
      error: 'Parcelle introuvable à ces coordonnées',
      features: [],
      query: { lon: lonF, lat: latF },
    }, { status: 404 });
  }

  // Diagnostic temporaire pour valider la correction sur Vercel logs
  if (process.env.NODE_ENV !== 'production') {
    console.log('[cadastre-proxy] IGN raw properties:', JSON.stringify(features[0].properties));
  }

  // Si plusieurs parcelles (cas du buffer), prendre la plus petite
  // (en général la bonne — les "grosses" sont les places/voiries).
  const sorted = features
    .map(normalize)
    .filter(f => f.properties.surface_m2 > 0)
    .sort((a, b) => a.properties.surface_m2 - b.properties.surface_m2);

  // Renvoie la première (plus petite, donc plus probable d'être la résidentielle)
  // mais aussi toutes pour debug côté front si besoin.
  const out = sorted.length ? sorted : features.map(normalize);

  return NextResponse.json(
    { features: out, source: 'IGN apicarto · cadastre/parcelle (geom=Point)' },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  );
}
