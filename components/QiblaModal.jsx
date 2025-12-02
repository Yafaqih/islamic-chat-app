import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin } from 'lucide-react';

/**
 * QiblaModal - Boussole Qibla (modèle préféré)
 */
export default function QiblaModal({ isOpen, onClose }) {
  const [heading, setHeading] = useState(0);
  const [smoothHeading, setSmoothHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isPointingToQibla, setIsPointingToQibla] = useState(false);
  const [compassSupported, setCompassSupported] = useState(true);
  const [lastVibrationTime, setLastVibrationTime] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const headingBuffer = useRef([]);
  const BUFFER_SIZE = 5;

  // Coordonnées de la Kaaba
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  // Calculer la direction de la Qibla
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

  // Calculer la distance jusqu'à la Mecque
  const calculateDistance = (lat, lng) => {
    const R = 6371;
    const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
    const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) * Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
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
    
    const hasLowValues = headingBuffer.current.some(h => h < 90);
    const hasHighValues = headingBuffer.current.some(h => h > 270);
    
    if (hasLowValues && hasHighValues) {
      sum = headingBuffer.current.reduce((acc, h) => {
        return acc + (h < 180 ? h + 360 : h);
      }, 0);
      let avg = sum / count;
      if (avg >= 360) avg -= 360;
      return avg;
    } else {
      sum = headingBuffer.current.reduce((acc, h) => acc + h, 0);
      return sum / count;
    }
  };

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);
    headingBuffer.current = [];

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const qibla = calculateQiblaDirection(latitude, longitude);
          setQiblaDirection(qibla);
          setLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('يرجى السماح بالوصول إلى موقعك');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('الموقع الجغرافي غير مدعوم');
      setLoading(false);
    }
  }, [isOpen]);

  // Gérer l'orientation du téléphone
  useEffect(() => {
    if (!isOpen) return;

    let orientationHandler;
    let hasReceivedData = false;

    if (!('DeviceOrientationEvent' in window)) {
      setCompassSupported(false);
      setError('البوصلة غير مدعومة على هذا الجهاز');
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
          setError('لم يتم استلام بيانات البوصلة. تأكد من أن جهازك يحتوي على مستشعر بوصلة.');
        }
      }, 3000);
    };

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            startOrientationTracking();
          } else {
            setError('يرجى السماح بالوصول إلى البوصلة');
            setCompassSupported(false);
          }
        })
        .catch(err => {
          console.error('Permission error:', err);
          setError('خطأ في طلب الإذن');
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
  }, [isOpen]);

  // Vérifier si on pointe vers la Qibla avec vibration
  useEffect(() => {
    if (qiblaDirection !== null && smoothHeading !== null) {
      const diff = Math.abs(smoothHeading - qiblaDirection);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      
      const isPointing = normalizedDiff < 15;
      setIsPointingToQibla(isPointing);

      const now = Date.now();
      const timeSinceLastVibration = now - lastVibrationTime;
      
      if ('vibrate' in navigator && timeSinceLastVibration > 1000) {
        if (isPointing) {
          try {
            navigator.vibrate([200, 100, 200]);
            setLastVibrationTime(now);
          } catch (e) {
            console.log('Vibration failed:', e);
          }
        } else if (normalizedDiff < 25 && timeSinceLastVibration > 2000) {
          try {
            navigator.vibrate(100);
            setLastVibrationTime(now);
          } catch (e) {
            console.log('Vibration failed:', e);
          }
        } else if (normalizedDiff < 35 && timeSinceLastVibration > 3000) {
          try {
            navigator.vibrate(50);
            setLastVibrationTime(now);
          } catch (e) {
            console.log('Vibration failed:', e);
          }
        }
      }
    }
  }, [smoothHeading, qiblaDirection, lastVibrationTime]);

  // Test de vibration
  const testVibration = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 200]);
      } catch (e) {
        console.log('Vibration error:', e);
      }
    }
  };

  // Demander permission iOS
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          setError(null);
          setCompassSupported(true);
          window.location.reload();
        } else {
          setError('يرجى السماح بالوصول إلى البوصلة في إعدادات Safari');
        }
      } catch (err) {
        setError('خطأ في طلب الإذن');
      }
    }
  };

  if (!isOpen) return null;

  const arrowRotation = qiblaDirection !== null && smoothHeading !== null 
    ? qiblaDirection - smoothHeading 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className={`bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative transition-all duration-300 ${
        isPointingToQibla ? 'ring-4 ring-yellow-400 shadow-yellow-400/50' : ''
      }`}>
        
        {/* Header avec image */}
        <div className="relative h-40 overflow-hidden">
          <img 
            src="/images/mecca-header.jpg"
            alt="المسجد الحرام"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Overlay */}
          <div className={`absolute inset-0 transition-all duration-500 ${
            isPointingToQibla 
              ? 'bg-gradient-to-t from-yellow-900/80 via-amber-600/40 to-yellow-400/20' 
              : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
          }`} />
          
          {/* Fallback */}
          <div className={`absolute inset-0 -z-10 transition-all duration-500 ${
            isPointingToQibla 
              ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500' 
              : 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800'
          }`} />

          {/* Titre */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-right">
            <h2 className="text-2xl font-bold mb-1">اتجاه القبلة</h2>
            {userLocation && (
              <div className="flex items-center justify-end gap-1 text-sm text-white/80">
                <span>{calculateDistance(userLocation.lat, userLocation.lng).toLocaleString()} كم من مكة</span>
                <MapPin className="w-4 h-4" />
              </div>
            )}
          </div>
          
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 bg-black/30 hover:bg-black/50 
              rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحديد الموقع...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-600 dark:text-red-400 mb-4 text-sm">{error}</p>
              {typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function' && (
                <button
                  onClick={requestPermission}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors font-semibold mb-3 w-full"
                >
                  السماح بالوصول إلى البوصلة
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-colors w-full mb-2"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={testVibration}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 underline"
              >
                اختبار الاهتزاز
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Debug info */}
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded-xl">
                <div>اتجاهك: {Math.round(smoothHeading)}° | القبلة: {qiblaDirection}°</div>
                <div>الفرق: {Math.round(Math.abs(smoothHeading - qiblaDirection) > 180 ? 360 - Math.abs(smoothHeading - qiblaDirection) : Math.abs(smoothHeading - qiblaDirection))}°</div>
              </div>

              {/* Boussole */}
              <div className="relative w-56 h-56 mx-auto">
                {/* Cercle de fond */}
                <div className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
                  isPointingToQibla 
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30' 
                    : 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'
                }`}>
                  {/* Points cardinaux */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-red-600">N</div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500 dark:text-gray-400">S</div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 dark:text-gray-400">W</div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 dark:text-gray-400">E</div>
                </div>

                {/* Effet Kaaba quand aligné */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    isPointingToQibla ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}
                >
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/50 animate-pulse">
                    <span className="text-4xl">🕋</span>
                  </div>
                </div>

                {/* Flèche */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ 
                    transform: `rotate(${arrowRotation}deg)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                >
                  <div className={`transition-colors duration-300 ${
                    isPointingToQibla ? 'text-yellow-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                    </svg>
                  </div>
                </div>

                {/* Centre */}
                <div className={`absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg transition-colors duration-300 ${
                  isPointingToQibla ? 'bg-yellow-500' : 'bg-emerald-600 dark:bg-emerald-400'
                }`}></div>
              </div>

              {/* Infos */}
              <div className="text-center space-y-3">
                <div className={`rounded-xl p-4 transition-all duration-300 ${
                  isPointingToQibla 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'bg-emerald-50 dark:bg-emerald-900/20'
                }`}>
                  <div className={`text-sm mb-1 ${
                    isPointingToQibla 
                      ? 'text-yellow-600 dark:text-yellow-400' 
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>اتجاه القبلة</div>
                  <div className={`text-3xl font-bold ${
                    isPointingToQibla 
                      ? 'text-yellow-700 dark:text-yellow-300' 
                      : 'text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {qiblaDirection}°
                  </div>
                </div>

                {/* Message de succès */}
                {isPointingToQibla && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-3 animate-pulse">
                    <p className="text-green-700 dark:text-green-300 font-bold text-lg">
                      ✅ أنت تواجه القبلة الآن!
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                      🤲 صلّ في هذا الاتجاه
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
                  {isPointingToQibla 
                    ? '✨ ثبّت هاتفك في هذا الاتجاه' 
                    : 'حرّك جهازك ببطء حتى تظهر الكعبة 🕋'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
