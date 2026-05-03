// app/api/parcelles/route.js
// Proxy serveur pour apicarto.ign.fr — évite les erreurs CORS
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
      return Response.json({ error: 'lat/lon requis' }, { status: 400 });
    }

    // Appel côté serveur — pas de CORS
    const url = `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${lon}&lat=${lat}&_limit=50`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PermitAI/1.0',
      },
    });

    if (!res.ok) {
      // Fallback: essayer avec l'API geo.api.gouv.fr
      return Response.json({ features: [], error: 'API IGN indisponible' });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    console.error('Parcelles API error:', e);
    return Response.json({ features: [], error: e.message });
  }
}
