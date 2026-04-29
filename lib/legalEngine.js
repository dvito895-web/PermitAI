// Moteur de règles légales françaises pour l'urbanisme

export function analyzeLegalConstraints({ surface, surfaceApresExtension, type, commune, zone, description }) {
  const alerts = [];
  const upsells = [];

  // 1. ARCHITECTE OBLIGATOIRE — Loi du 3 janvier 1977
  const surfaceRef = surfaceApresExtension || surface || 0;
  if (surfaceRef > 150 && ['construction', 'extension', 'surelevation'].includes(type)) {
    alerts.push({
      niveau: 'obligatoire',
      icone: '⚖️',
      titre: 'Architecte obligatoire',
      texte: `Au-delà de 150m² de surface de plancher, la loi du 3 janvier 1977 impose le recours à un architecte inscrit à l'Ordre pour signer et déposer le permis. PermitAI prépare votre dossier complet — l'architecte le valide et le signe.`,
      loi: 'Loi n°77-2 du 3 janvier 1977 sur l\'architecture, art. 3',
      upsell: { label: 'Trouver un architecte partenaire', action: 'architecte_partenaire' }
    });
    upsells.push('architecte_partenaire');
  }

  // 2. RE2020 — Réglementation Environnementale 2020
  if (['construction', 'extension'].includes(type) && surface > 0) {
    alerts.push({
      niveau: 'obligatoire',
      icone: '🌱',
      titre: 'RE2020 applicable',
      texte: 'La Réglementation Environnementale 2020 (RE2020) s\'applique à toute construction neuve. Elle impose des exigences thermiques, énergétiques et carbone strictes. Une étude thermique (RT/RE2020) est obligatoire pour le dépôt du permis.',
      loi: 'Décret n°2021-1004 du 29 juillet 2021',
      upsell: surface > 80
        ? { label: 'Obtenir une étude thermique RE2020', action: 'bureau_etude' }
        : null
    });
    if (surface > 80) upsells.push('bureau_etude');
  }

  // 3. ZONE ABF — Architecte des Bâtiments de France
  const zonesProtegees = ['zone protégée', 'monument historique', 'site inscrit', 'site classé', 'ZPPAUP', 'AVAP', 'secteur sauvegardé'];
  const descLower = (description || '').toLowerCase();
  const inAbfZone = zonesProtegees.some(z => descLower.includes(z.toLowerCase()))
    || (zone?.includes('UA') && commune?.toLowerCase().includes('paris'));
  if (inAbfZone) {
    alerts.push({
      niveau: 'attention',
      icone: '🏛️',
      titre: 'Zone ABF possible — Architecte des Bâtiments de France',
      texte: 'Si votre terrain est situé dans le périmètre d\'un monument historique (500m), d\'un site classé ou d\'un secteur sauvegardé, l\'Architecte des Bâtiments de France doit donner son accord préalable. Délais supplémentaires : 2 à 4 mois.',
      loi: 'Code du patrimoine, art. L.621-27 et L.632-1',
      upsell: { label: 'Vérifier si mon terrain est en zone ABF', action: 'verification_abf' }
    });
    upsells.push('verification_abf');
  }

  // 4. ERP — Établissement Recevant du Public
  const typesERP = ['commerce', 'restaurant', 'bureau', 'erp', 'accueil public', 'salle'];
  if (typesERP.some(t => descLower.includes(t))) {
    alerts.push({
      niveau: 'obligatoire',
      icone: '♿',
      titre: 'ERP — Accessibilité obligatoire',
      texte: 'Tout Établissement Recevant du Public doit respecter les normes d\'accessibilité aux personnes handicapées. Une notice d\'accessibilité est obligatoire dans le dossier de permis. Un bureau d\'études spécialisé peut être requis.',
      loi: 'Loi n°2005-102 du 11 février 2005, arrêté du 20 avril 2017',
      upsell: { label: 'Obtenir une notice accessibilité ERP', action: 'bureau_etude_erp' }
    });
    upsells.push('bureau_etude_erp');
  }

  // 5. TAXE D'AMÉNAGEMENT
  const ta = Math.round((surface || 0) * 820 * 0.05);
  if (surface > 5) {
    alerts.push({
      niveau: 'info',
      icone: '💶',
      titre: 'Taxe d\'aménagement estimée',
      texte: `Estimation indicative : ${ta.toLocaleString('fr-FR')}€ (surface × valeur forfaitaire 820€/m² × taux communal ~5%). La taxe exacte est calculée par la commune au moment du dépôt. Payable en 2 fois (12 et 24 mois après accord).`,
      loi: 'Code de l\'urbanisme, art. L.331-1 et suivants',
      upsell: null
    });
  }

  // 6. PLU/PLUi — Intercommunalité
  alerts.push({
    niveau: 'info',
    icone: '🗺️',
    titre: 'PLU ou PLUi applicable',
    texte: 'Certaines communes appliquent un PLU intercommunal (PLUi) géré par la communauté de communes. Les règles peuvent différer du PLU communal. PermitAI intègre les deux sources.',
    loi: 'Loi ALUR du 24 mars 2014',
    upsell: null
  });

  const delais = {
    'dp': '1 mois (2 mois en zone ABF)',
    'pc_maison': '2 mois (3 mois en zone ABF)',
    'pc_autre': '3 mois (4 à 6 mois en zone ABF)',
    'pa': '3 mois',
    'pd': '2 mois',
  };

  return { alerts, upsells, delais, taxeEstimee: ta };
}

