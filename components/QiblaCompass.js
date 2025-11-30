import React, { useState, useEffect, useRef } from 'react';
import { Navigation, MapPin } from 'lucide-react';

export default function QiblaCompass() {
  const [heading, setHeading] = useState(0);
  const [smoothHeading, setSmoothHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [permission, setPermission] = useState('prompt');
  const [error, setError] = useState(null);
  const [isPointingToQibla, setIsPointingToQibla] = useState(false);
  const [showCompass, setShowCompass] = useState(false);
  const [compassSupported, setCompassSupported] = useState(true);
  const [lastVibrationTime, setLastVibrationTime] = useState(0);
  
  const headingBuffer = useRef([]);
  const BUFFER_SIZE = 5; // Moyenne sur 5 valeurs pour stabiliser

  // Coordonnées de la Kaaba à La Mecque
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  // Calculer la direction de la Qibla (méthode correcte)
  const calculateQiblaDirection = (userLat, userLng) => {
    const lat1 = userLat * Math.PI / 180;
    const lng1 = userLng * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;
    const lng2 = KAABA_LNG * Math.PI / 180;

    const dLng = lng2 - lng1;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - 
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x);
    bearing = bearing * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return Math.round(bearing);
  };

  // Lisser les valeurs du heading pour stabiliser la flèche
  const smoothHeadingValue = (newHeading) => {
    headingBuffer.current.push(newHeading);
    
    if (headingBuffer.current.length > BUFFER_SIZE) {
      headingBuffer.current.shift();
    }

    // Gérer le problème du 0°/360° (nord)
    let sum = 0;
    let count = headingBuffer.current.length;
    
    // Si on a des valeurs autour de 0/360, ajuster
    const hasLowValues = headingBuffer.current.some(h => h < 90);
    const hasHighValues = headingBuffer.current.some(h => h > 270);
    
    if (hasLowValues && hasHighValues) {
      // On est autour du nord, normaliser
      sum = headingBuffer.current.reduce((acc, h) => {
        return acc + (h < 180 ? h + 360 : h);
      }, 0);
      let avg = sum / count;
      if (avg >= 360) avg -= 360;
      return avg;
    } else {
      // Moyenne simple
      sum = headingBuffer.current.reduce((acc, h) => acc + h, 0);
      return sum / count;
    }
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

    if (!('DeviceOrientationEvent' in window)) {
      setCompassSupported(false);
      setError('La boussole n\'est pas supportée sur cet appareil');
      return;
    }

    const startOrientationTracking = () => {
      orientationHandler = (event) => {
        let compassHeading = null;

        if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
          compassHeading = event.webkitCompassHeading;
          hasReceivedData = true;
        }
        else if (event.alpha !== null && event.alpha !== undefined) {
          compassHeading = event.alpha;
          hasReceivedData = true;
        }

        if (compassHeading !== null) {
          setHeading(compassHeading);
          const smoothed = smoothHeadingValue(compassHeading);
          setSmoothHeading(smoothed);
        }
      };

      window.addEventListener('deviceorientationabsolute', orientationHandler, true);
      window.addEventListener('deviceorientation', orientationHandler, true);

      setTimeout(() => {
        if (!hasReceivedData) {
          setError('Aucune donnée de boussole reçue. Assurez-vous que votre appareil a un capteur de boussole.');
        }
      }, 2000);
    };

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
      startOrientationTracking();
    }

    return () => {
      if (orientationHandler) {
        window.removeEventListener('deviceorientationabsolute', orientationHandler, true);
        window.removeEventListener('deviceorientation', orientationHandler, true);
      }
    };
  }, [showCompass]);

  // Vérifier si on pointe vers la Qibla avec vibration améliorée
  useEffect(() => {
    if (qiblaDirection !== null && smoothHeading !== null) {
      const diff = Math.abs(smoothHeading - qiblaDirection);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      
      const isPointing = normalizedDiff < 15;
      setIsPointingToQibla(isPointing);

      // Vibration avec délai pour éviter vibrations continues
      const now = Date.now();
      const timeSinceLastVibration = now - lastVibrationTime;
      
      if ('vibrate' in navigator && timeSinceLastVibration > 1000) {
        if (isPointing) {
          // Vibration forte quand on pointe exactement
          try {
            navigator.vibrate([200, 100, 200]);
            setLastVibrationTime(now);
            console.log('Vibration: pointing to Qibla');
          } catch (e) {
            console.log('Vibration failed:', e);
          }
        } else if (normalizedDiff < 25 && timeSinceLastVibration > 2000) {
          // Vibration moyenne quand on est proche
          try {
            navigator.vibrate(100);
            setLastVibrationTime(now);
            console.log('Vibration: close to Qibla');
          } catch (e) {
            console.log('Vibration failed:', e);
          }
        } else if (normalizedDiff < 35 && timeSinceLastVibration > 3000) {
          // Vibration légère quand on commence à approcher
          try {
            navigator.vibrate(50);
            setLastVibrationTime(now);
            console.log('Vibration: approaching Qibla');
          } catch (e) {
            console.log('Vibration failed:', e);
          }
        }
      }
    }
  }, [smoothHeading, qiblaDirection, lastVibrationTime]);

  // Test de vibration manuel
  const testVibration = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 200]);
        alert('Test de vibration lancé ! Si vous ne sentez rien, vérifiez que votre téléphone n\'est pas en mode silencieux.');
      } catch (e) {
        alert('Erreur vibration: ' + e.message);
      }
    } else {
      alert('La vibration n\'est pas supportée sur cet appareil');
    }
  };

  const arrowRotation = qiblaDirection !== null && smoothHeading !== null 
    ? qiblaDirection - smoothHeading 
    : 0;

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
        className="fixed bottom-[140px] sm:bottom-32 right-4 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 hover:scale-110"
        title="البوصلة - Qibla"
        aria-label="فتح بوصلة القبلة"
      >
        <Navigation className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
        <button
          onClick={() => setShowCompass(false)}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

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
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors block w-full mb-2"
            >
              إعادة المحاولة
            </button>
            <button
              onClick={testVibration}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors block w-full text-sm"
            >
              اختبار الاهتزاز
            </button>
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
              <div>اتجاهك: {Math.round(smoothHeading)}° | القبلة: {qiblaDirection}°</div>
              <div>الفرق: {Math.round(Math.abs(smoothHeading - qiblaDirection))}°</div>
            </div>

            {/* Boussole */}
            <div className="relative w-64 h-64 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-red-600">N</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">S</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">W</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">E</div>
              </div>

              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  isPointingToQibla ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-4xl">🕋</span>
                </div>
              </div>

              {/* Flèche avec transition smooth */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ 
                  transform: `rotate(${arrowRotation}deg)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <div className={`transition-colors duration-300 ${
                  isPointingToQibla ? 'text-green-500' : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                  </svg>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
            </div>

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

              <button
                onClick={testVibration}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
              >
                اختبار الاهتزاز
              </button>

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