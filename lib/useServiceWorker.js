// lib/useServiceWorker.js

import { useEffect, useState } from 'react';

export default function useServiceWorker() {
  const [registration, setRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Vérifier le support du Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Écouter les changements de connexion
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker enregistré:', reg);
      setRegistration(reg);

      // Vérifier les mises à jour toutes les heures
      setInterval(() => {
        reg.update();
      }, 60 * 60 * 1000);

      // Écouter les mises à jour
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nouvelle version disponible');
            setUpdateAvailable(true);
          }
        });
      });

      // Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message du SW:', event.data);
      });

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du SW:', error);
    }
  };

  const handleOnline = () => {
    console.log('Connexion rétablie');
    setIsOnline(true);
  };

  const handleOffline = () => {
    console.log('Connexion perdue');
    setIsOnline(false);
  };

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const clearCache = async () => {
    if ('serviceWorker' in navigator && registration) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Cache vidé');
    }
  };

  return {
    registration,
    updateAvailable,
    isOnline,
    updateServiceWorker,
    clearCache
  };
}