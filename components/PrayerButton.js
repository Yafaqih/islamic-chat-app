// components/PrayerButton.js
// Bouton simplifié pour afficher les notifications de prière dans le header
import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

export default function PrayerButton() {
  const [enabled, setEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);

  // Charger les préférences
  useEffect(() => {
    const savedEnabled = localStorage.getItem('prayerNotificationsEnabled');
    if (savedEnabled !== null) {
      setEnabled(savedEnabled === 'true');
    }
  }, []);

  // Récupérer les horaires de prière
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      if (!enabled) return;

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const timestamp = Math.floor(Date.now() / 1000);
        
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=2`
        );
        
        const data = await response.json();
        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
          calculateNextPrayer(data.data.timings);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      }
    };

    fetchPrayerTimes();
    const interval = setInterval(fetchPrayerTimes, 60000); // Mise à jour chaque minute

    return () => clearInterval(interval);
  }, [enabled]);

  const calculateNextPrayer = (timings) => {
    const now = new Date();
    const prayers = [
      { name: 'الفجر', time: timings.Fajr },
      { name: 'الظهر', time: timings.Dhuhr },
      { name: 'العصر', time: timings.Asr },
      { name: 'المغرب', time: timings.Maghrib },
      { name: 'العشاء', time: timings.Isha },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':');
      const prayerTime = new Date();
      prayerTime.setHours(parseInt(hours), parseInt(minutes), 0);

      if (prayerTime > now) {
        const diff = Math.floor((prayerTime - now) / 60000); // Différence en minutes
        setNextPrayer({ ...prayer, diff });
        return;
      }
    }

    // Si toutes les prières sont passées, la prochaine est Fajr demain
    const [hours, minutes] = timings.Fajr.split(':');
    const fajrTomorrow = new Date();
    fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
    fajrTomorrow.setHours(parseInt(hours), parseInt(minutes), 0);
    const diff = Math.floor((fajrTomorrow - now) / 60000);
    setNextPrayer({ name: 'الفجر', time: timings.Fajr, diff });
  };

  const toggleNotifications = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    localStorage.setItem('prayerNotificationsEnabled', newEnabled.toString());
    
    if (newEnabled) {
      // Demander la permission pour les notifications
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  return (
    <>
      {/* Bouton dans le header */}
      <button
        onClick={() => setShowSettings(true)}
        className={`p-2 hover:bg-white/10 rounded-lg transition-colors relative ${
          enabled ? '' : 'opacity-60'
        }`}
        title="مواقيت الصلاة"
      >
        {enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        
        {/* Badge si prière dans moins de 60 min */}
        {enabled && nextPrayer && nextPrayer.diff < 60 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold animate-pulse">
            !
          </div>
        )}
      </button>

      {/* Modal Paramètres */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              مواقيت الصلاة
            </h2>

            {/* Toggle Notifications */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                تفعيل التنبيهات
              </span>
              <button
                onClick={toggleNotifications}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-1' : 'translate-x-7'
                  }`}
                />
              </button>
            </div>

            {/* Horaires de prière */}
            {enabled && prayerTimes && (
              <div className="space-y-3">
                {[
                  { name: 'الفجر', time: prayerTimes.Fajr },
                  { name: 'الظهر', time: prayerTimes.Dhuhr },
                  { name: 'العصر', time: prayerTimes.Asr },
                  { name: 'المغرب', time: prayerTimes.Maghrib },
                  { name: 'العشاء', time: prayerTimes.Isha },
                ].map((prayer) => (
                  <div
                    key={prayer.name}
                    className={`flex justify-between items-center p-3 rounded-xl ${
                      nextPrayer?.name === prayer.name
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-500'
                        : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {prayer.name}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 font-mono">
                      {prayer.time}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Prochaine prière */}
            {enabled && nextPrayer && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl text-white text-center">
                <p className="text-sm opacity-90 mb-1">الصلاة القادمة</p>
                <p className="text-2xl font-bold">{nextPrayer.name}</p>
                <p className="text-sm opacity-90 mt-1">
                  {nextPrayer.diff < 60
                    ? `بعد ${nextPrayer.diff} دقيقة`
                    : `بعد ${Math.floor(nextPrayer.diff / 60)} ساعة`}
                </p>
              </div>
            )}

            {!enabled && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <BellOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>قم بتفعيل التنبيهات لعرض المواقيت</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}