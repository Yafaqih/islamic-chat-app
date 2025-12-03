// pages/prayer-times.js
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Clock, ChevronLeft, MapPin, Bell, Sun, Sunrise, Sunset, Moon, MessageCircle } from 'lucide-react';

// أوقات الصلاة الافتراضية (تُستبدل بالبيانات الفعلية)
const DEFAULT_TIMES = {
  fajr: '05:15',
  sunrise: '06:35',
  dhuhr: '12:10',
  asr: '15:25',
  maghrib: '17:50',
  isha: '19:20'
};

const PRAYERS = [
  { id: 'fajr', name: 'الفجر', icon: Sunrise, color: 'from-indigo-600 to-purple-600' },
  { id: 'sunrise', name: 'الشروق', icon: Sun, color: 'from-orange-500 to-yellow-500' },
  { id: 'dhuhr', name: 'الظهر', icon: Sun, color: 'from-yellow-500 to-orange-500' },
  { id: 'asr', name: 'العصر', icon: Sun, color: 'from-orange-600 to-red-500' },
  { id: 'maghrib', name: 'المغرب', icon: Sunset, color: 'from-red-600 to-purple-600' },
  { id: 'isha', name: 'العشاء', icon: Moon, color: 'from-purple-700 to-indigo-900' },
];

export default function PrayerTimesPage() {
  const [times, setTimes] = useState(DEFAULT_TIMES);
  const [location, setLocation] = useState('جارٍ تحديد الموقع...');
  const [currentTime, setCurrentTime] = useState('');
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    // تحديث الوقت الحالي
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));
      
      // حساب الصلاة القادمة
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      for (const prayer of PRAYERS) {
        if (prayer.id === 'sunrise') continue;
        const [h, m] = times[prayer.id].split(':').map(Number);
        const prayerMinutes = h * 60 + m;
        
        if (prayerMinutes > currentMinutes) {
          setNextPrayer(prayer);
          const diff = prayerMinutes - currentMinutes;
          const hours = Math.floor(diff / 60);
          const mins = diff % 60;
          setCountdown(hours > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${mins} دقيقة`);
          break;
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    // الحصول على الموقع
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await response.json();
            setLocation(data.address.city || data.address.town || data.address.state || 'موقعك الحالي');
          } catch {
            setLocation('موقعك الحالي');
          }
        },
        () => setLocation('يرجى السماح بالوصول للموقع')
      );
    }

    return () => clearInterval(interval);
  }, [times]);

  return (
    <>
      <Head>
        <title>مواقيت الصلاة | أوقات الصلاة اليوم - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="مواقيت الصلاة اليوم | أوقات صلاة الفجر، الظهر، العصر، المغرب، العشاء في مدينتك. تنبيهات الأذان ومعرفة الوقت المتبقي للصلاة القادمة."
        />
        <meta 
          name="keywords" 
          content="مواقيت الصلاة, اوقات الصلاة, صلاة الفجر, صلاة الظهر, صلاة العصر, صلاة المغرب, صلاة العشاء, الأذان, وقت الصلاة, prayer times"
        />
        <link rel="canonical" href="https://www.yafaqih.app/prayer-times" />
        
        {/* Open Graph */}
        <meta property="og:title" content="مواقيت الصلاة | Ya Faqih يا فقيه" />
        <meta property="og:description" content="مواقيت الصلاة اليوم - أوقات الفجر والظهر والعصر والمغرب والعشاء" />
        <meta property="og:url" content="https://www.yafaqih.app/prayer-times" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "مواقيت الصلاة",
              "description": "تطبيق لمعرفة مواقيت الصلاة",
              "url": "https://www.yafaqih.app/prayer-times",
              "applicationCategory": "ReligiousApplication"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-900 to-emerald-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-emerald-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">مواقيت الصلاة</h1>
                <p className="text-emerald-200 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {location}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Current Time & Next Prayer */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-2xl p-6 mb-8 text-center">
            <p className="text-emerald-300 mb-2">الوقت الحالي</p>
            <p className="text-5xl font-bold mb-4">{currentTime}</p>
            
            {nextPrayer && (
              <div className="bg-black/20 rounded-xl p-4 inline-block">
                <p className="text-emerald-300 text-sm">الصلاة القادمة</p>
                <p className="text-2xl font-bold">{nextPrayer.name}</p>
                <p className="text-emerald-200">بعد {countdown}</p>
              </div>
            )}
          </div>

          {/* Prayer Times Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {PRAYERS.map(prayer => {
              const Icon = prayer.icon;
              const isNext = nextPrayer?.id === prayer.id;
              
              return (
                <div 
                  key={prayer.id}
                  className={`bg-gradient-to-br ${prayer.color} rounded-2xl p-5 text-center relative overflow-hidden ${isNext ? 'ring-4 ring-white/50' : ''}`}
                >
                  {isNext && (
                    <span className="absolute top-2 right-2 bg-white text-emerald-700 text-xs px-2 py-1 rounded-full font-bold">
                      القادمة
                    </span>
                  )}
                  <Icon className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <h3 className="text-lg font-bold mb-1">{prayer.name}</h3>
                  <p className="text-2xl font-bold">{times[prayer.id]}</p>
                </div>
              );
            })}
          </div>

          {/* Enable Notifications */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-900 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold">تنبيهات الأذان</h3>
                  <p className="text-gray-400 text-sm">احصل على تنبيه عند دخول وقت الصلاة</p>
                </div>
              </div>
              <Link 
                href="/"
                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl transition"
              >
                تفعيل
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">لديك سؤال عن الصلاة؟</h2>
                <p className="text-emerald-100">اسأل يا فقيه عن أحكام الصلاة وأوقاتها</p>
              </div>
              <Link 
                href="/?prompt=ما حكم تأخير الصلاة عن وقتها"
                className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Quick Questions */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">أسئلة شائعة عن الصلاة</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'ما حكم الجمع بين الصلاتين؟',
                'كيف أقضي الصلاة الفائتة؟',
                'ما هو وقت صلاة الضحى؟',
                'هل يجوز الصلاة قبل الأذان؟',
                'ما حكم صلاة الجماعة؟',
                'كيف أصلي صلاة الاستخارة؟'
              ].map(q => (
                <Link
                  key={q}
                  href={`/?prompt=${q}`}
                  className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-sm"
                >
                  {q}
                </Link>
              ))}
            </div>
          </section>

          {/* SEO Content */}
          <section className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">أهمية الصلاة في وقتها</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                الصلاة عمود الدين وهي أول ما يُحاسب عليه العبد يوم القيامة. 
                قال الله تعالى: ﴿إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا﴾ [النساء: 103].
              </p>
              <p>
                <strong>أوقات الصلوات الخمس:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 mr-4">
                <li><strong>الفجر:</strong> من طلوع الفجر الصادق إلى طلوع الشمس</li>
                <li><strong>الظهر:</strong> من زوال الشمس إلى أن يصير ظل كل شيء مثله</li>
                <li><strong>العصر:</strong> من خروج وقت الظهر إلى اصفرار الشمس</li>
                <li><strong>المغرب:</strong> من غروب الشمس إلى مغيب الشفق الأحمر</li>
                <li><strong>العشاء:</strong> من مغيب الشفق الأحمر إلى نصف الليل</li>
              </ul>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 py-8 px-4 mt-12 border-t border-gray-800">
          <div className="max-w-4xl mx-auto text-center text-gray-400">
            <p>© 2025 Ya Faqih - يا فقيه | مساعدك الإسلامي الذكي</p>
          </div>
        </footer>
      </div>
    </>
  );
}
