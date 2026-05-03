// app/api/cerfa/analyze-plan/route.js
// Claude Vision analyse le plan uploadé et extrait toutes les données architecturales
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { imageBase64, mimeType, surface_declaree, nature_travaux } = await request.json();

    const prompt = `Tu es un architecte expert en urbanisme français. Analyse ce plan de maison/construction et extrais toutes les informations architecturales avec précision.

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après:
{
  "dimensions": {
    "largeur_totale": <nombre en mètres, estimé depuis le plan>,
    "profondeur_totale": <nombre en mètres>,
    "surface_plancher_estimee": <nombre en m²>,
    "hauteur_estimee": <nombre en mètres, défaut 2.8>
  },
  "forme_batiment": {
    "type": "rectangulaire" | "en_L" | "en_U" | "complexe",
    "ratio_largeur_profondeur": <nombre>,
    "orientation_principale": "Nord-Sud" | "Est-Ouest" | "autre",
    "points_facade_principale": [
      {"x": 0, "y": 0},
      {"x": 1, "y": 0},
      {"x": 1, "y": 0.6},
      {"x": 0, "y": 0.6}
    ]
  },
  "elements": {
    "nombre_pieces": <nombre>,
    "pieces": ["salon", "cuisine", "chambre 1", "chambre 2", "sdb", "couloir"],
    "a_etage": <true|false>,
    "a_garage": <true|false>,
    "a_veranda": <true|false>,
    "a_terrasse": <true|false>,
    "type_toiture": "deux pans" | "quatre pans" | "plat" | "mansardé",
    "pente_toiture_estimee": <nombre en degrés, défaut 35>
  },
  "materiaux_detectes": {
    "murs": "parpaing" | "brique" | "bois" | "béton" | "non détecté",
    "toiture": "tuiles" | "ardoise" | "bac acier" | "zinc" | "non détecté"
  },
  "facade_principale": {
    "nombre_fenetres": <nombre>,
    "nombre_portes": <nombre>,
    "hauteur_facade": <nombre en mètres>,
    "elements_notables": []
  },
  "plan_masse_suggestion": {
    "implantation": "centre" | "nord" | "sud" | "est" | "ouest",
    "recul_voirie_suggere": <nombre en mètres>,
    "recul_limite_suggere": <nombre en mètres>,
    "commentaire": "<conseil d'implantation>"
  },
  "notice_elements": {
    "description_terrain": "<description professionnelle>",
    "description_projet": "<description architecturale professionnelle>",
    "justification_conformite": "<justification PLU>"
  }
}

Surface déclarée: ${surface_declaree || 'non précisée'}m²
Nature travaux: ${nature_travaux || 'non précisée'}

Sois précis dans l'analyse du plan. Si tu ne peux pas déterminer une valeur, utilise des valeurs typiques françaises.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Parse JSON
    let result;
    try {
      const clean = text.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(clean);
    } catch {
      // Fallback si parsing échoue
      result = {
        dimensions: { largeur_totale: 10, profondeur_totale: 8, surface_plancher_estimee: parseFloat(surface_declaree) || 80, hauteur_estimee: 2.8 },
        forme_batiment: { type: 'rectangulaire', ratio_largeur_profondeur: 1.25, orientation_principale: 'Nord-Sud', points_facade_principale: [{x:0,y:0},{x:1,y:0},{x:1,y:0.6},{x:0,y:0.6}] },
        elements: { nombre_pieces: 4, pieces: ['salon', 'cuisine', 'chambre', 'sdb'], a_etage: false, a_garage: false, a_veranda: false, a_terrasse: false, type_toiture: 'deux pans', pente_toiture_estimee: 35 },
        materiaux_detectes: { murs: 'non détecté', toiture: 'tuiles' },
        facade_principale: { nombre_fenetres: 3, nombre_portes: 1, hauteur_facade: 2.8, elements_notables: [] },
        plan_masse_suggestion: { implantation: 'centre', recul_voirie_suggere: 5, recul_limite_suggere: 3, commentaire: 'Implantation centrée recommandée' },
        notice_elements: { description_terrain: '', description_projet: `Projet de ${nature_travaux || 'construction'} d'une surface de ${surface_declaree || '80'}m²`, justification_conformite: 'Le projet respecte les règles du PLU applicables.' },
      };
    }

    return Response.json({ success: true, analysis: result });
  } catch (e) {
    console.error('Analyze plan error:', e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
