// pages/ramadan.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Moon, ChevronLeft, MessageCircle, Sun, Utensils, BookOpen, Gift, Calendar } from 'lucide-react';

const RAMADAN_TOPICS = [
  {
    icon: Moon,
    title: 'فضائل رمضان',
    items: [
      'شهر نزول القرآن الكريم',
      'فيه ليلة القدر خير من ألف شهر',
      'تُفتح أبواب الجنة وتُغلق أبواب النار',
      'تُصفد الشياطين',
      'من صامه إيماناً واحتساباً غُفر له ما تقدم من ذنبه'
    ]
  },
  {
    icon: Utensils,
    title: 'أحكام الصيام',
    items: [
      'الإمساك عن الطعام والشراب من الفجر إلى المغرب',
      'النية من الليل للصيام الواجب',
      'من أكل أو شرب ناسياً فليتم صومه',
      'يُباح الفطر للمريض والمسافر مع القضاء',
      'الحامل والمرضع لهما رخصة الفطر'
    ]
  },
  {
    icon: BookOpen,
    title: 'العبادات في رمضان',
    items: [
      'قراءة القرآن وختمه',
      'صلاة التراويح (8 أو 20 ركعة)',
      'قيام الليل وخاصة العشر الأواخر',
      'الاعتكاف في المسجد',
      'الإكثار من الذكر والدعاء',
      'إطعام الصائمين'
    ]
  }
];

const MUFTIRAT = [
  { action: 'الأكل والشرب عمداً', ruling: 'يُبطل الصوم ويوجب القضاء' },
  { action: 'الجماع في نهار رمضان', ruling: 'يُبطل الصوم ويوجب القضاء والكفارة' },
  { action: 'الاستقاءة (التقيؤ عمداً)', ruling: 'يُبطل الصوم ويوجب القضاء' },
  { action: 'الحيض والنفاس', ruling: 'يُبطل الصوم ويوجب القضاء' },
  { action: 'الاحتلام', ruling: 'لا يُبطل الصوم' },
  { action: 'السواك ومعجون الأسنان', ruling: 'لا يُبطل الصوم (مع الاحتياط)' },
  { action: 'الاكتحال وقطرة العين', ruling: 'لا يُبطل الصوم على الراجح' },
  { action: 'الحقن غير المغذية', ruling: 'لا تُبطل الصوم' },
];

const SUNNAH_ACTS = [
  { act: 'تعجيل الفطر', description: 'المبادرة بالفطر عند غروب الشمس' },
  { act: 'الفطر على رطب أو تمر', description: 'وإلا فعلى ماء' },
  { act: 'دعاء الفطر', description: 'ذهب الظمأ وابتلت العروق وثبت الأجر' },
  { act: 'تأخير السحور', description: 'قرب الفجر ما أمكن' },
  { act: 'الإكثار من الصدقة', description: 'كان النبي ﷺ أجود ما يكون في رمضان' },
];

