import React, { useState, useEffect } from 'react';
import { X, Navigation, MapPin, Loader2, RefreshCw } from 'lucide-react';

/**
 * QiblaModal - Modal de la boussole Qibla
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 */
export default function QiblaModal({ isOpen, onClose }) {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Coordonnées de la Kaaba
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  // Calculer la direction de la Qibla
  const calculateQiblaDirection = (lat, lng) => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const kaabaLatRad = (KAABA_LAT * Math.PI) / 180;
    const kaabaLngRad = (KAABA_LNG * Math.PI) / 180;

    const y = Math.sin(kaabaLngRad - lngRad);
    const x = Math.cos(latRad) * Math.tan(kaabaLatRad) - 
              Math.sin(latRad) * Math.cos(kaabaLngRad - lngRad);

    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    qibla = (qibla + 360) % 360;

    return qibla;
  };

  // Calculer la distance jusqu'à la Mecque
  const calculateDistance = (lat, lng) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
    const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) * Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Obtenir la position de l'utilisateur
  const getLocation = () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    if (!navigator.geolocation) {
      setError('الموقع الجغرافي غير مدعوم');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        const direction = calculateQiblaDirection(latitude, longitude);
        setQiblaDirection(direction);
        setLoading(false);
      },
      (err) => {
        if (err.code === 1) {
          setPermissionDenied(true);
          setError('يرجى السماح بالوصول إلى موقعك');
        } else {
          setError('تعذر الحصول على الموقع');
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Écouter l'orientation de l'appareil
  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (event) => {
      let heading = event.alpha;
      if (heading !== null) {
        // Ajuster pour iOS
        if (typeof event.webkitCompassHeading === 'number') {
          heading = event.webkitCompassHeading;
        }
        setDeviceHeading(heading);
      }
    };

    // Demander la permission sur iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isOpen]);

  // Charger la position au montage
  useEffect(() => {
    if (isOpen) {
      getLocation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculer la rotation de la boussole
  const compassRotation = qiblaDirection !== null 
    ? qiblaDirection - deviceHeading 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header avec image de la Mecque */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src="/images/mecca-header.jpg"
            alt="المسجد الحرام"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback gradient si l'image n'existe pas
              e.target.style.display = 'none';
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Fallback background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 -z-10" />
          
          {/* Titre sur l'image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-right">
            <h2 className="text-2xl font-bold mb-1">اتجاه القبلة</h2>
            <p className="text-white/80 text-sm">المسجد الحرام - مكة المكرمة</p>
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
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">جاري تحديد موقعك...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={getLocation}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 
                  transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <>
              {/* Boussole */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                {/* Cercle extérieur */}
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
                
                {/* Graduations */}
                <div className="absolute inset-2 rounded-full border-2 border-gray-100 dark:border-gray-800">
                  {[...Array(72)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 origin-bottom"
                      style={{
                        transform: `translateX(-50%) rotate(${i * 5}deg)`,
                        height: i % 9 === 0 ? '10px' : '5px',
                        width: i % 9 === 0 ? '2px' : '1px',
                        marginTop: '-118px',
                        backgroundColor: i % 9 === 0 ? '#10b981' : '#d1d5db'
                      }}
                    />
                  ))}
                </div>

                {/* Points cardinaux */}
                <div className="absolute inset-0">
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-bold text-emerald-600 dark:text-emerald-400">N</span>
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-400">S</span>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">W</span>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">E</span>
                </div>

                {/* Aiguille de la Qibla */}
                <div 
                  className="absolute inset-0 transition-transform duration-300 ease-out"
                  style={{ transform: `rotate(${compassRotation}deg)` }}
                >
                  {/* Flèche vers la Qibla */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      {/* Ligne de la flèche */}
                      <div className="w-1 h-24 bg-gradient-to-t from-emerald-300 to-emerald-600 rounded-full mx-auto" 
                        style={{ marginTop: '-96px' }} 
                      />
                      {/* Pointe de la flèche */}
                      <div className="absolute -top-28 left-1/2 -translate-x-1/2">
                        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] 
                          border-l-transparent border-r-transparent border-b-emerald-600" />
                      </div>
                      {/* Icône Kaaba */}
                      <div className="absolute -top-36 left-1/2 -translate-x-1/2 text-2xl">
                        🕋
                      </div>
                    </div>
                  </div>
                </div>

                {/* Centre */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg border-4 border-emerald-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
              </div>

              {/* Informations */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(qiblaDirection)}°
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-right">اتجاه القبلة</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {userLocation && calculateDistance(userLocation.lat, userLocation.lng).toLocaleString()} كم
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-right">المسافة إلى مكة</span>
                </div>
              </div>

              {/* Instructions */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                وجّه هاتفك نحو الشمال للحصول على اتجاه دقيق
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
