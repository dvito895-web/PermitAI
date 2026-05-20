// lib/cerfaLegalRules.js
// ════════════════════════════════════════════════════════════════════
// Source unique de vérité — Code de l'urbanisme & textes officiels.
// Couvre TOUS les CERFA d'urbanisme courants avec règles dynamiques :
//   - 13406 PCMI (PC maison individuelle)  → PCMI 1..8
//   - 13409 PC autres constructions        → PC 1..16
//   - 13703 DP maison individuelle         → DP 1..7
//   - 13404 DP autres travaux              → DP 1..7
//   - 13405 Permis de démolir (PDEMO)      → PD 1..7
//   - 13702 CU informatif (CUa) / opérationnel (CUb)
//   - 13407 DOC, 13408 DAACT
// Et toutes les pièces "conditionnelles" : piscine, ERP, RE2020, ABF…
// ════════════════════════════════════════════════════════════════════

// ── Seuils légaux ──────────────────────────────────────────────────
// Art. R.421-9 / R.421-14 / R.421-17 Code de l'urbanisme
export function seuilDpPc(zonePlu) {
  return /^U/i.test(zonePlu || '') ? 40 : 20;
}

// Art. L.431-3 CU + loi 3 janv. 1977
export function architecteObligatoire({ surface_plancher_totale, est_personne_morale = false }) {
  if (est_personne_morale) return { obligatoire: true, raison: 'Demandeur personne morale (SCI, société…) — architecte obligatoire dès 1 m² (Art. L.431-3 CU).' };
  if ((surface_plancher_totale || 0) > 150) {
    return { obligatoire: true, raison: `Surface plancher totale ${surface_plancher_totale} m² > 150 m² — recours à architecte obligatoire (loi du 3 janvier 1977).` };
  }
  return { obligatoire: false };
}

// Décret 2021-1004 (RE2020)
export function re2020Required(nature_travaux, usage = 'logement') {
  const NEUFS = ['construction_neuve', 'construction', 'neuf', 'maison'];
  const isNeuf = NEUFS.some(k => (nature_travaux || '').toLowerCase().includes(k));
  if (!isNeuf) return { requise: false };
  return {
    requise: true,
    raison: `Construction neuve (${usage}) — attestation RE2020 obligatoire (décret 2021-1004 du 29 juillet 2021).`,
    document: 'Attestation prise en compte RE2020 (Bbio + Cep + DH)',
  };
}

// Art. L.621-31, L.642-3 Code patrimoine
export function abfAlerte(zone_abf, dans_perimetre_mh, dans_spr) {
  if (zone_abf || dans_perimetre_mh || dans_spr) {
    return {
      requise: true,
      raison: 'Terrain en périmètre de protection ABF (≤ 500 m monument historique / SPR / abords).',
      consequence: "Avis conforme de l'ABF requis. Délai d'instruction étendu (4 mois PC, 2 mois DP).",
      action: "Préparer le volet ABF du dossier : croquis, échantillons matériaux, palette RAL.",
    };
  }
  return { requise: false };
}

// Art. R.421-26 à R.421-29 CU
export function demolitionRules({ surface_demolie, commune_plu, dans_spr }) {
  if ((surface_demolie || 0) > 20 && (commune_plu || dans_spr)) {
    return {
      cerfa: '13405*10',
      nom: 'Permis de démolir (PDEMO)',
      delai: '2 mois',
      raison: `Démolition ${surface_demolie} m² > 20 m² en commune PLU → permis de démolir séparé requis.`,
    };
  }
  return null;
}