export default function RamadanPage() {
  return (
    <>
      <Head>
        <title>شهر رمضان | أحكام الصيام وفضائله - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="دليل شامل لشهر رمضان المبارك | فضائل رمضان، أحكام الصيام، مفسدات الصوم، صلاة التراويح، ليلة القدر، زكاة الفطر. كل ما تحتاج معرفته عن رمضان."
        />
        <meta 
          name="keywords" 
          content="رمضان, شهر رمضان, الصيام, أحكام الصيام, مفسدات الصوم, صلاة التراويح, ليلة القدر, السحور, الإفطار, زكاة الفطر, فضل رمضان"
        />
        <link rel="canonical" href="https://www.yafaqih.app/ramadan" />
        
        <meta property="og:title" content="شهر رمضان | Ya Faqih يا فقيه" />
        <meta property="og:description" content="دليل شامل لشهر رمضان - أحكام الصيام وفضائله" />
        <meta property="og:url" content="https://www.yafaqih.app/ramadan" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-900 to-indigo-800 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-purple-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                <Moon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">شهر رمضان المبارك</h1>
                <p className="text-purple-200 mt-1">شهر الصيام والقيام وتلاوة القرآن</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Intro */}
          <div className="bg-purple-900/30 rounded-2xl p-6 mb-8 text-center">
            <p className="text-xl font-arabic text-white mb-4">
              ﴿شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ﴾
            </p>
            <p className="text-purple-300">سورة البقرة - الآية 185</p>
          </div>

          {/* Topics */}
          <div className="space-y-6 mb-8">
            {RAMADAN_TOPICS.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <div key={index} className="bg-gray-800 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <Icon className="w-6 h-6 text-purple-400" />
                    {topic.title}
                  </h2>
                  <ul className="space-y-2">
                    {topic.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="text-purple-400 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Muftirat */}
          <section className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              ⚠️ مفسدات الصوم وما لا يُفسده
            </h2>
            <div className="space-y-3">
              {MUFTIRAT.map((item, index) => (
                <div key={index} className="flex items-start gap-4 bg-gray-900/50 rounded-xl p-3">
                  <span className="font-bold text-white flex-1">{item.action}</span>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    item.ruling.includes('يُبطل') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                  }`}>
                    {item.ruling}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Sunnah Acts */}
          <section className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sun className="w-6 h-6 text-yellow-500" />
              سنن الصيام
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {SUNNAH_ACTS.map((item, index) => (
                <div key={index} className="bg-gray-900/50 rounded-xl p-4">
                  <p className="font-bold text-yellow-400">{item.act}</p>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Laylat al-Qadr */}
          <section className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              ✨ ليلة القدر
            </h2>
            <p className="text-gray-200 mb-4">
              ليلة القدر خير من ألف شهر، تُطلب في العشر الأواخر من رمضان، 
              وأرجى الليالي الوتر منها (21، 23، 25، 27، 29).
            </p>
            <div className="bg-black/20 rounded-xl p-4">
              <p className="text-purple-300 font-bold mb-2">دعاء ليلة القدر:</p>
              <p className="text-xl font-arabic text-white">
                اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-purple-800 to-indigo-600 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن رمضان</h2>
                <p className="text-purple-100">أجوبة لجميع أسئلتك عن الصيام والقيام</p>
              </div>
              <Link 
                href="/?prompt=ما هي أحكام الصيام في رمضان"
                className="bg-white text-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Quick Questions */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">أسئلة شائعة عن رمضان</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'هل يجوز السواك للصائم؟',
                'ما حكم من أفطر ناسياً؟',
                'كيف أصلي التراويح؟',
                'ما هي كفارة الجماع في رمضان؟',
                'متى تجب زكاة الفطر؟',
                'ما حكم القيء للصائم؟'
              ].map(question => (
                <Link
                  key={question}
                  href={`/?prompt=${question}`}
                  className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-gray-300 hover:text-white"
                >
                  {question}
                </Link>
              ))}
            </div>
          </section>

          {/* Related */}
          <section>
            <h2 className="text-xl font-bold mb-4">مواضيع ذات صلة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/adhkar" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-center">
                <p className="text-2xl mb-1">📿</p>
                <p>الأذكار</p>
              </Link>
              <Link href="/dua" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-center">
                <p className="text-2xl mb-1">🤲</p>
                <p>الأدعية</p>
              </Link>
              <Link href="/tafsir" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-center">
                <p className="text-2xl mb-1">📖</p>
                <p>التفسير</p>
              </Link>
              <Link href="/zakat" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-center">
                <p className="text-2xl mb-1">💰</p>
                <p>الزكاة</p>
              </Link>
            </div>
          </section>
        </main>

        <footer className="bg-gray-900 py-8 px-4 mt-12 border-t border-gray-800">
          <div className="max-w-4xl mx-auto text-center text-gray-400">
            <p>© 2025 Ya Faqih - يا فقيه | مساعدك الإسلامي الذكي</p>
          </div>
        </footer>
      </div>
    </>
  );
}
