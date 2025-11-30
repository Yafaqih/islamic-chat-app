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
  const [compassSupported, setCompassSupported] = useState(true);

  // Coordonnées de la Kaaba à La Mecque
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  // Calculer la direction de la Qibla (méthode correcte)
  const calculateQiblaDirection = (userLat, userLng) => {
    // Convertir en radians
    const lat1 = userLat * Math.PI / 180;
    const lng1 = userLng * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;
    const lng2 = KAABA_LNG * Math.PI / 180;

    // Différence de longitude
    const dLng = lng2 - lng1;

    // Formule de bearing (relèvement)
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - 
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x);
    
    // Convertir en degrés
    bearing = bearing * 180 / Math.PI;
    
    // Normaliser entre 0 et 360
    bearing = (bearing + 360) % 360;
    
    return Math.round(bearing);
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
          console.log('User location:', latitude, longitude);
          console.log('Qibla direction:', qibla);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Impossible d\'obtenir votre position');
          setPermission('denied');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('La géolocalisation n\'est pas supportée');
      setPermission('denied');
    }
  }, []);

  // Gérer l'orientation du téléphone
  useEffect(() => {
    if (!showCompass) return;

    let orientationHandler;
    let hasReceivedData = false;

    // Vérifier le support de DeviceOrientationEvent
    if (!('DeviceOrientationEvent' in window)) {
      setCompassSupported(false);
      setError('La boussole n\'est pas supportée sur cet appareil');
      return;
    }

    const startOrientationTracking = () => {
      orientationHandler = (event) => {
        let compassHeading = null;

        // Pour iOS, utiliser webkitCompassHeading (vrai nord magnétique)
        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
          // webkitCompassHeading donne déjà la bonne direction (0 = Nord)
          compassHeading = event.webkitCompassHeading;
          hasReceivedData = true;
        }
        // Pour Android, utiliser alpha avec correction
        else if (event.alpha !== null && event.alpha !== undefined) {
          // alpha: 0 = Nord, augmente dans le sens horaire
          compassHeading = event.alpha;
          hasReceivedData = true;
        }

        if (compassHeading !== null) {
          setHeading(compassHeading);
          console.log('Current heading:', compassHeading);
        }
      };

      window.addEventListener('deviceorientationabsolute', orientationHandler, true);
      window.addEventListener('deviceorientation', orientationHandler, true);

      // Vérifier après 2 secondes si on reçoit des données
      setTimeout(() => {
        if (!hasReceivedData) {
          setError('Aucune donnée de boussole reçue. Assurez-vous que votre appareil a un capteur de boussole.');
        }
      }, 2000);
    };

    // Pour iOS 13+, demander la permission
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            startOrientationTracking();
          } else {
            setError('Permission de la boussole refusée. Veuillez autoriser l\'accès dans les paramètres.');
            setCompassSupported(false);
          }
        })
        .catch(err => {
          console.error('Permission error:', err);
          setError('Erreur lors de la demande de permission');
          setCompassSupported(false);
        });
    } else {
      // Pour Android et anciens iOS
      startOrientationTracking();
    }

    return () => {
      if (orientationHandler) {
        window.removeEventListener('deviceorientationabsolute', orientationHandler, true);
        window.removeEventListener('deviceorientation', orientationHandler, true);
      }
    };
  }, [showCompass]);

  // Vérifier si on pointe vers la Qibla (±15 degrés pour être plus tolérant)
  useEffect(() => {
    if (qiblaDirection !== null && heading !== null) {
      const diff = Math.abs(heading - qiblaDirection);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      
      const isPointing = normalizedDiff < 15; // Plus tolérant: 15° au lieu de 10°
      setIsPointingToQibla(isPointing);

      // Vibration progressive quand on s'approche
      if ('vibrate' in navigator) {
        if (isPointing) {
          // Vibration continue quand on pointe exactement
          navigator.vibrate([100, 50, 100]);
        } else if (normalizedDiff < 25) {
          // Vibration légère quand on est proche
          navigator.vibrate(50);
        } else if (normalizedDiff < 35) {
          // Vibration très légère quand on commence à approcher
          navigator.vibrate(20);
        }
      }
    }
  }, [heading, qiblaDirection]);

  // Calculer l'angle de rotation de la flèche
  // La flèche doit pointer vers la Qibla par rapport au nord actuel
  const arrowRotation = qiblaDirection !== null && heading !== null 
    ? qiblaDirection - heading 
    : 0;

  // Bouton pour demander la permission (iOS)
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          setError(null);
          setCompassSupported(true);
        } else {
          setError('Permission refusée. Veuillez autoriser l\'accès à la boussole dans les paramètres de Safari.');
        }
      } catch (err) {
        setError('Erreur lors de la demande de permission');
      }
    }
  };

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
                {userLocation.lat.toFixed(4)}°, {userLocation.lng.toFixed(4)}°
              </span>
            </div>
          )}
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4 text-sm">{error}</p>
            {typeof DeviceOrientationEvent.requestPermission === 'function' && (
              <button
                onClick={requestPermission}
                className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors font-semibold mb-2"
              >
                السماح بالوصول إلى البوصلة
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors block w-full"
            >
              إعادة المحاولة
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              {typeof DeviceOrientationEvent.requestPermission === 'function' 
                ? 'Sur iOS : Paramètres → Safari → Mouvement et orientation → Autoriser'
                : 'Assurez-vous que votre appareil a un capteur de boussole'}
            </p>
          </div>
        ) : qiblaDirection === null ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جاري تحديد الموقع...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Debug info */}
            <div className="text-xs text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
              <div>موقعك: {userLocation.lat.toFixed(2)}°N, {userLocation.lng.toFixed(2)}°E</div>
              <div>اتجاهك الحالي: {Math.round(heading)}°</div>
              <div>اتجاه القبلة: {qiblaDirection}°</div>
              <div>الفرق: {Math.round(Math.abs(heading - qiblaDirection))}°</div>
            </div>

            {/* Boussole */}
            <div className="relative w-64 h-64 mx-auto">
              {/* Cercle extérieur de la boussole */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                {/* Marqueurs cardinaux */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-red-600">N</div>
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