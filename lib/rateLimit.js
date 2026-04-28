// Rate limiting simple en mémoire
// Pour production : utiliser Redis ou Upstash

const rateLimit = new Map();

const RATE_LIMITS = {
  '/api/plu/query': { max: 10, window: 60000 }, // 10 req/min
  '/api/analyses': { max: 20, window: 60000 },
  '/api/cerfa': { max: 50, window: 60000 },
  default: { max: 100, window: 60000 },
};

export function checkRateLimit(ip, route) {
  const now = Date.now();
  const key = `${ip}:${route}`;
  
  // Déterminer les limites
  const limits = RATE_LIMITS[route] || RATE_LIMITS.default;
  
  // Récupérer ou initialiser le compteur
  const record = rateLimit.get(key) || { count: 0, resetTime: now + limits.window };
  
  // Reset si la fenêtre est expirée
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + limits.window;
  }
  
  // Incrémenter
  record.count += 1;
  rateLimit.set(key, record);
  
  // Vérifier la limite
  if (record.count > limits.max) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }
  
  return {
    allowed: true,
    remaining: limits.max - record.count,
    resetTime: record.resetTime,
  };
}

// Nettoyage périodique de la map (éviter memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimit.entries()) {
    if (now > record.resetTime) {
      rateLimit.delete(key);
    }
  }
}, 60000); // Nettoyer toutes les minutes
