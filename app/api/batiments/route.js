// app/api/batiments/route.js
// Récupère bâtiments + parcelle principale + PARCELLES VOISINES + PLU depuis IGN.
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    if (!lat || !lon) return Response.json({ error: 'lat/lon requis' }, { status: 400 });

    const latF = parseFloat(lat), lonF = parseFloat(lon);
    const delta = 0.003; // ~300m

    // 1. Bâtiments existants (BDTOPO WFS)
    const batUrl = `https://wxs.ign.fr/topographie/geoportail/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=BDTOPO_V3:batiment&BBOX=${latF-delta},${lonF-delta},${latF+delta},${lonF+delta}&SRSNAME=EPSG:4326&OUTPUTFORMAT=application/json&COUNT=80`;

    // 2. Parcelle principale (au point exact)
    const parcelMainUrl = `https://apicarto.ign.fr/api/cadastre/parcelle?lon=${lon}&lat=${lat}&_limit=3`;

    // 3. PARCELLES VOISINES — recherche dans une BBOX autour du point (pour avoir les mitoyennes)
    const deltaVoisins = 0.0007; // ~70m → environ 4-8 parcelles voisines en zone pavillonnaire
    const bbox = [lonF - deltaVoisins, latF - deltaVoisins, lonF + deltaVoisins, latF + deltaVoisins].join(',');
    const parcelsBboxUrl = `https://apicarto.ign.fr/api/cadastre/parcelle?bbox=${bbox}&_limit=30`;

    // 4. PLU
    const pluUrl = `https://apicarto.ign.fr/api/gpu/zone-urba?lon=${lon}&lat=${lat}&_limit=1`;

    const [batRes, parcelMainRes, parcelsBboxRes, pluRes] = await Promise.allSettled([
      fetch(batUrl,         { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(8000) }),
      fetch(parcelMainUrl,  { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(8000) }),
      fetch(parcelsBboxUrl, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(8000) }),
      fetch(pluUrl,         { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(8000) }),
    ]);

    // ── Bâtiments ──
    let batiments = [];
    if (batRes.status === 'fulfilled' && batRes.value.ok) {
      const d = await batRes.value.json();
      batiments = (d.features || []).map(f => ({
        geometry: f.geometry,
        hauteur: f.properties?.hauteur || f.properties?.z_max || 6,
        nature: f.properties?.nature || 'Bâtiment',
        usage: f.properties?.usage_1 || 'Indifférencié',
      }));
    }

    // ── Parcelle principale ──
    let parcelle = null;
    let mainParcelId = null; // pour exclure des voisins
    if (parcelMainRes.status === 'fulfilled' && parcelMainRes.value.ok) {
      const d = await parcelMainRes.value.json();
      if (d.features?.length > 0) {
        const f = d.features[0];
        const p = f.properties || {};
        mainParcelId = p.idu || `${p.commune || ''}-${p.section || ''}-${p.numero || ''}`;
        parcelle = {
          geometry: f.geometry,
          section: p.section,
          numero: p.numero,
          contenance: p.contenance,
          commune: p.commune,
          reference: mainParcelId,
        };
      }
    }

    // ── PARCELLES VOISINES (excluant la principale) ──
    let voisins = [];
    if (parcelsBboxRes.status === 'fulfilled' && parcelsBboxRes.value.ok) {
      const d = await parcelsBboxRes.value.json();
      voisins = (d.features || [])
        .filter(f => {
          const p = f.properties || {};
          const id = p.idu || `${p.commune || ''}-${p.section || ''}-${p.numero || ''}`;
          return id !== mainParcelId; // exclure la parcelle principale
        })
        .slice(0, 12) // limiter à 12 voisins pour le rendu
        .map(f => {
          const p = f.properties || {};
          return {
            geometry: f.geometry,
            section: p.section,
            numero: p.numero,
            contenance: p.contenance,
            reference: p.idu || `${p.section || ''}-${p.numero || ''}`,
          };
        });
    }

    // ── PLU ──
    let plu = null;
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

    const reglesPLU = getPLURules(plu?.zone || 'UB');

    return Response.json({
      batiments,
      parcelle,
      voisins,
      voisins_count: voisins.length,
      plu: plu || { zone: 'UB' },
      regles: reglesPLU,
      center: { lat: latF, lon: lonF },
    });

  } catch (e) {
    console.error('Batiments API error:', e);
    return Response.json({ error: e.message, batiments: [], parcelle: null, voisins: [] });
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
