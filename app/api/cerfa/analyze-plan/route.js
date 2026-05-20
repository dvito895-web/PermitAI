// app/api/cerfa/analyze-plan/route.js
// Claude Vision (opus-4-5) — Analyse architecte HMONP exhaustive du plan uploadé.
// Extrait dimensions, toiture, façades, niveaux, pièces, réseaux, conformité PLU automatique,
// liste des pièces jointes obligatoires selon le CERFA, et alertes architecte.

export const dynamic = 'force-dynamic';

import { llmCall, isLlmConfigured, extractJson } from '../../../../lib/llm';

const MODEL = 'claude-sonnet-4-5-20250929';

// ─────────────────────── Helpers
function buildPrompt({
  surface_declaree, nature_travaux, surface_terrain, hauteur_max_plu,
  ces_plu, zone_plu, zone_abf, type_cerfa, recul_voirie_plu, recul_limites_plu,
}) {
  const seuilDpPc = (zone_plu || '').toUpperCase().startsWith('U') ? 40 : 20;

  return `Tu es un ARCHITECTE HMONP (Habilitation à la Maîtrise d'Œuvre en son Nom Propre) français avec 20 ans d'expérience en instruction de dossiers d'urbanisme. Tu analyses ce plan/photo comme tu le ferais avant signature d'un dossier de permis de construire.

CONTEXTE FOURNI :
- Nature travaux       : ${nature_travaux || 'non précisée'}
- Surface déclarée     : ${surface_declaree || 'non précisée'} m² (créée)
- Surface terrain      : ${surface_terrain || 'non précisée'} m²
- Zone PLU             : ${zone_plu || 'non précisée'}
- Hauteur max PLU      : ${hauteur_max_plu || 'non précisée'} m
- CES (Coef Emprise Sol PLU) : ${ces_plu || 'non précisé'}
- Recul voirie PLU     : ${recul_voirie_plu || 'non précisé'} m
- Recul limites PLU    : ${recul_limites_plu || 'non précisé'} m
- Périmètre ABF        : ${zone_abf ? 'OUI (≤500m monument historique)' : 'non'}
- CERFA visé           : ${type_cerfa || 'à déterminer'}
- Seuil DP/PC zone     : ${seuilDpPc} m² (au-delà : PC obligatoire)

═══ TA MISSION ═══
Analyse le document fourni (plan masse, façades, coupe, photo terrain, etc.) et remplis le JSON ci-dessous EXHAUSTIVEMENT. Pour chaque mesure : utilise les cotes du plan si présentes, sinon estime depuis l'échelle ou la perspective, et indique ta confiance (0-100).

Si le document est illisible, incomplet ou hors-sujet : remplis quand même les champs détectables avec confidence < 50, et explique dans "qualite_document.commentaire".

═══ JSON STRICT À RETOURNER (rien avant, rien après, pas de markdown) ═══

{
  "qualite_document": {
    "type_detecte": "plan_masse | plan_facade | plan_coupe | plan_situation | photo_terrain | photo_aerienne | document_autre",
    "lisibilite": 0-100,
    "echelle_detectee": "1/100 | 1/200 | 1/500 | inconnue",
    "nord_visible": true|false,
    "cotes_visibles": true|false,
    "commentaire": "1 phrase"
  },

  "dimensions": {
    "emprise_sol_m2":           { "valeur": null, "confiance": 0 },
    "surface_plancher_creee_m2":{ "valeur": null, "confiance": 0 },
    "surface_totale_apres_m2":  { "valeur": null, "confiance": 0 },
    "hauteur_faitage_m":        { "valeur": null, "confiance": 0 },
    "hauteur_egout_m":          { "valeur": null, "confiance": 0 },
    "longueur_facade_principale_m": { "valeur": null, "confiance": 0 },
    "profondeur_batiment_m":    { "valeur": null, "confiance": 0 },
    "largeur_totale_m":         { "valeur": null, "confiance": 0 }
  },

  "toiture": {
    "type": "2_pans | 4_pans | plat | shed | mansarde | monopente | inconnu",
    "pente_degres": { "valeur": null, "confiance": 0 },
    "materiau": "tuile_canal | tuile_mecanique | ardoise | zinc | bac_acier | vegetalise | tole | inconnu",
    "couleur": "description courte ou code RAL",
    "confiance_globale": 0
  },

  "facades": {
    "materiau_principal": "enduit | pierre | brique | bois | bardage_metallique | bardage_bois | beton_brut | inconnu",
    "couleur_principale": "RAL ou description (ex: blanc cassé, ton pierre)",
    "ouvertures": {
      "nombre_fenetres": { "valeur": 0, "confiance": 0 },
      "nombre_portes":   { "valeur": 0, "confiance": 0 },
      "nombre_baies":    { "valeur": 0, "confiance": 0 }
    },
    "menuiseries": {
      "materiau": "bois | aluminium | pvc | mixte | inconnu",
      "couleur":  "RAL ou description"
    },
    "confiance_globale": 0
  },

  "niveaux": {
    "structure": "R+0 | R+1 | R+2 | R+3+ | inconnu",
    "combles_amenages": true|false|null,
    "sous_sol": true|false|null,
    "hauteur_sous_plafond_m": { "valeur": null, "confiance": 0 }
  },

  "pieces": {
    "nombre_total": null,
    "liste_detectee": [],
    "nombre_chambres": null,
    "garage": true|false|null,
    "terrasse": true|false|null,
    "piscine": true|false|null,
    "veranda": true|false|null
  },

  "reseaux": {
    "eau_potable":      "raccorde | non_raccorde | inconnu",
    "assainissement":   "tout_a_l_egout | ANC | mixte | inconnu",
    "electricite":      "raccorde | non_raccorde | inconnu",
    "gaz":              "raccorde | non_raccorde | inconnu",
    "telecom":          "raccorde | non_raccorde | inconnu"
  },

  "plan_masse_suggestion": {
    "implantation": "nord | sud | est | ouest | centre | inconnu",
    "recul_voirie_propose_m": null,
    "recul_limites_separatives_m": null,
    "orientation_principale": "Nord-Sud | Est-Ouest | autre"
  },

  "conformite_plu_auto": {
    "hauteur_ok":         { "verdict": "ok | depasse | inconnu", "detail": "ex: faîtage 8m ≤ 9m max ✓" },
    "seuil_dp_pc":        { "verdict": "dp_suffit | pc_requis | inconnu", "seuil_applique_m2": ${seuilDpPc}, "detail": "" },
    "emprise_ces":        { "verdict": "ok | depasse | inconnu", "detail": "ex: 25% ≤ 40% CES ✓" },
    "recul_voirie_ok":    { "verdict": "ok | non_conforme | inconnu", "detail": "" },
    "recul_limites_ok":   { "verdict": "ok | non_conforme | inconnu", "detail": "" },
    "score_global":       0-100
  },

  "pieces_jointes_requises": {
    "cerfa_recommande": "13406 | 13703 | 13409 | 13404 | 13410 | 13411 | 13702 | autre",
    "liste": [
      { "code": "PC1", "intitule": "Plan de situation du terrain",          "statut": "auto_genere | a_uploader | ia_genere", "instruction": "Auto-généré depuis IGN Géoportail." },
      { "code": "PC2", "intitule": "Plan de masse coté en 3 dimensions",     "statut": "a_uploader",   "instruction": "Téléversez votre plan masse avec cotes, nord, échelle, et reculs." },
      { "code": "PC3", "intitule": "Plan en coupe du terrain et construction","statut": "a_uploader",   "instruction": "Coupe transversale avec terrain naturel et projet." },
      { "code": "PC4", "intitule": "Notice décrivant le terrain et présentant le projet", "statut": "ia_genere", "instruction": "Pré-rempli par notre IA (modifiable)." },
      { "code": "PC5", "intitule": "Plan des façades et des toitures",       "statut": "a_uploader",   "instruction": "Toutes les façades et la toiture, cotées." },
      { "code": "PC6", "intitule": "Document graphique d'insertion paysagère","statut": "ia_genere",   "instruction": "Photomontage généré automatiquement." },
      { "code": "PC7", "intitule": "Photographie en environnement proche",   "statut": "a_uploader",   "instruction": "Vue depuis la voie publique." },
      { "code": "PC8", "intitule": "Photographie en environnement lointain", "statut": "a_uploader",   "instruction": "Vue plus large pour situer dans le paysage." }
    ]
  },

  "alertes_architecte": [
    {
      "criticite": "bloquante | warning | info",
      "domaine": "ABF | ERP | accessibilite_PMR | RE2020 | assainissement | thermique | structurel | autre",
      "message": "phrase précise",
      "action_recommandee": "phrase précise"
    }
  ],

  "synthese": {
    "verdict_global": "GO | GO_SOUS_CONDITIONS | NO_GO | INDETERMINE",
    "score_dossier": 0-100,
    "resume": "2-3 phrases — recommandation finale d'architecte HMONP"
  }
}

═══ RÈGLES D'ANALYSE OBLIGATOIRES ═══

1. Pour le seuil DP/PC : si zone U et surface créée > 40m² → PC (13406). Si zone non-U et > 20m² → PC. Sinon DP (13703).

2. Pour PIÈCES JOINTES selon CERFA :
   - PC (13406) → liste complète PC1 à PC8 + attestation RE2020 si construction NEUVE
   - DP (13703) → DP1 (situation), DP2 (masse), DP4 (façades), DP6 (photos), DP7 (notice descriptive)
   - PC pour autres constructions (13409) → idem PC + plan accès véhicules
   - Adapte la liste exactement au CERFA recommandé.

3. ALERTES ARCHITECTE — vérifie SYSTÉMATIQUEMENT et émets une alerte si :
   - Zone ABF → avis ABF obligatoire (warning)
   - Surface plancher > 150 m² → architecte obligatoire (bloquante si pas signé)
   - Construction neuve → RE2020 obligatoire (warning)
   - ERP détecté → autorisation travaux ERP (bloquante)
   - Bâtiment > 1 niveau ET ouverture sur voie publique → accessibilité PMR (warning)
   - Pas de tout-à-l'égout → ANC + étude SPANC (warning)
   - Hauteur projetée > hauteur max PLU → non-conforme (bloquante)

4. CONFIANCE — chaque mesure a un score 0-100. Si non détectable, mets valeur=null et confiance=0.

Réponds UNIQUEMENT le JSON, sans markdown, sans préfixe, sans suffixe.`;
}

