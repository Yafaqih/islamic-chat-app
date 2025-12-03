// pages/qibla.js
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Compass, ChevronLeft, MapPin, Navigation, MessageCircle, AlertCircle } from 'lucide-react';

export default function QiblaPage() {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceDirection, setDeviceDirection] = useState(0);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // حساب اتجاه القبلة
  const calculateQibla = (lat, lon) => {
    const meccaLat = 21.4225;
    const meccaLon = 39.8262;
    
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    const meccaLatRad = (meccaLat * Math.PI) / 180;
    const meccaLonRad = (meccaLon * Math.PI) / 180;
    
    const y = Math.sin(meccaLonRad - lonRad);
    const x = Math.cos(latRad) * Math.tan(meccaLatRad) - Math.sin(latRad) * Math.cos(meccaLonRad - lonRad);
    
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    qibla = (qibla + 360) % 360;
    
    return qibla;
  };

  const requestPermissions = async () => {
    try {
      // طلب إذن الموقع
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lon: longitude });
      
      const qibla = calculateQibla(latitude, longitude);
      setQiblaDirection(qibla);

      // طلب إذن البوصلة (iOS)
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        }
      } else {
        setPermissionGranted(true);
      }
    } catch (err) {
      setError('يرجى السماح بالوصول للموقع والبوصلة');
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;

    const handleOrientation = (event) => {
      let heading;
      if (event.webkitCompassHeading) {
        heading = event.webkitCompassHeading;
      } else if (event.alpha) {
        heading = 360 - event.alpha;
      }
      if (heading !== undefined) {
        setDeviceDirection(heading);
      }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted]);

  const rotation = qiblaDirection !== null ? qiblaDirection - deviceDirection : 0;

  return (
    <>
      <Head>
        <title>اتجاه القبلة | بوصلة القبلة - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="اتجاه القبلة | بوصلة القبلة لتحديد اتجاه الكعبة المشرفة. معرفة اتجاه القبلة من موقعك الحالي بدقة عالية."
        />
        <meta 
          name="keywords" 
          content="اتجاه القبلة, بوصلة القبلة, تحديد القبلة, الكعبة, مكة المكرمة, قبلة الصلاة, Qibla direction, Qibla compass"
        />
        <link rel="canonical" href="https://www.yafaqih.app/qibla" />
        
        {/* Open Graph */}
        <meta property="og:title" content="اتجاه القبلة | Ya Faqih يا فقيه" />
        <meta property="og:description" content="بوصلة القبلة - حدد اتجاه الكعبة المشرفة من موقعك" />
        <meta property="og:url" content="https://www.yafaqih.app/qibla" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "بوصلة القبلة",
              "description": "تطبيق لتحديد اتجاه القبلة",
              "url": "https://www.yafaqih.app/qibla",
              "applicationCategory": "ReligiousApplication"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-amber-900 to-amber-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-amber-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">اتجاه القبلة</h1>
                <p className="text-amber-200 mt-1">بوصلة القبلة لتحديد اتجاه الكعبة المشرفة</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Compass */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 mb-8">
            {!permissionGranted ? (
              <div className="text-center py-12">
                <Compass className="w-20 h-20 mx-auto mb-6 text-amber-500 opacity-50" />
                <h2 className="text-2xl font-bold mb-4">تحديد اتجاه القبلة</h2>
                <p className="text-gray-400 mb-6">
                  يحتاج التطبيق للوصول إلى موقعك والبوصلة لتحديد اتجاه القبلة
                </p>
                <button
                  onClick={requestPermissions}
                  className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-xl font-bold transition text-lg"
                >
                  🕋 تحديد اتجاه القبلة
                </button>
                
                {error && (
                  <div className="mt-4 bg-red-900/50 text-red-300 p-4 rounded-xl flex items-center gap-2 justify-center">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                {/* Location Info */}
                {location && (
                  <div className="flex items-center justify-center gap-2 text-amber-400 mb-4">
                    <MapPin className="w-5 h-5" />
                    <span>موقعك الحالي: {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°</span>
                  </div>
                )}

                {/* Compass Display */}
                <div className="relative w-72 h-72 mx-auto mb-6">
                  {/* Outer Ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-amber-600/30"></div>
                  
                  {/* Compass Rose */}
                  <div 
                    className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 shadow-2xl flex items-center justify-center"
                    style={{ transform: `rotate(${-deviceDirection}deg)`, transition: 'transform 0.3s ease-out' }}
                  >
                    {/* Cardinal Points */}
                    <span className="absolute top-4 text-sm font-bold text-red-500">N</span>
                    <span className="absolute bottom-4 text-sm font-bold text-gray-400">S</span>
                    <span className="absolute left-4 text-sm font-bold text-gray-400">W</span>
                    <span className="absolute right-4 text-sm font-bold text-gray-400">E</span>
                  </div>

                  {/* Qibla Arrow */}
                  <div 
                    className="absolute inset-8 flex items-center justify-center"
                    style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease-out' }}
                  >
                    <div className="relative">
                      <Navigation className="w-16 h-16 text-amber-500 transform -rotate-45" fill="currentColor" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl">🕋</span>
                    </div>
                  </div>

                  {/* Center Point */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-amber-500 rounded-full shadow-lg"></div>
                  </div>
                </div>

                {/* Direction Info */}
                <div className="bg-amber-900/30 rounded-xl p-4 inline-block">
                  <p className="text-amber-300 text-sm">اتجاه القبلة</p>
                  <p className="text-3xl font-bold">{qiblaDirection?.toFixed(1)}°</p>
                  <p className="text-amber-200 text-sm mt-1">
                    وجّه السهم نحو الكعبة 🕋
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-amber-500" />
              كيفية الاستخدام
            </h2>
            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <span>اضغط على زر "تحديد اتجاه القبلة" للسماح بالوصول</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <span>امسك الجهاز بشكل أفقي (مستوٍ)</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <span>استدر حتى يشير السهم نحو أعلى الشاشة</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                <span>الاتجاه الذي تواجهه الآن هو اتجاه القبلة</span>
              </li>
            </ol>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-amber-800 to-amber-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">لديك سؤال عن القبلة؟</h2>
                <p className="text-amber-100">اسأل يا فقيه عن أحكام استقبال القبلة</p>
              </div>
              <Link 
                href="/?prompt=ما حكم الصلاة إلى غير القبلة"
                className="bg-white text-amber-700 px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* SEO Content */}
          <section className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">أهمية استقبال القبلة</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                استقبال القبلة شرط من شروط صحة الصلاة. قال الله تعالى: 
                ﴿فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ وَحَيْثُ مَا كُنتُمْ فَوَلُّوا وُجُوهَكُمْ شَطْرَهُ﴾ [البقرة: 144].
              </p>
              <p>
                <strong>القبلة</strong> هي الكعبة المشرفة في مكة المكرمة، وهي أول بيت وُضع للناس. 
                يجب على المسلم استقبالها في الصلاة المفروضة والنافلة إذا كان قادراً.
              </p>
              <p>
                <strong>حالات يُعفى فيها من استقبال القبلة:</strong> صلاة الخوف الشديد، 
                صلاة النافلة على الراحلة في السفر، عدم القدرة على معرفة الاتجاه بعد الاجتهاد.
              </p>
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
