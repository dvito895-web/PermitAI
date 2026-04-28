import Link from 'next/link';
import { Building2, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

const ARTICLES = {
  'comment-lire-un-plu': {
    title: 'Comment lire et comprendre un Plan Local d\'Urbanisme (PLU)',
    date: '2025-01-15',
    readTime: '8 min',
    category: 'Guide PLU',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    content: `
Le Plan Local d'Urbanisme (PLU) est le document essentiel qui définit les règles de construction dans votre commune. Voici comment le décrypter efficacement.

## Qu'est-ce qu'un PLU ?

Le PLU remplace l'ancien POS (Plan d'Occupation des Sols) depuis la loi SRU de 2000. Il fixe les règles applicables à chaque terrain de la commune en matière d'urbanisme.

## Structure d'un PLU

Un PLU se compose de plusieurs documents obligatoires :

- **Le rapport de présentation** : diagnostic du territoire
- **Le PADD (Projet d'Aménagement et de Développement Durables)** : orientations d'urbanisme
- **Le règlement graphique** : zonage de la commune
- **Le règlement littéral** : règles applicables par zone

## Comprendre le zonage

Les zones sont codifiées par des lettres :

- **Zone U** : zone urbaine (déjà construite et équipée)
- **Zone AU** : zone à urbaniser (future zone constructible)
- **Zone A** : zone agricole (construction très limitée)
- **Zone N** : zone naturelle et forestière (protection stricte)

Chaque zone peut avoir des sous-zones (UA, UB, UC...) avec des règles spécifiques.

## Les articles essentiels du règlement

Le règlement de chaque zone comprend jusqu'à 14 articles :

- **Article 6** : Implantation par rapport aux voies
- **Article 7** : Implantation par rapport aux limites séparatives
- **Article 10** : Hauteur maximale des constructions
- **Article 9** : Emprise au sol
- **Article 11** : Aspect extérieur

## Où consulter le PLU ?

1. **En mairie** : consultation gratuite du PLU papier
2. **En ligne** : sur le Géoportail de l'Urbanisme
3. **Avec PermitAI** : analyse automatique en 3 minutes

## Cas pratique : exemple d'analyse

Pour une extension de 40m² en zone UA :

- Vérifier l'emprise au sol maximum (art. 9)
- Contrôler la hauteur autorisée (art. 10)
- Respecter les reculs par rapport aux limites (art. 7)

PermitAI automatise cette analyse et cite les articles exacts applicables à votre projet.
    `,
  },
  'cerfa-13406-guide-complet': {
    title: 'CERFA 13406 : le guide complet du permis de construire maison individuelle',
    date: '2025-01-10',
    readTime: '12 min',
    category: 'CERFA',
    image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1200&q=80',
    content: `
Le formulaire CERFA 13406*10 est obligatoire pour toute demande de permis de construire pour une maison individuelle. Guide complet.

## Qui est concerné ?

Le CERFA 13406 concerne :
- Construction d'une maison individuelle neuve
- Extension de plus de 40m² créant plus de 150m² de surface totale
- Annexes à une maison individuelle

## Les 8 sections du formulaire

### Section 1 : Identité du demandeur
- Nom, prénom, raison sociale
- Adresse complète
- Téléphone et email

### Section 2 : Localisation du terrain
- Adresse complète du terrain
- Références cadastrales (section et numéro de parcelle)

### Section 3 : Nature des travaux
- Construction neuve, extension, annexe
- Nombre de logements créés

### Section 4 : Surfaces
- Surface de plancher créée
- Emprise au sol
- Surface taxable

### Section 5 : Informations complémentaires
- Nombre de niveaux
- Hauteur du bâtiment
- Matériaux utilisés

## Pièces obligatoires à joindre

Au minimum 8 pièces :

- PC1 : Plan de situation
- PC2 : Plan de masse
- PC3 : Plan en coupe
- PC4 : Notice descriptive
- PC5 : Plan des façades et toitures
- PC6 : Document graphique 3D
- PC7 : Photographies terrain et environnement proche
- PC8 : Photographies terrain et environnement lointain

## Erreurs fréquentes à éviter

1. **Mauvaises références cadastrales** → Refus automatique
2. **Surfaces mal calculées** → Retard d'instruction
3. **Plans non à l'échelle** → Demande de pièces complémentaires
4. **Signature manquante** → Dossier incomplet

## Délai d'instruction

- **2 mois** pour une maison individuelle
- **3 mois** si le terrain est en secteur protégé

## Utiliser PermitAI

PermitAI pré-remplit automatiquement votre CERFA 13406 avec :
- Références cadastrales via API IGN
- Calcul automatique des surfaces
- Génération du PDF officiel
- Vérification de conformité PLU
    `,
  },
  'delais-instruction-permis-construire': {
    title: 'Délais d\'instruction du permis de construire : tout savoir en 2025',
    date: '2025-01-05',
    readTime: '6 min',
    category: 'Réglementation',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
    content: `
Les délais légaux d'instruction d'un permis de construire sont encadrés par le Code de l'urbanisme. Voici tout ce qu'il faut savoir.

## Délais standards

- **Maison individuelle** : 2 mois
- **Autres constructions** : 3 mois
- **En secteur protégé (ABF)** : + 1 mois

## Point de départ du délai

Le délai débute **1 mois après le dépôt du dossier complet**. La mairie envoie un récépissé indiquant la date limite de réponse.

## L'accord tacite

Si la mairie ne répond pas dans les délais, le permis est **tacitement accordé**. Vous devez demander un certificat de non-opposition.

⚠️ **Exception** : en secteur protégé ou en zone à risques, pas d'accord tacite.

## Demande de pièces complémentaires

La mairie peut demander des pièces manquantes **1 seule fois** dans le délai initial. Cela interrompt le délai.

Vous avez **3 mois** pour fournir les pièces. Le délai repart ensuite pour la durée initiale (2 ou 3 mois).

## Notification de délai majoré

Si votre projet nécessite une consultation extérieure (ABF, DREAL...), la mairie doit vous notifier un délai majoré dans le mois suivant le dépôt.

## Que faire en cas de dépassement ?

1. **Vérifier la date limite** sur le récépissé
2. **Réclamer le certificat de non-opposition** à la mairie
3. **En cas de refus** : recours gracieux ou contentieux

## Suivre son dossier avec PermitAI

PermitAI surveille automatiquement les délais et vous alerte :
- 15 jours avant l'échéance
- Le jour de l'échéance
- En cas d'accord tacite
    `,
  },
  'depot-numerique-plateau': {
    title: 'PLAT\'AU : comment déposer son permis de construire en ligne',
    date: '2024-12-20',
    readTime: '7 min',
    category: 'Démarches',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    content: `
PLAT'AU (PLAteforme de Traitement de l'Autorisation d'Urbanisme) permet de déposer votre permis de construire en ligne. Mode d'emploi.

## Qu'est-ce que PLAT'AU ?

Plateforme nationale créée en 2022 pour dématérialiser les autorisations d'urbanisme. Elle remplace progressivement le dépôt papier.

## Mairies raccordées

Plus de **20 000 communes** sont raccordées à PLAT'AU en 2025. Liste consultable sur service-public.fr.

## Avantages du dépôt numérique

- **Accusé de réception instantané**
- **Suivi en temps réel** de l'instruction
- **Pas de déplacement** en mairie
- **Pièces modifiables** avant validation
- **Archivage automatique**

## Étapes du dépôt

### 1. Créer un compte
Sur plat-au.gouv.fr avec FranceConnect ou email

### 2. Remplir le formulaire
CERFA 13406, 13409, ou 13703 selon le projet

### 3. Joindre les pièces
Format PDF, poids max 10 Mo par pièce

### 4. Valider et signer
Signature électronique obligatoire

### 5. Recevoir l'accusé
Par email sous 24h

## Format des pièces

- **PDF uniquement**
- Taille max : 10 Mo / pièce
- Plans en couleur acceptés
- Résolution min : 150 DPI

## Erreurs fréquentes

1. **PDF trop lourd** → Compresser les fichiers
2. **Plans illisibles** → Scanner en haute résolution
3. **Signature manquante** → Valider avec FranceConnect

## Que faire si ma mairie n'est pas raccordée ?

- **LRAR à La Poste** : envoi recommandé classique
- **Dépôt en mairie** : contre récépissé

PermitAI propose le dépôt PLAT'AU ou LRAR selon la mairie concernée, en 1 clic.
    `,
  },
  'refus-permis-construire-que-faire': {
    title: 'Refus de permis de construire : que faire ? Recours et solutions',
    date: '2024-12-15',
    readTime: '10 min',
    category: 'Contentieux',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
    content: `
Un refus de permis de construire n'est pas une fatalité. Plusieurs recours existent pour contester la décision.

## Comprendre les motifs de refus

Les motifs les plus fréquents :

- **Non-conformité au PLU** (70% des refus)
- **Aspect extérieur incompatible**
- **Atteinte à l'environnement**
- **Insuffisance de stationnement**
- **Problème de desserte**

## Recours gracieux

**Délai** : 2 mois à compter de la notification de refus

**Procédure** :
1. Lettre recommandée au maire
2. Exposer les arguments
3. Demander un réexamen

**Taux de succès** : ~15%

## Recours contentieux

Si le recours gracieux échoue :

**Délai** : 2 mois après la réponse au recours gracieux (ou 4 mois si pas de réponse)

**Procédure** :
1. Saisir le tribunal administratif
2. Présenter un mémoire argumenté
3. Audience et jugement

**Durée moyenne** : 12 à 18 mois

**Taux de succès** : ~30%

## Modifier le projet

**Solution la plus rapide** : adapter le projet aux exigences du PLU

Exemples :
- Réduire la hauteur
- Modifier l'implantation
- Changer les matériaux
- Réduire l'emprise au sol

## Nouveau dépôt

Après modification, vous pouvez redéposer immédiatement un nouveau permis.

**Conseil** : bien identifier la cause exacte du refus avant de redéposer.

## Coûts d'un refus

- **Retard projet** : 6 à 18 mois
- **Frais d'architecte** : 800 à 3 000€ (modification)
- **Avocat (contentieux)** : 2 000 à 6 000€
- **Perte d'opportunité** : variable

## Prévenir le refus avec PermitAI

PermitAI analyse le PLU **avant le dépôt** :
- Vérification automatique des règles
- Identification des non-conformités
- Suggestions d'adaptation
- Taux d'acceptation : 94%

Évitez 6 mois de retard et 3 000€ de frais.
    `,
  },
  'permis-construire-extension-maison': {
    title: 'Permis de construire extension maison : guide complet 2025',
    date: '2025-06-12',
    readTime: '10 min',
    category: 'Guide',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80',
    content: `
Vous projetez d'agrandir votre maison ? Voici tout ce qu'il faut savoir avant de commencer.

## Quelles autorisations selon la surface ?

La nature de l'autorisation dépend de la **surface plancher** créée :

- **≤ 5 m²** : aucune formalité
- **5 à 20 m²** : déclaration préalable (DP)
- **20 à 40 m²** en zone urbaine d'un PLU : déclaration préalable
- **> 40 m² (PLU) ou > 20 m² (hors PLU)** : permis de construire (CERFA 13406)
- **> 150 m² total après extension** : architecte obligatoire

## Les CERFA à connaître

- **CERFA 13703** : Déclaration préalable de travaux
- **CERFA 13406** : Permis de construire pour une maison individuelle

## Délais d'instruction

- DP : 1 mois
- Permis de construire : 2 à 3 mois selon la zone

## Erreurs fréquentes

- Oublier de vérifier l'**emprise au sol** maximale du PLU
- Ne pas respecter les **distances aux limites séparatives**
- Sous-estimer la **hauteur autorisée** au faîtage
- Négliger l'**aspect extérieur** (matériaux, couleurs)

## Coût d'un projet d'extension

- Construction : 1 500 à 2 500 €/m²
- Honoraires architecte (si > 150 m²) : 8 à 12 % du budget
- Taxe d'aménagement : variable selon commune

## Comment PermitAI vous aide

PermitAI analyse votre PLU communal en 3 minutes, vérifie l'emprise au sol, la hauteur, les marges, et pré-remplit votre CERFA officiel.
    `,
  },
  'plu-par-commune-france': {
    title: 'Comprendre les PLU par commune en France : 36 000 documents',
    date: '2025-06-08',
    readTime: '9 min',
    category: 'Guide PLU',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    content: `
Chaque commune de France dispose d'un PLU (ou d'une carte communale, ou du RNU). Voici comment vous y retrouver.

## Pourquoi les PLU varient

Le PLU traduit la politique d'urbanisme **locale** : densité, hauteur, mixité, environnement. Une commune littorale n'aura pas les mêmes règles qu'une commune de montagne.

## Où consulter le PLU de votre commune

- **Mairie** : consultation publique en service urbanisme
- **Géoportail Urbanisme** : géoportail-urbanisme.gouv.fr
- **Site de la commune** : souvent en téléchargement PDF
- **PermitAI** : recherche par adresse en 3 secondes

## Lire le règlement de zone

Chaque zone (UA, UB, UC, AU, A, N…) possède jusqu'à 14 articles :

- Article 1-2 : occupations autorisées / interdites
- Article 6 : implantation par rapport aux voies
- Article 7 : implantation par rapport aux limites
- Article 9 : emprise au sol
- Article 10 : hauteur maximale
- Article 11 : aspect extérieur
- Article 12 : stationnement
- Article 13 : espaces verts

## PLUi : Plan Local d'Urbanisme intercommunal

Depuis 2017, beaucoup d'EPCI ont fusionné les PLU communaux en un PLUi unique pour harmoniser les règles.

## Cartes communales et RNU

- **Carte communale** : ~7 000 communes, document simplifié
- **RNU (Règlement National d'Urbanisme)** : pour les communes sans PLU ni carte communale

## Comment PermitAI couvre 36 000 communes

PermitAI indexe en continu les PLU publiés sur le Géoportail Urbanisme officiel. Données mises à jour quotidiennement.
    `,
  },
  'agent-immobilier-plu-compromis': {
    title: 'Agent immobilier : vérifier le PLU avant chaque compromis',
    date: '2025-06-05',
    readTime: '7 min',
    category: 'Pro',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    content: `
30 % des compromis de vente avec projet de travaux comportent un risque PLU. Voici pourquoi vérifier devient essentiel.

## Le risque pour l'agent immo

Si l'acquéreur découvre **après signature** que son projet n'est pas conforme :

- Rétractation possible (clause résolutoire)
- Perte de la commission
- Responsabilité professionnelle engagée
- Réputation entachée

## Les 5 vérifications PLU minimales

1. **Constructibilité** du terrain
2. **Hauteur maximale** autorisée
3. **Emprise au sol** maximale
4. **Distances aux limites**
5. **Aspect extérieur** imposé

## Le bon process

- Avant le mandat : vérification rapide (3 min)
- Avant les visites : préparer la fiche PLU
- Avant le compromis : analyse complète + écrit
- Clause suspensive : possibilité de mentionner la conformité PLU

## Le ROI pour l'agent

- 1 vente sauvée par an = 8 000 € de commission préservée
- PermitAI Pro = 149 €/mois
- ROI : 447 % la première année

## Argument différenciateur

Face à un acheteur qui hésite, présenter une **fiche PLU complète** rassure et accélère la décision. Beaucoup d'agences l'utilisent désormais comme outil de prospection.

## L'extension Chrome PermitAI

Vérifiez le PLU directement depuis SeLoger, Logic-Immo ou Bien'ici en un clic.
    `,
  },
  'refus-permis-construire-recours': {
    title: 'Refus de permis de construire : recours et solutions 2025',
    date: '2024-12-15',
    readTime: '8 min',
    category: 'Recours',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
    content: `
Voir le contenu détaillé sur les recours dans notre article principal sur le sujet.

## Les 3 voies de recours

1. **Recours gracieux** au maire (2 mois)
2. **Recours contentieux** au tribunal administratif (2 mois après réponse)
3. **Modification du projet** et nouveau dépôt

## Recours gracieux

- Délai : 2 mois après notification
- Lettre recommandée au maire
- Taux de succès : ~15%
- Coût : 0 €

## Recours contentieux

- Délai : 2 mois après réponse au gracieux
- Saisir le tribunal administratif
- Durée : 12 à 18 mois
- Coût avocat : 2 000 à 6 000 €
- Taux de succès : ~30%

## Modifier le projet

C'est souvent la voie **la plus rapide** :

- Identifier la cause exacte du refus
- Adapter le projet (hauteur, emprise, matériaux)
- Redéposer immédiatement

## Prévenir avec PermitAI

PermitAI analyse votre PLU **avant le dépôt**. Taux d'acceptation des dossiers traités : 94 %.
    `,
  },
};

export async function generateMetadata({ params }) {
  const article = ARTICLES[params.slug];
  
  if (!article) {
    return {
      title: 'Article non trouvé | PermitAI Blog',
    };
  }

  return {
    title: `${article.title} | PermitAI Blog`,
    description: article.content.substring(0, 160),
  };
}

export default function BlogArticlePage({ params }) {
  const article = ARTICLES[params.slug];

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#06060e]">
      <nav className="nav-premium">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-[#e8b420]" />
            <span className="text-[18px] font-fraunces font-medium text-[#f0ede8]">PermitAI</span>
          </Link>
          <Link href="/blog">
            <button className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Tous les articles
            </button>
          </Link>
        </div>
      </nav>

      <article className="pt-40 pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="badge-premium inline-block mb-6">{article.category}</div>
          
          <h1 className="hero-title mb-6">{article.title}</h1>
          
          <div className="flex items-center gap-6 text-[13px] text-[#8a857d] mb-12">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </div>
          </div>

          <div className="aspect-video bg-[#14141f] rounded-lg mb-12 overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-invert max-w-none">
            {article.content.split('\n').map((paragraph, i) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={i} className="text-[24px] font-medium text-[#f0ede8] mt-12 mb-4">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={i} className="text-[18px] font-medium text-[#f0ede8] mt-8 mb-3">{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('- ')) {
                return <li key={i} className="text-[15px] text-[#8a857d] leading-relaxed ml-6 mb-2">{paragraph.replace('- ', '')}</li>;
              }
              if (paragraph.trim() === '') {
                return null;
              }
              return <p key={i} className="text-[15px] text-[#8a857d] leading-relaxed mb-6">{paragraph}</p>;
            })}
          </div>

          <div className="card-premium mt-12 bg-gradient-to-br from-[#14141f] to-[#0a0a14]">
            <h3 className="text-[20px] font-medium mb-4 text-[#f0ede8]">Analysez votre projet avec PermitAI</h3>
            <p className="text-[14px] text-[#8a857d] mb-6">
              Vérifiez la conformité de votre projet au PLU en 3 minutes. Évitez les refus et gagnez du temps.
            </p>
            <Link href="/analyse">
              <button className="btn-primary">Analyser mon terrain gratuitement</button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
