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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[100] text-sm">
          📡 غير متصل بالإنترنت
        </div>
      )}

      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;