// pages/_app.js
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LanguageProvider } from '../contexts/LanguageContext';
import Script from 'next/script';
import * as gtag from '../lib/gtag';
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
  const router = useRouter();
  
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

  // 📊 GOOGLE ANALYTICS - Tracker les changements de page
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // ⚠️ DÉSACTIVÉ TEMPORAIREMENT
  // useEffect(() => {
  //   if (updateAvailable) {
  //     setShowUpdateNotification(true);
  //   }
  // }, [updateAvailable]);

  // const handleUpdate = () => updateServiceWorker();
  // const handleDismiss = () => setShowUpdateNotification(false);

  return (
    <>
      {/* ✅ GOOGLE ANALYTICS - G-R4N29NRJ6Z */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-R4N29NRJ6Z"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R4N29NRJ6Z', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <SessionProvider session={session}>
        {/* ✅ Language Provider pour multilingue */}
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
    </>
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
import { useRouter } from 'next/router';
import { LanguageProvider } from '../contexts/LanguageContext';
import Script from 'next/script';
import * as gtag from '../lib/gtag';
import useServiceWorker from '../lib/useServiceWorker';
import UpdateNotification from '../components/UpdateNotification';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const { updateAvailable, isOnline, updateServiceWorker } = useServiceWorker();
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // 📊 Google Analytics - page tracking
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdateNotification(true);
    }
  }, [updateAvailable]);

  const handleUpdate = () => updateServiceWorker();
  const handleDismiss = () => setShowUpdateNotification(false);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-R4N29NRJ6Z"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R4N29NRJ6Z', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

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
    </>
  );
}

export default MyApp;

*/
