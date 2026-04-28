// Liste complète des 13 formulaires CERFA avec guides détaillés

export const CERFA_LIST = [
  {
    numero: '13406',
    emoji: '🏠',
    slug: '13406-permis-construire-maison-individuelle',
    nom: 'Permis de construire - Maison individuelle et/ou ses annexes',
    categorie: 'Permis de construire',
    description: 'Pour une maison individuelle et/ou ses annexes comprenant ou non des démolitions',
    delaiInstruction: '2 mois',
    champsRequis: ['identité', 'terrain', 'projet', 'surfaces'],
    piecesJointes: ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6', 'PC7', 'PC8'],
    guide: {
      introduction: "Le CERFA 13406 est le formulaire officiel pour demander un permis de construire pour une maison individuelle. Il est obligatoire pour toute construction de maison neuve ou extension créant plus de 150m² de surface totale.",
      sections: [
        {
          titre: "1. Identité du demandeur",
          description: "Informations sur le porteur du projet",
          champs: [
            { nom: "Nom et prénom", requis: true, aide: "Nom complet du ou des demandeurs" },
            { nom: "Adresse", requis: true, aide: "Adresse postale complète" },
            { nom: "Téléphone et email", requis: true, aide: "Coordonnées de contact" },
          ]
        },
        {
          titre: "2. Localisation du terrain",
          description: "Situation précise du projet",
          champs: [
            { nom: "Adresse du terrain", requis: true, aide: "Adresse complète avec code postal et commune" },
            { nom: "Références cadastrales", requis: true, aide: "Section et numéro de parcelle (disponible sur cadastre.gouv.fr)" },
            { nom: "Superficie du terrain", requis: true, aide: "Surface totale de la parcelle en m²" },
          ]
        },
        {
          titre: "3. Nature des travaux",
          description: "Type de projet envisagé",
          champs: [
            { nom: "Construction neuve", requis: false, aide: "Cocher si c'est une construction sur terrain vierge" },
            { nom: "Extension", requis: false, aide: "Cocher si c'est un agrandissement d'un bâtiment existant" },
            { nom: "Annexe", requis: false, aide: "Garage, piscine couverte, abri de jardin..." },
          ]
        },
        {
          titre: "4. Surfaces",
          description: "Calculs des surfaces du projet",
          champs: [
            { nom: "Surface de plancher créée", requis: true, aide: "Somme des surfaces de plancher closes et couvertes sous hauteur > 1.80m" },
            { nom: "Emprise au sol", requis: true, aide: "Projection verticale du volume de la construction au sol" },
            { nom: "Surface taxable", requis: true, aide: "Surface servant au calcul des taxes d'urbanisme" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "PC1",
          nom: "Plan de situation",
          description: "Localise le terrain dans la commune (échelle 1/25000 ou 1/50000). Disponible sur Géoportail.",
        },
        {
          code: "PC2",
          nom: "Plan de masse",
          description: "Vue de dessus du terrain avec cotations, implantation du projet, réseaux, accès. Échelle 1/200 ou 1/500.",
        },
        {
          code: "PC3",
          nom: "Plan en coupe",
          description: "Coupe du terrain et du projet montrant les hauteurs, pentes, raccordement au sol.",
        },
        {
          code: "PC4",
          nom: "Notice descriptive",
          description: "Document écrit présentant le projet, son intégration dans l'environnement, les matériaux, couleurs.",
        },
        {
          code: "PC5",
          nom: "Plan des façades et toitures",
          description: "Représentation des 4 façades et toitures du projet avec cotations et matériaux.",
        },
        {
          code: "PC6",
          nom: "Document graphique 3D",
          description: "Insertion 3D du projet dans son environnement proche (photomontage ou perspective).",
        },
      ],
      erreursFrequentes: [
        "Références cadastrales incorrectes ou manquantes",
        "Calcul erroné de la surface de plancher (oubli des combles aménageables)",
        "Plans non à l'échelle ou sans cotations",
        "Signature manquante sur le formulaire ou les annexes",
        "Pièces jointes de mauvaise qualité (illisibles)",
      ],
      delaisEtRecours: {
        delaiInstruction: "2 mois à compter de la réception du dossier complet",
        accordTacite: "Si pas de réponse dans les délais, le permis est tacitement accordé (sauf zones protégées)",
        affichage: "Le permis doit être affiché sur le terrain pendant toute la durée des travaux",
        recoursTiers: "Les tiers ont 2 mois après l'affichage pour contester le permis",
      }
    }
  },
  {
    numero: '13409',
    slug: '13409-declaration-prealable',
    nom: 'Déclaration préalable - Constructions et travaux non soumis à permis de construire',
    categorie: 'Déclaration préalable',
    description: 'Extension entre 5m² et 40m², modification façade, changement destination...',
    delaiInstruction: '1 mois',
    champsRequis: ['identité', 'terrain', 'nature_travaux'],
    piecesJointes: ['DP1', 'DP2', 'DP3', 'DP4', 'DP5'],
    guide: {
      introduction: "La déclaration préalable (DP) est une autorisation d'urbanisme simplifiée pour les petits projets. Elle concerne les extensions de 5 à 40m², les modifications de façade, les changements de destination sans travaux lourds.",
      sections: [
        {
          titre: "Projets concernés",
          description: "Quand faire une DP plutôt qu'un permis de construire",
          champs: [
            { nom: "Extension 5-40m²", requis: false, aide: "Extension de maison entre 5m² et 40m² ne dépassant pas 150m² au total" },
            { nom: "Modification façade", requis: false, aide: "Changement de fenêtres, portes, création ouverture, ravalement avec modification aspect" },
            { nom: "Changement destination", requis: false, aide: "Transformer un local commercial en habitation (sans gros travaux)" },
            { nom: "Piscine 10-100m²", requis: false, aide: "Piscine non couverte entre 10m² et 100m²" },
          ]
        },
        {
          titre: "Pièces à fournir",
          description: "Documents obligatoires",
          champs: [
            { nom: "DP1 - Plan de situation", requis: true, aide: "Localisation du terrain sur la commune" },
            { nom: "DP2 - Plan de masse", requis: true, aide: "Vue de dessus avec implantation du projet" },
            { nom: "DP3 - Plan en coupe", requis: false, aide: "Requis si modification du terrain" },
            { nom: "DP4 - Plan des façades", requis: true, aide: "Façades avant/après travaux" },
            { nom: "DP5 - Photos", requis: true, aide: "2 photos : terrain proche et lointain" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "DP1",
          nom: "Plan de situation",
          description: "Localise le terrain dans la commune. Échelle 1/5000 à 1/25000.",
        },
        {
          code: "DP2",
          nom: "Plan de masse",
          description: "Implantation du projet avec cotations et accès. Échelle 1/100 à 1/500.",
        },
        {
          code: "DP4",
          nom: "Plan des façades",
          description: "État existant ET état futur des façades modifiées.",
        },
      ],
      erreursFrequentes: [
        "Oubli de l'état existant sur les plans de façades",
        "Photos de mauvaise qualité ou ne montrant pas l'environnement",
        "Confusion entre surface de plancher et emprise au sol",
        "Dépôt d'une DP alors qu'un permis est obligatoire (> 40m²)",
      ],
      delaisEtRecours: {
        delaiInstruction: "1 mois (ou 2 mois en secteur protégé)",
        accordTacite: "Possible si pas de réponse dans les délais",
        validite: "La DP est valable 3 ans (prorogeable 2 fois 1 an si aucun travail commencé)",
        affichage: "Obligatoire sur le terrain pendant la durée des travaux",
      }
    }
  },
  {
    numero: '13410',
    slug: '13410-modificatif-permis-construire',
    nom: 'Demande de permis de construire modificatif',
    categorie: 'Modificatif',
    description: 'Modifier un permis de construire déjà accordé sans changer le projet de manière substantielle',
    delaiInstruction: '2 mois',
    champsRequis: ['permis_initial', 'modifications'],
    piecesJointes: ['Plans modifiés', 'Notice'],
    guide: {
      introduction: "Le permis modificatif permet d'apporter des changements à un permis déjà obtenu, à condition que ces modifications ne bouleversent pas l'économie générale du projet.",
      sections: [
        {
          titre: "Modifications autorisées",
          description: "Ce qui peut être modifié avec un permis modificatif",
          champs: [
            { nom: "Hauteur ou emprise légère", requis: false, aide: "Modification de quelques dizaines de cm" },
            { nom: "Aspect extérieur", requis: false, aide: "Changement de matériaux, couleurs, menuiseries" },
            { nom: "Implantation mineure", requis: false, aide: "Décalage de quelques mètres" },
            { nom: "Surfaces annexes", requis: false, aide: "Ajout d'un garage, modification terrasse" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "Copie permis initial",
          nom: "Permis de construire d'origine",
          description: "Joindre une copie du permis initial à modifier.",
        },
        {
          code: "Plans modifiés",
          nom: "Plans actualisés",
          description: "Uniquement les plans concernés par les modifications.",
        },
      ],
      erreursFrequentes: [
        "Dépôt trop tardif : le permis modificatif doit être déposé pendant la validité du permis initial",
        "Modifications trop importantes nécessitant un nouveau permis complet",
        "Oubli de joindre le permis initial",
      ],
      delaisEtRecours: {
        delaiInstruction: "2 mois (même délai qu'un permis initial)",
        validite: "Le permis modificatif reprend la date de validité du permis initial",
      }
    }
  },
  {
    numero: '13411',
    slug: '13411-transfert-permis-construire',
    nom: 'Demande de transfert de permis de construire ou d\'aménager',
    categorie: 'Transfert',
    description: 'Transférer un permis existant à un nouveau bénéficiaire (vente du terrain)',
    delaiInstruction: '2 mois',
    champsRequis: ['permis_initial', 'nouveaux_beneficiaires'],
    piecesJointes: ['Accord écrit', 'Justificatifs'],
    guide: {
      introduction: "Le transfert de permis permet de changer le bénéficiaire d'un permis déjà accordé, par exemple lors de la vente d'un terrain avec permis.",
      sections: [
        {
          titre: "Conditions du transfert",
          description: "Pré-requis pour transférer un permis",
          champs: [
            { nom: "Permis en cours de validité", requis: true, aide: "Le permis ne doit pas être périmé" },
            { nom: "Accord de l'ancien titulaire", requis: true, aide: "Signature obligatoire de l'ancien bénéficiaire" },
            { nom: "Aucun travaux commencé", requis: false, aide: "Le transfert est plus simple si les travaux n'ont pas débuté" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "Accord écrit",
          nom: "Attestation de l'ancien titulaire",
          description: "Document signé par l'ancien bénéficiaire autorisant le transfert.",
        },
        {
          code: "Copie permis",
          nom: "Permis de construire à transférer",
          description: "Copie du permis initial avec numéro et date.",
        },
      ],
      erreursFrequentes: [
        "Signature manquante de l'ancien titulaire",
        "Demande déposée alors que le permis est périmé",
        "Confusion avec le permis modificatif",
      ],
      delaisEtRecours: {
        delaiInstruction: "2 mois",
        validite: "Le permis transféré conserve sa date de validité initiale",
      }
    }
  },
  {
    numero: '13702',
    slug: '13702-declaration-achevement-travaux',
    nom: 'Déclaration attestant l\'achèvement et la conformité des travaux',
    categorie: 'Suivi de chantier',
    description: 'DAACT - Déclaration obligatoire à faire en fin de chantier',
    delaiInstruction: 'Réception immédiate',
    champsRequis: ['permis_reference', 'date_achevement'],
    piecesJointes: ['Attestations', 'Photos'],
    guide: {
      introduction: "La DAACT (Déclaration Attestant l'Achèvement et la Conformité des Travaux) est obligatoire à la fin de tous travaux ayant fait l'objet d'un permis de construire ou d'une déclaration préalable.",
      sections: [
        {
          titre: "Quand déposer la DAACT ?",
          description: "Délais et obligations",
          champs: [
            { nom: "À la fin des travaux", requis: true, aide: "Dès que les travaux sont terminés, même si aménagements intérieurs en cours" },
            { nom: "Avant occupation", requis: true, aide: "La DAACT doit être déposée avant d'emménager ou d'utiliser les locaux" },
            { nom: "Dans les 90 jours", requis: false, aide: "Recommandé de déposer rapidement pour éviter toute suspicion" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "Attestations",
          nom: "Attestations réglementaires",
          description: "RT2012/RE2020 (thermique), accessibilité PMR si applicable.",
        },
        {
          code: "Photos",
          nom: "Photos du projet réalisé",
          description: "Vues extérieures montrant la conformité.",
        },
      ],
      erreursFrequentes: [
        "Oubli de dépôt de la DAACT (empêche la purge des recours)",
        "Dépôt sans les attestations obligatoires (RT, PMR)",
        "DAACT déposée alors que les travaux ne sont pas conformes au permis",
      ],
      delaisEtRecours: {
        delaiInstruction: "Réception immédiate, la mairie a 3 à 5 mois pour contrôler",
        controle: "La mairie peut effectuer une visite de conformité dans les 3 mois (5 mois en zone ABF)",
      }
    }
  },
  {
    numero: '13703',
    slug: '13703-permis-demolir',
    nom: 'Demande de permis de démolir',
    categorie: 'Démolition',
    description: 'Démolir totalement ou partiellement un bâtiment (obligatoire dans certaines communes)',
    delaiInstruction: '2 mois',
    champsRequis: ['batiment', 'raison_demolition'],
    piecesJointes: ['Plans', 'Photos'],
    guide: {
      introduction: "Le permis de démolir est obligatoire dans certaines communes (secteurs protégés, zones de protection du patrimoine) pour démolir tout ou partie d'un bâtiment.",
      sections: [
        {
          titre: "Communes concernées",
          description: "Où le permis de démolir est obligatoire",
          champs: [
            { nom: "Secteur sauvegardé", requis: false, aide: "Centre historique protégé" },
            { nom: "Abords de monuments historiques", requis: false, aide: "Périmètre de 500m autour d'un MH" },
            { nom: "Site patrimonial remarquable", requis: false, aide: "SPR institué par délibération" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "Plans",
          nom: "Plans du bâtiment à démolir",
          description: "Plan de masse situant le bâtiment sur la parcelle.",
        },
        {
          code: "Photos",
          nom: "Photos du bâtiment",
          description: "Vues extérieures de toutes les façades.",
        },
      ],
      erreursFrequentes: [
        "Démolition sans permis dans une commune où il est obligatoire",
        "Absence de diagnostic amiante avant démolition",
        "Oubli de déclaration ISDI (déchets du BTP)",
      ],
      delaisEtRecours: {
        delaiInstruction: "2 mois",
        validite: "Le permis de démolir est valable 3 ans",
      }
    }
  },
  {
    numero: '13704',
    slug: '13704-certificat-urbanisme-operationnel',
    nom: 'Certificat d\'urbanisme opérationnel',
    categorie: 'Certificat',
    description: 'CUb - Renseigne sur la faisabilité d\'un projet précis sur un terrain',
    delaiInstruction: '2 mois',
    champsRequis: ['terrain', 'projet_envisage'],
    piecesJointes: ['Plan situation', 'Note descriptive'],
    guide: {
      introduction: "Le certificat d'urbanisme opérationnel (CUb) indique si un projet précis est réalisable sur un terrain donné. Il renseigne sur les règles d'urbanisme, les limitations administratives et l'état des équipements publics.",
      sections: [
        {
          titre: "Différence CUa et CUb",
          description: "Deux types de certificats",
          champs: [
            { nom: "CUa (information)", requis: false, aide: "Renseigne sur les règles générales applicables au terrain" },
            { nom: "CUb (opérationnel)", requis: false, aide: "Indique si un projet précis est réalisable" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "Plan situation",
          nom: "Plan de situation du terrain",
          description: "Localisation précise de la parcelle.",
        },
        {
          code: "Note projet",
          nom: "Note descriptive du projet",
          description: "Description précise du projet envisagé (surfaces, hauteurs, usage).",
        },
      ],
      erreursFrequentes: [
        "Confusion entre CUa et CUb",
        "Description imprécise du projet (ne permet pas à la mairie de se prononcer)",
        "Oubli de joindre les références cadastrales",
      ],
      delaisEtRecours: {
        delaiInstruction: "2 mois",
        validite: "Le CU est valable 18 mois et garantit les règles d'urbanisme pendant ce délai",
      }
    }
  },
  {
    numero: '13705',
    slug: '13705-permis-amenager',
    nom: 'Demande de permis d\'aménager',
    categorie: 'Aménagement',
    description: 'Lotissement, aire de stationnement, terrain de camping, parc d\'attractions...',
    delaiInstruction: '3 mois',
    champsRequis: ['type_amenagement', 'surfaces', 'equipements'],
    piecesJointes: ['Plans aménagement', 'Notice', 'Étude impact'],
    guide: {
      introduction: "Le permis d'aménager concerne les opérations d'aménagement d'un terrain : lotissements, terrains de camping, aires de stationnement de plus de 50 places, parcs d'attractions...",
      sections: [
        {
          titre: "Opérations concernées",
          description: "Projets nécessitant un PA",
          champs: [
            { nom: "Lotissement", requis: false, aide: "Division d'un terrain en 2 lots ou plus en vue de construire" },
            { nom: "Camping > 6 emplacements", requis: false, aide: "Terrain de camping ou caravanage" },
            { nom: "Parking > 50 places", requis: false, aide: "Aire de stationnement ouverte au public" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "Plans",
          nom: "Plan d'aménagement",
          description: "Vue d'ensemble de l'aménagement avec VRD, espaces verts.",
        },
        {
          code: "Étude impact",
          nom: "Étude d'impact environnemental",
          description: "Obligatoire pour les projets importants.",
        },
      ],
      erreursFrequentes: [
        "Oubli de l'étude d'impact pour les grands projets",
        "Plans incomplets (absence des réseaux, voiries)",
        "Non-respect des règles de densité du PLU",
      ],
      delaisEtRecours: {
        delaiInstruction: "3 mois",
        validite: "3 ans, prorogeable 2 fois 1 an",
      }
    }
  },
  {
    numero: '13824',
    slug: '13824-permis-construire-autre-batiment',
    nom: 'Permis de construire pour un bâtiment autre que maison individuelle',
    categorie: 'Permis de construire',
    description: 'Immeuble collectif, local commercial, ERP, bâtiment agricole ou industriel',
    delaiInstruction: '3 mois',
    champsRequis: ['destination', 'surfaces', 'erp'],
    piecesJointes: ['PC1 à PC8', 'Notice accessibilité'],
    guide: {
      introduction: "Le CERFA 13824 concerne tous les bâtiments autres que les maisons individuelles : immeubles collectifs, commerces, bureaux, ERP (établissements recevant du public), bâtiments agricoles...",
      sections: [
        {
          titre: "Destinations concernées",
          description: "Types de bâtiments",
          champs: [
            { nom: "Logement collectif", requis: false, aide: "Immeuble de 2 logements ou plus" },
            { nom: "Commerce", requis: false, aide: "Boutique, restaurant, hôtel..." },
            { nom: "Bureau", requis: false, aide: "Bâtiment tertiaire" },
            { nom: "ERP", requis: false, aide: "École, salle de spectacle, magasin > 200m²..." },
            { nom: "Agricole", requis: false, aide: "Hangar, étable, serre..." },
            { nom: "Industriel", requis: false, aide: "Usine, entrepôt, atelier..." },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "Notice accessibilité",
          nom: "Notice PMR",
          description: "Obligatoire pour tous les ERP et logements collectifs.",
        },
        {
          code: "Plans sécurité",
          nom: "Plans de sécurité incendie",
          description: "Obligatoire pour ERP selon catégorie.",
        },
      ],
      erreursFrequentes: [
        "Oubli de la notice accessibilité PMR",
        "Classification ERP incorrecte",
        "Non-respect des normes incendie",
      ],
      delaisEtRecours: {
        delaiInstruction: "3 mois (ou plus si consultation ABF, commission sécurité...)",
        validite: "3 ans, prorogeable 2 fois 1 an",
      }
    }
  },
  {
    numero: '15269',
    slug: '15269-erp-accessibilite',
    nom: 'Dossier ERP - Accessibilité aux personnes handicapées',
    categorie: 'ERP',
    description: 'Dossier spécifique accessibilité pour ERP (établissements recevant du public)',
    delaiInstruction: '4 mois',
    champsRequis: ['type_erp', 'categorie', 'dispositifs_accessibilite'],
    piecesJointes: ['Plans accessibilité', 'Notice détaillée'],
    guide: {
      introduction: "Le CERFA 15269 est spécifique aux ERP pour justifier de l'accessibilité aux personnes à mobilité réduite conformément à la loi de 2005.",
      sections: [
        {
          titre: "Catégories d'ERP",
          description: "Classification selon capacité d'accueil",
          champs: [
            { nom: "Catégorie 1", requis: false, aide: "> 1500 personnes" },
            { nom: "Catégorie 2", requis: false, aide: "701 à 1500 personnes" },
            { nom: "Catégorie 3", requis: false, aide: "301 à 700 personnes" },
            { nom: "Catégorie 4", requis: false, aide: "< 300 personnes (sauf 5e)" },
            { nom: "Catégorie 5", requis: false, aide: "Établissements de petite taille" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "Notice accessibilité",
          nom: "Notice PMR détaillée",
          description: "Justification de tous les dispositifs d'accessibilité.",
        },
      ],
      erreursFrequentes: [
        "Absence de rampe PMR ou ascenseur",
        "Largeur de porte insuffisante",
        "Absence de sanitaires PMR",
      ],
      delaisEtRecours: {
        delaiInstruction: "4 mois",
        commission: "Passage en commission de sécurité obligatoire avant ouverture",
      }
    }
  },
  {
    numero: '15292',
    slug: '15292-declaration-ouverture-chantier',
    nom: 'Déclaration d\'ouverture de chantier',
    categorie: 'Suivi de chantier',
    description: 'DOC - À déposer avant de commencer les travaux',
    delaiInstruction: 'Réception immédiate',
    champsRequis: ['permis_reference', 'date_debut_travaux'],
    piecesJointes: [],
    guide: {
      introduction: "La DOC (Déclaration d'Ouverture de Chantier) doit être déposée en mairie avant le début effectif des travaux autorisés par un permis de construire ou d'aménager.",
      sections: [
        {
          titre: "Obligations",
          description: "Pourquoi déposer une DOC",
          champs: [
            { nom: "Informer la mairie", requis: true, aide: "La mairie peut ainsi planifier des contrôles" },
            { nom: "Déclencher les délais", requis: true, aide: "Les délais de recours commencent à courir" },
            { nom: "Affichage du permis", requis: true, aide: "L'affichage du permis sur le terrain doit être effectif dès la DOC" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "Formulaire",
          nom: "CERFA 15292",
          description: "Simple formulaire avec numéro de permis et date de début.",
        },
      ],
      erreursFrequentes: [
        "Oubli de dépôt de la DOC (peut empêcher de purger les recours)",
        "DOC déposée trop tard (après début travaux)",
        "Absence d'affichage du permis sur le terrain",
      ],
      delaisEtRecours: {
        delaiInstruction: "Réception immédiate, aucune validation nécessaire",
      }
    }
  },
  {
    numero: '14789',
    slug: '14789-division-terrain-lotissement',
    nom: 'Déclaration de division de terrain pour lotissement',
    categorie: 'Aménagement',
    description: 'Division d\'un terrain en 2 lots ou plus sans permis d\'aménager',
    delaiInstruction: '1 mois',
    champsRequis: ['parcelle', 'nombre_lots'],
    piecesJointes: ['Plan division', 'Annexes'],
    guide: {
      introduction: "La déclaration de division permet de créer 2 lots maximum sans passer par un permis d'aménager (au-delà de 2 lots, un PA est obligatoire).",
      sections: [
        {
          titre: "Différence avec le PA",
          description: "Lotissement simplifié",
          champs: [
            { nom: "2 lots maximum", requis: true, aide: "Au-delà, un permis d'aménager est obligatoire" },
            { nom: "Pas de VRD créée", requis: true, aide: "La division ne doit pas créer de nouvelle voirie" },
          ]
        },
      ],
      piecesMajeures: [
        {
          code: "Plan division",
          nom: "Plan de division",
          description: "Plan cadastral avec les nouveaux lots délimités.",
        },
      ],
      erreursFrequentes: [
        "Division en plus de 2 lots sans PA",
        "Oubli de vérifier les règles de constructibilité de chaque lot",
      ],
      delaisEtRecours: {
        delaiInstruction: "1 mois",
      }
    }
  },
  {
    numero: '13412',
    slug: '13412-sursis-statuer',
    nom: 'Demande de sursis à statuer',
    categorie: 'Recours',
    description: 'La mairie peut surseoir à statuer si projet incompatible avec étude en cours',
    delaiInstruction: '2 mois',
    champsRequis: ['motif_sursis'],
    piecesJointes: ['Justificatifs'],
    guide: {
      introduction: "Le sursis à statuer permet à la mairie de suspendre l'instruction d'une demande d'autorisation si un projet d'évolution du PLU est en cours et pourrait rendre le projet incompatible.",
      sections: [
        {
          titre: "Motifs de sursis",
          description: "Quand la mairie peut surseoir",
          champs: [
            { nom: "Révision PLU en cours", requis: false, aide: "La commune modifie son PLU" },
            { nom: "Projet d'intérêt général", requis: false, aide: "Infrastructure publique prévue" },
          ]
        },
      ],
      piecesMajeures: [],
      erreursFrequentes: [
        "Sursis à statuer abusif (pas de projet réel de PLU)",
      ],
      delaisEtRecours: {
        delaiInstruction: "Le sursis suspend les délais",
        duree: "Maximum 2 ans",
      }
    }
  },
];

export function getCerfaByNumero(numero) {
  return CERFA_LIST.find(c => c.numero === numero);
}

export function getCerfaBySlug(slug) {
  return CERFA_LIST.find(c => c.slug === slug);
}
