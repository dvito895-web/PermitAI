// app/api/batiments/route.js
// Récupère les bâtiments existants + limites parcelle depuis IGN BDTOPO
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const code_insee = searchParams.get('code_insee') || '';

    if (!lat || !lon) return Response.json({ error: 'lat/lon requis' }, { status: 400 });

    const latF = parseFloat(lat), lonF = parseFloat(lon);
    const delta = 0.003; // ~300m autour

    // 1. Bâtiments existants via IGN BDTOPO WFS
    const batUrl = `https://wxs.ign.fr/topographie/geoportail/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=BDTOPO_V3:batiment&BBOX=${latF-delta},${lonF-delta},${latF+delta},${lonF+delta}&SRSNAME=EPSG:4326&OUTPUTFORMAT=application/json&COUNT=50`;
    
    // 2. Parcelles cadastrales via API cadastre
    const parcelUrl = `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${lon}&lat=${lat}&_limit=5`;

    // 3. Données PLU depuis notre base
    const pluUrl = `https://apicarto.ign.fr/api/gpu/zone-urba?lon=${lon}&lat=${lat}&_limit=1`;

    const [batRes, parcelRes, pluRes] = await Promise.allSettled([
      fetch(batUrl, { headers: { 'Accept': 'application/json' } }),
      fetch(parcelUrl, { headers: { 'Accept': 'application/json' } }),
      fetch(pluUrl, { headers: { 'Accept': 'application/json' } }),
    ]);

    let batiments = [], parcelle = null, plu = null;

    if (batRes.status === 'fulfilled' && batRes.value.ok) {
      const d = await batRes.value.json();
      batiments = (d.features || []).map(f => ({
        geometry: f.geometry,
        hauteur: f.properties?.hauteur || f.properties?.z_max || 6,
        nature: f.properties?.nature || 'Bâtiment',
        usage: f.properties?.usage_1 || 'Indifférencié',
      }));
    }

    if (parcelRes.status === 'fulfilled' && parcelRes.value.ok) {
      const d = await parcelRes.value.json();
      if (d.features?.length > 0) {
        const f = d.features[0];
        parcelle = {
          geometry: f.geometry,
          section: f.properties?.section,
          numero: f.properties?.numero,
          contenance: f.properties?.contenance,
          commune: f.properties?.commune,
        };
      }
    }

    if (pluRes.status === 'fulfilled' && pluRes.value.ok) {
      const d = await pluRes.value.json();
      if (d.features?.length > 0) {
        const f = d.features[0];
        plu = {
          zone: f.properties?.libelle || f.properties?.libelong || 'UB',
          type_zone: f.properties?.typezone || 'U',
          reglement_url: f.properties?.urlfic || null,
        };
      }
    }

    // Règles PLU standards par zone (fallback si API GPU vide)
    const reglesPLU = getPLURules(plu?.zone || 'UB');

    return Response.json({
      batiments,
      parcelle,
      plu: plu || { zone: 'UB' },
      regles: reglesPLU,
      center: { lat: latF, lon: lonF },
    });

  } catch (e) {
    console.error('Batiments API error:', e);
    return Response.json({ error: e.message, batiments: [], parcelle: null });
  }
}

function getPLURules(zone) {
  const rules = {
    'UA': { recul_voirie: 0, recul_limite: 0, emprise_max: 0.8, hauteur_max: 15, implantation: 'alignement obligatoire' },
    'UB': { recul_voirie: 5, recul_limite: 3, emprise_max: 0.5, hauteur_max: 10, implantation: 'retrait possible' },
    'UC': { recul_voirie: 5, recul_limite: 3, emprise_max: 0.4, hauteur_max: 8, implantation: 'retrait obligatoire' },
    'UD': { recul_voirie: 5, recul_limite: 5, emprise_max: 0.3, hauteur_max: 7, implantation: 'retrait obligatoire' },
    'UE': { recul_voirie: 10, recul_limite: 5, emprise_max: 0.5, hauteur_max: 12, implantation: 'libre' },
    'NB': { recul_voirie: 10, recul_limite: 5, emprise_max: 0.2, hauteur_max: 6, implantation: 'libre' },
    'default': { recul_voirie: 5, recul_limite: 3, emprise_max: 0.4, hauteur_max: 9, implantation: 'retrait possible' },
  };
  const zoneBase = zone?.replace(/[0-9]/g, '') || 'UB';
  return rules[zoneBase] || rules['UB'];
}
