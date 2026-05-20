// lib/cerfaLegalRules.js
// ════════════════════════════════════════════════════════════════════
// Règles légales hardcodées — Code de l'urbanisme & textes officiels.
// Source unique pour le wizard, les analyses, la conformité PLU.
// ════════════════════════════════════════════════════════════════════

// Seuil DP / PC (article R.421-9 et R.421-14 du Code de l'urbanisme)
//   - En zone U du PLU : DP jusqu'à 40 m², PC au-delà
//   - Hors zone U      : DP jusqu'à 20 m², PC au-delà
export function seuilDpPc(zonePlu) {
  return /^U/i.test(zonePlu || '') ? 40 : 20;
}

// Architecte obligatoire (article L.431-3 Code de l'urbanisme + loi 3 janv. 1977)
//   - Construction neuve : architecte si surface plancher > 150 m²
//   - Personnes morales : architecte obligatoire dès le premier m²
//   - Extension : architecte si surface TOTALE après travaux > 150 m²
export function architecteObligatoire({ surface_plancher_totale, est_personne_morale = false }) {
  if (est_personne_morale) return { obligatoire: true, raison: 'Demandeur personne morale (SCI, société...) — architecte obligatoire dès 1 m² (Art. L.431-3 CU).' };
  if ((surface_plancher_totale || 0) > 150) {
    return { obligatoire: true, raison: `Surface plancher totale ${surface_plancher_totale} m² > 150 m² — recours à architecte obligatoire (loi du 3 janvier 1977).` };
  }
  return { obligatoire: false };
}

// RE2020 (décret 29 juillet 2021)
//   - Construction NEUVE de logement, bureau, enseignement primaire/secondaire
//   - Attestation RE2020 + étude thermique obligatoires dès le dépôt PC
export function re2020Required(nature_travaux, usage = 'logement') {
  const NEUFS = ['construction_neuve', 'construction', 'neuf'];
  const isNeuf = NEUFS.some(k => (nature_travaux || '').toLowerCase().includes(k));
  if (!isNeuf) return { requise: false };
  return {
    requise: true,
    raison: `Construction neuve (${usage}) — attestation RE2020 obligatoire (décret 2021-1004 du 29 juillet 2021).`,
    document: 'Attestation prise en compte RE2020 (Bbio + Cep + DH)',
  };
}

// ABF — Architectes des Bâtiments de France (Art. L.621-31, L.642-3 Code patrimoine)
//   - Périmètre de 500m autour d'un monument historique → avis ABF requis
//   - Site Patrimonial Remarquable, abord de cathédrale, etc.
export function abfAlerte(zone_abf, dans_perimetre_mh, dans_spr) {
  if (zone_abf || dans_perimetre_mh || dans_spr) {
    return {
      requise: true,
      raison: 'Terrain en périmètre de protection ABF (≤ 500m monument historique / SPR / abords).',
      consequence: 'Avis conforme de l\'ABF requis. Délai d\'instruction étendu à 4 mois (PC) ou 2 mois (DP).',
      action: 'Préparer le volet ABF du dossier : croquis, échantillons matériaux, palette couleurs RAL.',
    };
  }
  return { requise: false };
}

// Démolition (Art. R.421-26 à R.421-29 CU)
//   - PD obligatoire si > 20 m² ET commune avec PLU OU SPR
//   - PC démolir/construire si démolition + reconstruction (1 seul dossier)
export function demolitionRules({ surface_demolie, commune_plu, dans_spr }) {
  if ((surface_demolie || 0) > 20 && (commune_plu || dans_spr)) {
    return {
      cerfa: '13405*10',
      nom: 'Permis de démolir',
      delai: '2 mois',
      raison: `Démolition ${surface_demolie} m² > 20 m² en commune PLU → permis de démolir séparé requis.`,
    };
  }
  return null;
}

// DOC — Déclaration d'Ouverture de Chantier (Art. R.424-16 CU)
//   - CERFA 13407*04
//   - Obligatoire dans les 24h du démarrage des travaux d'un PC accordé
export const DOC_RULE = {
  cerfa: '13407*04',
  nom: 'Déclaration d\'ouverture de chantier (DOC)',
  delai_depot: '24h après début des travaux',
  obligation: 'Obligatoire pour tout PC ou PA accordé. À transmettre en mairie en 3 exemplaires.',
  reference: 'Art. R.424-16 Code de l\'urbanisme',
};

