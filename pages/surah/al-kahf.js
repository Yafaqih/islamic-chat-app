// pages/surah/al-kahf.js
import Head from 'next/head';
import Link from 'next/link';
import { Book, ChevronLeft, Play, MessageCircle, Star, Clock, Heart } from 'lucide-react';

const SURAH_INFO = {
  number: 18,
  name: 'الكهف',
  englishName: 'Al-Kahf',
  verses: 110,
  type: 'مكية',
  revelation: 69,
  pages: '293-304',
  juz: '15-16'
};

const KEY_THEMES = [
  { title: 'قصة أصحاب الكهف', verses: '9-26', description: 'فتية آمنوا بربهم فحفظهم الله' },
  { title: 'قصة صاحب الجنتين', verses: '32-44', description: 'الكبر والغرور بالمال والأولاد' },
  { title: 'قصة موسى والخضر', verses: '60-82', description: 'العلم الإلهي والحكمة الخفية' },
  { title: 'قصة ذي القرنين', verses: '83-98', description: 'الملك العادل ويأجوج ومأجوج' },
];

const VIRTUES = [
  {
    hadith: 'من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين',
    source: 'صحيح الجامع',
    icon: '🌟'
  },
  {
    hadith: 'من حفظ عشر آيات من أول سورة الكهف عُصم من الدجال',
    source: 'صحيح مسلم',
    icon: '🛡️'
  },
  {
    hadith: 'من قرأها كما أُنزلت كانت له نوراً يوم القيامة',
    source: 'صحيح الترغيب',
    icon: '💡'
  }
];

export default function SurahAlKahfPage() {
  return (
    <>
      <Head>
        <title>سورة الكهف | قراءة وتفسير سورة الكهف كاملة - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="سورة الكهف كاملة مكتوبة | فضل قراءة سورة الكهف يوم الجمعة. تفسير سورة الكهف، قصة أصحاب الكهف، قصة موسى والخضر، قصة ذي القرنين."
        />
        <meta 
          name="keywords" 
          content="سورة الكهف, سورة الكهف مكتوبة, سورة الكهف كاملة, فضل سورة الكهف, قراءة سورة الكهف, تفسير سورة الكهف, سورة الكهف يوم الجمعة, أصحاب الكهف, موسى والخضر, ذو القرنين"
        />
        <link rel="canonical" href="https://www.yafaqih.app/surah/al-kahf" />
        
        {/* Open Graph */}
        <meta property="og:title" content="سورة الكهف | Ya Faqih يا فقيه" />
        <meta property="og:description" content="سورة الكهف كاملة - فضلها وتفسيرها" />
        <meta property="og:url" content="https://www.yafaqih.app/surah/al-kahf" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "name": "سورة الكهف",
              "description": "سورة الكهف كاملة مع التفسير والفضائل",
              "url": "https://www.yafaqih.app/surah/al-kahf"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-900 to-teal-800 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/tafsir" className="inline-flex items-center text-emerald-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة لقائمة السور
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold">{SURAH_INFO.number}</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">سورة {SURAH_INFO.name}</h1>
                <p className="text-emerald-200 mt-2 flex flex-wrap gap-3">
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
          {/* Friday Reminder */}
          <div className="bg-gradient-to-r from-yellow-900 to-amber-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">سنة يوم الجمعة</h2>
                <p className="text-yellow-200">يُستحب قراءة سورة الكهف كل يوم جمعة لفضلها العظيم</p>
              </div>
            </div>
          </div>

          {/* Listen Button */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-900 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold">استمع لسورة الكهف</h3>
                  <p className="text-gray-400 text-sm">بصوت القارئ عبد الباسط عبد الصمد</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span>مدة القراءة: ~45 دقيقة</span>
              </div>
            </div>
          </div>

          {/* Virtues */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              فضائل سورة الكهف
            </h2>
            <div className="space-y-4">
              {VIRTUES.map((virtue, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{virtue.icon}</span>
                    <div>
                      <p className="text-lg leading-relaxed mb-2">«{virtue.hadith}»</p>
                      <p className="text-emerald-400 text-sm">📚 {virtue.source}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Themes / Stories */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Book className="w-6 h-6 text-emerald-500" />
              القصص في سورة الكهف
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {KEY_THEMES.map((theme, index) => (
                <Link
                  key={index}
                  href={`/?prompt=فسر لي قصة ${theme.title} في سورة الكهف`}
                  className="bg-gray-800 rounded-xl p-5 hover:bg-gray-700 transition group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg group-hover:text-emerald-400 transition">
                      {theme.title}
                    </h3>
                    <span className="text-emerald-400 text-sm">الآيات {theme.verses}</span>
                  </div>
                  <p className="text-gray-400">{theme.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Ask Ya Faqih */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن سورة الكهف</h2>
                <p className="text-emerald-100">احصل على تفسير مفصل لأي آية أو قصة</p>
              </div>
              <Link 
                href="/?prompt=فسر لي سورة الكهف"
                className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Quick Questions */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">أسئلة شائعة عن سورة الكهف</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'ما فضل قراءة سورة الكهف يوم الجمعة؟',
                'لماذا سميت سورة الكهف بهذا الاسم؟',
                'ما علاقة سورة الكهف بالدجال؟',
                'ما هي الدروس المستفادة من قصة أصحاب الكهف؟',
                'من هو الخضر وما قصته مع موسى؟',
                'من هو ذو القرنين؟'
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
            <h2 className="text-2xl font-bold mb-4">عن سورة الكهف</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                سورة الكهف هي السورة الثامنة عشرة في القرآن الكريم، وهي سورة مكية 
                عدد آياتها 110 آية. سُميت بهذا الاسم لورود قصة أصحاب الكهف فيها.
              </p>
              <p>
                تتناول السورة أربع قصص عظيمة: قصة أصحاب الكهف (فتنة الدين)، 
                قصة صاحب الجنتين (فتنة المال)، قصة موسى والخضر (فتنة العلم)، 
                وقصة ذي القرنين (فتنة السلطة).
              </p>
              <p>
                من فضائل سورة الكهف أنها نور لمن قرأها يوم الجمعة، وأن حفظ أوائلها 
                أو أواخرها يعصم من فتنة الدجال.
              </p>
            </div>
          </section>

          {/* Related Surahs */}
          <section className="mt-8">
            <h2 className="text-xl font-bold mb-4">سور ذات صلة</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'يس', number: 36 },
                { name: 'الملك', number: 67 },
                { name: 'الواقعة', number: 56 }
              ].map(surah => (
                <Link
                  key={surah.number}
                  href={`/surah/${surah.name === 'يس' ? 'yaseen' : surah.name === 'الملك' ? 'al-mulk' : 'al-waqiah'}`}
                  className="bg-gray-800 hover:bg-emerald-900 p-4 rounded-xl transition text-center"
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