// Fallback structuré quand Claude/parsing échoue : garde la même forme que le JSON cible.
function fallbackResult({ surface_declaree, nature_travaux, type_cerfa }) {
  const surface = parseFloat(surface_declaree) || 80;
  const isPc = surface > 20 || /construction/i.test(nature_travaux || '');
  const cerfa = type_cerfa || (isPc ? '13406' : '13703');

  return {
    qualite_document: {
      type_detecte: 'document_autre', lisibilite: 0, echelle_detectee: 'inconnue',
      nord_visible: false, cotes_visibles: false,
      commentaire: 'Analyse Claude indisponible — valeurs par défaut. Vérifiez et complétez manuellement.',
    },
    dimensions: {
      emprise_sol_m2:                 { valeur: surface, confiance: 30 },
      surface_plancher_creee_m2:      { valeur: surface, confiance: 30 },
      surface_totale_apres_m2:        { valeur: null,    confiance: 0 },
      hauteur_faitage_m:              { valeur: 7,       confiance: 30 },
      hauteur_egout_m:                { valeur: 4.5,     confiance: 30 },
      longueur_facade_principale_m:   { valeur: 10,      confiance: 30 },
      profondeur_batiment_m:          { valeur: 8,       confiance: 30 },
      largeur_totale_m:               { valeur: 10,      confiance: 30 },
    },
    toiture: { type: 'inconnu', pente_degres: { valeur: 35, confiance: 0 }, materiau: 'inconnu', couleur: 'à préciser', confiance_globale: 0 },
    facades: {
      materiau_principal: 'inconnu', couleur_principale: 'à préciser',
      ouvertures: { nombre_fenetres: { valeur: 0, confiance: 0 }, nombre_portes: { valeur: 0, confiance: 0 }, nombre_baies: { valeur: 0, confiance: 0 } },
      menuiseries: { materiau: 'inconnu', couleur: 'à préciser' },
      confiance_globale: 0,
    },
    niveaux: { structure: 'inconnu', combles_amenages: null, sous_sol: null, hauteur_sous_plafond_m: { valeur: 2.5, confiance: 0 } },
    pieces:  { nombre_total: null, liste_detectee: [], nombre_chambres: null, garage: null, terrasse: null, piscine: null, veranda: null },
    reseaux: { eau_potable: 'inconnu', assainissement: 'inconnu', electricite: 'inconnu', gaz: 'inconnu', telecom: 'inconnu' },
    plan_masse_suggestion: { implantation: 'inconnu', recul_voirie_propose_m: 5, recul_limites_separatives_m: 3, orientation_principale: 'Nord-Sud' },
    conformite_plu_auto: {
      hauteur_ok:       { verdict: 'inconnu', detail: 'Hauteur non détectée — à compléter.' },
      seuil_dp_pc:      { verdict: isPc ? 'pc_requis' : 'dp_suffit', seuil_applique_m2: 40, detail: `Surface ${surface} m² → ${isPc ? 'PC' : 'DP'} indicatif.` },
      emprise_ces:      { verdict: 'inconnu', detail: 'CES non vérifiable sans surface terrain.' },
      recul_voirie_ok:  { verdict: 'inconnu', detail: '' },
      recul_limites_ok: { verdict: 'inconnu', detail: '' },
      score_global: 30,
    },
    pieces_jointes_requises: {
      cerfa_recommande: cerfa,
      liste: cerfa.startsWith('1370') ? [
        { code: 'DP1', intitule: 'Plan de situation',         statut: 'auto_genere', instruction: 'Auto-généré depuis IGN.' },
        { code: 'DP2', intitule: 'Plan de masse',              statut: 'a_uploader',  instruction: 'Plan masse coté avec nord.' },
        { code: 'DP4', intitule: 'Plan des façades et toitures', statut: 'a_uploader', instruction: 'Toutes façades cotées.' },
        { code: 'DP6', intitule: 'Photographies du terrain',   statut: 'a_uploader',  instruction: 'Photos proche + lointaine.' },
        { code: 'DP7', intitule: 'Notice descriptive',         statut: 'ia_genere',   instruction: 'Pré-remplie par notre IA.' },
      ] : [
        { code: 'PC1', intitule: 'Plan de situation',                              statut: 'auto_genere', instruction: 'Auto-généré depuis IGN.' },
        { code: 'PC2', intitule: 'Plan de masse 3D coté',                          statut: 'a_uploader',  instruction: 'Téléversez le plan masse.' },
        { code: 'PC3', intitule: 'Plan en coupe',                                   statut: 'a_uploader',  instruction: 'Coupe terrain + projet.' },
        { code: 'PC4', intitule: 'Notice descriptive',                              statut: 'ia_genere',   instruction: 'Pré-remplie.' },
        { code: 'PC5', intitule: 'Plan des façades et toitures',                    statut: 'a_uploader',  instruction: 'Toutes façades + toiture.' },
        { code: 'PC6', intitule: 'Insertion paysagère',                             statut: 'ia_genere',   instruction: 'Photomontage IA.' },
        { code: 'PC7', intitule: 'Photographie environnement proche',               statut: 'a_uploader',  instruction: 'Vue depuis voie publique.' },
        { code: 'PC8', intitule: 'Photographie environnement lointain',             statut: 'a_uploader',  instruction: 'Vue paysagère élargie.' },
      ],
    },
    alertes_architecte: [
      { criticite: 'info', domaine: 'autre', message: 'Document non analysable par l\'IA — analyse manuelle requise.', action_recommandee: 'Téléversez un plan en haute résolution (PNG/JPG, < 5 MB).' },
    ],
    synthese: {
      verdict_global: 'INDETERMINE',
      score_dossier: 30,
      resume: `Analyse Claude indisponible. Valeurs par défaut pour un ${cerfa.startsWith('1370') ? 'DP' : 'PC'} de ${surface} m². Complétez les champs manuellement.`,
    },
    // Champs legacy — conserve compatibilité avec ancien UI qui lit ces noms
    forme_batiment: { type: 'rectangulaire', ratio_largeur_profondeur: 1.25, orientation_principale: 'Nord-Sud', points_facade_principale: [{x:0,y:0},{x:1,y:0},{x:1,y:0.6},{x:0,y:0.6}] },
    elements: { nombre_pieces: 4, pieces: ['salon','cuisine','chambre','sdb'], a_etage: false, a_garage: false, a_veranda: false, a_terrasse: false, type_toiture: 'deux pans', pente_toiture_estimee: 35 },
    materiaux_detectes: { murs: 'non détecté', toiture: 'tuiles' },
    facade_principale: { nombre_fenetres: 3, nombre_portes: 1, hauteur_facade: 2.8, elements_notables: [] },
    notice_elements: { description_terrain: '', description_projet: `Projet de ${nature_travaux || 'construction'} d'une surface de ${surface} m²`, justification_conformite: 'À compléter manuellement.' },
  };
}