// Piscine — Art. R.421-9 et R.421-17 CU
//   - 0 à 10 m² (bassin) hors zone protégée : libre (sauf abri > 1,80m)
//   - 10 à 100 m² : Déclaration préalable (13703)
//   - > 100 m² OU abri > 1,80 m : Permis de construire (13406)
export function piscineRules({ surface_bassin, hauteur_abri, dans_spr }) {
  if (!surface_bassin) return null;
  const s = parseFloat(surface_bassin) || 0;
  const h = parseFloat(hauteur_abri) || 0;
  if (s <= 10 && h <= 1.8 && !dans_spr) return { regime: 'libre', detail: 'Bassin ≤ 10 m² et abri ≤ 1,80 m — aucune formalité (hors zone protégée).' };
  if (s > 100 || h > 1.8) return { regime: 'pc', cerfa: '13406', detail: `Bassin ${s} m² > 100 m² ou abri ${h} m > 1,80 m → Permis de construire.` };
  return { regime: 'dp', cerfa: '13703', detail: `Bassin ${s} m² entre 10 et 100 m² → Déclaration préalable.` };
}

// CU — Certificat d'urbanisme
//   - CUa (informatif) : règles applicables, taxes, servitudes
//   - CUb (opérationnel) : faisabilité du projet décrit
export function cuType({ projet_decrit, surface_creee }) {
  if (projet_decrit || (parseFloat(surface_creee) || 0) > 0) return { type: 'CUb', delai: '2 mois', description: 'CU opérationnel — faisabilité du projet.' };
  return { type: 'CUa', delai: '1 mois', description: 'CU informatif — règles applicables au terrain.' };
}

// DOC — Déclaration d'Ouverture de Chantier (Art. R.424-16 CU)
export const DOC_RULE = {
  cerfa: '13407*04',
  nom: "Déclaration d'ouverture de chantier (DOC)",
  delai_depot: '24h après début des travaux',
  obligation: 'Obligatoire pour tout PC ou PA accordé. À transmettre en mairie en 3 exemplaires.',
  reference: 'Art. R.424-16 Code de l\'urbanisme',
};
export const DAACT_RULE = {
  cerfa: '13408*05',
  nom: "Déclaration attestant l'achèvement et la conformité des travaux (DAACT)",
  delai_depot: '90 jours après fin des travaux',
  obligation: 'Obligatoire pour PC, PD et PA. Déclenche le délai de contrôle de conformité (3 ou 5 mois).',
  reference: 'Art. R.462-1 à R.462-10 Code de l\'urbanisme',
};

// Délais d'instruction officiels (Art. R.423-23 CU)
export const DELAIS_INSTRUCTION = {
  '13703': { delai: '1 mois',     description: 'DP maison individuelle / abords' },
  '13404': { delai: '1 mois',     description: 'DP autres travaux' },
  '13406': { delai: '2 mois',     description: 'PC maison individuelle (PCMI)' },
  '13409': { delai: '3 mois',     description: 'PC autres constructions' },
  '13410': { delai: '3 mois',     description: "Permis d'aménager" },
  '13411': { delai: '2 mois',     description: 'Permis de démolir' },
  '13405': { delai: '2 mois',     description: 'Permis de démolir (refonte 2023)' },
  '13702': { delai: '1 à 2 mois', description: "Certificat d'urbanisme (CUa 1 mois, CUb 2 mois)" },
  '13412': { delai: '4 mois',     description: 'Autorisation travaux ERP' },
  '13407': { delai: 'immédiat',   description: "Déclaration d'ouverture de chantier" },
  '13408': { delai: '90 jours',   description: 'DAACT' },
};

