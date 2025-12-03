// pages/hijri-calendar.js
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Moon, Star, MessageCircle } from 'lucide-react';

// أسماء الأشهر الهجرية
const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

// أسماء أيام الأسبوع
const WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// المناسبات الإسلامية
const ISLAMIC_EVENTS = [
  { month: 1, day: 1, name: 'رأس السنة الهجرية', type: 'holiday' },
  { month: 1, day: 10, name: 'يوم عاشوراء', type: 'special' },
  { month: 3, day: 12, name: 'المولد النبوي الشريف', type: 'special' },
  { month: 7, day: 27, name: 'ليلة الإسراء والمعراج', type: 'special' },
  { month: 8, day: 15, name: 'ليلة النصف من شعبان', type: 'special' },
  { month: 9, day: 1, name: 'بداية شهر رمضان', type: 'holiday' },
  { month: 9, day: 27, name: 'ليلة القدر (المرجحة)', type: 'special' },
  { month: 10, day: 1, name: 'عيد الفطر المبارك', type: 'holiday' },
  { month: 12, day: 9, name: 'يوم عرفة', type: 'special' },
  { month: 12, day: 10, name: 'عيد الأضحى المبارك', type: 'holiday' },
];

// تحويل التاريخ الميلادي إلى هجري (تقريبي)
const gregorianToHijri = (date) => {
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + 
            Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - 
             Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  
  return { year, month, day };
};

export default function HijriCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hijriDate, setHijriDate] = useState({ year: 1446, month: 6, day: 1 });
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    const hijri = gregorianToHijri(currentDate);
    setHijriDate(hijri);
    setSelectedMonth(hijri.month);
  }, [currentDate]);

  const getEventsForMonth = (month) => {
    return ISLAMIC_EVENTS.filter(e => e.month === month);
  };

  const nextMonth = () => {
    setSelectedMonth(prev => prev === 12 ? 1 : prev + 1);
  };

  const prevMonth = () => {
    setSelectedMonth(prev => prev === 1 ? 12 : prev - 1);
  };

  return (
    <>
      <Head>
        <title>التقويم الهجري | تحويل التاريخ الهجري والميلادي - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="التقويم الهجري | معرفة التاريخ الهجري اليوم، تحويل التاريخ من هجري لميلادي والعكس. المناسبات الإسلامية والأعياد."
        />
        <meta 
          name="keywords" 
          content="التقويم الهجري, تاريخ اليوم هجري, تحويل التاريخ, الأشهر الهجرية, رمضان, ذو الحجة, المولد النبوي, عيد الفطر, عيد الأضحى"
        />
        <link rel="canonical" href="https://www.yafaqih.app/hijri-calendar" />
        
        {/* Open Graph */}
        <meta property="og:title" content="التقويم الهجري | Ya Faqih يا فقيه" />
        <meta property="og:description" content="التقويم الهجري - معرفة التاريخ الهجري والمناسبات الإسلامية" />
        <meta property="og:url" content="https://www.yafaqih.app/hijri-calendar" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "التقويم الهجري",
              "description": "تطبيق التقويم الهجري والمناسبات الإسلامية",
              "url": "https://www.yafaqih.app/hijri-calendar",
              "applicationCategory": "UtilitiesApplication"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-violet-900 to-violet-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-violet-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">التقويم الهجري</h1>
                <p className="text-violet-200 mt-1">معرفة التاريخ الهجري والمناسبات الإسلامية</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Current Date */}
          <div className="bg-gradient-to-br from-violet-800 to-violet-900 rounded-2xl p-8 mb-8 text-center">
            <Moon className="w-12 h-12 mx-auto mb-4 text-violet-300" />
            <p className="text-violet-300 mb-2">التاريخ الهجري اليوم</p>
            <p className="text-4xl md:text-5xl font-bold mb-2">
              {hijriDate.day} {HIJRI_MONTHS[hijriDate.month - 1]} {hijriDate.year}
            </p>
            <p className="text-violet-300">
              {currentDate.toLocaleDateString('ar-SA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Month Navigation */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={prevMonth}
                className="w-10 h-10 bg-violet-900 rounded-full flex items-center justify-center hover:bg-violet-800 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold">
                {HIJRI_MONTHS[selectedMonth - 1]} {hijriDate.year}
              </h2>
              
              <button 
                onClick={nextMonth}
                className="w-10 h-10 bg-violet-900 rounded-full flex items-center justify-center hover:bg-violet-800 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Events for Selected Month */}
            <div className="space-y-3">
              {getEventsForMonth(selectedMonth).length > 0 ? (
                getEventsForMonth(selectedMonth).map((event, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl flex items-center gap-4 ${
                      event.type === 'holiday' 
                        ? 'bg-gradient-to-r from-green-900 to-green-800' 
                        : 'bg-gradient-to-r from-violet-900 to-violet-800'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold">{event.day}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{event.name}</h3>
                      <p className="text-sm opacity-75">
                        {event.day} {HIJRI_MONTHS[event.month - 1]}
                      </p>
                    </div>
                    {event.type === 'holiday' && (
                      <span className="mr-auto bg-green-600 px-3 py-1 rounded-full text-xs">
                        عطلة
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">
                  لا توجد مناسبات في هذا الشهر
                </p>
              )}
            </div>
          </div>

          {/* All Months */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-violet-400" />
              الأشهر الهجرية
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {HIJRI_MONTHS.map((month, index) => {
                const monthNum = index + 1;
                const hasEvents = ISLAMIC_EVENTS.some(e => e.month === monthNum);
                const isCurrentMonth = monthNum === hijriDate.month;
                
                return (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(monthNum)}
                    className={`p-4 rounded-xl transition text-center ${
                      isCurrentMonth 
                        ? 'bg-violet-600 text-white' 
                        : selectedMonth === monthNum
                          ? 'bg-violet-800 text-white'
                          : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl font-bold block">{monthNum}</span>
                    <span className="text-sm">{month}</span>
                    {hasEvents && (
                      <span className="block mt-1 text-xs text-violet-300">📅</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">المناسبات الإسلامية القادمة</h2>
            <div className="space-y-3">
              {ISLAMIC_EVENTS.map((event, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl"
                >
                  <div className={`w-2 h-2 rounded-full ${event.type === 'holiday' ? 'bg-green-500' : 'bg-violet-500'}`}></div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-sm text-gray-400">
                      {event.day} {HIJRI_MONTHS[event.month - 1]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-violet-800 to-violet-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">لديك سؤال عن المناسبات الإسلامية؟</h2>
                <p className="text-violet-100">اسأل يا فقيه عن فضائل الأشهر والمناسبات</p>
              </div>
              <Link 
                href="/?prompt=ما فضل شهر رمضان"
                className="bg-white text-violet-700 px-6 py-3 rounded-xl font-bold hover:bg-violet-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* SEO Content */}
          <section className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">التقويم الهجري الإسلامي</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                التقويم الهجري هو تقويم قمري يعتمد على دورة القمر، ويتكون من 12 شهراً. 
                بدأ التقويم الهجري من هجرة النبي محمد ﷺ من مكة إلى المدينة.
              </p>
              <p>
                <strong>الأشهر الحرم:</strong> ذو القعدة، ذو الحجة، محرم، ورجب. 
                سُميت بالحرم لتحريم القتال فيها.
              </p>
              <p>
                <strong>أهم المناسبات:</strong> رمضان (شهر الصيام)، عيد الفطر، يوم عرفة، 
                عيد الأضحى، يوم عاشوراء، المولد النبوي.
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
