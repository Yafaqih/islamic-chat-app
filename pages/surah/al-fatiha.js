// pages/surah/al-fatiha.js
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, Book, MessageCircle, Play, Volume2 } from 'lucide-react';

const VERSES = [
  { number: 1, arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'بسم الله الرحمن الرحيم' },
  { number: 2, arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'الحمد لله رب العالمين' },
  { number: 3, arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'الرحمن الرحيم' },
  { number: 4, arabic: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'مالك يوم الدين' },
  { number: 5, arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'إياك نعبد وإياك نستعين' },
  { number: 6, arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'اهدنا الصراط المستقيم' },
  { number: 7, arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين' },
];

export default function AlFatihaPage() {
  return (
    <>
      <Head>
        <title>سورة الفاتحة | تفسير وفضائل أم الكتاب - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="سورة الفاتحة كاملة مع التفسير والفضائل | أم الكتاب، السبع المثاني، فاتحة الكتاب. تفسير آيات سورة الفاتحة وأحكامها."
        />
        <meta 
          name="keywords" 
          content="سورة الفاتحة, أم الكتاب, السبع المثاني, فاتحة الكتاب, تفسير الفاتحة, الحمد لله رب العالمين, قراءة الفاتحة"
        />
        <link rel="canonical" href="https://www.yafaqih.app/surah/al-fatiha" />
        
        <meta property="og:title" content="سورة الفاتحة | Ya Faqih يا فقيه" />
        <meta property="og:description" content="سورة الفاتحة كاملة مع التفسير والفضائل" />
        <meta property="og:url" content="https://www.yafaqih.app/surah/al-fatiha" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-900 to-emerald-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/tafsir" className="inline-flex items-center text-emerald-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للتفسير
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold">١</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">سورة الفاتحة</h1>
                <div className="flex items-center gap-4 mt-2 text-emerald-200">
                  <span>مكية</span>
                  <span>•</span>
                  <span>٧ آيات</span>
                  <span>•</span>
                  <span>أم الكتاب</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Surah Info */}
          <div className="bg-emerald-900/30 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-3 text-emerald-400">عن السورة</h2>
            <p className="text-gray-300 leading-relaxed">
              سورة الفاتحة هي أعظم سورة في القرآن الكريم، سُميت بأم الكتاب والسبع المثاني. 
              وهي ركن من أركان الصلاة، لا تصح الصلاة إلا بها. قال النبي ﷺ: 
              «لا صلاة لمن لم يقرأ بفاتحة الكتاب».
            </p>
          </div>

          {/* Verses */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <div className="text-center mb-8">
              <p className="text-2xl text-emerald-400 mb-4">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            </div>
            
            <div className="space-y-6">
              {VERSES.map((verse) => (
                <div key={verse.number} className="border-b border-gray-700 pb-6 last:border-0">
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 bg-emerald-900 rounded-full flex items-center justify-center text-emerald-400 font-bold flex-shrink-0">
                      {verse.number}
                    </span>
                    <div className="flex-1">
                      <p className="text-2xl leading-loose text-white font-arabic text-right mb-2">
                        {verse.arabic}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن تفسير الفاتحة</h2>
                <p className="text-emerald-100">احصل على شرح مفصل لأي آية</p>
              </div>
              <Link 
                href="/?prompt=فسر لي سورة الفاتحة بالتفصيل"
                className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition"
              >
                اطلب التفسير
              </Link>
            </div>
          </div>

          {/* Virtues */}
          <section className="bg-gray-800/50 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">فضائل سورة الفاتحة</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-emerald-400 font-bold mb-2">أعظم سورة في القرآن</p>
                <p>قال النبي ﷺ لأبي سعيد بن المعلى: «لأعلمنك سورة هي أعظم السور في القرآن... الحمد لله رب العالمين، هي السبع المثاني والقرآن العظيم الذي أوتيته».</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-emerald-400 font-bold mb-2">ركن في الصلاة</p>
                <p>قال النبي ﷺ: «لا صلاة لمن لم يقرأ بفاتحة الكتاب». وهي الركن الذي لا تصح الصلاة إلا به.</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-emerald-400 font-bold mb-2">رقية شرعية</p>
                <p>الفاتحة رقية شرعية للمريض، كما في حديث الصحابي الذي رقى اللديغ بالفاتحة فشُفي.</p>
              </div>
            </div>
          </section>

          {/* Related Surahs */}
          <section>
            <h2 className="text-xl font-bold mb-4">سور أخرى</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'البقرة', number: 2 },
                { name: 'آل عمران', number: 3 },
                { name: 'الكهف', number: 18 },
                { name: 'يس', number: 36 },
              ].map(surah => (
                <Link
                  key={surah.number}
                  href={`/?prompt=فسر لي سورة ${surah.name}`}
                  className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-center"
                >
                  <span className="text-emerald-400 font-bold">{surah.number}</span>
                  <p className="text-white">{surah.name}</p>
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
