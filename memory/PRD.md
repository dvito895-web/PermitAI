# PermitAI — Product Requirements Document

> **Origin**: GitHub `dvito895-web/PermitAI` — SaaS architecture & permit (PC/DP) « 7-figure » pour la France.
> **Stack**: Next.js 14 App Router · PostgreSQL/Neon · Prisma · Clerk · Stripe · Claude Sonnet 4.5 (via Emergent LLM Key) · IGN / BAN / Géoportail
> **Langue**: Français (FR) — obligatoire pour toutes les réponses utilisateur.

---

## 1) Vision produit
Permettre à tout particulier ou pro de générer un dossier d'urbanisme complet (CERFA + pièces annexes) niveau architecte HMONP, en quelques minutes :
1. Adresse → cadastre IGN + règles PLU + bâtiments existants automatiques.
2. Upload d'un plan / photo → analyse Claude Vision (dimensions, toiture, façades, conformité PLU).
3. Sélection du type de projet (construction, extension, piscine, démolition, certificat…) → CERFA recommandé et liste de pièces dynamique.
4. Génération automatique de tous les documents : plan de situation (IGN), plan de masse pro (SVG vectoriel cartouché), plan de coupe, façades, notice descriptive (IA), insertion paysagère.
5. Dépôt en mairie via PLAT'AU ou service assisté PermitAI (199 €).

## 2) Personas
- **Particulier** : construit / agrandit sa maison, ne connaît pas le code de l'urbanisme.
- **Constructeur / artisan** : génère ses dossiers en série.
- **Architecte HMONP** : utilise PermitAI comme assistant pour gagner du temps.
- **Promoteur / SCI** (personne morale) : obligation d'architecte dès 1 m² — PermitAI fait le pré-cadrage.

## 3) Modules principaux
| Module | Status |
|---|---|
| Landing + tarifs + sign-in (Clerk) | ✅ MVP |
| Dashboard analyses historiques | ✅ MVP |
| Map cadastrale interactive (Leaflet + IGN) | ✅ MVP |
| Wizard CERFA dynamique (6 étapes) | ✅ Refondu 2026-02 |
| Indexation PLU 34 970 communes | 🟡 Partiel (script disponible) |
| Stripe abonnement + one-time | ✅ MVP (webhooks à finaliser) |
| Génération PCMI 1-8 / DP 1-7 / PDEMO / CU automatique | ✅ Refondu 2026-02 |
| Plan masse SVG niveau architecte | ✅ Refondu 2026-02 (`PlanMassePro.js`) |
| IA Claude Sonnet 4.5 (vision + texte) | ✅ Refondu 2026-02 (Emergent LLM Key) |
| Resend emails | 🔴 Clé manquante |

## 4) Refonte du 20 février 2026 (cette itération)
### a. Wizard CERFA dynamique
- **Avant** : pièces hardcodées dans `CERFA_DATA` (5 CERFAs basiques, pas de pièces conditionnelles).
- **Après** : `lib/cerfaLegalRules.js` est la source unique de vérité. Couvre 13406 (PCMI), 13409 (PC autres), 13703 (DP maison), 13404 (DP autres), 13405 (PDEMO), 13702 (CU). Pièces conditionnelles `si_neuf`, `si_abf`, `si_piscine`, `si_avant_1997`, `si_cub`, `si_extension_50`, `si_argile`, `si_natura`, `si_erp`, etc., filtrées via `getPiecesForCerfa(cerfaId, ctx)`.
- **Step 1 du wizard** : nouveau bouton **Démolition** + inputs conditionnels (`surface_bassin` + `hauteur_abri` pour piscine ; `surface_demolie` + `annee_construction` pour démolition avec alerte amiante < 1997 ; sélecteur `CUa` / `CUb` pour certificat).
- **Step 5** : `dynamicPieces = getPiecesForCerfa(cerfaId, ctxLegal)` → rendu conditionnel par `getGenerator(piece)` (plan_situation, plan_masse_pro, plan_coupe, plan_facade, notice_ia, insertion_paysagere, upload).
- **Step 6** : blocage du téléchargement ZIP si pièces obligatoires manquent (basé sur `p.obligatoire === true`).

### b. PlanMassePro / PlanCoupePro / PlanFacadePro (3 nouveaux composants SVG pro)
- **`components/PlanMassePro.js`** — Plan de masse SVG :
  - Géométrie IGN réelle (parcelle + bâtiments existants + voisins).
  - Zone constructible (recul voirie + reculs limites séparatives).
  - Projet hachuré bleu avec cotations + reculs cotés.
  - Annotations NGF, réseaux EP/EU, échelle graphique, flèche Nord.
  - **Cartouche professionnel** : maître d'ouvrage, terrain, projet, règles PLU, échelle, date.
  - Export **SVG vectoriel** + PNG haute résolution + layers toggleables.
- **`components/PlanCoupePro.js`** — Plan en coupe PCMI3/DP3 :
  - Terrain naturel (TN) + Terrain fini (TF) avec textures terre/béton.
  - Bâtiment existant (gris, toit 2 pans) + projet (bleu hachuré).
  - Toiture conditionnelle (2 pans / plat selon pente détectée par IA).
  - Cotations verticales (H façade, H totale, H max PLU).
  - **Verdict conformité PLU automatique** (✓/⚠ selon H projet vs H max).
  - Cartouche complet + échelle.
- **`components/PlanFacadePro.js`** — 4 façades PCMI5/DP4 :
  - Grille 2×2 (façade sud principale, nord, pignons est/ouest).
  - Textures matériaux selon analyse IA (brique, enduit, bois, pierre).
  - Toitures dimensionnées (tuile/ardoise/zinc/bac_acier).
  - Fenêtres positionnées + porte d'entrée (façade sud uniquement).
  - Cotations linéaires + cartouche matériaux.