// ── Pièces par CERFA (structure dynamique) ─────────────────────────
// Chaque pièce :
//   code, intitule, source (auto_ign | dessin_interactif | ia_claude | a_uploader | photo),
//   obligatoire (true | 'si_neuf' | 'si_piscine' | 'si_extension' | 'si_demolition' | 'si_abf' | 'si_clos_couvert' | false),
//   description, bloque_depot (true = empêche soumission si manquante)
// ────────────────────────────────────────────────────────────────────
export const PIECES_PAR_CERFA = {
  // ═══ PCMI — Permis de construire maison individuelle ═══════════
  '13406': [
    { code: 'PCMI1', intitule: 'Plan de situation du terrain',                                     source: 'auto_ign',         obligatoire: true,         critique: true,  description: 'Localisation IGN — échelle 1/5000 à 1/25000.' },
    { code: 'PCMI2', intitule: 'Plan de masse coté en 3 dimensions',                               source: 'dessin_interactif',obligatoire: true,         critique: true,  description: 'Vue dessus terrain + projet, coté, nord, échelle 1/200 ou 1/500.' },
    { code: 'PCMI3', intitule: 'Plan en coupe du terrain et de la construction',                   source: 'auto_analyse',     obligatoire: true,         critique: true,  description: 'Coupe transversale TN + projet — cotes hauteurs + niveau NGF.' },
    { code: 'PCMI4', intitule: 'Notice décrivant le terrain et le projet',                         source: 'ia_claude',        obligatoire: true,         critique: true,  description: "Article R.431-8 CU — terrain, projet, matériaux, paysage." },
    { code: 'PCMI5', intitule: 'Plan des façades et des toitures',                                 source: 'auto_analyse',     obligatoire: true,         critique: true,  description: 'Toutes les façades + toiture, cotées, échelle 1/100.' },
    { code: 'PCMI6', intitule: "Document graphique d'insertion paysagère",                        source: 'ia_claude',        obligatoire: true,         critique: true,  description: 'Photomontage du projet inséré dans son environnement.' },
    { code: 'PCMI7', intitule: "Photographie de l'environnement proche",                          source: 'a_uploader',       obligatoire: true,         critique: true,  description: 'Vue depuis la voie publique.' },
    { code: 'PCMI8', intitule: "Photographie de l'environnement lointain",                        source: 'a_uploader',       obligatoire: true,         critique: true,  description: 'Vue panoramique élargie situant le terrain.' },
    // — Pièces conditionnelles —
    { code: 'PCMI13', intitule: 'Attestation RE2020 + étude thermique',                            source: 'a_uploader',       obligatoire: 'si_neuf',    critique: true,  description: 'Bureau d\'études thermique habilité (décret 2021-1004).' },
    { code: 'PCMI14', intitule: 'Étude de sol (Loi ELAN — zones argile)',                          source: 'a_uploader',       obligatoire: 'si_argile',  critique: false, description: 'Obligatoire en zones d\'exposition moyenne ou forte au retrait-gonflement des argiles.' },
    { code: 'PCMI15', intitule: 'Pièces volet ABF (croquis, matériaux, RAL)',                      source: 'a_uploader',       obligatoire: 'si_abf',     critique: true,  description: 'Si terrain en périmètre de protection MH ou SPR.' },
    { code: 'PCMI16', intitule: 'Attestation accessibilité PMR',                                   source: 'a_uploader',       obligatoire: 'si_erp',     critique: true,  description: 'Pour les ERP — bureau de contrôle.' },
    { code: 'PCMI17', intitule: 'Étude d\'assainissement non collectif (SPANC)',                   source: 'a_uploader',       obligatoire: 'si_anc',     critique: false, description: 'Si terrain non raccordé au tout-à-l\'égout.' },
    { code: 'TITRE',  intitule: 'Justificatif du titre de propriété ou autorisation',              source: 'a_uploader',       obligatoire: true,         critique: true,  description: 'Acte de propriété, promesse de vente, mandat…' },
  ],

  // ═══ PC autres constructions (logement collectif, équipement, agricole…) ═══
  '13409': [
    { code: 'PC1',  intitule: 'Plan de situation du terrain',                                       source: 'auto_ign',         obligatoire: true,         critique: true,  description: 'Localisation IGN.' },
    { code: 'PC2',  intitule: 'Plan de masse coté en 3 dimensions',                                 source: 'dessin_interactif',obligatoire: true,         critique: true,  description: 'Plan masse complet.' },
    { code: 'PC3',  intitule: 'Plan en coupe',                                                      source: 'auto_analyse',     obligatoire: true,         critique: true,  description: 'Coupe TN + projet.' },
    { code: 'PC4',  intitule: 'Notice descriptive',                                                 source: 'ia_claude',        obligatoire: true,         critique: true,  description: 'Art. R.431-8 CU.' },
    { code: 'PC5',  intitule: 'Plan des façades et toitures',                                       source: 'auto_analyse',     obligatoire: true,         critique: true,  description: 'Toutes les façades.' },
    { code: 'PC6',  intitule: "Document graphique d'insertion",                                     source: 'ia_claude',        obligatoire: true,         critique: true,  description: 'Photomontage.' },
    { code: 'PC7',  intitule: 'Photographie environnement proche',                                  source: 'a_uploader',       obligatoire: true,         critique: true,  description: 'Vue voie publique.' },
    { code: 'PC8',  intitule: 'Photographie environnement lointain',                                source: 'a_uploader',       obligatoire: true,         critique: true,  description: 'Vue paysagère.' },
    { code: 'PC11', intitule: "Document attestant le respect règles d'accessibilité",               source: 'a_uploader',       obligatoire: 'si_erp',     critique: true,  description: 'ERP / logements collectifs.' },
    { code: 'PC12', intitule: 'Attestation sécurité incendie (ERP)',                                source: 'a_uploader',       obligatoire: 'si_erp',     critique: true,  description: 'Bureau de contrôle agréé.' },
    { code: 'PC15', intitule: 'Étude impact ou notice incidence Natura 2000',                       source: 'a_uploader',       obligatoire: 'si_natura',  critique: false, description: 'Si terrain dans périmètre Natura 2000.' },
    { code: 'PC16', intitule: 'Attestation RE2020',                                                 source: 'a_uploader',       obligatoire: 'si_neuf',    critique: true,  description: 'Construction neuve.' },
    { code: 'TITRE',intitule: 'Justificatif du titre',                                              source: 'a_uploader',       obligatoire: true,         critique: true,  description: 'Propriété / mandat.' },
  ],

  // ═══ DP — Maison individuelle (modifications) ════════════════════
  '13703': [
    { code: 'DP1',  intitule: 'Plan de situation',                                                  source: 'auto_ign',         obligatoire: true,          critique: true,  description: 'Extrait carte IGN.' },
    { code: 'DP2',  intitule: 'Plan de masse coté',                                                 source: 'dessin_interactif',obligatoire: true,          critique: true,  description: 'Plan masse simplifié.' },
    { code: 'DP3',  intitule: 'Plan en coupe',                                                      source: 'auto_analyse',     obligatoire: 'si_volume',   critique: false, description: 'Obligatoire si modification du volume.' },
    { code: 'DP4',  intitule: 'Plan des façades et toitures',                                       source: 'auto_analyse',     obligatoire: true,          critique: true,  description: 'Façades concernées.' },
    { code: 'DP5',  intitule: 'Représentation aspect extérieur',                                    source: 'a_uploader',       obligatoire: 'si_aspect',   critique: false, description: 'Si modif. aspect (couleurs, matériaux).' },
    { code: 'DP6',  intitule: 'Photographies du terrain (proche + lointaine)',                      source: 'a_uploader',       obligatoire: true,          critique: true,  description: 'Vues actuelles.' },
    { code: 'DP7',  intitule: 'Notice descriptive',                                                 source: 'ia_claude',        obligatoire: true,          critique: true,  description: 'Présentation du projet.' },
    { code: 'DP11', intitule: 'Pièces volet ABF',                                                   source: 'a_uploader',       obligatoire: 'si_abf',      critique: true,  description: 'Si périmètre MH ou SPR.' },
    { code: 'DP12', intitule: 'Étude thermique simplifiée',                                         source: 'a_uploader',       obligatoire: 'si_extension_50', critique: false, description: 'Extension > 50 m² (RE2020 simplifiée).' },
    { code: 'TITRE',intitule: 'Justificatif du titre',                                              source: 'a_uploader',       obligatoire: 'si_non_proprio', critique: false, description: 'Si pas propriétaire.' },
  ],

  // ═══ DP — Autres travaux (clôtures, ravalements, division…) ══════
  '13404': [
    { code: 'DP1', intitule: 'Plan de situation',                                                   source: 'auto_ign',         obligatoire: true,         critique: true,  description: 'Extrait IGN.' },
    { code: 'DP2', intitule: 'Plan de masse',                                                       source: 'dessin_interactif',obligatoire: 'si_volume',  critique: false, description: 'Si modification volume.' },
    { code: 'DP4', intitule: 'Plan des façades et toitures',                                        source: 'auto_analyse',     obligatoire: 'si_aspect',  critique: false, description: 'Façades concernées.' },
    { code: 'DP6', intitule: 'Photographies du terrain',                                            source: 'a_uploader',       obligatoire: true,         critique: true,  description: 'État actuel.' },
    { code: 'DP7', intitule: 'Notice descriptive',                                                  source: 'ia_claude',        obligatoire: true,         critique: true,  description: 'Présentation du projet.' },
    { code: 'DP11', intitule: 'Pièces volet ABF',                                                   source: 'a_uploader',       obligatoire: 'si_abf',     critique: true,  description: 'Si périmètre MH.' },
  ],

  // ═══ PDEMO — Permis de démolir ═══════════════════════════════════
  '13405': [
    { code: 'PD1', intitule: 'Plan de situation',                                                   source: 'auto_ign',         obligatoire: true, critique: true,  description: 'Extrait IGN.' },
    { code: 'PD2', intitule: 'Plan de masse des constructions à démolir',                           source: 'dessin_interactif',obligatoire: true, critique: true,  description: 'Cotes + Nord + échelle.' },
    { code: 'PD3', intitule: "Photographies du ou des bâtiments à démolir",                         source: 'a_uploader',       obligatoire: true, critique: true,  description: 'Vues actuelles complètes.' },
    { code: 'PD4', intitule: 'Notice descriptive de la démolition',                                 source: 'ia_claude',        obligatoire: true, critique: true,  description: 'Justification, moyens, calendrier.' },
    { code: 'PD7', intitule: 'Diagnostic amiante / plomb / déchets',                                source: 'a_uploader',       obligatoire: 'si_avant_1997', critique: true,  description: 'Obligatoire pour bâtiments construits avant 1997 (amiante) ou 1949 (plomb).' },
    { code: 'TITRE', intitule: 'Justificatif du titre de propriété',                                source: 'a_uploader',       obligatoire: true, critique: true,  description: 'Propriété du bien démoli.' },
  ],

  // ═══ CU — Certificat d'urbanisme (CUa informatif OU CUb opérationnel) ═══
  '13702': [
    { code: 'CU1', intitule: 'Plan de situation',                                                   source: 'auto_ign',         obligatoire: true,        critique: true,  description: 'Localisation IGN.' },
    { code: 'CU2', intitule: 'Note descriptive du projet (CUb uniquement)',                         source: 'ia_claude',        obligatoire: 'si_cub',    critique: 'si_cub', description: 'Description sommaire — nature, volume, destination.' },
    { code: 'CU3', intitule: 'Plan du terrain (croquis simple)',                                    source: 'dessin_interactif',obligatoire: 'si_cub',    critique: false, description: 'Si CUb : situation des constructions envisagées.' },
  ],
};

