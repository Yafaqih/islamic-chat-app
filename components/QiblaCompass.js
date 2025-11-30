import React, { useState, useEffect } from 'react';
import { Navigation, MapPin } from 'lucide-react';

export default function QiblaCompass() {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [permission, setPermission] = useState('prompt');
  const [error, setError] = useState(null);
  const [isPointingToQibla, setIsPointingToQibla] = useState(false);
  const [showCompass, setShowCompass] = useState(false);

  // Coordonnées de la Kaaba à La Mecque
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  // Calculer la direction de la Qibla
  const calculateQiblaDirection = (lat, lng) => {
    const phiK = KAABA_LAT * Math.PI / 180.0;
    const lambdaK = KAABA_LNG * Math.PI / 180.0;
    const phi = lat * Math.PI / 180.0;
    const lambda = lng * Math.PI / 180.0;
    const psi = 180.0 / Math.PI * Math.atan2(Math.sin(lambdaK - lambda), Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda));
    return Math.round(psi < 0 ? psi + 360 : psi);
  };

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const qibla = calculateQiblaDirection(latitude, longitude);
          setQiblaDirection(qibla);
          setPermission('granted');
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Impossible d\'obtenir votre position');
          setPermission('denied');
        }
      );
    } else {
      setError('La géolocalisation n\'est pas supportée');
      setPermission('denied');
    }
  }, []);

  // Gérer l'orientation du téléphone
  useEffect(() => {
    let orientationHandler;

    if ('DeviceOrientationEvent' in window) {
      // iOS 13+ nécessite une permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              startOrientationTracking();
            }
          })
          .catch(console.error);
      } else {
        // Android et anciens navigateurs
        startOrientationTracking();
      }
    }

    function startOrientationTracking() {
      orientationHandler = (event) => {
        let compassHeading = event.alpha; // 0-360 degrés
        
        // Pour iOS, utiliser webkitCompassHeading si disponible
        if (event.webkitCompassHeading) {
          compassHeading = event.webkitCompassHeading;
        }

        if (compassHeading !== null) {
          setHeading(compassHeading);
        }
      };

      window.addEventListener('deviceorientation', orientationHandler);
    }

    return () => {
      if (orientationHandler) {
        window.removeEventListener('deviceorientation', orientationHandler);
      }
    };
  }, []);

  // Vérifier si on pointe vers la Qibla (±10 degrés)
  useEffect(() => {
    if (qiblaDirection !== null) {
      const diff = Math.abs(heading - qiblaDirection);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      
      const isPointing = normalizedDiff < 10;
      setIsPointingToQibla(isPointing);

      // Vibration progressive quand on s'approche
      if ('vibrate' in navigator) {
        if (isPointing) {
          // Vibration continue quand on pointe exactement
          navigator.vibrate([100, 50, 100]);
        } else if (normalizedDiff < 20) {
          // Vibration légère quand on est proche
          navigator.vibrate(50);
        } else if (normalizedDiff < 30) {
          // Vibration très légère quand on commence à approcher
          navigator.vibrate(20);
        }
      }
    }
  }, [heading, qiblaDirection]);

  // Calculer l'angle de rotation de la flèche
  const arrowRotation = qiblaDirection !== null ? qiblaDirection - heading : 0;

  if (!showCompass) {
    return (
      <button
        onClick={() => setShowCompass(true)}
        className="fixed bottom-20 left-4 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40"
        title="البوصلة - Qibla"
      >
        <Navigation className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
        {/* Bouton fermer */}
        <button
          onClick={() => setShowCompass(false)}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Titre */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            اتجاه القبلة
          </h2>
          {userLocation && (
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>
                {userLocation.lat.toFixed(2)}°, {userLocation.lng.toFixed(2)}°
              </span>
            </div>
          )}
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : qiblaDirection === null ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جاري تحديد الموقع...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Boussole */}
            <div className="relative w-64 h-64 mx-auto">
              {/* Cercle extérieur de la boussole */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                {/* Marqueurs cardinaux */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">N</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">S</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">W</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">E</div>
              </div>

              {/* Image de la Kaaba (visible quand on pointe vers la Qibla) */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  isPointingToQibla ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-4xl">🕋</span>
                </div>
              </div>

              {/* Flèche pointant vers la Qibla */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              >
                <div className={`transition-colors duration-300 ${
                  isPointingToQibla ? 'text-green-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                  </svg>
                </div>
              </div>

              {/* Point central */}
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
            </div>

            {/* Informations */}
            <div className="text-center space-y-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">اتجاه القبلة</div>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                  {qiblaDirection}°
                </div>
              </div>

              {isPointingToQibla && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-3 animate-pulse">
                  <p className="text-green-700 dark:text-green-300 font-semibold text-lg">
                    ✅ تم توجيهك نحو القبلة
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">
                قم بتحريك جهازك ببطء حتى تظهر الكعبة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}