### c. Export DOCX + PDF de la notice descriptive
- **`app/api/cerfa/notice-export/route.js`** — Endpoint POST qui génère un **DOCX Word natif** via la lib `docx` (couleurs PermitAI, sections stylées, page de garde, signature).
- **`NoticeArchi.downloadPdf()`** — Génère un PDF via `window.print()` stylé CSS @page A4 avec Georgia serif (zéro dépendance, prêt à imprimer).
- 3 boutons exposés dans le wizard step 5 : `notice-download-txt`, `notice-download-docx`, `notice-download-pdf`.

### d. Webhooks Stripe complets
- **`app/api/webhook/stripe/route.js`** refondu — gère **7 events** :
  - `checkout.session.completed` (création initiale via Stripe Checkout)
  - `customer.subscription.created` / `.updated` / `.deleted`
  - `invoice.paid` / `invoice.payment_succeeded` (renouvellements + reset crédits mensuels)
  - `invoice.payment_failed` (création d'alerte interne automatique)
- **Sync DB** : `User` (clerkId, stripeCustomerId, stripeSubscriptionId, plan, credits) **et** table `Subscription` séparée (historique + status + currentPeriodEnd).
- Mapping `priceId → plan` via env vars `STRIPE_PRICE_STARTER/PRO/CABINET` (fallback inclusion).
- Endpoint GET `/api/webhook/stripe` ajouté pour healthcheck (renvoie liste events configurés).

### e. Migration LLM → Emergent LLM Key
- **`lib/llm.js`** : helper unifié qui privilégie `EMERGENT_LLM_KEY` (proxy OpenAI-compatible sur `https://integrations.emergentagent.com/llm/chat/completions`) avec fallback Anthropic direct.
- **`app/api/cerfa/analyze-plan/route.js`** : passe désormais par `llmCall()` avec `claude-sonnet-4-5-20250929` (vision).
- **`app/api/cerfa/notice/route.js`** : idem, retourne `provider` + `model` + `ai_powered`.
- Conséquence : plus de dépendance à la clé Anthropic perso de l'utilisateur (qui n'avait plus de crédits).

## 5) Tests & validation
- `/app/backend/tests/test_cerfa_api.py` (pytest) — créé par l'agent de test : **6/6 PASS** sur les routes API critiques.
- Smoke test manuel UI : CERFA 13405 (PDEMO) affiche bien PD1..PD4, PD7 (amiante conditionnel) + TITRE en step 5.
- Emergent LLM Key validée pour vision + texte (logs : `ai_powered=true, provider=emergent, model=claude-sonnet-4-5-20250929`).

## 6) Backlog priorisé
### P0 — Reste à faire
- (vide pour l'instant)

### P1
- **Vraie géométrie IGN voisins** : `batimentsData.voisins` n'est pas peuplé par `/api/batiments` → enrichir pour que `PlanMassePro` affiche les bâtiments mitoyens.
- Intégration Resend (welcome + confirmation analyse) — clé valide requise.
- Page `/dashboard/billing` : afficher status Subscription, plan actif, crédits restants, bouton "Customer portal" Stripe.
- Indexation PLU 34 970 communes en arrière-plan (`scripts/index_ultra_fast.py`).
- Photomontage d'insertion paysagère (PCMI6) via Claude image generation (nano-banana).

### P2
- Découper `app/cerfa/wizard/page.js` (1300+ lignes) en sous-composants `components/wizard/Step{1..6}.js`.
- Tests E2E Playwright complets (toutes étapes 1 → 6).
- Internationalisation (anglais pour Belgique francophone + Suisse romande).

## 7) Variables d'environnement
| Clé | Usage | Statut |
|---|---|---|
| `EMERGENT_LLM_KEY` | Claude via proxy Emergent | ✅ |
| `ANTHROPIC_API_KEY` | Fallback (peut être vide) | ⚠️ Compte sans crédits |
| `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_*` | Auth | ✅ |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_*` | Paiements | ✅ |
| `DATABASE_URL` | Neon PostgreSQL via Prisma | ✅ |
| `RESEND_API_KEY` | Emails transactionnels | ⚠️ Placeholder |

## 8) Architecture clé
```
/app/
├── app/
│   ├── api/
│   │   ├── cadastre-proxy/route.ts      # Fetch IGN secure
│   │   ├── cerfa/
│   │   │   ├── analyze-plan/route.js    # Claude Vision via Emergent
│   │   │   ├── notice/route.js          # Claude texte via Emergent
│   │   │   └── all/route.js             # Liste CERFAs
│   │   ├── plu/query/route.js
│   │   ├── batiments/route.js
│   │   └── address/route.js             # BAN
│   ├── cerfa/
│   │   ├── page.js                      # Liste CERFA officielle
│   │   └── wizard/page.js               # Wizard 6 étapes dynamique
│   ├── analyse/page.js
│   ├── dashboard/page.js
│   └── page.js
├── components/
│   ├── PlanMassePro.js                  # NOUVEAU SVG pro
│   ├── PlanMasseAuto.js                 # Ancien Canvas (legacy)
│   ├── CerfaPiecesList.js               # Liste pièces dynamique (ctx-aware)
│   ├── LegalAlerts.js                   # Alertes RE2020/ABF/architecte
│   ├── MapCadastre.js                   # Leaflet IGN
│   └── ...
├── lib/
│   ├── llm.js                           # NOUVEAU helper unifié Emergent/Anthropic
│   ├── cerfaLegalRules.js               # SOT règles légales — refondu
│   ├── cerfaEngine.js / cerfaList.js
│   ├── db.js                            # Prisma client
│   └── pdfGenerator.js / texts.js / ...
└── prisma/schema.prisma
```
