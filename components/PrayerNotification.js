import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, X, Volume2, VolumeX, Smartphone, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function PrayerNotification({ 
  isOpen = null,
  onClose = null,
  showFloatingButton = true
}) {
  const { language, isRTL } = useLanguage();
  
  const [enabled, setEnabled] = useState(false);
  const [location, setLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(true);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  
  const [adhanEnabled, setAdhanEnabled] = useState(false);
  const [adhanPlaying, setAdhanPlaying] = useState(false);
  const audioRef = useRef(null);

  // Traductions
  const txt = {
    ar: {
      prayerTimes: '🕌 مواقيت الصلاة',
      enableNotifications: 'تفعيل التنبيهات',
      adhanSound: 'صوت الأذان',
      adhanDesc: 'تشغيل الأذان عند وقت الصلاة',
      testAdhan: 'تجربة صوت الأذان',
      stopAdhan: 'إيقاف الأذان',
      nextPrayer: 'الصلاة القادمة',
      inTime: 'بعد',
      adhanWillPlay: 'سيتم تشغيل الأذان',
      enableForNotif: 'فعّل التنبيهات للحصول على إشعارات الصلاة',
      volumeTip: '💡 تأكد من رفع صوت الجهاز لسماع الأذان',
      locationError: 'تعذر الحصول على موقعك',
      notifBefore: 'صلاة {prayer} بعد 5 دقائق',
      notifNow: 'حان وقت صلاة {prayer}',
      fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
      addToHome: '📱 أضف التطبيق للشاشة الرئيسية',
      addToHomeDesc: 'لتفعيل التنبيهات على الآيفون، يجب إضافة يا فقيه للشاشة الرئيسية',
      step1: 'اضغط على زر المشاركة',
      step2: 'اختر "إضافة للشاشة الرئيسية"',
      step3: 'افتح التطبيق من الشاشة الرئيسية',
      step4: 'فعّل التنبيهات 🔔',
      later: 'لاحقاً',
      enableAdhanOnly: 'فعّل الأذان فقط',
      hours: 'ساعة',
      minutes: 'دقيقة',
      hour: 'ساعة',
      minute: 'دقيقة',
      and: 'و'
    },
    fr: {
      prayerTimes: '🕌 Heures de prière',
      enableNotifications: 'Activer les notifications',
      adhanSound: 'Son de l\'Adhan',
      adhanDesc: 'Jouer l\'Adhan à l\'heure de la prière',
      testAdhan: 'Tester le son de l\'Adhan',
      stopAdhan: 'Arrêter l\'Adhan',
      nextPrayer: 'Prochaine prière',
      inTime: 'Dans',
      adhanWillPlay: 'L\'Adhan sera joué',
      enableForNotif: 'Activez les notifications pour les rappels de prière',
      volumeTip: '💡 Assurez-vous que le volume est activé pour entendre l\'Adhan',
      locationError: 'Impossible d\'obtenir votre position',
      notifBefore: 'Prière {prayer} dans 5 minutes',
      notifNow: 'C\'est l\'heure de la prière {prayer}',
      fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
      addToHome: '📱 Ajouter à l\'écran d\'accueil',
      addToHomeDesc: 'Pour activer les notifications sur iPhone, ajoutez Ya Faqih à l\'écran d\'accueil',
      step1: 'Appuyez sur le bouton de partage',
      step2: 'Choisissez "Sur l\'écran d\'accueil"',
      step3: 'Ouvrez l\'app depuis l\'écran d\'accueil',
      step4: 'Activez les notifications 🔔',
      later: 'Plus tard',
      enableAdhanOnly: 'Activer l\'Adhan uniquement',
      hours: 'heures',
      minutes: 'minutes',
      hour: 'heure',
      minute: 'minute',
      and: 'et'
    },
    en: {
      prayerTimes: '🕌 Prayer Times',
      enableNotifications: 'Enable notifications',
      adhanSound: 'Adhan sound',
      adhanDesc: 'Play Adhan at prayer time',
      testAdhan: 'Test Adhan sound',
      stopAdhan: 'Stop Adhan',
      nextPrayer: 'Next prayer',
      inTime: 'In',
      adhanWillPlay: 'Adhan will play',
      enableForNotif: 'Enable notifications to receive prayer reminders',
      volumeTip: '💡 Make sure your volume is up to hear the Adhan',
      locationError: 'Unable to get your location',
      notifBefore: '{prayer} prayer in 5 minutes',
      notifNow: 'It\'s time for {prayer} prayer',
      fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
      addToHome: '📱 Add to Home Screen',
      addToHomeDesc: 'To enable notifications on iPhone, add Ya Faqih to your home screen',
      step1: 'Tap the share button',
      step2: 'Choose "Add to Home Screen"',
      step3: 'Open the app from your home screen',
      step4: 'Enable notifications 🔔',
      later: 'Later',
      enableAdhanOnly: 'Enable Adhan only',
      hours: 'hours',
      minutes: 'minutes',
      hour: 'hour',
      minute: 'minute',
      and: 'and'
    }
  }[language] || {
    prayerTimes: '🕌 مواقيت الصلاة', enableNotifications: 'تفعيل التنبيهات', adhanSound: 'صوت الأذان', adhanDesc: 'تشغيل الأذان عند وقت الصلاة', testAdhan: 'تجربة صوت الأذان', stopAdhan: 'إيقاف الأذان', nextPrayer: 'الصلاة القادمة', inTime: 'بعد', adhanWillPlay: 'سيتم تشغيل الأذان', enableForNotif: 'فعّل التنبيهات للحصول على إشعارات الصلاة', volumeTip: '💡 تأكد من رفع صوت الجهاز لسماع الأذان', locationError: 'تعذر الحصول على موقعك', fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء', addToHome: '📱 أضف التطبيق للشاشة الرئيسية', later: 'لاحقاً', enableAdhanOnly: 'فعّل الأذان فقط', hours: 'ساعة', minutes: 'دقيقة', and: 'و'
  };

  const prayerNames = {
    Fajr: txt.fajr,
    Dhuhr: txt.dhuhr,
    Asr: txt.asr,
    Maghrib: txt.maghrib,
    Isha: txt.isha
  };

  useEffect(() => {
    if (isOpen !== null) {
      setShowSettings(isOpen);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowSettings(false);
    if (onClose) onClose();
  };

  const checkNotificationSupport = () => {
    if (!('Notification' in window)) {
      return { supported: false, reason: 'api_missing' };
    }
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      return { supported: false, reason: 'not_https' };
    }
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isStandalone) {
      return { supported: false, reason: 'ios_not_pwa' };
    }
    return { supported: true, reason: null };
  };

  const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOSDevice = () => /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isPWA = () => window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

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
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLocation(loc);
          localStorage.setItem('prayerLocation', JSON.stringify(loc));
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert(txt.locationError);
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
          Fajr: timings.Fajr, Dhuhr: timings.Dhuhr, Asr: timings.Asr, Maghrib: timings.Maghrib, Isha: timings.Isha
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
      if (adhanEnabled) playAdhan();
    }
  };

  const sendNotification = (prayerName, time, isBefore) => {
    if (notificationPermission !== 'granted') return;
    const prayerNameLocal = prayerNames[prayerName];
    const body = isBefore 
      ? txt.notifBefore.replace('{prayer}', prayerNameLocal)
      : txt.notifNow.replace('{prayer}', prayerNameLocal);
    
    new Notification('Ya Faqih - يا فقيه', { body, icon: '/icon-192.png', badge: '/icon-192.png' });
  };

  const playAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio('/sounds/adhan.mp3');
    audio.volume = 0.7;
    audioRef.current = audio;
    setAdhanPlaying(true);
    audio.play().catch(err => console.log('Adhan playback failed:', err));
    audio.onended = () => setAdhanPlaying(false);
  };

  const stopAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
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

  const toggleAdhan = () => {
    const newState = !adhanEnabled;
    setAdhanEnabled(newState);
    localStorage.setItem('adhanEnabled', newState.toString());
  };

  const enableNotifications = async () => {
    setLoading(true);
    const support = checkNotificationSupport();
    
    if (!support.supported) {
      if (support.reason === 'ios_not_pwa' && isIOSDevice()) {
        setShowInstallGuide(true);
        setLoading(false);
        return;
      }
      if (!location) getLocation();
      setEnabled(true);
      localStorage.setItem('prayerNotificationsEnabled', 'true');
      setLoading(false);
      return;
    }

    if (!location) getLocation();

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setEnabled(true);
        localStorage.setItem('prayerNotificationsEnabled', 'true');
        new Notification('Ya Faqih - يا فقيه', { body: txt.enableNotifications + ' ✅', icon: '/icon-192.png' });
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
    setLoading(false);
  };

  const disableNotifications = () => {
    setEnabled(false);
    localStorage.setItem('prayerNotificationsEnabled', 'false');
    stopAdhan();
  };

  const formatTimeRemaining = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ${hours > 1 ? txt.hours : txt.hour} ${txt.and} ${mins} ${mins > 1 ? txt.minutes : txt.minute}`;
    }
    return `${mins} ${mins > 1 ? txt.minutes : txt.minute}`;
  };

  return (
    <>
      <audio ref={audioRef} />

      {/* Guide d'installation iOS */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{txt.addToHome}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{txt.addToHomeDesc}</p>
              
              <div className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span className="text-gray-700 dark:text-gray-300">{txt.step1} <span className="inline-block">⬆️</span></span>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span className="text-gray-700 dark:text-gray-300">{txt.step2}</span>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span className="text-gray-700 dark:text-gray-300">{txt.step3}</span>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span className="text-gray-700 dark:text-gray-300">{txt.step4}</span>
                </div>
              </div>

              <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button onClick={() => setShowInstallGuide(false)} className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium">
                  {txt.later}
                </button>
                <button
                  onClick={() => {
                    setShowInstallGuide(false);
                    if (!location) getLocation();
                    setEnabled(true);
                    localStorage.setItem('prayerNotificationsEnabled', 'true');
                    setAdhanEnabled(true);
                    localStorage.setItem('adhanEnabled', 'true');
                  }}
                  className="flex-1 py-3 px-4 bg-purple-500 text-white rounded-xl font-medium"
                >
                  {txt.enableAdhanOnly}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button onClick={handleClose} className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}>
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">{txt.prayerTimes}</h2>

            {/* Toggle Notifications */}
            <div className={`flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Bell className="w-5 h-5 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">{txt.enableNotifications}</span>
              </div>
              <button
                onClick={enabled ? disableNotifications : enableNotifications}
                disabled={loading}
                className={`relative w-14 h-8 rounded-full transition-all ${enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${enabled ? (isRTL ? 'left-1' : 'right-1') : (isRTL ? 'right-1' : 'left-1')}`} />
              </button>
            </div>

            {/* Toggle Adhan */}
            <div className={`flex items-center justify-between mb-4 p-3 rounded-xl transition-all ${isRTL ? 'flex-row-reverse' : ''} ${
              enabled 
                ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700' 
                : 'bg-gray-100 dark:bg-gray-700/30 opacity-50'
            }`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {adhanEnabled ? <Volume2 className="w-5 h-5 text-purple-500" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <span className="text-gray-700 dark:text-gray-300 font-medium block">{txt.adhanSound}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{txt.adhanDesc}</span>
                </div>
              </div>
              <button
                onClick={toggleAdhan}
                disabled={!enabled}
                className={`relative w-14 h-8 rounded-full transition-all ${adhanEnabled && enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'} ${!enabled ? 'cursor-not-allowed' : ''}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${adhanEnabled && enabled ? (isRTL ? 'left-1' : 'right-1') : (isRTL ? 'right-1' : 'left-1')}`} />
              </button>
            </div>

            {/* Bouton test Adhan */}
            {enabled && adhanEnabled && (
              <button
                onClick={testAdhan}
                className={`w-full mb-4 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  adhanPlaying 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200'
                }`}
              >
                {adhanPlaying ? <><VolumeX className="w-5 h-5" />{txt.stopAdhan}</> : <><Volume2 className="w-5 h-5" />{txt.testAdhan}</>}
              </button>
            )}

            {/* Horaires des prières */}
            {enabled && prayerTimes && (
              <div className="space-y-2 mb-4">
                {Object.entries(prayerTimes).map(([name, time]) => {
                  const isNext = nextPrayer?.name === name;
                  return (
                    <div key={name} className={`flex justify-between items-center p-3 rounded-xl ${isRTL ? 'flex-row-reverse' : ''} ${
                      isNext ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-500' : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}>
                      <span className={`font-mono ${isNext ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-400'}`}>{time}</span>
                      <span className={`font-semibold ${isNext ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>{prayerNames[name]}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Prochaine prière */}
            {enabled && nextPrayer && (
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white text-center">
                <div className="text-sm opacity-80 mb-1">{txt.nextPrayer}</div>
                <div className="text-2xl font-bold mb-1">{prayerNames[nextPrayer.name]}</div>
                <div className="text-sm opacity-80">{txt.inTime} {formatTimeRemaining(nextPrayer.diff)}</div>
                {adhanEnabled && (
                  <div className="mt-2 text-xs opacity-70 flex items-center justify-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    {txt.adhanWillPlay}
                  </div>
                )}
              </div>
            )}

            {/* État désactivé */}
            {!enabled && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BellOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{txt.enableForNotif}</p>
              </div>
            )}

            {/* Note sur l'Adhan */}
            {enabled && <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">{txt.volumeTip}</p>}
          </div>
        </div>
      )}
    </>
  );
}
