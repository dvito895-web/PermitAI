# 🚀 PermitAI - Guide de Déploiement Production

## ✅ État Actuel

### Fonctionnalités Implémentées
- ✅ **Système IA Hybride** : Gemini (gratuit) / Claude Sonnet 4 (payants)
- ✅ **10 652 communes PLU indexées** (29,6% de couverture nationale)
- ✅ **Design premium unifié** sur toutes les pages
- ✅ **Backend API complet** : analyse PLU, CERFA, dépôt, suivi
- ✅ **Authentication Clerk** : Sign-in/Sign-up fonctionnel
- ✅ **Paiements Stripe** : Infrastructure prête
- ✅ **Base de données PostgreSQL** : Neon.tech configuré

### Technologies
- **Frontend** : Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend** : Next.js API Routes
- **Database** : PostgreSQL sur Neon.tech
- **Auth** : Clerk.dev
- **Payments** : Stripe
- **IA** : Claude Sonnet 4 (Anthropic) + Gemini 1.5 Flash (Google)

---

## 📋 Checklist Configuration Manuelle

### 1. 🔐 Configuration Clerk (Authentication)

**Variables déjà configurées** :
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Actions à faire** :
1. **Créer compte production** sur https://dashboard.clerk.dev
2. **Créer nouvelle application** "PermitAI Production"
3. **Récupérer les clés de production** :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (commence par `pk_live_...`)
   - `CLERK_SECRET_KEY` (commence par `sk_live_...`)
4. **Configurer les Webhooks Clerk** :
   - URL : `https://votre-domaine.com/api/webhooks/clerk`
   - Events : `user.created`, `user.updated`, `user.deleted`
   - Récupérer le `CLERK_WEBHOOK_SIGNING_SECRET`
5. **Configurer les URLs de redirection** :
   - After Sign In URL : `/dashboard`
   - After Sign Up URL : `/dashboard`
6. **Activer Google OAuth** (optionnel) dans Settings → Social Connections

---

### 2. 💳 Configuration Stripe (Paiements)

**Variables déjà configurées** (TEST):
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_temporaire
```

**Actions à faire** :
1. **Passer en mode Live** sur https://dashboard.stripe.com
2. **Récupérer les clés Live** :
   - `STRIPE_PUBLISHABLE_KEY` (commence par `pk_live_...`)
   - `STRIPE_SECRET_KEY` (commence par `sk_live_...`)
3. **Créer les produits Stripe** :
   
   **Plan Starter (29€/mois)** :
   - Prix : 29 EUR
   - Récurrence : monthly
   - Metadata : `plan=starter`
   - Récupérer le Price ID : `price_xxx`
   
   **Plan Pro (89€/mois)** :
   - Prix : 89 EUR
   - Récurrence : monthly
   - Metadata : `plan=pro`
   - Récupérer le Price ID : `price_xxx`
   
   **Plan Cabinet (199€/mois)** :
   - Prix : 199 EUR
   - Récurrence : monthly
   - Metadata : `plan=cabinet`
   - Récupérer le Price ID : `price_xxx`

4. **Configurer le Webhook Stripe** :
   - URL : `https://votre-domaine.com/api/webhook/stripe`
   - Events : 
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Récupérer le `STRIPE_WEBHOOK_SECRET` (commence par `whsec_...`)

5. **Mettre à jour le code** avec les Price IDs :
   ```javascript
   // Dans /app/tarifs/page.js
   const PRICE_IDS = {
     starter_monthly: 'price_xxx',
     starter_yearly: 'price_xxx',
     pro_monthly: 'price_xxx',
     pro_yearly: 'price_xxx',
     cabinet_monthly: 'price_xxx',
     cabinet_yearly: 'price_xxx',
   };
   ```

---

### 3. 🌐 Configuration Domaine Personnalisé

**Domaine recommandé** : `permitai.fr` ou `permitai.com`

**Actions à faire** :
1. **Acheter le domaine** (chez Gandi, OVH, Namecheap, etc.)
2. **Configurer DNS** :
   ```
   Type: A
   Name: @
   Value: [IP du serveur]
   TTL: 3600
   
   Type: CNAME
   Name: www
   Value: [domaine ou IP]
   TTL: 3600
   ```
3. **Mettre à jour `.env`** :
   ```env
   NEXT_PUBLIC_BASE_URL=https://permitai.fr
   FRONTEND_URL=https://permitai.fr
   ```
