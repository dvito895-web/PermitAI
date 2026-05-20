# PermitAI — Changelog

## 20 février 2026 — Itération P1 Phase A

### Nouvelles fonctionnalités
- **`/dashboard/billing`** : page Subscription complète avec plan actuel, crédits restants, prochaine facturation, IDs Stripe, et bouton "Gérer mon abonnement" (Stripe Customer Portal).
- **API `/api/me/subscription`** : retourne `{authenticated, plan, status, credits, credits_used, limit, stripe_*}`.
- **API `/api/stripe/portal`** : crée une session Stripe billingPortal pour gestion abonnement (changement plan, factures, moyen de paiement).
- **PCMI6 Photomontage IA** : nouveau composant `PhotomontagePCMI6.js` + endpoint `/api/cerfa/photomontage` qui utilise **Gemini Nano Banana 3.1** (via Emergent LLM Key) pour insérer photoréalistement le projet dans une photo du paysage existant. Prompt HMONP soigné (style, matériaux, couleurs, toiture).
- **API `/api/batiments` enrichie** : retourne désormais **12 parcelles voisines** réelles (IGN apicarto avec `geom=Polygon` pour filtrage spatial fiable). Parcelle principale sélectionnée par proximité (centroïde le plus proche du point requis). Validé sur Lyon (49m), Caluire (32m), Bordeaux (37m).
- **Script `index_plu_production_v2.py`** : indexation PLU parallélisée (Semaphore, 20 concurrent), fetch zonage IGN GPU réel par commune (au lieu de règles génériques), checkpoint progress, logging fichier, retry exponentiel.

### Améliorations
- **`lib/llm.js`** : ajout `generateImage({prompt, referenceImageBase64})` pour Gemini Nano Banana via Emergent proxy. Send text + image en 2 messages séparés (format requis par litellm/gemini multimodal).
- **`middleware.ts`** : `/api/me/subscription` et `/api/stripe/portal` ajoutés aux routes publiques (avec auth check interne) pour retourner du JSON propre même sans session.
- **Sidebar dashboard** : nouveau bouton "Gérer mon abonnement" → `/dashboard/billing`.

### Tests
- **Backend 12/12 PASS** (`testing_agent_v3_fork` iteration_2.json) :
  - Photomontage Nano Banana → JPEG ~600KB généré avec succès
  - Batiments enrichis (12 voisins, parcelle géolocalisée correctement)
  - Subscription + Portal retournent JSON propre
  - Régressions analyze-plan + notice + webhook stripe OK
- Frontend : data-testids validés en static (Clerk middleware empêche test E2E sans session)

## 20 février 2026 — Itération P1 (initiale)

- PlanCoupePro + PlanFacadePro (SVG vectoriel pro)
- Export notice DOCX + PDF stylé
- Webhooks Stripe complets (7 events)

## 20 février 2026 — Itération P0

- Wizard CERFA dynamique (PIECES_PAR_CERFA pour 13406/13409/13703/13404/13405/13702)
- PlanMassePro (SVG architecte HMONP avec cartouche)
- Migration LLM vers Emergent LLM Key (`lib/llm.js`)
