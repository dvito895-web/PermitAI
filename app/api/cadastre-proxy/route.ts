/**
 * Proxy cadastre — alias /api/cadastre-proxy.
 *
 * GET /api/cadastre-proxy?lon=&lat=
 *   → délègue à /api/cadastre (logique IGN + normalisation contenance/contenancedgfip).
 *   La route originale /api/cadastre reste fonctionnelle ; ce proxy existe pour
 *   garantir la cohérence du contrat d'URL côté client (MapCadastre, wizard).
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const lon = req.nextUrl.searchParams.get('lon');
  const lat = req.nextUrl.searchParams.get('lat');
  if (!lon || !lat) {
    return NextResponse.json({ error: 'lon et lat requis', features: [] }, { status: 400 });
  }

  const lonF = parseFloat(lon);
  const latF = parseFloat(lat);
  if (Number.isNaN(lonF) || Number.isNaN(latF)) {
    return NextResponse.json({ error: 'lon/lat must be numeric', features: [] }, { status: 400 });
  }

  const buf  = 0.0001;
  const bbox = `${lonF - buf},${latF - buf},${lonF + buf},${latF + buf}`;

  let data: any = null;
  const urls = [
    `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${lon}&lat=${lat}&bbox=${bbox}&limit=1&apikey=essentiels`,
    `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${lon}&lat=${lat}&bbox=${bbox}&limit=1`,
    `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${lon}&lat=${lat}&limit=1`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'PermitAI/1.0' },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const d = await res.json();
        if (d.features?.length > 0) { data = d; break; }
      }
    } catch {}
  }

  if (!data) {
    return NextResponse.json({ error: 'Parcelle introuvable', features: [] }, { status: 404 });
  }

  // Normalisation contenance | contenancedgfip + fallback géométrique
  data.features = data.features.map((f: any) => {
    const p = f.properties || {};
    let surface = 0;
    if (Number(p.contenance) > 0)           surface = Math.round(Number(p.contenance));
    else if (Number(p.contenancedgfip) > 0) surface = Math.round(Number(p.contenancedgfip));
    else if (f.geometry)                    surface = Math.round(calcSurface(f.geometry));
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
      },
    };
  });

  return NextResponse.json(data, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}

function calcSurface(geometry: any): number {
  try {
    const rings = geometry.type === 'Polygon' ? geometry.coordinates
      : geometry.type === 'MultiPolygon' ? geometry.coordinates[0] : [];
    if (!rings.length) return 0;
    const coords = rings[0];
    const R = 6371000;
    let area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const dLon = ((coords[i+1][0] - coords[i][0]) * Math.PI) / 180;
      const avgLat = (((coords[i][1] + coords[i+1][1]) / 2) * Math.PI) / 180;
      area += dLon * R * R * Math.cos(avgLat);
    }
    return Math.abs(area / 2);
  } catch { return 0; }
}