4. **Configurer HTTPS** (Let's Encrypt recommandé)
5. **Mettre à jour Clerk** :
   - Dans Dashboard → Settings → Domains
   - Ajouter `permitai.fr` et `www.permitai.fr`
6. **Mettre à jour Stripe** :
   - Dans Settings → Branding
   - Domain : `permitai.fr`

---

### 4. 🔑 Variables d'Environnement Production

**Fichier `.env.production`** :
```env
# Base URLs
NEXT_PUBLIC_BASE_URL=https://permitai.fr
FRONTEND_URL=https://permitai.fr

# Database
DATABASE_URL=postgresql://[production_db_url]

# Clerk (PRODUCTION)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe (PRODUCTION)
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# AI APIs
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
GEMINI_API_KEY=AIzaSyA7dRJ0eiBwawWup11Z2Y-veR4CBq71MRU
```

---

### 5. 🗄️ Base de Données Production

**Neon.tech recommandé** (déjà utilisé en développement)

**Actions à faire** :
1. **Créer une branche production** sur Neon.tech
2. **Récupérer l'URL de connexion** :
   ```
   postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
   ```
3. **Migrer le schéma** :
   ```bash
   cd /app
   npx prisma db push
   ```
4. **Continuer l'indexation PLU** (actuellement 29,6%) :
   ```bash
   cd /app/scripts
   export DATABASE_URL="[production_url]"
   nohup python3 generate_plu_production.py > indexation_prod.log 2>&1 &
   ```
5. **Monitorer la progression** via `/api/indexation/progress`

**Coût estimé Neon.tech** : ~20-50 EUR/mois

---

### 6. 📊 Métriques et Monitoring

**Outils recommandés** :
- **Vercel Analytics** (si déployé sur Vercel)
- **Sentry** pour error tracking :
  ```bash
  yarn add @sentry/nextjs
  ```
- **PostHog** pour product analytics
- **Uptime Robot** pour monitoring uptime

---

### 7. 🔒 Sécurité Production

**Checklist sécurité** :
- ✅ HTTPS activé (obligatoire)
- ✅ Variables d'environnement sécurisées (jamais dans le code)
- ✅ CORS configuré (uniquement domaine autorisé)
- ✅ Rate limiting sur API endpoints (à implémenter)
- ✅ Clerk en mode production
- ✅ Stripe en mode Live
- ⚠️ Ajouter `.env.production` au `.gitignore`

**À implémenter (optionnel)** :
```javascript
// Rate limiting avec upstash
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
```

---

## 🚀 Déploiement

### Option 1 : Déploiement Vercel (Recommandé)

**Avantages** :
- Déploiement zero-config
- CDN global automatique
- HTTPS automatique
- Preview deployments

**Étapes** :
1. **Connecter repository GitHub** à Vercel
2. **Importer le projet** sur https://vercel.com
3. **Configurer variables d'environnement** (toutes celles listées ci-dessus)
4. **Deploy** → URL automatique fournie
5. **Configurer domaine personnalisé** dans Settings → Domains

**Coût estimé** : Gratuit (hobby) ou 20 USD/mois (Pro)

### Option 2 : Déploiement VPS (DigitalOcean, Hetzner)

**Avantages** :
- Contrôle total
- Coût fixe prévisible

**Étapes** :
1. **Créer un VPS** (4GB RAM minimum)
2. **Installer Node.js 20+** et Yarn
3. **Cloner le repository**
4. **Configurer `.env.production`**
5. **Build** :
   ```bash
   cd /app
   yarn install
   yarn build
   ```
6. **Lancer avec PM2** :
   ```bash
   pm2 start yarn --name "permitai" -- start
   pm2 save
   ```
7. **Configurer Nginx** comme reverse proxy
8. **Configurer SSL** avec Let's Encrypt

**Coût estimé** : 10-20 EUR/mois

---

## 📈 Post-Déploiement

### Tâches Immédiates
1. ✅ Tester toutes les fonctionnalités en production
2. ✅ Vérifier les webhooks Clerk et Stripe
3. ✅ Tester un paiement réel (puis rembourser)
4. ✅ Créer 2-3 comptes tests
5. ✅ Analyser 5-10 adresses différentes
6. ✅ Vérifier les emails de notification

### Optimisations Futures
1. **Compléter l'indexation PLU** (70,4% restants = 25 348 communes)
2. **Ajouter plus de règles par commune** (actuellement ~7 chunks/commune)
3. **Implémenter le wizard CERFA complet** (4 étapes)
4. **Intégrer vraie API PLAT'AU** (actuellement mockée)
5. **Développer extension Chrome** (plan Pro)
6. **Créer API externe** (plan Cabinet)
7. **Ajouter A/B testing** Gemini vs Claude
8. **Implémenter rate limiting**

---

## 🆘 Support

**En cas de problème** :
1. Vérifier les logs : `/var/log/supervisor/nextjs.out.log`
2. Tester API : `curl https://permitai.fr/api/health`
3. Vérifier DB : `psql $DATABASE_URL -c "SELECT COUNT(*) FROM plu_chunks"`
4. Vérifier webhooks dans Dashboard Clerk/Stripe

**Contacts utiles** :
- Clerk Support : https://clerk.dev/support
- Stripe Support : https://support.stripe.com
- Neon Support : https://neon.tech/docs/introduction/support

---

## 📊 KPIs à Suivre

**Métriques Business** :
- Nombre d'inscriptions (objectif : 100/mois)
- Taux de conversion gratuit → payant (objectif : 5%)
- MRR (Monthly Recurring Revenue)
- Churn rate (objectif : <5%)

**Métriques Techniques** :
- Temps de réponse API PLU (objectif : <3s)
- Taux de succès analyses (objectif : >95%)
- Uptime (objectif : 99.9%)
- Nombre de communes indexées (objectif : 36 000)

---

## ✅ Checklist Finale Avant Lancement

### Technique
- [ ] Variables d'environnement production configurées
- [ ] Clerk en mode Live
- [ ] Stripe en mode Live avec vrais produits
- [ ] HTTPS activé et certificat valide
- [ ] Domaine personnalisé configuré
- [ ] Database backups configurés
- [ ] Monitoring et alertes actifs
- [ ] Tests end-to-end réussis

### Business
- [ ] Mentions légales créées
- [ ] CGU/CGV rédigées
- [ ] Politique de confidentialité (RGPD)
- [ ] Support client configuré
- [ ] Plan marketing défini
- [ ] Prix validés
- [ ] Documentation utilisateur

### Légal
- [ ] SIRET/SIREN obtenu
- [ ] TVA intracommunautaire
- [ ] Conditions générales validées par avocat
- [ ] RGPD compliant
- [ ] Déclaration CNIL si nécessaire

---

**Prêt pour le lancement ! 🚀**
