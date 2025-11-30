// pages/_app.js
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
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
      {/* Notification mise à jour */}
      <UpdateNotification 
        show={showUpdateNotification}
        onUpdate={handleUpdate}
        onDismiss={handleDismiss}
      />

      {/* Hors ligne */}
      {!isOnline && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-3 rounded-full shadow-2xl z-[100] text-sm font-bold">
          غير متصل بالإنترنت
        </div>
      )}

      {/* Conteneur principal responsive avec max-width et padding safe */}
      <div className="min-h-screen">
  <div className="w-full max-w-lg mx-auto px-4 pt-2 pb-28 sm:px-6 lg:px-8">
    <Component {...pageProps} />
  </div>
</div>
    </SessionProvider>
  );
}

export default MyApp;