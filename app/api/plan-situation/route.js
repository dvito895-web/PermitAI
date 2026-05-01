// app/api/plan-situation/route.js
// Génère l'URL du plan de situation via API IGN
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const zoom = searchParams.get('zoom') || '15';

    if (!lat || !lon) {
      return Response.json({ error: 'lat/lon requis' }, { status: 400 });
    }

    // Carte IGN - Plan de situation 1/25000
    const largeur = 1200;
    const hauteur = 900;
    
    const planSituationUrl = `https://wxs.ign.fr/cartes/geoportail/r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLES=&CRS=EPSG:4326&BBOX=${parseFloat(lat)-0.015},${parseFloat(lon)-0.02},${parseFloat(lat)+0.015},${parseFloat(lon)+0.02}&WIDTH=${largeur}&HEIGHT=${hauteur}&FORMAT=image/png`;
    
    // Carte satellite pour contexte
    const satelliteUrl = `https://wxs.ign.fr/ortho/geoportail/r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=HR.ORTHOIMAGERY.ORTHOPHOTOS&STYLES=&CRS=EPSG:4326&BBOX=${parseFloat(lat)-0.005},${parseFloat(lon)-0.007},${parseFloat(lat)+0.005},${parseFloat(lon)+0.007}&WIDTH=${largeur}&HEIGHT=${hauteur}&FORMAT=image/jpeg`;
    
    // Géoportail direct (meilleure qualité)
    const geoportailUrl = `https://www.geoportail-urbanisme.gouv.fr/map/#tile=1&lon=${lon}&lat=${lat}&zoom=16`;
    
    // URL OpenStreetMap comme fallback
    const osmUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=${largeur}x${hauteur}&markers=${lat},${lon},ol-marker`;

    return Response.json({
      plan_situation: planSituationUrl,
      satellite: satelliteUrl,
      geoportail: geoportailUrl,
      osm: osmUrl,
      embed_url: `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lon)-0.02},${parseFloat(lat)-0.015},${parseFloat(lon)+0.02},${parseFloat(lat)+0.015}&layer=mapnik&marker=${lat},${lon}`,
      leaflet_config: {
        center: [parseFloat(lat), parseFloat(lon)],
        zoom: 15,
        marker: [parseFloat(lat), parseFloat(lon)],
      }
    });
  } catch (e) {
    return Response.json({ error: 'Erreur génération plan' });
  }
}
