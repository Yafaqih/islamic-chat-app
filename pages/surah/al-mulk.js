// pages/surah/al-mulk.js
import Head from 'next/head';
import Link from 'next/link';
import { Book, ChevronLeft, Play, MessageCircle, Star, Clock, Shield } from 'lucide-react';

const SURAH_INFO = {
  number: 67,
  name: 'الملك',
  englishName: 'Al-Mulk',
  otherNames: ['تبارك', 'المنجية', 'الواقية', 'المانعة'],
  verses: 30,
  type: 'مكية',
  pages: '562-564',
  juz: '29'
};

const KEY_THEMES = [
  { title: 'ملك الله وقدرته', verses: '1-5', description: 'تبارك الذي بيده الملك وخلق السماوات' },
  { title: 'عذاب الكافرين', verses: '6-11', description: 'جزاء المكذبين في نار جهنم' },
  { title: 'نعم الله على العباد', verses: '15-22', description: 'الأرض والرزق والسمع والبصر' },
  { title: 'تهديد المكذبين', verses: '23-30', description: 'إنذار بالعذاب وتذكير بنعمة الماء' },
];

const VIRTUES = [
  {
    hadith: 'سورة من القرآن ثلاثون آية شفعت لرجل حتى غُفر له، وهي تبارك الذي بيده الملك',
    source: 'صحيح الترمذي',
    icon: '🤲'
  },
  {
    hadith: 'إن سورة من القرآن ثلاثين آية تشفع لصاحبها حتى يُغفر له',
    source: 'صحيح أبي داود',
    icon: '✨'
  },
  {
    hadith: 'هي المانعة، هي المنجية، تنجيه من عذاب القبر',
    source: 'الحاكم',
    icon: '🛡️'
  }
];

export default function SurahAlMulkPage() {
  return (
    <>
      <Head>
        <title>سورة الملك | المنجية من عذاب القبر - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="سورة الملك كاملة مكتوبة | سورة تبارك المنجية من عذاب القبر. فضل قراءة سورة الملك قبل النوم. تفسير سورة الملك مع الشرح."
        />
        <meta 
          name="keywords" 
          content="سورة الملك, سورة تبارك, المنجية, عذاب القبر, سورة الملك مكتوبة, سورة الملك كاملة, فضل سورة الملك, قراءة سورة الملك, تفسير سورة الملك"
        />
        <link rel="canonical" href="https://www.yafaqih.app/surah/al-mulk" />
        
        {/* Open Graph */}
        <meta property="og:title" content="سورة الملك | Ya Faqih يا فقيه" />
        <meta property="og:description" content="سورة الملك - المنجية من عذاب القبر" />
        <meta property="og:url" content="https://www.yafaqih.app/surah/al-mulk" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "name": "سورة الملك",
              "description": "سورة الملك كاملة مع التفسير والفضائل",
              "url": "https://www.yafaqih.app/surah/al-mulk"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-900 to-purple-800 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/tafsir" className="inline-flex items-center text-indigo-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة لقائمة السور
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold">{SURAH_INFO.number}</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">سورة {SURAH_INFO.name}</h1>
                <p className="text-indigo-200 mt-2 flex flex-wrap gap-3">
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
          {/* Protection Badge */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-800 rounded-2xl p-6 mb-8 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">المنجية من عذاب القبر</h2>
            <p className="text-indigo-200">يُستحب قراءتها كل ليلة قبل النوم</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {SURAH_INFO.otherNames.map(name => (
                <span key={name} className="bg-indigo-700 px-3 py-1 rounded-full text-sm">
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Listen Button */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-900 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold">استمع لسورة الملك</h3>
                  <p className="text-gray-400 text-sm">بصوت القارئ ماهر المعيقلي</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span>مدة القراءة: ~5 دقائق</span>
              </div>
            </div>
          </div>

          {/* Virtues */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              فضائل سورة الملك
            </h2>
            <div className="space-y-4">
              {VIRTUES.map((virtue, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{virtue.icon}</span>
                    <div>
                      <p className="text-lg leading-relaxed mb-2">«{virtue.hadith}»</p>
                      <p className="text-indigo-400 text-sm">📚 {virtue.source}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Themes */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Book className="w-6 h-6 text-indigo-500" />
              موضوعات السورة
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {KEY_THEMES.map((theme, index) => (
                <Link
                  key={index}
                  href={`/?prompt=فسر لي ${theme.title} في سورة الملك`}
                  className="bg-gray-800 rounded-xl p-5 hover:bg-gray-700 transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg group-hover:text-indigo-400 transition">
                      {theme.title}
                    </h3>
                    <span className="text-indigo-400 text-sm">الآيات {theme.verses}</span>
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
              <p className="mb-2">تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴿١﴾</p>
              <p className="mb-2">الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ ﴿٢﴾</p>
            </div>
          </section>

          {/* Ask Ya Faqih */}
          <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن سورة الملك</h2>
                <p className="text-indigo-100">احصل على تفسير مفصل لأي آية</p>
              </div>
              <Link 
                href="/?prompt=فسر لي سورة الملك"
                className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Quick Questions */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">أسئلة شائعة عن سورة الملك</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'لماذا سميت سورة الملك بالمنجية؟',
                'ما فضل قراءة سورة الملك قبل النوم؟',
                'هل تنجي سورة الملك من عذاب القبر؟',
                'ما معنى تبارك؟',
                'كم مرة يُستحب قراءة سورة الملك؟',
                'ما هي أسماء سورة الملك؟'
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
            <h2 className="text-2xl font-bold mb-4">عن سورة الملك</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                سورة الملك هي السورة السابعة والستون في القرآن الكريم، وهي سورة مكية 
                عدد آياتها 30 آية. تُسمى أيضاً بـ"تبارك" و"المنجية" و"الواقية" و"المانعة".
              </p>
              <p>
                من أعظم فضائلها أنها تشفع لصاحبها حتى يُغفر له، وتنجيه من عذاب القبر. 
                لذلك يُستحب قراءتها كل ليلة قبل النوم.
              </p>
              <p>
                تتحدث السورة عن ملك الله تعالى وقدرته، وخلقه للموت والحياة، 
                وجزاء الكافرين والمؤمنين، ونعم الله على عباده.
              </p>
            </div>
          </section>

          {/* Related Surahs */}
          <section className="mt-8">
            <h2 className="text-xl font-bold mb-4">سور ذات صلة</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'الكهف', number: 18 },
                { name: 'يس', number: 36 },
                { name: 'الواقعة', number: 56 }
              ].map(surah => (
                <Link
                  key={surah.number}
                  href={`/surah/${surah.name === 'الكهف' ? 'al-kahf' : surah.name === 'يس' ? 'yaseen' : 'al-waqiah'}`}
                  className="bg-gray-800 hover:bg-indigo-900 p-4 rounded-xl transition text-center"
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
