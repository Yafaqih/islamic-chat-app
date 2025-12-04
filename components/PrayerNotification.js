import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, X, Volume2, VolumeX, Smartphone, Download } from 'lucide-react';

export default function PrayerNotification({ 
  isOpen = null,
  onClose = null,
  showFloatingButton = true
}) {
  const [enabled, setEnabled] = useState(false);
  const [location, setLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(true);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  
  // État pour l'Adhan
  const [adhanEnabled, setAdhanEnabled] = useState(false);
  const [adhanPlaying, setAdhanPlaying] = useState(false);
  const audioRef = useRef(null);

  // Synchroniser avec le contrôle externe
  useEffect(() => {
    if (isOpen !== null) {
      setShowSettings(isOpen);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowSettings(false);
    if (onClose) onClose();
  };

  const prayerNames = {
    Fajr: 'الفجر',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء'
  };

  // ✅ Détecter le support des notifications
  const checkNotificationSupport = () => {
    // Vérifier si l'API existe
    if (!('Notification' in window)) {
      return { supported: false, reason: 'api_missing' };
    }
    
    // Vérifier si on est en HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      return { supported: false, reason: 'not_https' };
    }
    
    // Vérifier si c'est iOS Safari (sans PWA)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && !isStandalone) {
      return { supported: false, reason: 'ios_not_pwa' };
    }
    
    return { supported: true, reason: null };
  };

  // ✅ Détecter si mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // ✅ Détecter si iOS
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  // ✅ Détecter si PWA installée
  const isPWA = () => {
    return window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  };

  // Charger les préférences
  useEffect(() => {
    const savedEnabled = localStorage.getItem('prayerNotificationsEnabled');
    const savedLocation = localStorage.getItem('prayerLocation');
    const savedAdhan = localStorage.getItem('adhanEnabled');
    
    if (savedEnabled === 'true') {
      setEnabled(true);
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }
    }
    
    if (savedAdhan === 'true') {
      setAdhanEnabled(true);
    }

    // ✅ Vérifier le support des notifications
    const support = checkNotificationSupport();
    setNotificationSupported(support.supported);

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (enabled && location) {
      fetchPrayerTimes();
      const interval = setInterval(fetchPrayerTimes, 3600000);
      return () => clearInterval(interval);
    }
  }, [enabled, location]);

  useEffect(() => {
    if (prayerTimes) {
      const checkInterval = setInterval(() => {
        checkNextPrayer();
      }, 30000);

      checkNextPrayer();
      return () => clearInterval(checkInterval);
    }
  }, [prayerTimes]);

  const getLocation = () => {
    setLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(loc);
          localStorage.setItem('prayerLocation', JSON.stringify(loc));
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('تعذر الحصول على موقعك');
          setLoading(false);
        }
      );
    }
  };

  const fetchPrayerTimes = async () => {
    if (!location) return;

    try {
      const today = new Date();
      const timestamp = Math.floor(today.getTime() / 1000);
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${location.lat}&longitude=${location.lng}&method=2`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        const timings = data.data.timings;
        setPrayerTimes({
          Fajr: timings.Fajr,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha
        });
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    }
  };

  const checkNextPrayer = () => {
    if (!prayerTimes) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let nextPrayerData = null;
    let minDiff = Infinity;

    Object.entries(prayerTimes).forEach(([name, time]) => {
      const [hours, minutes] = time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      const diff = prayerMinutes - currentTime;

      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextPrayerData = { name, time, diff };
      }
    });

    if (!nextPrayerData) {
      const [hours, minutes] = prayerTimes.Fajr.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      const diff = (24 * 60) - currentTime + prayerMinutes;
      nextPrayerData = { name: 'Fajr', time: prayerTimes.Fajr, diff };
    }

    setNextPrayer(nextPrayerData);

    // Notification 5 minutes avant
    if (nextPrayerData.diff === 5) {
      sendNotification(nextPrayerData.name, nextPrayerData.time, true);
    }

    // Notification à l'heure exacte + Adhan
    if (nextPrayerData.diff === 0) {
      sendNotification(nextPrayerData.name, nextPrayerData.time, false);
      if (adhanEnabled) {
        playAdhan();
      }
    }
  };

  // Jouer l'Adhan
  const playAdhan = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      const audio = new Audio('/sounds/adhan.mp3');
      audioRef.current = audio;
      
      audio.volume = 0.7;
      audio.play()
        .then(() => {
          setAdhanPlaying(true);
        })
        .catch((error) => {
          console.error('Error playing Adhan:', error);
        });
      
      audio.onended = () => {
        setAdhanPlaying(false);
      };
    } catch (error) {
      console.error('Error playing Adhan:', error);
    }
  };

  // Arrêter l'Adhan
  const stopAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAdhanPlaying(false);
    }
  };

  // Tester l'Adhan
  const testAdhan = () => {
    if (adhanPlaying) {
      stopAdhan();
    } else {
      playAdhan();
    }
  };

  // Toggle Adhan
  const toggleAdhan = () => {
    const newValue = !adhanEnabled;
    setAdhanEnabled(newValue);
    localStorage.setItem('adhanEnabled', newValue.toString());
    
    if (!newValue && adhanPlaying) {
      stopAdhan();
    }
  };

  const sendNotification = (prayerName, time, isBefore) => {
    if (!enabled || notificationPermission !== 'granted') return;

    const arabicName = prayerNames[prayerName];
    const title = isBefore 
      ? `🕌 ${arabicName} في 5 دقائق`
      : `🕌 حان وقت ${arabicName}`;
    
    const body = isBefore
      ? `استعد للصلاة. الأذان الساعة ${time}`
      : `الله أكبر - حي على الصلاة`;

    try {
      new Notification(title, {
        body: body,
        icon: '/icon-192x192.png',
        tag: `prayer-${prayerName}-${isBefore ? 'before' : 'now'}`,
        requireInteraction: !isBefore
      });
    } catch (error) {
      console.error('Notification error:', error);
    }
  };

  // ✅ Fonction améliorée pour activer les notifications
  const enableNotifications = async () => {
    const support = checkNotificationSupport();
    
    // ✅ Si iOS sans PWA, afficher le guide d'installation
    if (!support.supported && support.reason === 'ios_not_pwa') {
      setShowInstallGuide(true);
      return;
    }
    
    // ✅ Si API manquante mais mobile, essayer quand même avec son Adhan
    if (!support.supported && support.reason === 'api_missing') {
      if (isMobile()) {
        // Activer quand même pour l'Adhan et les horaires
        if (!location) {
          getLocation();
        }
        setEnabled(true);
        localStorage.setItem('prayerNotificationsEnabled', 'true');
        setAdhanEnabled(true);
        localStorage.setItem('adhanEnabled', 'true');
        alert('✅ تم تفعيل مواقيت الصلاة مع صوت الأذان\n\n⚠️ التنبيهات غير مدعومة على هذا المتصفح، لكن سيتم تشغيل الأذان عند كل صلاة إذا كان التطبيق مفتوحاً');
        if (location) {
          fetchPrayerTimes();
        }
        return;
      } else {
        alert('المتصفح لا يدعم التنبيهات. جرب متصفح آخر مثل Chrome أو Firefox');
        return;
      }
    }

    // ✅ Demander la permission
    try {
      if (notificationPermission !== 'granted') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'denied') {
          alert('❌ تم رفض التنبيهات\n\nلتفعيلها، اذهب إلى إعدادات المتصفح وفعّل التنبيهات لهذا الموقع');
          return;
        }
        
        if (permission !== 'granted') {
          // Fallback pour Adhan
          if (!location) {
            getLocation();
          }
          setEnabled(true);
          localStorage.setItem('prayerNotificationsEnabled', 'true');
          setAdhanEnabled(true);
          localStorage.setItem('adhanEnabled', 'true');
          alert('⚠️ لم يتم السماح بالتنبيهات\n\nتم تفعيل صوت الأذان كبديل. تأكد أن التطبيق مفتوح لسماع الأذان');
          if (location) {
            fetchPrayerTimes();
          }
          return;
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      // Fallback
      if (!location) {
        getLocation();
      }
      setEnabled(true);
      localStorage.setItem('prayerNotificationsEnabled', 'true');
      setAdhanEnabled(true);
      localStorage.setItem('adhanEnabled', 'true');
      if (location) {
        fetchPrayerTimes();
      }
      return;
    }

    if (!location) {
      getLocation();
    }

    setEnabled(true);
    localStorage.setItem('prayerNotificationsEnabled', 'true');
    
    if (location) {
      fetchPrayerTimes();
    }

    // ✅ Envoyer une notification de test
    try {
      new Notification('✅ تم تفعيل تنبيهات الصلاة', {
        body: 'ستصلك إشعارات قبل كل صلاة بخمس دقائق',
        icon: '/icon-192x192.png',
      });
    } catch (e) {
      console.log('Test notification failed:', e);
    }
  };

  const disableNotifications = () => {
    setEnabled(false);
    localStorage.setItem('prayerNotificationsEnabled', 'false');
    setNextPrayer(null);
    stopAdhan();
  };

  const formatTimeRemaining = (minutes) => {
    if (minutes < 60) {
      return `${minutes} دقيقة`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ساعة`;
    }
    return `${hours} ساعة و ${mins} دقيقة`;
  };

  return (
    <>
      {/* Bouton flottant (optionnel) */}
      {showFloatingButton && !showSettings && (
        <button
          onClick={() => setShowSettings(true)}
          className={`fixed bottom-[140px] sm:bottom-32 right-4 ${
            enabled 
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
              : 'bg-gray-400'
          } text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 hover:scale-110 relative`}
          title="مواقيت الصلاة"
        >
          {enabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
          {enabled && nextPrayer && nextPrayer.diff < 60 && (
            <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
              !
            </div>
          )}
        </button>
      )}

      {/* ✅ Guide d'installation PWA pour iOS */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                📱 أضف التطبيق للشاشة الرئيسية
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                لتفعيل التنبيهات على الآيفون، يجب إضافة يا فقيه للشاشة الرئيسية
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-right space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span className="text-gray-700 dark:text-gray-300">اضغط على زر المشاركة <span className="inline-block">⬆️</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span className="text-gray-700 dark:text-gray-300">اختر "إضافة للشاشة الرئيسية"</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span className="text-gray-700 dark:text-gray-300">افتح التطبيق من الشاشة الرئيسية</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span className="text-gray-700 dark:text-gray-300">فعّل التنبيهات 🔔</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInstallGuide(false)}
                  className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                >
                  لاحقاً
                </button>
                <button
                  onClick={() => {
                    setShowInstallGuide(false);
                    // Activer quand même pour l'Adhan
                    if (!location) getLocation();
                    setEnabled(true);
                    localStorage.setItem('prayerNotificationsEnabled', 'true');
                    setAdhanEnabled(true);
                    localStorage.setItem('adhanEnabled', 'true');
                  }}
                  className="flex-1 py-3 px-4 bg-purple-500 text-white rounded-xl font-medium"
                >
                  فعّل الأذان فقط
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
              🕌 مواقيت الصلاة
            </h2>

            {/* Toggle Notifications */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">تفعيل التنبيهات</span>
              </div>
              <button
                onClick={enabled ? disableNotifications : enableNotifications}
                disabled={loading}
                className={`relative w-14 h-8 rounded-full transition-all ${
                  enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                  enabled ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Toggle Adhan */}
            <div className={`flex items-center justify-between mb-4 p-3 rounded-xl transition-all ${
              enabled 
                ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700' 
                : 'bg-gray-100 dark:bg-gray-700/30 opacity-50'
            }`}>
              <div className="flex items-center gap-3">
                {adhanEnabled ? (
                  <Volume2 className="w-5 h-5 text-purple-500" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium block">صوت الأذان</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">تشغيل الأذان عند وقت الصلاة</span>
                </div>
              </div>
              <button
                onClick={toggleAdhan}
                disabled={!enabled}
                className={`relative w-14 h-8 rounded-full transition-all ${
                  adhanEnabled && enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                } ${!enabled ? 'cursor-not-allowed' : ''}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                  adhanEnabled && enabled ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Bouton test Adhan */}
            {enabled && adhanEnabled && (
              <button
                onClick={testAdhan}
                className={`w-full mb-4 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  adhanPlaying 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                }`}
              >
                {adhanPlaying ? (
                  <>
                    <VolumeX className="w-5 h-5" />
                    إيقاف الأذان
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    تجربة صوت الأذان
                  </>
                )}
              </button>
            )}

            {/* Horaires des prières */}
            {enabled && prayerTimes && (
              <div className="space-y-2 mb-4">
                {Object.entries(prayerTimes).map(([name, time]) => {
                  const isNext = nextPrayer?.name === name;
                  return (
                    <div
                      key={name}
                      className={`flex justify-between items-center p-3 rounded-xl ${
                        isNext
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-500'
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <span className={`font-mono ${
                        isNext ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {time}
                      </span>
                      <span className={`font-semibold ${
                        isNext ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'
                      }`}>
                        {prayerNames[name]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Prochaine prière */}
            {enabled && nextPrayer && (
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white text-center">
                <div className="text-sm opacity-80 mb-1">الصلاة القادمة</div>
                <div className="text-2xl font-bold mb-1">
                  {prayerNames[nextPrayer.name]}
                </div>
                <div className="text-sm opacity-80">
                  بعد {formatTimeRemaining(nextPrayer.diff)}
                </div>
                {adhanEnabled && (
                  <div className="mt-2 text-xs opacity-70 flex items-center justify-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    سيتم تشغيل الأذان
                  </div>
                )}
              </div>
            )}

            {/* État désactivé */}
            {!enabled && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BellOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>فعّل التنبيهات للحصول على إشعارات الصلاة</p>
              </div>
            )}

            {/* Note sur l'Adhan */}
            {enabled && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                💡 تأكد من رفع صوت الجهاز لسماع الأذان
              </p>
            )}

          </div>
        </div>
      )}
    </>
  );
}