// ─────────────────────── Handler
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      imageBase64, mimeType, surface_declaree, nature_travaux,
      // contexte PLU optionnel (recommandé pour la conformité auto)
      surface_terrain, hauteur_max_plu, ces_plu, zone_plu, zone_abf,
      type_cerfa, recul_voirie_plu, recul_limites_plu,
    } = body;

    if (!imageBase64) {
      return Response.json({ success: false, error: 'imageBase64 manquant' }, { status: 400 });
    }
    if (!isLlmConfigured()) {
      return Response.json({
        success: true,
        analysis: fallbackResult({ surface_declaree, nature_travaux, type_cerfa }),
        ai_powered: false,
        warning: 'Aucune clé LLM configurée (EMERGENT_LLM_KEY ou ANTHROPIC_API_KEY) — valeurs fallback retournées.',
      });
    }

    const prompt = buildPrompt({
      surface_declaree, nature_travaux, surface_terrain, hauteur_max_plu,
      ces_plu, zone_plu, zone_abf, type_cerfa, recul_voirie_plu, recul_limites_plu,
    });

    const llm = await llmCall({
      maxTokens: 4000,
      model: MODEL,
      content: [
        { type: 'image', source: { type: 'base64', media_type: mimeType || 'image/jpeg', data: imageBase64 } },
        { type: 'text',  text: prompt },
      ],
    });

    if (!llm.ok) {
      console.error('[analyze-plan] LLM error', llm.provider, llm.error);
      return Response.json({
        success: true,
        analysis: fallbackResult({ surface_declaree, nature_travaux, type_cerfa }),
        ai_powered: false,
        warning: `LLM ${llm.provider}: ${llm.error?.slice(0, 160) || 'erreur'} — fallback retourné.`,
      });
    }

    const result = extractJson(llm.text) || fallbackResult({ surface_declaree, nature_travaux, type_cerfa });

    return Response.json({
      success: true,
      analysis: result,
      ai_powered: true,
      provider: llm.provider,
      model: llm.model,
    });
  } catch (e) {
    console.error('Analyze plan error:', e);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
