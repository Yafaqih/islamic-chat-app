import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, MapPin, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * QiblaModal - Version multilingue avec flèche corrigée
 */
export default function QiblaModal({ isOpen, onClose }) {
  const { language, isRTL } = useLanguage();
  
  const [displayHeading, setDisplayHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isPointingToQibla, setIsPointingToQibla] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const [compassActive, setCompassActive] = useState(false);
  const [debugRotation, setDebugRotation] = useState(0);
  
  const headingBuffer = useRef([]);
  const currentHeadingRef = useRef(0);
  const targetHeadingRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const wasPointingRef = useRef(false);
  const lastSoundTimeRef = useRef(0);
  const audioContextRef = useRef(null);
  const orientationHandlerRef = useRef(null);
  
  // Détecter si iOS nécessite une permission utilisateur
  const isIOS = typeof window !== 'undefined' && 
    typeof DeviceOrientationEvent !== 'undefined' && 
    typeof DeviceOrientationEvent.requestPermission === 'function';
  
  const BUFFER_SIZE = 25;
  const LERP_FACTOR = 0.05;
  const MIN_UPDATE_INTERVAL = 50;
  const DEAD_ZONE = 0.3;

  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;

  // Traductions
  const txt = {
    ar: {
      qiblaDirection: 'اتجاه القبلة',
      km: 'كم',
      locating: 'جاري تحديد الموقع...',
      allowLocation: 'يرجى السماح بالوصول إلى موقعك',
      allowCompass: 'يرجى السماح بالوصول إلى البوصلة',
      allowAccess: 'السماح بالوصول',
      yourDirection: 'اتجاهك',
      qibla: 'القبلة',
      difference: 'الفرق',
      foundQibla: '✅ القبلة',
      prayHere: 'صلّ في هذا الاتجاه 🤲',
      turnPhone: '🔄 أدر هاتفك حتى يتوافق النقطة الخضراء مع السهم',
      turnLeft: '← أدر لليسار',
      turnRight: '→ أدر لليمين',
      testSound: '🔊 اختبار الصوت',
      tip: '💡 حرّك الهاتف على شكل ∞ لتحسين الدقة'
    },
    fr: {
      qiblaDirection: 'Direction de la Qibla',
      km: 'km',
      locating: 'Localisation en cours...',
      allowLocation: 'Veuillez autoriser l\'accès à votre position',
      allowCompass: 'Veuillez autoriser l\'accès à la boussole',
      allowAccess: 'Autoriser l\'accès',
      yourDirection: 'Votre direction',
      qibla: 'Qibla',
      difference: 'Différence',
      foundQibla: '✅ Qibla',
      prayHere: 'Priez dans cette direction 🤲',
      turnPhone: '🔄 Tournez votre téléphone jusqu\'à aligner le point vert avec la flèche',
      turnLeft: '← Tournez à gauche',
      turnRight: '→ Tournez à droite',
      testSound: '🔊 Tester le son',
      tip: '💡 Bougez le téléphone en forme de ∞ pour améliorer la précision'
    },
    en: {
      qiblaDirection: 'Qibla Direction',
      km: 'km',
      locating: 'Locating...',
      allowLocation: 'Please allow access to your location',
      allowCompass: 'Please allow access to the compass',
      allowAccess: 'Allow Access',
      yourDirection: 'Your direction',
      qibla: 'Qibla',
      difference: 'Difference',
      foundQibla: '✅ Qibla',
      prayHere: 'Pray in this direction 🤲',
      turnPhone: '🔄 Turn your phone until the green dot aligns with the arrow',
      turnLeft: '← Turn left',
      turnRight: '→ Turn right',
      testSound: '🔊 Test sound',
      tip: '💡 Move your phone in a ∞ shape to improve accuracy'
    }
  }[language] || {
    qiblaDirection: 'اتجاه القبلة', km: 'كم', locating: 'جاري تحديد الموقع...', allowLocation: 'يرجى السماح بالوصول إلى موقعك', allowCompass: 'يرجى السماح بالوصول إلى البوصلة', allowAccess: 'السماح بالوصول', yourDirection: 'اتجاهك', qibla: 'القبلة', difference: 'الفرق', foundQibla: '✅ القبلة', prayHere: 'صلّ في هذا الاتجاه 🤲', turnPhone: '🔄 أدر هاتفك حتى يتوافق النقطة الخضراء مع السهم', turnLeft: '← أدر لليسار', turnRight: '→ أدر لليمين', testSound: '🔊 اختبار الصوت', tip: '💡 حرّك الهاتف على شكل ∞ لتحسين الدقة'
  };

  // Animation fluide
  const animate = useCallback(() => {
    const current = currentHeadingRef.current;
    const target = targetHeadingRef.current;
    
    let diff = target - current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    if (Math.abs(diff) > DEAD_ZONE) {
      const newHeading = current + diff * LERP_FACTOR;
      currentHeadingRef.current = (newHeading + 360) % 360;
      
      const now = Date.now();
      if (now - lastUpdateRef.current > MIN_UPDATE_INTERVAL) {
        setDisplayHeading(currentHeadingRef.current);
        lastUpdateRef.current = now;
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isOpen && !loading && !error) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, loading, error, animate]);

  // Audio
  const playSuccessSound = useCallback(async () => {
    if (!soundEnabled) return;
    
    const now = Date.now();
    if (now - lastSoundTimeRef.current < 3000) return;
    lastSoundTimeRef.current = now;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const notes = [
        { freq: 523.25, delay: 0, duration: 0.6 },
        { freq: 659.25, delay: 0.1, duration: 0.5 },
        { freq: 783.99, delay: 0.2, duration: 0.4 },
        { freq: 1046.50, delay: 0.3, duration: 0.6 },
      ];

      notes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = note.freq;
        const start = ctx.currentTime + note.delay;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + note.duration);
        osc.start(start);
        osc.stop(start + note.duration);
      });
    } catch (e) {}
  }, [soundEnabled]);

  const handleTestSound = () => {
    lastSoundTimeRef.current = 0;
    playSuccessSound();
  };

  // Calcul Qibla
  const calculateQiblaDirection = (userLat, userLng) => {
    const lat1 = userLat * Math.PI / 180;
    const lng1 = userLng * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;
    const lng2 = KAABA_LNG * Math.PI / 180;
    const dLng = lng2 - lng1;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return Math.round((bearing + 360) % 360);
  };

  const calculateDistance = (lat, lng) => {
    const R = 6371;
    const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
    const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat * Math.PI/180) * Math.cos(KAABA_LAT * Math.PI/180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  };

  // Lissage du compas
  const processHeading = useCallback((rawHeading) => {
    if (rawHeading === null || isNaN(rawHeading)) return;
    
    headingBuffer.current.push(rawHeading);
    if (headingBuffer.current.length > BUFFER_SIZE) {
      headingBuffer.current.shift();
    }
    
    let sinSum = 0, cosSum = 0;
    headingBuffer.current.forEach(h => {
      const rad = h * Math.PI / 180;
      sinSum += Math.sin(rad);
      cosSum += Math.cos(rad);
    });
    
    let avgHeading = Math.atan2(sinSum, cosSum) * 180 / Math.PI;
    targetHeadingRef.current = (avgHeading + 360) % 360;
  }, []);

  // Géolocalisation
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);
    headingBuffer.current = [];
    currentHeadingRef.current = 0;
    targetHeadingRef.current = 0;
    wasPointingRef.current = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setQiblaDirection(calculateQiblaDirection(latitude, longitude));
        setLoading(false);
      },
      (err) => {
        setError(txt.allowLocation);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [isOpen]);

  // Capteur d'orientation - Fonction handler
  const handleOrientation = useCallback((event) => {
    let heading;
    if (event.webkitCompassHeading !== undefined) {
      // iOS
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android
      heading = 360 - event.alpha;
    }
    
    if (heading !== undefined && !isNaN(heading)) {
      processHeading(heading);
    }
  }, [processHeading]);

  // Stocker le handler dans une ref pour le cleanup
  useEffect(() => {
    orientationHandlerRef.current = handleOrientation;
  }, [handleOrientation]);

  // Démarrer le listener d'orientation
  const startCompass = useCallback(() => {
    if (compassActive) return;
    
    window.addEventListener('deviceorientation', orientationHandlerRef.current, true);
    setCompassActive(true);
    setPermissionNeeded(false);
    setError(null);
  }, [compassActive]);

  // Initialiser le capteur d'orientation
  useEffect(() => {
    if (!isOpen || loading || error) return;

    // Sur iOS, on doit attendre que l'utilisateur clique
    if (isIOS) {
      setPermissionNeeded(true);
      return;
    }

    // Sur Android/Desktop, on démarre directement
    startCompass();

    return () => {
      if (orientationHandlerRef.current) {
        window.removeEventListener('deviceorientation', orientationHandlerRef.current, true);
      }
      setCompassActive(false);
    };
  }, [isOpen, loading, error, isIOS, startCompass]);

  // Cleanup quand le modal se ferme
  useEffect(() => {
    if (!isOpen && compassActive) {
      if (orientationHandlerRef.current) {
        window.removeEventListener('deviceorientation', orientationHandlerRef.current, true);
      }
      setCompassActive(false);
      setPermissionNeeded(false);
      headingBuffer.current = [];
    }
  }, [isOpen, compassActive]);

  // Détection de la Qibla
  useEffect(() => {
    if (qiblaDirection === null) return;

    let diff = qiblaDirection - displayHeading;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    setDebugRotation(diff);
    
    const isPointing = Math.abs(diff) < 15;
    setIsPointingToQibla(isPointing);
    
    if (isPointing && !wasPointingRef.current) {
      playSuccessSound();
    }
    wasPointingRef.current = isPointing;
  }, [displayHeading, qiblaDirection, playSuccessSound]);

  // Fonction appelée quand l'utilisateur clique sur "Autoriser"
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          // Permission accordée - démarrer le compass
          startCompass();
        } else {
          setError(txt.allowCompass);
        }
      } catch (e) {
        setError(txt.allowCompass);
      }
    } else {
      // Pas iOS - démarrer directement
      startCompass();
    }
  };

  if (!isOpen) return null;

  let arrowRotation = qiblaDirection !== null ? qiblaDirection - displayHeading : 0;
  if (arrowRotation > 180) arrowRotation -= 360;
  if (arrowRotation < -180) arrowRotation += 360;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl transition-all duration-700 ${
        isPointingToQibla ? 'ring-4 ring-yellow-400 shadow-yellow-400/50' : ''
      }`}>
        
        {/* Header */}
        <div className="relative h-32 overflow-hidden">
          <img 
            src="/images/mecca-header.jpg"
            alt="المسجد الحرام"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className={`absolute inset-0 transition-all duration-700 ${
            isPointingToQibla 
              ? 'bg-gradient-to-t from-yellow-900/80 via-amber-600/40 to-transparent' 
              : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
          }`} />
          
          <div className={`absolute inset-0 -z-10 ${
            isPointingToQibla 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
              : 'bg-gradient-to-br from-emerald-600 to-teal-700'
          }`} />

          <div className={`absolute bottom-3 ${isRTL ? 'right-4 text-right' : 'left-4 text-left'} text-white`}>
            <h2 className="text-xl font-bold">{txt.qiblaDirection}</h2>
            {userLocation && (
              <div className={`flex items-center gap-1 text-sm text-white/80 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <span>{calculateDistance(userLocation.lat, userLocation.lng).toLocaleString()} {txt.km}</span>
                <MapPin className="w-3 h-3" />
              </div>
            )}
          </div>
          
          <button onClick={onClose} className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-9 h-9 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white`}>
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`absolute top-3 ${isRTL ? 'left-14' : 'right-14'} w-9 h-9 rounded-full flex items-center justify-center ${
              soundEnabled ? 'bg-emerald-500/80 text-white' : 'bg-black/30 text-white/60'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Contenu */}
        <div className="p-5">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">{txt.locating}</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-500 mb-4 text-sm">{error}</p>
              <button onClick={requestPermission} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold w-full">
                {txt.allowAccess}
              </button>
            </div>
          ) : permissionNeeded && !compassActive ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧭</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{txt.allowCompass}</p>
              <button onClick={requestPermission} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold w-full transition-colors">
                {txt.allowAccess}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Debug Info */}
              <div className="grid grid-cols-3 gap-2 text-center text-sm bg-gray-100 dark:bg-gray-700 rounded-xl p-3">
                <div>
                  <div className="text-gray-500 text-xs">{txt.yourDirection}</div>
                  <div className="font-bold">{Math.round(displayHeading)}°</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">{txt.qibla}</div>
                  <div className="font-bold text-emerald-600">{qiblaDirection}°</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">{txt.difference}</div>
                  <div className={`font-bold ${Math.abs(debugRotation) < 15 ? 'text-green-500' : 'text-orange-500'}`}>
                    {Math.round(debugRotation)}°
                  </div>
                </div>
              </div>

              {/* Boussole */}
              <div className="relative w-56 h-56 mx-auto">
                <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-500 ${
                  isPointingToQibla 
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20' 
                    : 'border-gray-200 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'
                }`}>
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500">N</span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400">S</span>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">W</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">E</span>
                  
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                    <div
                      key={deg}
                      className="absolute w-0.5 h-3 bg-gray-300 dark:bg-gray-500"
                      style={{
                        top: '6px',
                        left: '50%',
                        transformOrigin: '50% 106px',
                        transform: `translateX(-50%) rotate(${deg}deg)`
                      }}
                    />
                  ))}
                </div>

                <div
                  className="absolute w-3 h-3 bg-emerald-500 rounded-full shadow-lg"
                  style={{
                    top: '4px',
                    left: '50%',
                    transformOrigin: '50% 108px',
                    transform: `translateX(-50%) rotate(${qiblaDirection - displayHeading}deg)`
                  }}
                />

                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none ${
                  isPointingToQibla ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-3xl">🕋</span>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg 
                    className={`w-20 h-20 drop-shadow-lg transition-colors duration-500 ${
                      isPointingToQibla ? 'text-yellow-500' : 'text-emerald-600'
                    }`} 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                  </svg>
                </div>

                <div className={`absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md transition-colors duration-500 ${
                  isPointingToQibla ? 'bg-yellow-500' : 'bg-emerald-600'
                }`} />
              </div>

              {/* Instructions */}
              <div className={`text-center p-3 rounded-xl transition-all duration-500 ${
                isPointingToQibla 
                  ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-400' 
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}>
                {isPointingToQibla ? (
                  <>
                    <p className="text-green-700 dark:text-green-300 font-bold text-lg">{txt.foundQibla}</p>
                    <p className="text-green-600 dark:text-green-400 text-sm">{txt.prayHere}</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">{txt.turnPhone}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {debugRotation > 0 ? txt.turnLeft : txt.turnRight}
                    </p>
                  </>
                )}
              </div>

              <button onClick={handleTestSound} className="w-full text-xs text-gray-400 hover:text-gray-600 py-2">
                {txt.testSound}
              </button>

              <p className="text-xs text-gray-400 text-center">{txt.tip}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