// Mapping fallback (alias / nouveaux numéros)
const ALIAS = {
  '13409': '13409', '13406': '13406', '13703': '13703', '13404': '13404',
  '13405': '13405', '13411': '13405', '13702': '13702', '13410': '13702',
  '13407': null, '13414': null, '13408': null,
};

// ── Filtrage dynamique des pièces selon contexte ───────────────────
export function getPiecesForCerfa(cerfaNum, ctx = {}) {
  const key = (cerfaNum || '').replace('*', '').slice(0, 5);
  const realKey = ALIAS[key] !== undefined ? (ALIAS[key] || key) : key;
  const base = PIECES_PAR_CERFA[realKey] || PIECES_PAR_CERFA['13703'];

  // Évalue la condition de chaque pièce conditionnelle
  return base
    .map(p => ({ ...p, obligatoire: evalCondition(p.obligatoire, ctx) }))
    .filter(p => p.obligatoire !== 'hide');
}

function evalCondition(rule, ctx) {
  if (rule === true || rule === false) return rule;
  if (typeof rule !== 'string') return !!rule;
  const isNeuf = /construction|maison|neuf/i.test(ctx.nature_travaux || '');
  const sCreee = parseFloat(ctx.surface_creee) || 0;

  switch (rule) {
    case 'si_neuf':           return isNeuf;
    case 'si_extension':      return /extension/i.test(ctx.nature_travaux || '');
    case 'si_piscine':        return /piscine/i.test(ctx.nature_travaux || '') || ctx.piscine;
    case 'si_demolition':     return (parseFloat(ctx.surface_demolie) || 0) > 0;
    case 'si_abf':            return !!ctx.zone_abf || !!ctx.dans_spr;
    case 'si_erp':            return !!ctx.est_erp;
    case 'si_anc':            return ctx.assainissement === 'ANC' || ctx.assainissement === 'non_raccorde';
    case 'si_argile':         return !!ctx.zone_argile;
    case 'si_natura':         return !!ctx.zone_natura;
    case 'si_avant_1997':     return (ctx.annee_construction || 9999) < 1997;
    case 'si_cub':            return ctx.cu_type === 'CUb';
    case 'si_volume':         return /extension|surelevation|construction/i.test(ctx.nature_travaux || '');
    case 'si_aspect':         return /ravalement|cloture|facade|toiture/i.test(ctx.nature_travaux || '');
    case 'si_extension_50':   return sCreee > 50;
    case 'si_non_proprio':    return !ctx.est_proprietaire;
    case 'si_clos_couvert':   return !!ctx.clos_couvert;
    default:                  return false;
  }
}

