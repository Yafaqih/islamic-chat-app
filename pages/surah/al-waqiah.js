// pages/surah/al-waqiah.js
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, MessageCircle, TrendingUp, Users } from 'lucide-react';

const SELECTED_VERSES = [
  { number: 1, arabic: 'إِذَا وَقَعَتِ الْوَاقِعَةُ' },
  { number: 2, arabic: 'لَيْسَ لِوَقْعَتِهَا كَاذِبَةٌ' },
  { number: 7, arabic: 'وَكُنتُمْ أَزْوَاجًا ثَلَاثَةً' },
  { number: 10, arabic: 'وَالسَّابِقُونَ السَّابِقُونَ' },
  { number: 11, arabic: 'أُولَٰئِكَ الْمُقَرَّبُونَ' },
  { number: 77, arabic: 'إِنَّهُ لَقُرْآنٌ كَرِيمٌ' },
  { number: 78, arabic: 'فِي كِتَابٍ مَّكْنُونٍ' },
  { number: 79, arabic: 'لَّا يَمَسُّهُ إِلَّا الْمُطَهَّرُونَ' },
  { number: 96, arabic: 'فَسَبِّحْ بِاسْمِ رَبِّكَ الْعَظِيمِ' },
];

const GROUPS = [
  {
    title: 'السابقون المقربون',
    color: 'from-yellow-600 to-amber-600',
    icon: '👑',
    description: 'هم الذين سبقوا إلى الإيمان والطاعات، مقربون عند الله في جنات النعيم'
  },
  {
    title: 'أصحاب اليمين',
    color: 'from-green-600 to-emerald-600',
    icon: '📜',
    description: 'هم الذين يأخذون كتابهم بيمينهم، في سدر مخضود وطلح منضود'
  },
  {
    title: 'أصحاب الشمال',
    color: 'from-red-600 to-rose-600',
    icon: '🔥',
    description: 'هم المكذبون الضالون، في سموم وحميم وظل من يحموم'
  }
];

export default function AlWaqiahPage() {
  return (
    <>
      <Head>
        <title>سورة الواقعة | سورة الغنى - تفسير وفضائل - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="سورة الواقعة كاملة مع التفسير | سورة الغنى التي تمنع الفقر. تفسير سورة الواقعة وفضل قراءتها يومياً."
        />
        <meta 
          name="keywords" 
          content="سورة الواقعة, سورة الغنى, تفسير الواقعة, فضل الواقعة, السابقون المقربون, أصحاب اليمين, أصحاب الشمال, قراءة الواقعة يومياً"
        />
        <link rel="canonical" href="https://www.yafaqih.app/surah/al-waqiah" />
        
        <meta property="og:title" content="سورة الواقعة | Ya Faqih يا فقيه" />
        <meta property="og:description" content="سورة الواقعة - سورة الغنى - مع التفسير والفضائل" />
        <meta property="og:url" content="https://www.yafaqih.app/surah/al-waqiah" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-violet-900 to-purple-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/tafsir" className="inline-flex items-center text-violet-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للتفسير
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-violet-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold">٥٦</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">سورة الواقعة</h1>
                <div className="flex items-center gap-4 mt-2 text-violet-200">
                  <span>مكية</span>
                  <span>•</span>
                  <span>٩٦ آية</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    سورة الغنى
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Surah Info */}
          <div className="bg-violet-900/30 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-3 text-violet-400">عن السورة</h2>
            <p className="text-gray-300 leading-relaxed">
              سورة الواقعة من السور المكية، سُميت بسورة الغنى لأنها تمنع الفقر عمن يقرأها.
              تتحدث عن أهوال يوم القيامة وانقسام الناس إلى ثلاث فئات: السابقون المقربون، 
              وأصحاب اليمين، وأصحاب الشمال.
            </p>
          </div>

          {/* Three Groups */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-violet-400" />
              أصناف الناس يوم القيامة
            </h2>
            <div className="space-y-4">
              {GROUPS.map((group, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-r ${group.color} rounded-2xl p-5`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{group.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{group.title}</h3>
                      <p className="text-white/90">{group.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Verses */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 text-violet-400">آيات مختارة</h2>
            <div className="space-y-4">
              {SELECTED_VERSES.map((verse) => (
                <div key={verse.number} className="flex items-center gap-4 bg-gray-900/50 rounded-xl p-4">
                  <span className="w-10 h-10 bg-violet-900 rounded-full flex items-center justify-center text-violet-400 font-bold flex-shrink-0">
                    {verse.number}
                  </span>
                  <p className="text-xl font-arabic text-white">{verse.arabic}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-violet-800 to-purple-600 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن سورة الواقعة</h2>
                <p className="text-violet-100">احصل على تفسير مفصل للآيات</p>
              </div>
              <Link 
                href="/?prompt=فسر لي سورة الواقعة وما فضل قراءتها"
                className="bg-white text-violet-700 px-6 py-3 rounded-xl font-bold hover:bg-violet-50 transition"
              >
                اطلب التفسير
              </Link>
            </div>
          </div>

          {/* Virtues */}
          <section className="bg-gray-800/50 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">فضائل سورة الواقعة</h2>
            <div className="text-gray-300 space-y-4">
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-violet-400 font-bold mb-2">💰 سورة الغنى</p>
                <p>روي عن ابن مسعود رضي الله عنه أنه قال: «من قرأ سورة الواقعة في كل ليلة لم تصبه فاقة أبداً».</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-violet-400 font-bold mb-2">📖 وصية الصحابة</p>
                <p>أوصى ابن مسعود رضي الله عنه بناته بقراءة سورة الواقعة كل ليلة.</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-violet-400 font-bold mb-2">⏰ أفضل وقت للقراءة</p>
                <p>يُستحب قراءتها كل ليلة قبل النوم للحفظ من الفقر وجلب الرزق.</p>
              </div>
            </div>
          </section>

          {/* Related */}
          <section>
            <h2 className="text-xl font-bold mb-4">سور ذات صلة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'الرحمن', slug: 'ar-rahman' },
                { name: 'الملك', slug: 'al-mulk' },
                { name: 'يس', slug: 'yaseen' },
                { name: 'الكهف', slug: 'al-kahf' },
              ].map(surah => (
                <Link
                  key={surah.slug}
                  href={`/surah/${surah.slug}`}
                  className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-center"
                >
                  <p className="text-white font-bold">{surah.name}</p>
                </Link>
              ))}
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