// DAACT — Déclaration Attestant l'Achèvement et la Conformité des Travaux (Art. R.462-1)
//   - CERFA 13408*05
//   - Obligatoire dans les 90 jours après fin des travaux
export const DAACT_RULE = {
  cerfa: '13408*05',
  nom: 'Déclaration attestant l\'achèvement et la conformité des travaux (DAACT)',
  delai_depot: '90 jours après fin des travaux',
  obligation: 'Obligatoire pour PC, PD et PA. Déclenche le délai de contrôle de conformité (3 ou 5 mois).',
  reference: 'Art. R.462-1 à R.462-10 Code de l\'urbanisme',
};

// Délais d'instruction officiels (Art. R.423-23 CU)
export const DELAIS_INSTRUCTION = {
  '13703': { delai: '1 mois',  description: 'DP maison individuelle / abords' },
  '13404': { delai: '1 mois',  description: 'DP autres travaux' },
  '13406': { delai: '2 mois',  description: 'PC maison individuelle' },
  '13409': { delai: '3 mois',  description: 'PC autres constructions' },
  '13410': { delai: '3 mois',  description: 'Permis d\'aménager' },
  '13411': { delai: '2 mois',  description: 'Permis de démolir' },
  '13405': { delai: '2 mois',  description: 'Permis de démolir (refonte 2023)' },
  '13702': { delai: '1 à 2 mois', description: 'Certificat d\'urbanisme (CUa 1 mois, CUb 2 mois)' },
  '13412': { delai: '4 mois',  description: 'Autorisation travaux ERP' },
};

// Pièces obligatoires par CERFA — référence Code de l'urbanisme R.431-7 et suivants
export const PIECES_PAR_CERFA = {
  '13406': [
    { code: 'PC1', intitule: 'Plan de situation du terrain',                              source: 'auto_ign',         critique: true,  description: 'Localisation du terrain dans la commune (extrait carte IGN).' },
    { code: 'PC2', intitule: 'Plan de masse coté en 3 dimensions',                        source: 'dessin_interactif',critique: true,  description: 'Vue dessus terrain + projet, coté, nord, échelle.' },
    { code: 'PC3', intitule: 'Plan en coupe du terrain et de la construction',            source: 'auto_analyse',     critique: true,  description: 'Coupe transversale avec terrain naturel et projet.' },
    { code: 'PC4', intitule: 'Notice descriptive du terrain et du projet',                source: 'ia_claude',        critique: true,  description: 'Notice rédigée selon l\'art. R.431-8 CU.' },
    { code: 'PC5', intitule: 'Plan des façades et des toitures',                          source: 'auto_analyse',     critique: true,  description: 'Toutes les façades cotées + toiture.' },
    { code: 'PC6', intitule: 'Document graphique d\'insertion paysagère',                 source: 'ia_claude',        critique: true,  description: 'Photomontage du projet dans son environnement.' },
    { code: 'PC7', intitule: 'Photographie de l\'environnement proche',                   source: 'a_uploader',       critique: true,  description: 'Vue depuis la voie publique.' },
    { code: 'PC8', intitule: 'Photographie de l\'environnement lointain',                 source: 'a_uploader',       critique: true,  description: 'Vue panoramique élargie.' },
    { code: 'RE2020', intitule: 'Attestation RE2020 + étude thermique',                   source: 'a_uploader',       critique: 'si_neuf', description: 'Bureau d\'études thermique habilité.' },
    { code: 'TITRE', intitule: 'Justificatif du titre de propriété ou autorisation',      source: 'a_uploader',       critique: true,  description: 'Acte de propriété, promesse de vente, mandat...' },
  ],
  '13703': [
    { code: 'DP1', intitule: 'Plan de situation',                                         source: 'auto_ign',         critique: true,  description: 'Extrait carte IGN — localisation du terrain.' },
    { code: 'DP2', intitule: 'Plan de masse coté',                                        source: 'dessin_interactif',critique: true,  description: 'Plan masse simplifié avec cotes principales.' },
    { code: 'DP3', intitule: 'Plan en coupe',                                              source: 'auto_analyse',     critique: false, description: 'Obligatoire si modification du volume.' },
    { code: 'DP4', intitule: 'Plan des façades et toitures',                              source: 'auto_analyse',     critique: true,  description: 'Façades concernées par les travaux.' },
    { code: 'DP6', intitule: 'Photographies du terrain',                                  source: 'a_uploader',       critique: true,  description: 'Proche + lointaine.' },
    { code: 'DP7', intitule: 'Notice descriptive',                                        source: 'ia_claude',        critique: true,  description: 'Présentation du projet.' },
    { code: 'TITRE', intitule: 'Justificatif du titre',                                   source: 'a_uploader',       critique: false, description: 'Justification de la qualité pour déposer.' },
  ],
  '13409': null, // Hérite de 13406 + plans d'accès véhicules
  '13404': null, // Hérite de 13703
};

