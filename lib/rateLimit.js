import { LRUCache } from 'lru-cache';

// Configuration des rate limiters
const rateLimiters = {
  // API Chat: 10 requêtes par minute
  chat: new LRUCache({
    max: 500, // Maximum 500 utilisateurs en cache
    ttl: 60 * 1000, // 1 minute
  }),

  // API Signup: 5 inscriptions par heure par IP
  signup: new LRUCache({
    max: 1000,
    ttl: 60 * 60 * 1000, // 1 heure
  }),

  // API Auth: 10 tentatives par 15 minutes par IP
  auth: new LRUCache({
    max: 1000,
    ttl: 15 * 60 * 1000, // 15 minutes
  }),

  // API générale: 100 requêtes par minute par IP
  general: new LRUCache({
    max: 1000,
    ttl: 60 * 1000, // 1 minute
  }),
};

/**
 * Vérifie le rate limit pour une clé donnée
 * @param {string} type - Type de rate limiter (chat, signup, auth, general)
 * @param {string} key - Clé unique (userId, IP, etc.)
 * @param {number} limit - Nombre maximum de requêtes autorisées
 * @returns {Object} { success: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(type, key, limit) {
  const limiter = rateLimiters[type];
  
  if (!limiter) {
    throw new Error(`Rate limiter type "${type}" not found`);
  }

  const tokenCount = limiter.get(key) || 0;
  const remaining = Math.max(0, limit - tokenCount - 1);

  if (tokenCount >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: Date.now() + limiter.ttl,
      retryAfter: Math.ceil(limiter.ttl / 1000), // en secondes
    };
  }

  limiter.set(key, tokenCount + 1);

  return {
    success: true,
    remaining,
    resetAt: Date.now() + limiter.ttl,
  };
}

/**
 * Récupère l'IP du client
 * @param {Object} req - Objet request de Next.js
 * @returns {string} Adresse IP du client
 */
export function getClientIp(req) {
  // Vérifier les headers de proxy (Vercel, Cloudflare, etc.)
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  if (forwarded) {
    // x-forwarded-for peut contenir plusieurs IPs, prendre la première
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Middleware de rate limiting pour Next.js API routes
 * @param {string} type - Type de rate limiter
 * @param {number} limit - Limite de requêtes
 * @param {Function} keyFn - Fonction pour générer la clé (optionnel)
 */
export function rateLimitMiddleware(type, limit, keyFn = null) {
  return (req, res, handler) => {
    // Générer la clé
    const key = keyFn ? keyFn(req) : getClientIp(req);
    
    // Vérifier le rate limit
    const result = checkRateLimit(type, key, limit);

    // Ajouter les headers de rate limiting
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetAt);

    if (!result.success) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        error: 'Trop de requêtes',
        message: `Vous avez dépassé la limite de ${limit} requêtes. Veuillez réessayer dans ${result.retryAfter} secondes.`,
        retryAfter: result.retryAfter,
        resetAt: result.resetAt,
      });
    }

    // Continuer vers le handler
    return handler(req, res);
  };
}

/**
 * Helper pour appliquer le rate limiting dans une API route
 */
export async function withRateLimit(req, res, type, limit, keyFn = null) {
  const key = keyFn ? keyFn(req) : getClientIp(req);
  const result = checkRateLimit(type, key, limit);

  // Ajouter les headers
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetAt);

  if (!result.success) {
    res.setHeader('Retry-After', result.retryAfter);
    res.status(429).json({
      error: 'Trop de requêtes',
      message: `Vous avez dépassé la limite de ${limit} requêtes. Veuillez réessayer dans ${result.retryAfter} secondes.`,
      retryAfter: result.retryAfter,
      resetAt: result.resetAt,
    });
    return false;
  }

  return true;
}