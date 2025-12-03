// pages/surah/yaseen.js
import Head from 'next/head';
import Link from 'next/link';
import { Book, ChevronLeft, Play, MessageCircle, Star, Clock, Heart } from 'lucide-react';

const SURAH_INFO = {
  number: 36,
  name: 'يس',
  englishName: 'Yaseen',
  verses: 83,
  type: 'مكية',
  revelation: 41,
  pages: '440-445',
  juz: '22-23'
};

const KEY_THEMES = [
  { title: 'إثبات الرسالة والنبوة', verses: '1-12', description: 'تأكيد نبوة محمد ﷺ وإنذار المكذبين' },
  { title: 'قصة أصحاب القرية', verses: '13-32', description: 'قصة الرسل الثلاثة والرجل المؤمن' },
  { title: 'آيات الله في الكون', verses: '33-44', description: 'دلائل قدرة الله في الخلق' },
  { title: 'البعث والحساب', verses: '51-68', description: 'أهوال يوم القيامة والجزاء' },
];

const VIRTUES = [
  {
    hadith: 'إن لكل شيء قلباً، وقلب القرآن يس',
    source: 'الترمذي',
    icon: '❤️'
  },
  {
    hadith: 'اقرؤوا يس على موتاكم',
    source: 'أبو داود',
    icon: '🤲'
  },
  {
    hadith: 'من قرأ يس في ليلة ابتغاء وجه الله غُفر له',
    source: 'الدارمي',
    icon: '🌙'
  }
];

export default function SurahYaseenPage() {
  return (
    <>
      <Head>
        <title>سورة يس | قراءة وتفسير سورة يس كاملة - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="سورة يس كاملة مكتوبة | فضل سورة يس قلب القرآن. تفسير سورة يس، قصة أصحاب القرية، آيات البعث والحساب. اقرأ سورة يس مع التفسير."
        />
        <meta 
          name="keywords" 
          content="سورة يس, سورة يس مكتوبة, سورة يس كاملة, فضل سورة يس, قراءة سورة يس, تفسير سورة يس, قلب القرآن, سورة يس للميت, سورة يس mp3"
        />
        <link rel="canonical" href="https://www.yafaqih.app/surah/yaseen" />
        
        {/* Open Graph */}
        <meta property="og:title" content="سورة يس | Ya Faqih يا فقيه" />
        <meta property="og:description" content="سورة يس كاملة - قلب القرآن" />
        <meta property="og:url" content="https://www.yafaqih.app/surah/yaseen" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "name": "سورة يس",
              "description": "سورة يس كاملة مع التفسير والفضائل",
              "url": "https://www.yafaqih.app/surah/yaseen"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-rose-900 to-pink-800 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/tafsir" className="inline-flex items-center text-rose-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة لقائمة السور
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-rose-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold">{SURAH_INFO.number}</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">سورة {SURAH_INFO.name}</h1>
                <p className="text-rose-200 mt-2 flex flex-wrap gap-3">
                  <span>{SURAH_INFO.type}</span>
                  <span>•</span>
                  <span>{SURAH_INFO.verses} آية</span>
                  <span>•</span>
                  <span>الجزء {SURAH_INFO.juz}</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Heart of Quran */}
          <div className="bg-gradient-to-r from-rose-900 to-pink-800 rounded-2xl p-6 mb-8 text-center">
            <div className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold mb-2">قلب القرآن</h2>
            <p className="text-rose-200">سورة يس من أعظم سور القرآن الكريم وأكثرها فضلاً</p>
          </div>

          {/* Listen Button */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-900 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold">استمع لسورة يس</h3>
                  <p className="text-gray-400 text-sm">بصوت القارئ مشاري العفاسي</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span>مدة القراءة: ~15 دقيقة</span>
              </div>
            </div>
          </div>

          {/* Virtues */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              فضائل سورة يس
            </h2>
            <div className="space-y-4">
              {VIRTUES.map((virtue, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{virtue.icon}</span>
                    <div>
                      <p className="text-lg leading-relaxed mb-2">«{virtue.hadith}»</p>
                      <p className="text-rose-400 text-sm">📚 {virtue.source}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Themes */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Book className="w-6 h-6 text-rose-500" />
              موضوعات السورة
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {KEY_THEMES.map((theme, index) => (
                <Link
                  key={index}
                  href={`/?prompt=فسر لي ${theme.title} في سورة يس`}
                  className="bg-gray-800 rounded-xl p-5 hover:bg-gray-700 transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg group-hover:text-rose-400 transition">
                      {theme.title}
                    </h3>
                    <span className="text-rose-400 text-sm">الآيات {theme.verses}</span>
                  </div>
                  <p className="text-gray-400">{theme.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Opening Verses */}
          <section className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">من بداية السورة</h2>
            <div className="text-2xl leading-loose text-center font-arabic bg-gray-900/50 p-6 rounded-xl">
              <p className="mb-4">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              <p className="mb-2">يس ﴿١﴾</p>
              <p className="mb-2">وَالْقُرْآنِ الْحَكِيمِ ﴿٢﴾</p>
              <p className="mb-2">إِنَّكَ لَمِنَ الْمُرْسَلِينَ ﴿٣﴾</p>
              <p>عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ ﴿٤﴾</p>
            </div>
          </section>

          {/* Ask Ya Faqih */}
          <div className="bg-gradient-to-r from-rose-800 to-rose-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن سورة يس</h2>
                <p className="text-rose-100">احصل على تفسير مفصل لأي آية</p>
              </div>
              <Link 
                href="/?prompt=فسر لي سورة يس"
                className="bg-white text-rose-700 px-6 py-3 rounded-xl font-bold hover:bg-rose-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Quick Questions */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">أسئلة شائعة عن سورة يس</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'لماذا سميت سورة يس قلب القرآن؟',
                'ما فضل قراءة سورة يس للميت؟',
                'من هو الرجل المؤمن في سورة يس؟',
                'ما معنى يس؟',
                'ما هي قصة أصحاب القرية؟',
                'متى تُقرأ سورة يس؟'
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
            <h2 className="text-2xl font-bold mb-4">عن سورة يس</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                سورة يس هي السورة السادسة والثلاثون في القرآن الكريم، وهي سورة مكية 
                عدد آياتها 83 آية. سُميت بـ"قلب القرآن" لفضلها العظيم.
              </p>
              <p>
                تتناول السورة موضوعات العقيدة الأساسية: إثبات الرسالة، وحدانية الله، 
                البعث والنشور، ومصير المكذبين والمؤمنين.
              </p>
              <p>
                من أبرز قصصها قصة أصحاب القرية الذين جاءهم المرسلون، 
                وقصة الرجل المؤمن الذي جاء من أقصى المدينة يسعى.
              </p>
            </div>
          </section>

          {/* Related Surahs */}
          <section className="mt-8">
            <h2 className="text-xl font-bold mb-4">سور ذات صلة</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'الكهف', number: 18 },
                { name: 'الملك', number: 67 },
                { name: 'الرحمن', number: 55 }
              ].map(surah => (
                <Link
                  key={surah.number}
                  href={`/surah/${surah.name === 'الكهف' ? 'al-kahf' : surah.name === 'الملك' ? 'al-mulk' : 'ar-rahman'}`}
                  className="bg-gray-800 hover:bg-rose-900 p-4 rounded-xl transition text-center"
                >
                  <span className="text-2xl font-bold block">{surah.number}</span>
                  <span>سورة {surah.name}</span>
                </Link>
              ))}
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
