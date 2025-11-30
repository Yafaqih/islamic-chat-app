// public/sw.js - Service Worker pour caching

const CACHE_VERSION = 'yafaqih-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Fichiers à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html'
];

// Durées de cache (en millisecondes)
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60 * 1000,      // 7 jours
  api: 5 * 60 * 1000,                    // 5 minutes
  prayerTimes: 24 * 60 * 60 * 1000,     // 24 heures
  dynamic: 60 * 60 * 1000                // 1 heure
};

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('yafaqih-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégies de caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes externes (sauf API Aladhan)
  if (!url.origin.includes(self.location.origin) && !url.origin.includes('aladhan.com')) {
    return;
  }

  // Stratégie Cache First pour les assets statiques
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Stratégie Stale-While-Revalidate pour l'API Aladhan (horaires de prière)
  if (url.href.includes('aladhan.com')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE, CACHE_DURATIONS.prayerTimes));
    return;
  }

  // Stratégie Network First pour les API internes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, CACHE_DURATIONS.api));
    return;
  }

  // Stratégie Cache First avec fallback réseau pour le reste
  event.respondWith(cacheFirstWithRefresh(request, DYNAMIC_CACHE));
});

// Vérifier si c'est un asset statique
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/);
}

// Stratégie 1: Cache First (pour assets statiques)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }
  
  console.log('[SW] Cache miss, fetching:', request.url);
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

// Stratégie 2: Network First (pour API)
async function networkFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('[SW] Fetching from network:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      // Ajouter timestamp pour expiration
      const clonedResponse = response.clone();
      const body = await clonedResponse.blob();
      const headers = new Headers(clonedResponse.headers);
      headers.append('sw-cached-at', Date.now().toString());
      
      const cachedResponse = new Response(body, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: headers
      });
      
      cache.put(request, cachedResponse);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      // Vérifier si le cache n'est pas expiré
      const cachedAt = parseInt(cached.headers.get('sw-cached-at') || '0');
      const age = Date.now() - cachedAt;
      
      if (age < maxAge) {
        console.log('[SW] Using cached response');
        return cached;
      }
    }
    
    throw error;
  }
}

// Stratégie 3: Stale-While-Revalidate (pour données qui changent peu)
async function staleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch en arrière-plan
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const clonedResponse = response.clone();
        const body = clonedResponse.blob();
        body.then((blob) => {
          const headers = new Headers(clonedResponse.headers);
          headers.append('sw-cached-at', Date.now().toString());
          
          const cachedResponse = new Response(blob, {
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers: headers
          });
          
          cache.put(request, cachedResponse);
        });
      }
      return response;
    })
    .catch(() => null);
  
  // Retourner le cache immédiatement s'il existe
  if (cached) {
    const cachedAt = parseInt(cached.headers.get('sw-cached-at') || '0');
    const age = Date.now() - cachedAt;
    
    if (age < maxAge) {
      console.log('[SW] Serving from cache, refreshing in background');
      return cached;
    }
  }
  
  // Sinon attendre le fetch
  return fetchPromise || cached || fetch(request);
}

// Stratégie 4: Cache First avec refresh en arrière-plan
async function cacheFirstWithRefresh(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Refresh en arrière-plan
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  
  return cached || fetchPromise || fetch(request);
}

// Message handler pour clear cache
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});