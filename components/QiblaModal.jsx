import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Volume2, VolumeX, Smartphone } from 'lucide-react';

/**
 * QiblaModal - Boussole Qibla compatible iOS et Android
 * - Détection automatique de la plateforme
 * - Lissage adapté pour chaque OS
 * - Support des permissions iOS
 */
export default function QiblaModal({ isOpen, onClose }) {
  const [smoothHeading, setSmoothHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isPointingToQibla, setIsPointingToQibla] = useState(false);
  const [lastVibrationTime, setLastVibrationTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [platform, setPlatform] = useState('unknown');
  const [compassAccuracy, setCompassAccuracy] = useState('unknown');
  
  const headingBuffer = useRef([]);
  const wasPointingRef = useRef(false);
  const lastSoundTimeRef = useRef(0);
  const audioContextRef = useRef(null);
  const animatedHeadingRef = useRef(null);
  
  // Paramètres de lissage
  const BUFFER_SIZE = 15;
  const MIN_CHANGE_THRESHOLD = 2;
  const SMOOTHING_FACTOR = 0.12;

  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  // ============================================
  // DÉTECTION DE PLATEFORME
  // ============================================
  
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform('ios');
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('other');
    }
  }, []);

  // ============================================
  // SYSTÈME AUDIO
  // ============================================
  
  const initializeAudio = () => {
    if (audioContextRef.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    } catch (e) {
      console.error('Audio init failed:', e);
    }
  };

  const playSuccessSound = async () => {
    if (!soundEnabled) return;
    
    const now = Date.now();
    if (now - lastSoundTimeRef.current < 2000) return;
    lastSoundTimeRef.current = now;

    try {
      if (!audioContextRef.current) initializeAudio();
      
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const notes = [
        { freq: 523.25, delay: 0, duration: 0.6 },
        { freq: 659.25, delay: 0.1, duration: 0.5 },
        { freq: 783.99, delay: 0.2, duration: 0.4 },
        { freq: 1046.50, delay: 0.3, duration: 0.6 },
      ];

      const currentTime = ctx.currentTime;

      notes.forEach(note => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = note.freq;
        
        const startTime = currentTime + note.delay;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration);
      });
      
    } catch (e) {
      console.error('Sound error:', e);
    }
  };

  const handleTestSound = async () => {
    initializeAudio();
    lastSoundTimeRef.current = 0;
    await playSuccessSound();
  };

  const handleToggleSound = () => {
    initializeAudio();
    setSoundEnabled(!soundEnabled);
  };

  const testVibration = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 200]);
      } catch (e) {}
    }
  };

  // ============================================
  // CALCULS QIBLA
  // ============================================

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

  // ============================================
  // LISSAGE - Compatible iOS et Android
  // ============================================

  const smoothHeadingValue = (newHeading) => {
    if (newHeading === null || isNaN(newHeading)) return animatedHeadingRef.current || 0;
    
    // Ajouter au buffer
    headingBuffer.current.push(newHeading);
    
    if (headingBuffer.current.length > BUFFER_SIZE) {
      headingBuffer.current.shift();
    }

    // Moyenne circulaire
    let sinSum = 0;
    let cosSum = 0;
    
    headingBuffer.current.forEach(h => {
      const rad = h * Math.PI / 180;
      sinSum += Math.sin(rad);
      cosSum += Math.cos(rad);
    });

    let targetHeading = Math.atan2(sinSum, cosSum) * 180 / Math.PI;
    targetHeading = (targetHeading + 360) % 360;

    // Initialiser si premier appel
    if (animatedHeadingRef.current === null) {
      animatedHeadingRef.current = targetHeading;
      return targetHeading;
    }

    // Interpolation
    let currentHeading = animatedHeadingRef.current;
    
    let diff = targetHeading - currentHeading;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < MIN_CHANGE_THRESHOLD) {
      return currentHeading;
    }

    const newAnimatedHeading = currentHeading + diff * SMOOTHING_FACTOR;
    animatedHeadingRef.current = (newAnimatedHeading + 360) % 360;
    
    return animatedHeadingRef.current;
  };

  // ============================================
  // OBTENIR LA POSITION
  // ============================================

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);
    headingBuffer.current = [];
    wasPointingRef.current = false;
    lastSoundTimeRef.current = 0;
    animatedHeadingRef.current = null;

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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('الموقع الجغرافي غير مدعوم');
      setLoading(false);
    }
  }, [isOpen]);

  // ============================================
  // ORIENTATION - Compatible iOS et Android
  // ============================================

  useEffect(() => {
    if (!isOpen || loading) return;

    let orientationHandler = null;
    let absoluteHandler = null;
    let watchId = null;

    const handleOrientationIOS = (event) => {
      // iOS utilise webkitCompassHeading (0-360, 0 = Nord)
      if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
        const heading = event.webkitCompassHeading;
        const smoothed = smoothHeadingValue(heading);
        setSmoothHeading(smoothed);
        
        // Précision du compas iOS
        if (event.webkitCompassAccuracy !== undefined) {
          if (event.webkitCompassAccuracy < 0) {
            setCompassAccuracy('non calibré');
          } else if (event.webkitCompassAccuracy <= 10) {
            setCompassAccuracy('excellente');
          } else if (event.webkitCompassAccuracy <= 25) {
            setCompassAccuracy('bonne');
          } else {
            setCompassAccuracy('faible');
          }
        }
      }
    };

    const handleOrientationAndroid = (event) => {
      // Android: alpha est l'angle par rapport au nord magnétique
      // alpha = 0 quand le haut du téléphone pointe vers le nord
      // alpha augmente dans le sens antihoraire
      if (event.alpha !== null && event.alpha !== undefined) {
        // Sur Android, on doit inverser car alpha augmente dans le sens antihoraire
        let heading = event.alpha;
        
        // Si absolute est true, c'est relatif au nord magnétique
        if (event.absolute === true) {
          heading = (360 - heading) % 360;
        } else {
          // Sinon, c'est relatif à l'orientation initiale du téléphone
          heading = (360 - heading) % 360;
        }
        
        const smoothed = smoothHeadingValue(heading);
        setSmoothHeading(smoothed);
      }
    };

    const startTracking = () => {
      if (platform === 'ios') {
        // iOS
        orientationHandler = handleOrientationIOS;
        window.addEventListener('deviceorientation', orientationHandler, true);
      } else {
        // Android - préférer deviceorientationabsolute si disponible
        absoluteHandler = (event) => {
          if (event.absolute) {
            handleOrientationAndroid(event);
          }
        };
        
        orientationHandler = handleOrientationAndroid;
        
        // Essayer d'abord absolute (plus précis sur Android)
        window.addEventListener('deviceorientationabsolute', absoluteHandler, true);
        window.addEventListener('deviceorientation', orientationHandler, true);
      }
    };

    // Demander permission sur iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            startTracking();
          } else {
            setError('يرجى السماح بالوصول إلى البوصلة');
          }
        })
        .catch(err => {
          console.error('Permission error:', err);
          setError('خطأ في طلب الإذن');
        });
    } else {
      // Android ou iOS < 13
      startTracking();
    }

    return () => {
      if (orientationHandler) {
        window.removeEventListener('deviceorientation', orientationHandler, true);
      }
      if (absoluteHandler) {
        window.removeEventListener('deviceorientationabsolute', absoluteHandler, true);
      }
    };
  }, [isOpen, loading, platform]);

  // ============================================
  // VÉRIFIER ALIGNEMENT + SON + VIBRATION
  // ============================================

  useEffect(() => {
    if (qiblaDirection !== null && smoothHeading !== null) {
      const diff = Math.abs(smoothHeading - qiblaDirection);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      
      const isPointing = normalizedDiff < 15;
      
      if (isPointing && !wasPointingRef.current) {
        playSuccessSound();
      }
      
      wasPointingRef.current = isPointing;
      setIsPointingToQibla(isPointing);

      const now = Date.now();
      const timeSinceLastVibration = now - lastVibrationTime;
      
      if ('vibrate' in navigator && timeSinceLastVibration > 1000) {
        if (isPointing) {
          try {
            navigator.vibrate([200, 100, 200]);
            setLastVibrationTime(now);
          } catch (e) {}
        } else if (normalizedDiff < 25 && timeSinceLastVibration > 2000) {
          try {
            navigator.vibrate(100);
            setLastVibrationTime(now);
          } catch (e) {}
        }
      }
    }
  }, [smoothHeading, qiblaDirection, lastVibrationTime, soundEnabled]);

  // ============================================
  // PERMISSION iOS
  // ============================================

  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setError(null);
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

  const getPlatformName = () => {
    switch (platform) {
      case 'ios': return 'iOS';
      case 'android': return 'Android';
      default: return 'غير معروف';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className={`bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative transition-all duration-500 ${
        isPointingToQibla ? 'ring-4 ring-yellow-400 shadow-yellow-400/50' : ''
      }`}>
        
        {/* Header */}
        <div className="relative h-40 overflow-hidden">
          <img 
            src="/images/mecca-header.jpg"
            alt="المسجد الحرام"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className={`absolute inset-0 transition-all duration-500 ${
            isPointingToQibla 
              ? 'bg-gradient-to-t from-yellow-900/80 via-amber-600/40 to-yellow-400/20' 
              : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
          }`} />
          
          <div className={`absolute inset-0 -z-10 transition-all duration-500 ${
            isPointingToQibla 
              ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500' 
              : 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800'
          }`} />

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-right">
            <h2 className="text-2xl font-bold mb-1">اتجاه القبلة</h2>
            {userLocation && (
              <div className="flex items-center justify-end gap-1 text-sm text-white/80">
                <span>{calculateDistance(userLocation.lat, userLocation.lng).toLocaleString()} كم من مكة</span>
                <MapPin className="w-4 h-4" />
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleSound}
            className={`absolute top-4 left-16 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              soundEnabled 
                ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white' 
                : 'bg-black/30 hover:bg-black/50 text-white/60'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
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
              {typeof DeviceOrientationEvent !== 'undefined' && 
               typeof DeviceOrientationEvent.requestPermission === 'function' && (
                <button
                  onClick={requestPermission}
                  className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors font-semibold mb-3 w-full"
                >
                  السماح بالوصول إلى البوصلة
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-colors w-full"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Debug info */}
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Smartphone className="w-3 h-3" />
                  <span>{getPlatformName()}</span>
                </div>
                <div>اتجاهك: {Math.round(smoothHeading)}° | القبلة: {qiblaDirection}°</div>
                <div>الفرق: {Math.round(Math.abs(smoothHeading - qiblaDirection) > 180 ? 360 - Math.abs(smoothHeading - qiblaDirection) : Math.abs(smoothHeading - qiblaDirection))}°</div>
              </div>

              {/* Boussole */}
              <div className="relative w-56 h-56 mx-auto">
                <div className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
                  isPointingToQibla 
                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30' 
                    : 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'
                }`}>
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-red-600">N</div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500">S</div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">W</div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">E</div>
                </div>

                {/* Kaaba quand aligné */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                  isPointingToQibla ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}>
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/50 animate-pulse">
                    <span className="text-4xl">🕋</span>
                  </div>
                </div>

                {/* Flèche */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ 
                    transform: `rotate(${arrowRotation}deg)`,
                    transition: 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)'
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

                <div className={`absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg transition-colors duration-300 ${
                  isPointingToQibla ? 'bg-yellow-500' : 'bg-emerald-600'
                }`}></div>
              </div>

              {/* Infos */}
              <div className="text-center space-y-3">
                <div className={`rounded-xl p-4 transition-all duration-300 ${
                  isPointingToQibla ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'
                }`}>
                  <div className={`text-sm mb-1 ${
                    isPointingToQibla ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>اتجاه القبلة</div>
                  <div className={`text-3xl font-bold ${
                    isPointingToQibla ? 'text-yellow-700 dark:text-yellow-300' : 'text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {qiblaDirection}°
                  </div>
                </div>

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

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={testVibration}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 underline"
                  >
                    اختبار الاهتزاز
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleTestSound}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    اختبار الصوت
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isPointingToQibla 
                    ? '✨ ثبّت هاتفك في هذا الاتجاه' 
                    : 'حرّك جهازك ببطء حتى تظهر الكعبة 🕋'
                  }
                </p>
                
                {/* Conseil de calibration */}
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  💡 لتحسين الدقة: حرّك الهاتف على شكل رقم 8
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
