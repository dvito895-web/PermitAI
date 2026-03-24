# PermitAI - Votre permis de construire sans les mauvaises surprises

PermitAI est un SaaS complet pour analyser les Plans Locaux d'Urbanisme (PLU) de France, générer des formulaires CERFA officiels et déposer des dossiers en mairie.

## 🚀 Fonctionnalités principales

- **Analyse PLU instantanée** sur 36 000 communes françaises
- **Génération automatique de 13 CERFA** officiels
- **Dépôt numérique en mairie** via PLAT'AU ou LRAR La Poste
- **IA Claude** pour l'analyse des règles d'urbanisme
- **Alertes et suivi** des délais d'instruction
- **Dashboard utilisateur** complet

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 avec App Router
- **Backend**: Next.js API Routes
- **Base de données**: PostgreSQL (Neon.tech) avec Prisma ORM
- **Authentification**: Clerk.dev (email, Google OAuth, magic links)
- **Paiements**: Stripe avec abonnements
- **IA**: Claude API d'Anthropic (modèle claude-sonnet-4-20250514)
- **Design**: Tailwind CSS avec design dark premium

## 🎨 Design

- Fond principal: `#06060e`
- Couleur accent or: `#A07820` et `#E8B420`
- Typographie: Fraunces (titres) + system fonts (corps)
- Style inspiré de Linear, Vercel, Raycast

## 📦 Installation

1. Installer les dépendances:
```bash
yarn install
```

2. Configurer les variables d'environnement dans `.env`:
```env
# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_key

# PostgreSQL Database (Neon.tech)
DATABASE_URL=your_postgresql_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SIGNING_SECRET=your_webhook_secret

# Stripe Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key

# Base URLs
NEXT_PUBLIC_BASE_URL=your_app_url
FRONTEND_URL=your_frontend_url
```

3. Initialiser la base de données:
```bash
npx prisma generate
npx prisma db push
```

4. Lancer le serveur de développement:
```bash
yarn dev
```

L'application sera accessible sur `http://localhost:3000`

## 🗂️ Structure du projet

```
/app
├── app/
│   ├── page.js                    # Landing page
│   ├── layout.js                  # Layout avec ClerkProvider
│   ├── globals.css                # Styles globaux
│   ├── sign-in/[[...sign-in]]/   # Page de connexion
│   ├── sign-up/[[...sign-up]]/   # Page d'inscription
│   ├── dashboard/                 # Dashboard utilisateur
│   ├── analyse/                   # Page d'analyse PLU
│   ├── tarifs/                    # Page de tarifs
│   └── api/[[...path]]/          # API backend
│       └── route.js
├── lib/
│   └── db.ts                      # Client Prisma
├── prisma/
│   └── schema.prisma              # Schéma de base de données
├── middleware.ts                  # Middleware Clerk
└── tailwind.config.js             # Configuration Tailwind

```

## 🔑 Endpoints API

### PLU
- `POST /api/plu/query` - Analyser un terrain avec le PLU
- `GET /api/mairie/info?code=XXXXX` - Informations sur une mairie

### Paiements
- `POST /api/checkout` - Créer une session de paiement Stripe
- `POST /api/webhook/stripe` - Webhook Stripe

### Webhooks
- `POST /api/webhooks/clerk` - Webhook Clerk pour sync utilisateurs

### Santé
- `GET /api/health` - Vérifier l'état de l'API

## 💳 Plans tarifaires

- **Gratuit** : 0€ - 1 analyse limitée
- **Starter** : 29€/mois ou 290€/an - 8 analyses/mois, 3 CERFA
- **Pro** : 89€/mois ou 890€/an - Illimité, 13 CERFA, 5 utilisateurs
- **Cabinet** : 199€/mois ou 1990€/an - Tout Pro + API + multi-clients

## 🗄️ Base de données

### Modèles Prisma

- **User** - Utilisateurs synchronisés depuis Clerk
- **PluChunk** - Règles PLU indexées par commune
- **PluDocument** - État d'indexation des PLU
- **Analyse** - Analyses PLU effectuées
- **Dossier** - Dossiers de permis créés
- **Subscription** - Abonnements Stripe
- **Alerte** - Alertes et notifications

## 🌐 APIs externes utilisées

### APIs gouvernementales françaises (publiques)
- **API Adresse** : `https://api-adresse.data.gouv.fr/search/` - Géocodage
- **IGN Cadastre** : `https://apicarto.ign.fr/api/cadastre/parcelle` - Références parcellaires
- **API Communes** : `https://geo.api.gouv.fr/communes/` - Informations communes

### APIs tierces
- **Claude API** (Anthropic) - Analyse IA des règles PLU
- **Stripe** - Gestion des paiements et abonnements
- **Clerk** - Authentification et gestion utilisateurs

### APIs mockées (à implémenter)
- **PLAT'AU** - Dépôt numérique en mairie
- **La Poste LRAR** - Courrier recommandé électronique

## 🚦 Prochaines étapes

1. ✅ MVP fonctionnel créé
2. ⏳ Indexer les 36 000 PLU de France dans la base de données
3. ⏳ Implémenter les 13 formulaires CERFA
4. ⏳ Intégrer PLAT'AU pour le dépôt en mairie
5. ⏳ Ajouter La Poste LRAR pour les mairies non raccordées
6. ⏳ Créer les pages CERFA, Dépôt et Suivi
7. ⏳ Tester les webhooks Stripe et Clerk
8. ⏳ Configurer les plans Stripe avec les bons price_id

## 📝 Notes importantes

- Les PLU ne sont pas encore indexés dans la base. Pour tester, vous pouvez ajouter des données de test dans la table `plu_chunks`.
- Les APIs PLAT'AU et La Poste LRAR sont mockées pour le MVP.
- Le modèle Claude utilisé est `claude-sonnet-4-20250514` comme spécifié.
- Le design est entièrement dark premium avec les couleurs spécifiées.
- Tous les textes sont actuellement en anglais pour éviter les problèmes d'encodage. Ils peuvent être traduits en français.

## 🔐 Sécurité

- Toutes les clés API sont stockées dans des variables d'environnement
- Les webhooks Stripe et Clerk sont vérifiés avec des signatures
- L'authentification est gérée par Clerk
- Les routes protégées utilisent le middleware Clerk

## 📄 Licence

© 2025 PermitAI. Tous droits réservés.