// ── Recommandation CERFA selon contexte ────────────────────────────
export function recommendCerfa({ nature_travaux, surface_creee, surface_demolie, zone_plu, est_personne_morale, surface_bassin, hauteur_abri, dans_spr, cu_type }) {
  const s = parseFloat(surface_creee) || 0;
  const sD = parseFloat(surface_demolie) || 0;
  const seuil = seuilDpPc(zone_plu);
  const t = (nature_travaux || '').toLowerCase();

  // CU
  if (t.includes('certificat') || cu_type) return { num: '13702*07', short: "Certificat d'urbanisme", delai: cu_type === 'CUb' ? '2 mois' : '1 mois' };

  // Démolition pure
  if (t.includes('demolition') || (sD > 0 && s === 0)) {
    const r = demolitionRules({ surface_demolie: sD, commune_plu: !!zone_plu, dans_spr });
    if (r) return { num: r.cerfa, short: r.nom, delai: r.delai };
  }

  // Piscine
  if (t.includes('piscine') || surface_bassin) {
    const pis = piscineRules({ surface_bassin, hauteur_abri, dans_spr });
    if (pis?.regime === 'pc') return { num: '13406*13', short: 'PCMI — Piscine', delai: '2 mois' };
    if (pis?.regime === 'dp') return { num: '13703*13', short: 'DP — Piscine', delai: '1 mois' };
    if (pis?.regime === 'libre') return { num: null, short: 'Aucune formalité (piscine libre)', delai: '—' };
  }

  // Aménagement (lotissement, voirie…)
  if (t.includes('amenagement') || t.includes('lotissement')) return { num: '13410*10', short: "Permis d'aménager", delai: '3 mois' };

  // Construction neuve / extension
  if (t.includes('construction') || s > seuil || est_personne_morale) {
    return { num: '13406*13', short: 'PCMI — Permis de construire maison individuelle', delai: '2 mois' };
  }

  return { num: '13703*13', short: 'Déclaration préalable — maison individuelle', delai: '1 mois' };
}

