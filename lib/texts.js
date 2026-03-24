/**
 * Fichier centralisé pour tous les textes de l'application
 * Évite les problèmes d'encodage des caractères spéciaux
 */

export const texts = {
  // Navigation
  nav: {
    logo: 'PermitAI',
    features: 'Fonctionnalités',
    testimonials: 'Témoignages',
    pricing: 'Tarifs',
    login: 'Connexion',
    getStarted: 'Commencer',
    dashboard: 'Tableau de bord',
  },

  // Hero
  hero: {
    title: 'Votre permis de construire.',
    titleHighlight: 'Sans les mauvaises surprises.',
    subtitle: 'PermitAI indexe les 36 000 Plans Locaux d\'Urbanisme de France, génère vos CERFA officiels et dépose votre dossier directement en mairie.',
    subtitleHighlight: 'Résultat en 3 minutes.',
    ctaPrimary: 'Analyser mon terrain gratuitement',
    ctaSecondary: 'Voir une démo',
  },

  // Stats
  stats: {
    permits: { value: '500 000', label: 'PERMIS PAR AN EN FRANCE' },
    rejected: { value: '30%', label: 'REFUSÉS AU PREMIER DÉPÔT' },
    delay: { value: '6 MOIS', label: 'DE RETARD EN MOYENNE' },
    plu: { value: '36 000', label: 'PLU INDEXÉS' },
    cost: { value: '15 000 EUR', label: 'COÛT MAX D\'UN REFUS' },
  },

  // Features
  features: {
    title: 'Fonctionnalités',
    items: [
      {
        title: 'Analyse PLU instantanée',
        desc: 'Vérification automatique sur 36 000 communes',
      },
      {
        title: '13 CERFA automatiques',
        desc: 'Formulaires officiels pré-remplis en un clic',
      },
      {
        title: 'Dépôt numérique',
        desc: 'PLAT-AU et LRAR La Poste intégrés',
      },
      {
        title: 'Notice IA',
        desc: 'Documents rédigés par intelligence artificielle',
      },
      {
        title: 'Suivi des délais',
        desc: 'Alertes automatiques à chaque étape',
      },
      {
        title: 'Veille PLU',
        desc: 'Surveillance des modifications réglementaires',
      },
    ],
  },

  // Testimonials
  testimonials: {
    title: 'Témoignages',
    items: [
      {
        name: 'Marc D.',
        role: 'Propriétaire à Lyon',
        text: 'PermitAI a détecté que mon extension dépassait de 12cm la hauteur autorisée. Sans cet outil j\'aurais eu 8 mois de retard.',
        gain: '8 mois + 6 200 EUR économisés',
      },
      {
        name: 'Sophie L.',
        role: 'Agent immobilier à Bordeaux',
        text: 'Je l\'utilise avant chaque compromis de vente. J\'ai sauvé 3 transactions cette année.',
        gain: '3 transactions sauvées',
      },
      {
        name: 'Cabinet Moreau',
        role: 'Urbanisme, Paris',
        text: 'PermitAI a divisé notre temps d\'instruction par 8. Le ROI est immédiat.',
        gain: '340 heures gagnées/an',
      },
    ],
  },

  // Trust metrics
  metrics: {
    users: { value: '4 800', label: 'Utilisateurs actifs' },
    success: { value: '94%', label: 'Dossiers acceptés' },
    rating: { value: '4,9★', label: 'Note moyenne' },
    savings: { value: '3 200 EUR', label: 'Économie moyenne' },
  },

  // CTA Final
  finalCta: {
    title: 'Analysez votre terrain gratuitement',
    subtitle: '1 analyse offerte. Aucune carte bancaire.',
    button: 'Commencer l\'analyse gratuite',
  },

  // Footer
  footer: {
    tagline: 'La référence nationale pour les permis de construire en France.',
    product: 'Produit',
    resources: 'Ressources',
    legal: 'Légal',
    copyright: '© 2025 PermitAI. Tous droits réservés.',
    links: {
      analyse: 'Analyse PLU',
      cerfa: 'CERFA',
      depot: 'Dépôt mairie',
      pricing: 'Tarifs',
      docs: 'Documentation',
      support: 'Support',
      legal: 'Mentions légales',
      terms: 'CGU',
      privacy: 'Confidentialité',
    },
  },

  // Analyse PLU
  analyse: {
    title: 'Analyse',
    titleHighlight: 'PLU',
    subtitle: 'Vérifiez la conformité de votre projet en 3 minutes',
    form: {
      addressLabel: 'Adresse du terrain',
      addressPlaceholder: 'Ex: 15 rue de la République, 75001 Paris',
      descLabel: 'Description des travaux',
      descPlaceholder: 'Ex: Je souhaite construire une extension de 20m2 à ma maison individuelle avec une hauteur de 3m...',
      submit: 'Analyser la faisabilité',
      loading: 'Analyse en cours...',
      signInRequired: 'Vous devez être connecté pour analyser un terrain.',
      createAccount: 'Créer un compte gratuit',
    },
    results: {
      confidence: 'Confiance',
      town: 'Commune',
      recommendedCerfa: 'CERFA recommandé',
      applicableRules: 'Règles PLU applicables',
      hiddenRules: 'règles masquées',
      upgradeMessage: 'Débloquez toutes les règles avec le plan Starter à 29 EUR/mois',
      viewPricing: 'Voir les tarifs',
      viewOnGeoportail: 'Voir le PLU sur Géoportail Urbanisme',
    },
  },

  // CERFA
  cerfa: {
    title: 'Formulaires',
    titleHighlight: 'CERFA',
    subtitle: 'Générez vos formulaires officiels pré-remplis automatiquement',
    wizard: {
      step1: 'Demandeur',
      step2: 'Terrain',
      step3: 'Travaux',
      step4: 'Récapitulatif',
      previous: 'Précédent',
      next: 'Suivant',
      generate: 'Générer le PDF',
      download: 'Télécharger le CERFA',
      success: 'PDF généré avec succès !',
    },
    forms: {
      delay: 'Délai',
      maxSurface: 'Max',
    },
  },

  // Pricing
  pricing: {
    title: 'Tarifs simples et',
    titleHighlight: 'transparents',
    subtitle: 'Choisissez le plan qui correspond à vos besoins',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    yearlyBadge: '2 mois offerts',
    popular: 'Le plus populaire',
    perMonth: '/mois',
    perYear: '/an',
    cta: 'Choisir',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    currentPlan: 'Plan actuel',
    analysesLeft: 'Analyses restantes',
    activeDossiers: 'Dossiers actifs',
    alerts: 'Alertes en cours',
    newAnalysis: 'Nouvelle analyse PLU',
    newAnalysisDesc: 'Analysez la conformité de votre projet',
    generateCerfa: 'Générer un CERFA',
    generateCerfaDesc: 'Remplissez automatiquement vos formulaires',
    upgradePlan: 'Upgrade plan',
    upgradePlanDesc: 'Débloquez toutes les fonctionnalités',
  },

  // Suivi
  suivi: {
    title: 'Suivi des',
    titleHighlight: 'dossiers',
    subtitle: 'Suivez l\'avancement de vos demandes d\'urbanisme',
    alerts: 'Alertes',
    filters: {
      all: 'Tous',
      draft: 'Brouillon',
      submitted: 'Déposé',
      inProgress: 'En instruction',
      approved: 'Accordé',
      rejected: 'Refusé',
    },
    table: {
      number: 'Numéro de dossier',
      type: 'Type',
      town: 'Commune',
      status: 'Statut',
      submitDate: 'Date dépôt',
      daysLeft: 'Jours restants',
      nextAction: 'Prochaine action',
      actions: 'Actions',
    },
  },

  // Depot
  depot: {
    title: 'Dépôt en',
    titleHighlight: 'mairie',
    subtitle: 'Déposez votre dossier en ligne ou par courrier recommandé',
    verify: 'Vérifier la mairie',
    verifying: 'Vérification...',
    codeInsee: 'Code INSEE (ex: 75001)',
    platauConnected: 'Mairie raccordée à PLAT-AU',
    platauNotConnected: 'Mairie non raccordée à PLAT-AU',
    depositOnline: 'Déposer en ligne via PLAT-AU',
    depositByLRAR: 'Envoyer par LRAR électronique',
    depositInPerson: 'Dépôt physique en mairie',
    requiredDocuments: 'Pièces obligatoires à joindre',
    legalDelay: 'Délai légal d\'instruction',
    deadline: 'Date limite de réponse',
    tacitApproval: 'Accord tacite possible',
  },
};

export default texts;
