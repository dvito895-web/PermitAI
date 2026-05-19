// app/api/plu/query/route.js
// Analyse PLU complète : géocodage BAN → zone IGN GPU → Claude Opus 4.5 → fallback Code de l'urbanisme.
import { NextResponse } from 'next/server';

const MODEL = 'claude-opus-4-5';

async function geocode(address) {
  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`;
    const r = await fetch(url, { headers: { 'User-Agent': 'PermitAI/1.0' } });
    if (!r.ok) return null;
    const d = await r.json();
    const f = d.features?.[0];
    if (!f) return null;
    return {
      commune: f.properties.city,
      postcode: f.properties.postcode,
      citycode: f.properties.citycode,
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
    };
  } catch { return null; }
}

async function getZonePLU(lon, lat) {
  try {
    const geom = JSON.stringify({ type: 'Point', coordinates: [lon, lat] });
    const url = `https://apicarto.ign.fr/api/gpu/zone-urba?geom=${encodeURIComponent(geom)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'PermitAI/1.0' }, next: { revalidate: 86400 } });
    if (!r.ok) return null;
    const d = await r.json();
    const f = d.features?.[0];
    if (!f) return null;
    return {
      libelle: f.properties.libelle || null,
      libelong: f.properties.libelong || null,
      typezone: f.properties.typezone || null,
    };
  } catch { return null; }
}

async function aiAnalysis({ adresse, description, commune, zone, surface, type }) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const prompt = `Tu es expert en droit de l'urbanisme français. Analyse cette demande PLU :

ADRESSE : ${adresse}
COMMUNE : ${commune || 'inconnue'}
ZONE PLU : ${zone ? `${zone.libelle} (${zone.typezone}) — ${zone.libelong}` : 'non identifiée'}
PROJET : ${description || 'non précisé'}
SURFACE : ${surface || '?'} m²
TYPE : ${type || 'non précisé'}

JSON STRICT :
{
  "verdict": "conforme | conforme_sous_conditions | non_conforme | incertain",
  "score_confiance": 0-100,
  "resume": "2-3 phrases",
  "regles_applicables": [{"id":1,"label":"...","article":"...","value":"...","status":"ok|warn|danger","detail":"..."}],
  "alertes": ["max 3"],
  "recommendations": ["max 3"]
}

5-7 règles max. Zone A/N → généralement non_conforme. Réponds UNIQUEMENT le JSON.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    const text = d.content?.[0]?.text || '';
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    return JSON.parse(m[0]);
  } catch (e) {
    console.error('[plu/query] Claude failed:', e.message);
    return null;
  }
}

function genericRules() {
  return [
    { id: 1, label: 'Hauteur maximale',         article: 'Art. R.111-16',  value: '9m max au faîtage',    status: 'ok',   detail: "Limite indicative en zone résidentielle. À confirmer avec le PLU local." },
    { id: 2, label: 'Emprise au sol',           article: 'Art. R.111-19',  value: '40% du terrain max',   status: 'ok',   detail: 'Valeur courante en zone U.' },
    { id: 3, label: 'Recul voie publique',      article: 'Art. R.111-6',   value: '3m minimum',            status: 'ok',   detail: 'Recul standard, le PLU local peut imposer plus.' },
    { id: 4, label: 'Recul limites séparatives',article: 'Art. R.111-20',  value: 'H/2 ≥ 3m',              status: 'ok',   detail: 'Règle classique : recul = moitié hauteur, min 3m.' },
    { id: 5, label: 'Espaces verts',            article: 'Art. PLU local', value: '20-30% perméable',      status: 'warn', detail: 'Coefficient biotope à vérifier.' },
  ];
}

function recommendCerfa(type, surface) {
  const s = parseInt(surface, 10) || 0;
  if (type === 'demolition') return { numero: '13411*10', nom: 'Permis de démolir', delai: '2 mois' };
  if (type === 'amenagement') return { numero: '13410*10', nom: "Permis d'aménager", delai: '3 mois' };
  if (type === 'certificat')  return { numero: '13702*07', nom: "Certificat d'urbanisme", delai: '1-2 mois' };
  if (s > 20 || type === 'construction_neuve') {
    return { numero: '13406*13', nom: 'Permis de construire — maison individuelle', delai: '2 mois' };
  }
  return { numero: '13703*13', nom: 'Déclaration préalable — maison individuelle', delai: '1 mois' };
}

export async function POST(request) {
  const t0 = Date.now();
  try {
    const body = await request.json();
    const addr = body.address || body.adresse;
    const { description, type, surface, is_demo = true } = body;
    if (!addr) return NextResponse.json({ error: 'Adresse requise' }, { status: 400 });

    const geo = await geocode(addr);
    const commune = geo?.commune || addr.split(',').pop()?.trim() || 'Inconnue';
    const postcode = geo?.postcode || '';
    const coordinates = geo ? { lon: geo.lon, lat: geo.lat } : null;

    let zoneData = null;
    if (geo) zoneData = await getZonePLU(geo.lon, geo.lat);

    const ai = await aiAnalysis({ adresse: addr, description, commune, zone: zoneData, surface, type });

    const cerfa = recommendCerfa(type, surface);
    const baseRules = ai?.regles_applicables?.length ? ai.regles_applicables : genericRules();
    const verdict = ai?.verdict || (zoneData ? 'conforme_sous_conditions' : 'incertain');
    const score   = ai?.score_confiance ?? (zoneData ? 75 : 45);
    const resume  = ai?.resume || (zoneData
      ? `Projet analysé en zone ${zoneData.libelle || '?'} de ${commune}. ${zoneData.libelong || ''} Vérifiez les règles spécifiques.`
      : `Adresse géocodée à ${commune}. La zone PLU exacte n'a pas pu être identifiée — règles indicatives du Code de l'urbanisme appliquées.`);

    const zoneLabel = zoneData
      ? `${zoneData.libelle || zoneData.typezone || '?'} — ${zoneData.libelong || 'PLU local'}`
      : 'Non identifiée (Code de l\'urbanisme appliqué)';

    return NextResponse.json({
      success: true,
      // Champs attendus par la page /analyse
      verdict,
      score_confiance: score,
      resume,
      commune,
      postcode,
      coordinates,
      zone: zoneLabel,
      zone_data: zoneData,
      regles_applicables: baseRules,
      cerfa_recommande: cerfa.numero,
      regles_masquees: is_demo ? Math.max(0, 15 - baseRules.length) : 0,
      is_demo: !!is_demo,
      is_ai_powered: !!ai,
      geoportail_url: coordinates
        ? `https://www.geoportail-urbanisme.gouv.fr/map/#tile=1&lon=${coordinates.lon}&lat=${coordinates.lat}&zoom=17`
        : null,
      duration: ((Date.now() - t0) / 1000).toFixed(1),
      // Aliases legacy
      address: addr,
      pluSource: ai ? 'Claude Opus 4.5 + IGN GPU' : (zoneData ? 'IGN GPU' : "Code de l'urbanisme"),
      score,
      rules: baseRules.map(r => ({ id: r.id, label: r.label, article: r.article, value: r.value, status: r.status, detail: r.detail })),
      cerfa,
      hiddenRulesCount: is_demo ? Math.max(0, 15 - baseRules.length) : 0,
      model: ai ? MODEL : null,
      alertes: ai?.alertes || [],
      recommendations: ai?.recommendations || [],
    });
  } catch (error) {
    console.error('PLU query error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}
