// app/api/cerfa/notice/route.js
// Génère la notice descriptive PC7/DP7 via Claude Opus 4.5 (avec fallback template).
export const dynamic = 'force-dynamic';

const MODEL = 'claude-opus-4-5';

async function generateWithClaude(data) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const prompt = `Tu es un expert en droit de l'urbanisme français. Rédige une NOTICE DESCRIPTIVE complète (article R.431-8 Code de l'urbanisme) pour un CERFA ${data.type_cerfa || 'PC/DP'}.

DEMANDEUR : ${data.prenom || ''} ${data.nom || ''}
ADRESSE : ${data.adresse_terrain}
COMMUNE : ${data.commune} (${data.code_postal})
SURFACE TERRAIN : ${data.surface_terrain || 'non précisée'} m²
SURFACE CRÉÉE : ${data.surface_creee} m²
HAUTEUR PROJET : ${data.hauteur_projet || 'non précisée'} m
NATURE : ${data.nature_travaux}
ZONE PLU : ${data.zone_plu || 'à vérifier'}
ABF : ${data.zone_abf ? 'OUI (accord ABF requis)' : 'non'}
MATÉRIAUX FAÇADE : ${data.materiaux_facade || 'à préciser'}
MATÉRIAUX TOITURE : ${data.materiaux_toiture || 'à préciser'}
DESCRIPTION LIBRE : ${data.description_libre || '—'}

Génère une notice en sections claires (Demandeur / Terrain / Projet / Matériaux / Réseaux / Conformité urbanisme).
Ton administratif français, précis, prêt à imprimer. Pas de markdown, juste du texte avec titres en MAJUSCULES soulignés par des tirets.`;

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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return d.content?.[0]?.text || null;
  } catch {
    return null;
  }
}

function templateNotice(data) {
  const surfaceCreee = parseInt(data.surface_creee) || 0;
  return `NOTICE DESCRIPTIVE DU PROJET
================================

DEMANDEUR
---------
${data.prenom || ''} ${data.nom || ''}
Adresse du terrain : ${data.adresse_terrain}
Commune : ${data.commune} (${data.code_postal})

DESCRIPTION DU TERRAIN
-----------------------
Le terrain est situé à ${data.adresse_terrain}, commune de ${data.commune} (${data.code_postal}).
Surface du terrain : ${data.surface_terrain || 'à préciser'} m²
Zone PLU : ${data.zone_plu || 'À vérifier auprès du service urbanisme'}
${data.zone_abf ? '⚠️ Terrain en périmètre de protection d\'un monument historique — accord ABF requis' : ''}

DESCRIPTION DU PROJET
----------------------
Nature des travaux : ${data.nature_travaux}
Surface créée : ${data.surface_creee} m²
Hauteur du projet : ${data.hauteur_projet || 'à préciser'} m
${data.description_libre ? `\nDescription complémentaire :\n${data.description_libre}` : ''}

MATÉRIAUX ET ASPECTS EXTÉRIEURS
---------------------------------
Façades : ${data.materiaux_facade || 'À préciser'}
Toiture : ${data.materiaux_toiture || 'À préciser'}

Les matériaux et couleurs ont été choisis en cohérence avec les constructions voisines et les prescriptions du règlement local d'urbanisme applicable.

RACCORDEMENTS AUX RÉSEAUX
--------------------------
Le projet sera raccordé aux réseaux existants (eau potable, assainissement collectif, électricité) selon les conditions techniques imposées par les concessionnaires de réseaux.

CONFORMITÉ AUX RÈGLES D'URBANISME
------------------------------------
Le projet a été conçu dans le respect des dispositions du Plan Local d'Urbanisme (PLU) de la commune de ${data.commune} et du Code de l'urbanisme. La surface créée de ${data.surface_creee} m² est ${surfaceCreee <= 150 ? 'inférieure au seuil de 150m² ne nécessitant pas le recours à un architecte' : 'conforme aux dispositions applicables'}.

Date : ${new Date().toLocaleDateString('fr-FR')}
Signature du demandeur : _______________`;
}

export async function POST(request) {
  try {
    const data = await request.json();
    if (!data.adresse_terrain || !data.nature_travaux) {
      return Response.json({ error: 'adresse_terrain et nature_travaux requis' }, { status: 400 });
    }

    // 1) Tenter Claude Opus 4.5 ; 2) sinon template administratif fiable.
    const aiNotice = await generateWithClaude(data);
    const notice = aiNotice || templateNotice(data);

    return Response.json({
      notice,
      cerfa_type: data.type_cerfa,
      ai_powered: !!aiNotice,
      model: aiNotice ? MODEL : null,
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({ error: 'Erreur génération notice', detail: e.message }, { status: 500 });
  }
}
