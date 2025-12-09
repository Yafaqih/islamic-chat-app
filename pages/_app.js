// pages/_app.js
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { LanguageProvider } from '../contexts/LanguageContext'; // ✅ NOUVEAU
// ⚠️ SERVICE WORKER DÉSACTIVÉ TEMPORAIREMENT
// import useServiceWorker from '../lib/useServiceWorker';
// import UpdateNotification from '../components/UpdateNotification';
import '../styles/globals.css';

// ⚠️ CACHE BUSTER - Supprime tous les caches existants
function CacheBuster() {
  useEffect(() => {
    // Désinstaller tous les Service Workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
          console.log('🗑️ Service Worker désinstallé:', registration.scope);
        }
      });
    }

    // Vider tous les caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
          console.log('🗑️ Cache supprimé:', name);
        }
      });
    }
  }, []);

  return null;
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  // ⚠️ SERVICE WORKER DÉSACTIVÉ TEMPORAIREMENT
  // const { updateAvailable, isOnline, updateServiceWorker } = useServiceWorker();
  // const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  
  // Simuler isOnline pour garder la fonctionnalité hors-ligne
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ⚠️ DÉSACTIVÉ TEMPORAIREMENT
  // useEffect(() => {
  //   if (updateAvailable) {
  //     setShowUpdateNotification(true);
  //   }
  // }, [updateAvailable]);

  // const handleUpdate = () => updateServiceWorker();
  // const handleDismiss = () => setShowUpdateNotification(false);

  return (
    <SessionProvider session={session}>
      {/* ✅ NOUVEAU: Language Provider pour multilingue */}
      <LanguageProvider>
        {/* ⚠️ CACHE BUSTER - SUPPRIMER POUR LA PRODUCTION */}
        <CacheBuster />

        {/* ⚠️ NOTIFICATION MISE À JOUR DÉSACTIVÉE TEMPORAIREMENT */}
        {/* <UpdateNotification 
          show={showUpdateNotification}
          onUpdate={handleUpdate}
          onDismiss={handleDismiss}
        /> */}

        {/* Hors ligne */}
        {!isOnline && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[100] text-sm">
            📡 غير متصل بالإنترنت
          </div>
        )}

        {/* Conteneur principal */}
        <div className="min-h-screen w-full">
          <Component {...pageProps} />
        </div>
      </LanguageProvider>
    </SessionProvider>
  );
}

export default MyApp;


/*
==========================================
🚀 VERSION PRODUCTION - À RESTAURER PLUS TARD
==========================================

// pages/_app.js
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import useServiceWorker from '../lib/useServiceWorker';
import UpdateNotification from '../components/UpdateNotification';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const { updateAvailable, isOnline, updateServiceWorker } = useServiceWorker();
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdateNotification(true);
    }
  }, [updateAvailable]);

  const handleUpdate = () => updateServiceWorker();
  const handleDismiss = () => setShowUpdateNotification(false);

  return (
    <SessionProvider session={session}>
      <LanguageProvider>
        <UpdateNotification 
          show={showUpdateNotification}
          onUpdate={handleUpdate}
          onDismiss={handleDismiss}
        />

        {!isOnline && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[100] text-sm">
            📡 غير متصل بالإنترنت
          </div>
        )}

        <div className="min-h-screen w-full">
          <Component {...pageProps} />
        </div>
      </LanguageProvider>
    </SessionProvider>
  );
}

export default MyApp;

*/
