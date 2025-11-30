// pages/_app.js
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
import useServiceWorker from '../lib/useServiceWorker';
import UpdateNotification from '../components/UpdateNotification';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const { updateAvailable, isOnline, updateServiceWorker } = useServiceWorker();
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdateNotification(true);
    }
  }, [updateAvailable]);

  const handleUpdate = () => {
    updateServiceWorker();
  };

  const handleDismiss = () => {
    setShowUpdateNotification(false);
  };

  return (
    <SessionProvider session={session}>
      {/* Notification de mise à jour */}
      <UpdateNotification
        show={showUpdateNotification}
        onUpdate={handleUpdate}
        onDismiss={handleDismiss}
      />

      {/* Indicateur hors ligne */}
      {!isOnline && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl z-[9999] text-sm font-bold animate-pulse">
          غير متصل بالإنترنت
        </div>
      )}

      {/* CONTENEUR PRINCIPAL – LA CLÉ DE TOUT */}
      <div className="w-full min-h-screen bg-gradient-to-b from-islamic-dark to-black text-white">
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
}