export const PIECES_OBLIGATOIRES = {
  '13406': [
    { code: 'PC1', nom: 'Plan de situation du terrain (PCMI 1)', obligatoire: true, description: 'Localisation du terrain dans la commune. Échelle 1/25 000 ou 1/5 000.' },
    { code: 'PC2', nom: 'Plan de masse (PCMI 2)', obligatoire: true, description: 'Vue de dessus du terrain avec implantation du projet. Cotations + altimétrie.' },
    { code: 'PC3', nom: 'Plan en coupe (PCMI 3)', obligatoire: true, description: 'Coupe du terrain et de la construction. Profil du terrain naturel.' },
    { code: 'PC4', nom: 'Notice descriptive (PCMI 4)', obligatoire: true, description: 'Présentation du terrain et description du projet.' },
    { code: 'PC5', nom: 'Plans des façades et toitures (PCMI 5)', obligatoire: true, description: 'Élévations de chaque façade. Matériaux et couleurs.' },
    { code: 'PC6', nom: 'Document graphique d\'insertion (PCMI 6)', obligatoire: true, description: 'Simulation de l\'aspect futur de la construction dans l\'environnement.' },
    { code: 'PC7', nom: 'Photographies proches et lointaines (PCMI 7)', obligatoire: true, description: 'Vues depuis et vers le terrain depuis l\'espace public.' },
    { code: 'AT1', nom: 'Attestation RE2020 (si construction neuve)', obligatoire: true, description: 'Attestation de prise en compte de la réglementation thermique RE2020.' },
    { code: 'ERP1', nom: 'Notice accessibilité (si ERP)', obligatoire: false, description: 'Obligatoire uniquement pour les ERP.' },
    { code: 'ABF1', nom: 'Accord ABF (si zone protégée)', obligatoire: false, description: 'Obligatoire si périmètre monument historique ou site classé.' },
  ],
  '13703': [
    { code: 'DP1', nom: 'Plan de situation (DPMI 1)', obligatoire: true, description: 'Localisation du terrain.' },
    { code: 'DP2', nom: 'Plan de masse (DPMI 2)', obligatoire: true, description: 'Implantation des travaux.' },
    { code: 'DP3', nom: 'Plan en coupe (DPMI 3)', obligatoire: false, description: 'Si modification du profil du terrain.' },
    { code: 'DP4', nom: 'Photos du terrain et environnement (DPMI 4)', obligatoire: true, description: 'État actuel + intégration.' },
    { code: 'DP5', nom: 'Plan des façades (DPMI 5)', obligatoire: false, description: 'Si modification des façades.' },
  ],
  '13411': [
    { code: 'PD1', nom: 'Plan de situation', obligatoire: true },
    { code: 'PD2', nom: 'Plan de masse', obligatoire: true },
    { code: 'PD3', nom: 'Photos avant démolition', obligatoire: true },
    { code: 'PD4', nom: 'Notice descriptive démolition', obligatoire: true },
    { code: 'PD5', nom: 'Attestation amiante (si bâti avant 1997)', obligatoire: true },
  ],
};

export const UPSELL_SERVICES = {
  architecte_partenaire: {
    titre: 'Architecte partenaire',
    description: 'Mise en relation avec un architecte dans votre département pour les projets > 150m²',
    prix: 'Gratuit — commission sur le projet',
    cta: 'Être mis en relation',
    action: 'mailto:contact@permitai.eu?subject=Architecte partenaire - projet > 150m²'
  },
  bureau_etude: {
    titre: 'Bureau d\'études RE2020',
    description: 'Étude thermique RE2020 obligatoire pour les constructions neuves',
    prix: 'À partir de 800€ (remise PermitAI 15%)',
    cta: 'Obtenir un devis',
    action: 'mailto:contact@permitai.eu?subject=Bureau études RE2020'
  },
  bureau_etude_erp: {
    titre: 'Notice accessibilité ERP',
    description: 'Notice d\'accessibilité PMR obligatoire pour les ERP',
    prix: 'À partir de 400€ (remise PermitAI 15%)',
    cta: 'Obtenir un devis',
    action: 'mailto:contact@permitai.eu?subject=Notice accessibilité ERP'
  },
  verification_abf: {
    titre: 'Vérification zone ABF',
    description: 'Vérification si votre terrain est en périmètre ABF + conseils',
    prix: '49€ one-shot',
    cta: 'Vérifier maintenant',
    action: '/tarifs?product=audit'
  },
};
