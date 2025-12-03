// public/sw.js - SERVICE WORKER DÉSACTIVÉ TEMPORAIREMENT
// ⚠️ Ce fichier désactive le cache pour les tests
// ⚠️ Remplacer par sw-production.js pour le lancement officiel

const CACHE_VERSION = 'yafaqih-disabled';

// Installation - Skip immédiatement
self.addEventListener('install', (event) => {
  console.log('[SW] ⚠️ Mode test - Cache désactivé');
  self.skipWaiting();
});

// Activation - Supprimer TOUS les caches existants
self.addEventListener('activate', (event) => {
  console.log('[SW] 🗑️ Suppression de tous les caches...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Suppression:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[SW] ✅ Tous les caches supprimés');
        return self.clients.claim();
      })
  );
});

// Fetch - Laisser passer TOUTES les requêtes au réseau (pas de cache)
self.addEventListener('fetch', (event) => {
  // Ne rien intercepter - tout va directement au réseau
  return;
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});