import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, Clock, MapPin, X, Volume2, VolumeX } from 'lucide-react';

export default function PrayerNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [adhanEnabled, setAdhanEnabled] = useState(false);
  const [location, setLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [adhanPlaying, setAdhanPlaying] = useState(false);
  
  const adhanAudioRef = useRef(null);
  const lastAdhanTimeRef = useRef(null);

  // Noms des prières en arabe
  const prayerNames = {
    Fajr: 'الفجر',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء'
  };

  // Initialiser depuis localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem('prayerNotificationsEnabled');
    const savedLocation = localStorage.getItem('prayerLocation');
    const savedAdhanEnabled = localStorage.getItem('adhanEnabled');
    
    if (savedEnabled === 'true') {
      setEnabled(true);
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }
    }
    
    if (savedAdhanEnabled === 'true') {
      setAdhanEnabled(true);
    }

    // Vérifier la permission de notification
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Créer l'élément audio pour l'Adhan
  useEffect(() => {
    adhanAudioRef.current = new Audio('/audio/adhan.mp3');
    
    adhanAudioRef.current.addEventListener('ended', () => {
      setAdhanPlaying(false);
    });
    
    adhanAudioRef.current.addEventListener('error', (e) => {
      console.error('Erreur audio Adhan:', e);
      setAdhanPlaying(false);
    });

    return () => {
      if (adhanAudioRef.current) {
        adhanAudioRef.current.pause();
        adhanAudioRef.current = null;
      }
    };
  }, []);

  // Charger les horaires de prière
  useEffect(() => {
    if (enabled && location) {
      fetchPrayerTimes();
      const interval = setInterval(fetchPrayerTimes, 3600000);
      return () => clearInterval(interval);
    }
  }, [enabled, location]);

  // Vérifier la prochaine prière
  useEffect(() => {
    if (prayerTimes) {
      const checkInterval = setInterval(() => {
        checkNextPrayer();
      }, 30000); // Vérifier toutes les 30 secondes

      checkNextPrayer();
      return () => clearInterval(checkInterval);
    }
  }, [prayerTimes, adhanEnabled]);

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
          alert('Impossible d\'obtenir votre position');
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
    const currentKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

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

    // Au moment de la prière (diff entre 0 et 1 minute)
    if (nextPrayerData.diff <= 1 && nextPrayerData.diff >= 0) {
      const adhanKey = `${currentKey}-${nextPrayerData.name}`;
      
      // Éviter de jouer l'adhan plusieurs fois pour la même prière
      if (lastAdhanTimeRef.current !== adhanKey) {
        lastAdhanTimeRef.current = adhanKey;
        sendNotification(nextPrayerData.name, nextPrayerData.time, false);
        
        // Jouer l'Adhan si activé
        if (adhanEnabled) {
          playAdhan();
        }
      }
    }
  };

  const playAdhan = async () => {
    if (!adhanAudioRef.current || adhanPlaying) return;
    
    try {
      setAdhanPlaying(true);
      adhanAudioRef.current.currentTime = 0;
      await adhanAudioRef.current.play();
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'Adhan:', error);
      setAdhanPlaying(false);
      
      // Essayer avec Web Audio API en fallback
      playAdhanFallback();
    }
  };

  // Fallback avec Web Audio API (son de notification simple)
  const playAdhanFallback = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      
      // Créer un son de notification islamique
      const playTone = (freq, start, duration, vol = 0.3) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(vol, start + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };
      
      const now = ctx.currentTime;
      // Mélodie simple rappelant l'Adhan
      playTone(440, now, 1, 0.4);
      playTone(494, now + 0.3, 0.8, 0.35);
      playTone(523, now + 0.6, 1, 0.4);
      playTone(587, now + 1, 1.2, 0.35);
      playTone(523, now + 1.5, 1.5, 0.4);
      
      setTimeout(() => setAdhanPlaying(false), 3000);
    } catch (e) {
      console.error('Fallback audio failed:', e);
      setAdhanPlaying(false);
    }
  };

  const stopAdhan = () => {
    if (adhanAudioRef.current) {
      adhanAudioRef.current.pause();
      adhanAudioRef.current.currentTime = 0;
      setAdhanPlaying(false);
    }
  };

  const testAdhan = () => {
    if (adhanPlaying) {
      stopAdhan();
    } else {
      playAdhan();
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
      const notification = new Notification(title, {
        body: body,
        icon: '/icon-192x192.png',
        tag: `prayer-${prayerName}-${isBefore ? 'before' : 'now'}`,
        requireInteraction: !isBefore,
        silent: isBefore // Silent si c'est avant, sinon le son système jouera
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Notification error:', error);
    }
  };

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Les notifications ne sont pas supportées par votre navigateur');
      return;
    }

    if (notificationPermission !== 'granted') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission !== 'granted') {
        alert('Veuillez autoriser les notifications');
        return;
      }
    }

    if (!location) {
      getLocation();
    }

    setEnabled(true);
    localStorage.setItem('prayerNotificationsEnabled', 'true');
    
    if (location) {
      fetchPrayerTimes();
    }
  };

  const disableNotifications = () => {
    setEnabled(false);
    localStorage.setItem('prayerNotificationsEnabled', 'false');
    setNextPrayer(null);
    stopAdhan();
  };

  const toggleAdhan = () => {
    const newValue = !adhanEnabled;
    setAdhanEnabled(newValue);
    localStorage.setItem('adhanEnabled', newValue.toString());
    
    if (!newValue) {
      stopAdhan();
    }
  };

  const formatTimeRemaining = (minutes) => {
    if (minutes < 60) {
      return `${minutes} دقيقة`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ''}`;
  };

  return (
    <>
      {!showSettings && (
        <button
          onClick={() => setShowSettings(true)}
          className={`fixed bottom-[140px] sm:bottom-32 right-4 ${
            enabled 
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700' 
              : 'bg-gray-400 dark:bg-gray-600'
          } text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 hover:scale-110 relative`}
          title="مواقيت الصلاة"
          aria-label="فتح إعدادات مواقيت الصلاة"
        >
          {enabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
          {enabled && nextPrayer && nextPrayer.diff < 60 && (
            <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse shadow-md">
              !
            </div>
          )}
          {adhanPlaying && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              🔊
            </div>
          )}
        </button>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                مواقيت الصلاة
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                تنبيهات تلقائية لأوقات الصلاة
              </p>
            </div>

            {/* Toggle Notifications */}
            <div className="mb-4">
              <div className={`p-4 rounded-xl ${
                enabled 
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {enabled ? (
                      <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <BellOff className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`font-semibold ${
                      enabled 
                        ? 'text-purple-700 dark:text-purple-300' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {enabled ? 'التنبيهات مفعلة' : 'التنبيهات معطلة'}
                    </span>
                  </div>
                  <button
                    onClick={enabled ? disableNotifications : enableNotifications}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      enabled
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-purple-500 text-white hover:bg-purple-600'
                    } disabled:opacity-50`}
                  >
                    {loading ? 'جاري...' : enabled ? 'تعطيل' : 'تفعيل'}
                  </button>
                </div>

                {location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {location.lat.toFixed(2)}°, {location.lng.toFixed(2)}°
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Toggle Adhan - Visible seulement quand notifications activées */}
            {enabled && (
              <div className="mb-4">
                <div className={`p-4 rounded-xl ${
                  adhanEnabled 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500' 
                    : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {adhanEnabled ? (
                        <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <span className={`font-semibold block ${
                          adhanEnabled 
                            ? 'text-emerald-700 dark:text-emerald-300' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          الأذان
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          تشغيل الأذان عند حلول وقت الصلاة
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={toggleAdhan}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        adhanEnabled
                          ? 'bg-emerald-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        adhanEnabled ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  {/* Contrôles Adhan */}
                  {adhanEnabled && (
                    <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800">
                      {/* Bouton Test */}
                      <button
                        onClick={testAdhan}
                        className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                          adhanPlaying
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                        }`}
                      >
                        {adhanPlaying ? (
                          <>
                            <VolumeX className="w-4 h-4" />
                            إيقاف الأذان
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            اختبار الأذان
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prochaine prière */}
            {enabled && nextPrayer && (
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">الصلاة القادمة</span>
                  {adhanEnabled && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      🔊 الأذان مفعل
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">
                  {prayerNames[nextPrayer.name]}
                </div>
                <div className="text-lg opacity-90 mb-2">
                  {nextPrayer.time}
                </div>
                <div className="text-sm opacity-75">
                  متبقي: {formatTimeRemaining(nextPrayer.diff)}
                </div>
              </div>
            )}

            {/* Horaires du jour */}
            {enabled && prayerTimes && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-right">
                  مواقيت اليوم
                </h3>
                {Object.entries(prayerTimes).map(([name, time]) => {
                  const isNext = nextPrayer?.name === name;
                  return (
                    <div
                      key={name}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        isNext
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-500'
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          isNext 
                            ? 'text-purple-700 dark:text-purple-300' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {time}
                        </span>
                        {adhanEnabled && isNext && (
                          <Volume2 className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <span className={`font-semibold ${
                        isNext 
                          ? 'text-purple-700 dark:text-purple-300' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {prayerNames[name]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info quand désactivé */}
            {!enabled && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 text-right mb-2">
                  <strong>كيف يعمل:</strong>
                </p>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 text-right">
                  <li>• تنبيه قبل 5 دقائق من كل صلاة</li>
                  <li>• تنبيه عند حلول وقت الأذان</li>
                  <li>• إمكانية تشغيل الأذان تلقائياً 🔊</li>
                  <li>• حساب تلقائي حسب موقعك</li>
                  <li>• تحديث يومي للمواقيت</li>
                </ul>
              </div>
            )}

            {/* Note sur le fichier audio */}
            {enabled && adhanEnabled && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300 text-right">
                  💡 <strong>ملاحظة:</strong> تأكد من وجود ملف الأذان في <code className="bg-amber-200 dark:bg-amber-800 px-1 rounded">/public/audio/adhan.mp3</code>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