// Récupère la liste des pièces pour un CERFA donné
export function getPiecesForCerfa(cerfaNum) {
  const key = (cerfaNum || '').replace('*', '').slice(0, 5);
  return PIECES_PAR_CERFA[key] || PIECES_PAR_CERFA['13703'];
}

// Recommandation CERFA selon contexte (utilisable hors wizard)
export function recommendCerfa({ nature_travaux, surface_creee, surface_demolie, zone_plu }) {
  const s = parseFloat(surface_creee) || 0;
  const sD = parseFloat(surface_demolie) || 0;
  const seuil = seuilDpPc(zone_plu);

  if (sD > 20) return { num: '13411*10', short: 'Permis de démolir', delai: '2 mois' };
  if ((nature_travaux || '').includes('certificat')) return { num: '13702*07', short: "Certificat d'urbanisme", delai: '1-2 mois' };
  if ((nature_travaux || '').includes('amenagement')) return { num: '13410*10', short: "Permis d'aménager", delai: '3 mois' };
  if (s > seuil || (nature_travaux || '').includes('construction_neuve')) {
    return { num: '13406*13', short: 'Permis de construire — maison individuelle', delai: '2 mois' };
  }
  return { num: '13703*13', short: 'Déclaration préalable — maison individuelle', delai: '1 mois' };
}

// Vérifie la conformité PLU instantanément (utilisable en step 3 & 4)
export function checkConformitePlu({ surface_creee, hauteur_projet, emprise_projet, recul_voirie, recul_limites, surface_terrain, pluRegles }) {
  if (!pluRegles) return { score: null, items: [], verdict: 'inconnu' };

  const items = [];
  let pass = 0; let total = 0;

  if (pluRegles.hauteur_max && hauteur_projet) {
    total++;
    const ok = parseFloat(hauteur_projet) <= parseFloat(pluRegles.hauteur_max);
    if (ok) pass++;
    items.push({ label: 'Hauteur', ok, detail: `${hauteur_projet}m ${ok ? '≤' : '>'} ${pluRegles.hauteur_max}m max` });
  }
  if (pluRegles.emprise_max && surface_terrain && emprise_projet) {
    total++;
    const ratio = parseFloat(emprise_projet) / parseFloat(surface_terrain);
    const ok = ratio <= parseFloat(pluRegles.emprise_max);
    if (ok) pass++;
    items.push({ label: 'Emprise au sol', ok, detail: `${(ratio*100).toFixed(0)}% ${ok ? '≤' : '>'} ${(pluRegles.emprise_max*100).toFixed(0)}% CES` });
  }
  if (pluRegles.recul_voirie && recul_voirie) {
    total++;
    const ok = parseFloat(recul_voirie) >= parseFloat(pluRegles.recul_voirie);
    if (ok) pass++;
    items.push({ label: 'Recul voirie', ok, detail: `${recul_voirie}m ${ok ? '≥' : '<'} ${pluRegles.recul_voirie}m min` });
  }
  if (pluRegles.recul_limites && recul_limites) {
    total++;
    const ok = parseFloat(recul_limites) >= parseFloat(pluRegles.recul_limites);
    if (ok) pass++;
    items.push({ label: 'Recul limites séparatives', ok, detail: `${recul_limites}m ${ok ? '≥' : '<'} ${pluRegles.recul_limites}m min` });
  }

  const score = total ? Math.round((pass / total) * 100) : null;
  const verdict = score === null ? 'inconnu' : score === 100 ? 'conforme' : score >= 75 ? 'attention' : 'non_conforme';

  return { score, items, verdict, pass, total };
}
