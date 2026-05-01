// app/lib/cerfaEngine.js
// Moteur CERFA complet - toutes les API connectées

export const CERFA_DATA = {
  '13406': {
    numero: '13406*07',
    nom: 'Permis de construire — maison individuelle',
    emoji: '🏠',
    delai: '2 mois',
    surfaceMax: 150,
    pieces: [
      { code: 'PC1', nom: 'Plan de situation', obligatoire: true, generation: 'auto_api', description: 'Généré automatiquement via API IGN — localise le terrain dans la commune à l\'échelle 1/25 000', api: 'IGN_PLAN_SITUATION' },
      { code: 'PC2', nom: 'Plan de masse', obligatoire: true, generation: 'cadastre', description: 'Fond de plan cadastral automatique via API Cadastre + votre projet à dessiner par-dessus', api: 'CADASTRE_PARCELLE' },
      { code: 'PC3', nom: 'Plan en coupe', obligatoire: true, generation: 'upload', description: 'Coupe du terrain montrant les hauteurs avant/après travaux — à uploader' },
      { code: 'PC4', nom: 'Plans des façades et toitures', obligatoire: true, generation: 'upload', description: 'Toutes les façades avant/après travaux — à uploader' },
      { code: 'PC5', nom: 'Document graphique d\'insertion', obligatoire: true, generation: 'upload', description: 'Simulation visuelle dans l\'environnement — photo + croquis du projet' },
      { code: 'PC6', nom: 'Photographies', obligatoire: true, generation: 'upload', description: 'Photos depuis et vers le terrain depuis l\'espace public' },
      { code: 'PC7', nom: 'Notice descriptive', obligatoire: true, generation: 'ia_generated', description: 'Générée automatiquement par PermitAI à partir de vos réponses' },
      { code: 'PC8', nom: 'Justificatifs demandeur', obligatoire: true, generation: 'upload', description: 'Titre de propriété ou autorisation du propriétaire' },
      { code: 'AT-RE2020', nom: 'Attestation RE2020', obligatoire: true, generation: 'upload', description: 'Obligatoire pour construction neuve — attestation thermique' },
    ],
  },
  '13703': {
    numero: '13703*11',
    nom: 'Déclaration préalable — maison individuelle',
    emoji: '📋',
    delai: '1 mois',
    surfaceMax: 40,
    pieces: [
      { code: 'DP1', nom: 'Plan de situation', obligatoire: true, generation: 'auto_api', description: 'Généré automatiquement via API IGN', api: 'IGN_PLAN_SITUATION' },
      { code: 'DP2', nom: 'Plan de masse', obligatoire: true, generation: 'cadastre', description: 'Fond cadastral automatique + projet à dessiner', api: 'CADASTRE_PARCELLE' },
      { code: 'DP3', nom: 'Plan en coupe', obligatoire: false, generation: 'upload', description: 'Requis si modification du terrain' },
      { code: 'DP4', nom: 'Plans des façades', obligatoire: true, generation: 'upload', description: 'Façades avant/après' },
      { code: 'DP5', nom: 'Représentation extérieure', obligatoire: true, generation: 'upload', description: 'Photo + simulation du projet' },
      { code: 'DP6', nom: 'Photographies', obligatoire: true, generation: 'upload', description: 'Photos du terrain et environnement' },
      { code: 'DP7', nom: 'Notice descriptive', obligatoire: true, generation: 'ia_generated', description: 'Générée automatiquement' },
    ],
  },
  '13410': {
    numero: '13410*06',
    nom: 'Certificat d\'urbanisme',
    emoji: '📜',
    delai: '1 mois (CUa) / 2 mois (CUb)',
    pieces: [
      { code: 'CU1', nom: 'Plan de situation', obligatoire: true, generation: 'auto_api', api: 'IGN_PLAN_SITUATION' },
      { code: 'CU2', nom: 'Note descriptive (CUb)', obligatoire: false, generation: 'ia_generated', description: 'Requis uniquement pour CUb opérationnel' },
    ],
  },
  '13414': {
    numero: '13414*05',
    nom: 'Déclaration d\'ouverture de chantier',
    emoji: '🚧',
    delai: 'Immédiat',
    pieces: [],
  },
  '13408': {
    numero: '13408*08',
    nom: 'Déclaration achèvement travaux (DAACT)',
    emoji: '✅',
    delai: '90 jours',
    pieces: [],
  },
};

export function detectCerfa(surface, type) {
  const s = parseInt(surface) || 0;
  if (s > 150) return null; // architecte obligatoire
  if (['construction', 'surelevation'].includes(type)) return '13406';
  if (type === 'extension') return s > 20 ? '13406' : '13703';
  return '13703'; // piscine, cloture, ravalement, etc.
}
