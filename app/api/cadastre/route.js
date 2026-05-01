// app/api/cadastre/route.js
// Récupère les données cadastrales depuis l'API officielle
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const code_insee = searchParams.get('code_insee');

    if (!lat || !lon) {
      return Response.json({ error: 'lat/lon requis' }, { status: 400 });
    }

    // API Cadastre officielle - données parcellaires
    const cadastreUrl = `https://geocodage.ign.fr/look4/parcel/reverse?lon=${lon}&lat=${lat}&returnTrueGeometry=true`;
    const res = await fetch(cadastreUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      // Fallback: API cadastre data.gouv.fr
      const fallbackUrl = `https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lon}&fields=code,nom,codesPostaux&format=json`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      return Response.json({ 
        source: 'fallback',
        commune: fallbackData[0] || null,
        parcelle: null
      });
    }

    const data = await res.json();
    const feature = data.features?.[0];
    
    return Response.json({
      source: 'ign',
      parcelle: {
        section: feature?.properties?.section || '',
        numero: feature?.properties?.numero || '',
        feuille: feature?.properties?.feuille || '',
        reference: feature ? `${feature.properties.section} ${feature.properties.numero}` : '',
        surface: feature?.properties?.contenance || null,
        commune_code: feature?.properties?.commune || code_insee || '',
      },
      geometry: feature?.geometry || null,
    });
  } catch (e) {
    console.error('Cadastre API error:', e);
    return Response.json({ error: 'Erreur API cadastre', parcelle: null });
  }
}
