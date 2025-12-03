import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, Clock, MapPin, X, Volume2, VolumeX } from 'lucide-react';

export default function PrayerButton() {
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

  const prayerNames = {
    Fajr: 'الفجر',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء'
  };

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

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

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

    if (nextPrayerData.diff === 5) {
      sendNotification(nextPrayerData.name, nextPrayerData.time, true);
    }

    if (nextPrayerData.diff <= 1 && nextPrayerData.diff >= 0) {
      const adhanKey = `${currentKey}-${nextPrayerData.name}`;
      
      if (lastAdhanTimeRef.current !== adhanKey) {
        lastAdhanTimeRef.current = adhanKey;
        sendNotification(nextPrayerData.name, nextPrayerData.time, false);
        
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
      console.error('Erreur Adhan:', error);
      setAdhanPlaying(false);
      playAdhanFallback();
    }
  };

  const playAdhanFallback = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      
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
        silent: isBefore
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
      alert('المتصفح لا يدعم التنبيهات');
      return;
    }

    if (notificationPermission !== 'granted') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission !== 'granted') {
        alert('يرجى السماح بالتنبيهات');
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
    if (mins === 0) {
      return `${hours} ساعة`;
    }
    return `${hours} ساعة و ${mins} دقيقة`;
  };

  return (
    <>
      {!showSettings && (
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
          {adhanPlaying && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
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
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
              مواقيت الصلاة
            </h2>

            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 dark:text-gray-300 font-medium">تفعيل التنبيهات</span>
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

            {enabled && (
              <div className="flex items-center justify-between mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="flex items-center gap-2">
                  {adhanEnabled ? (
                    <Volume2 className="w-5 h-5 text-purple-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium block">صوت الأذان</span>
                    <span className="text-xs text-gray-500">تشغيل الأذان عند حلول وقت الصلاة</span>
                  </div>
                </div>
                <button
                  onClick={toggleAdhan}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    adhanEnabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                    adhanEnabled ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            )}

            {enabled && adhanEnabled && (
              <button
                onClick={testAdhan}
                className={`w-full mb-4 py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  adhanPlaying
                    ? 'bg-red-500 text-white'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
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
            )}

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
                  <div className="mt-2 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    🔊 الأذان مفعل
                  </div>
                )}
              </div>
            )}

            {!enabled && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BellOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>فعّل التنبيهات للحصول على إشعارات الصلاة</p>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
