import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, MapPin, X } from 'lucide-react';

export default function PrayerNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [location, setLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [loading, setLoading] = useState(false);

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
    
    if (savedEnabled === 'true') {
      setEnabled(true);
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }
    }

    // Vérifier la permission de notification
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
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
      }, 60000);

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

    if (nextPrayerData.diff === 0) {
      sendNotification(nextPrayerData.name, nextPrayerData.time, false);
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
        silent: false
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

            <div className="mb-6">
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

            {enabled && nextPrayer && (
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">الصلاة القادمة</span>
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
                      <span className={`font-medium ${
                        isNext 
                          ? 'text-purple-700 dark:text-purple-300' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {time}
                      </span>
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

            {!enabled && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 text-right mb-2">
                  <strong>كيف يعمل:</strong>
                </p>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 text-right">
                  <li>• تنبيه قبل 5 دقائق من كل صلاة</li>
                  <li>• تنبيه عند حلول وقت الأذان</li>
                  <li>• حساب تلقائي حسب موقعك</li>
                  <li>• تحديث يومي للمواقيت</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}