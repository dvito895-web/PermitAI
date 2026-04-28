# OPTIMISATIONS PERFORMANCE & QUALITÉ - PRIORITÉ 12

## ✅ Implémenté

### 1. **CSP Headers** (Content Security Policy)
- Ajouté dans `next.config.js`
- Protection XSS, clickjacking, injection de code
- Whitelist stricte pour scripts, styles, frames

### 2. **Headers de Sécurité**
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)
- `Permissions-Policy` (désactive caméra, micro, géolocalisation)

### 3. **Images WebP/AVIF**
- Next.js Image Optimization activée
- Formats modernes : `image/avif`, `image/webp`
- Compression automatique

### 4. **Rate Limiting**
- Fichier `/lib/rateLimit.js` créé
- Limites par route API :
  - `/api/plu/query`: 10 req/min
  - `/api/analyses`: 20 req/min
  - `/api/cerfa`: 50 req/min
  - Défaut : 100 req/min
- En mémoire (pour production : utiliser Redis/Upstash)

### 5. **Optimisations Next.js**
- Compression activée (`compress: true`)
- `poweredByHeader: false` (masque version Next.js)
- React Strict Mode activé
- Image lazy loading par défaut

## 🔧 À Configurer en Production

### 1. **Redis Cache** (optionnel)
Pour implémenter le cache Redis :

```bash
npm install ioredis
```

```javascript
// lib/redis.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedPLU(communeCode) {
  const key = `plu:${communeCode}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  // Fetch from DB
  const plu = await fetchPLUFromDB(communeCode);
  
  // Cache 24h
  await redis.setex(key, 86400, JSON.stringify(plu));
  return plu;
}
```

### 2. **Upstash Rate Limiting** (recommandé pour production)

```bash
npm install @upstash/ratelimit @upstash/redis
```

```javascript
// lib/rateLimitUpstash.js
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});
```

### 3. **CDN** (recommandé)
- Utiliser Vercel Edge Network (inclus avec Vercel)
- Ou Cloudflare CDN pour assets statiques

### 4. **Monitoring**
- Activer Vercel Analytics (déjà inclus)
- Plausible Analytics (déjà intégré)
- Sentry pour error tracking (optionnel)

## 📊 Métriques de Performance

### Lighthouse Score Attendu (après optimisations)
- **Performance** : 90+
- **Accessibility** : 95+
- **Best Practices** : 95+
- **SEO** : 100

### Web Vitals Cibles
- **LCP** (Largest Contentful Paint) : < 2.5s
- **FID** (First Input Delay) : < 100ms
- **CLS** (Cumulative Layout Shift) : < 0.1

## 🚀 Optimisations Futures (P13+)

1. **Service Worker** : Cache offline des PLU consultés
2. **Prefetch dynamique** : Précharger les communes voisines
3. **Lazy loading routes** : Code splitting avancé
4. **Database indexing** : Index sur `commune_code`, `zone`, `article`
5. **Full-text search** : PostgreSQL `tsvector` pour recherche PLU
6. **Image CDN externe** : Cloudinary ou Imgix

## 📝 ENV Vars Additionnelles (Production)

```bash
# Redis (si utilisé)
REDIS_URL=redis://...

# Upstash (recommandé pour rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Sentry (error tracking optionnel)
SENTRY_DSN=https://...
```
