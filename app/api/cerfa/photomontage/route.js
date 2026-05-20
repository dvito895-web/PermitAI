// app/api/cerfa/photomontage/route.js
// PCMI6 — Photomontage d'insertion paysagère via Gemini Nano Banana (Emergent LLM Key).
// Reçoit une photo du paysage + description du projet, retourne une image générée
// montrant le projet inséré dans son environnement.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { generateImage } from '../../../../lib/llm';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      imageBase64,                          // photo du paysage (sans la maison)
      mimeType = 'image/jpeg',
      // Description architecturale
      nature_travaux,
      surface_creee,
      hauteur_projet,
      materiaux_facade,
      couleur_facade,
      materiaux_toiture,
      couleur_toiture,
      type_toiture = 'à 2 pans',
      description_libre,
      style = 'contemporain régional',
      commune,
    } = body || {};

    if (!imageBase64) return Response.json({ error: 'imageBase64 (photo du paysage) requise' }, { status: 400 });

    // Prompt soigné — un vrai architecte HMONP décrirait son projet inséré dans le paysage
    const prompt = `[INSERTION PAYSAGÈRE — Photomontage architectural niveau PCMI6]

Tu reçois une photographie du paysage actuel d'un terrain en France (${commune || 'commune française'}).

OBJECTIF : Réinjecte EXACTEMENT cette photo en conservant le ciel, la végétation, la voirie, le voisinage et le cadrage, puis insère de manière photoréaliste une construction nouvelle :

PROJET À INSÉRER :
- Nature : ${nature_travaux || 'maison individuelle neuve'}
- Surface plancher : ${surface_creee || 100} m²
- Hauteur totale : ${hauteur_projet || 7} m
- Style : ${style}
- Toiture : ${type_toiture}, matériau ${materiaux_toiture || 'tuiles terre cuite'}, couleur ${couleur_toiture || 'rouge brique'}
- Façades : ${materiaux_facade || 'enduit lisse'}, couleur ${couleur_facade || 'blanc cassé / pierre claire'}
- ${description_libre || ''}

CONTRAINTES ARCHITECTURALES :
- Respecte les proportions, la perspective et l'ombrage du paysage d'origine
- Volumétrie simple et cohérente avec le bâti environnant
- Fenêtres verticales rythmées, menuiseries fines
- Bardage horizontal possible si style contemporain
- Aucun élément kitsch — ton sobre, prêt à déposer en mairie

Rendu attendu : photographie réaliste, échelle d'insertion correcte, lumière naturelle cohérente avec la photo source. Format paysage 16:9 si possible.`;

    const r = await generateImage({
      prompt,
      referenceImageBase64: imageBase64,
      referenceMime: mimeType,
    });

    if (!r.ok) {
      console.error('[photomontage] gen error:', r.error);
      return Response.json({ success: false, error: r.error }, { status: 502 });
    }

    return Response.json({
      success: true,
      image: { mime: r.image.mime, base64: r.image.base64 },
      model: r.model,
      provider: 'emergent',
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[photomontage] fatal:', e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