// ── Conformité PLU instantanée ─────────────────────────────────────
export function checkConformitePlu({ surface_creee, hauteur_projet, emprise_projet, recul_voirie, recul_limites, surface_terrain, pluRegles }) {
  if (!pluRegles) return { score: null, items: [], verdict: 'inconnu' };
  const items = [];
  let pass = 0, total = 0;

  if (pluRegles.hauteur_max && hauteur_projet) {
    total++;
    const ok = parseFloat(hauteur_projet) <= parseFloat(pluRegles.hauteur_max);
    if (ok) pass++;
    items.push({ label: 'Hauteur', ok, detail: `${hauteur_projet} m ${ok ? '≤' : '>'} ${pluRegles.hauteur_max} m max` });
  }
  if (pluRegles.emprise_max && surface_terrain && emprise_projet) {
    total++;
    const ratio = parseFloat(emprise_projet) / parseFloat(surface_terrain);
    const ok = ratio <= parseFloat(pluRegles.emprise_max);
    if (ok) pass++;
    items.push({ label: 'Emprise au sol (CES)', ok, detail: `${(ratio * 100).toFixed(0)}% ${ok ? '≤' : '>'} ${(pluRegles.emprise_max * 100).toFixed(0)}%` });
  }
  if (pluRegles.recul_voirie && recul_voirie) {
    total++;
    const ok = parseFloat(recul_voirie) >= parseFloat(pluRegles.recul_voirie);
    if (ok) pass++;
    items.push({ label: 'Recul voirie', ok, detail: `${recul_voirie} m ${ok ? '≥' : '<'} ${pluRegles.recul_voirie} m min` });
  }
  if (pluRegles.recul_limites && recul_limites) {
    total++;
    const ok = parseFloat(recul_limites) >= parseFloat(pluRegles.recul_limites);
    if (ok) pass++;
    items.push({ label: 'Recul limites séparatives', ok, detail: `${recul_limites} m ${ok ? '≥' : '<'} ${pluRegles.recul_limites} m min` });
  }

  const score = total ? Math.round((pass / total) * 100) : null;
  const verdict = score === null ? 'inconnu' : score === 100 ? 'conforme' : score >= 75 ? 'attention' : 'non_conforme';
  return { score, items, verdict, pass, total };
}

// ── Méta-données par CERFA (pour affichage liste) ───────────────────
export const CERFA_META = {
  '13406': { numero: '13406*13', nom: 'PCMI — Permis de construire maison individuelle', emoji: '🏠', delai: '2 mois' },
  '13409': { numero: '13409*13', nom: 'PC — Autres constructions',                        emoji: '🏢', delai: '3 mois' },
  '13703': { numero: '13703*13', nom: 'DP — Déclaration préalable maison',                emoji: '📋', delai: '1 mois' },
  '13404': { numero: '13404*13', nom: 'DP — Autres travaux',                              emoji: '📋', delai: '1 mois' },
  '13405': { numero: '13405*10', nom: 'Permis de démolir',                                emoji: '💣', delai: '2 mois' },
  '13702': { numero: '13702*07', nom: "Certificat d'urbanisme (CUa / CUb)",               emoji: '📜', delai: '1 à 2 mois' },
  '13407': { numero: '13407*04', nom: "Déclaration d'ouverture de chantier (DOC)",        emoji: '🚧', delai: 'Immédiat' },
  '13408': { numero: '13408*05', nom: 'DAACT — Achèvement des travaux',                   emoji: '✅', delai: '90 jours' },
};
