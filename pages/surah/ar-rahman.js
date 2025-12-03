// pages/surah/ar-rahman.js
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, MessageCircle, Heart, Sparkles } from 'lucide-react';

// آيات مختارة من سورة الرحمن
const SELECTED_VERSES = [
  { number: 1, arabic: 'الرَّحْمَٰنُ' },
  { number: 2, arabic: 'عَلَّمَ الْقُرْآنَ' },
  { number: 3, arabic: 'خَلَقَ الْإِنسَانَ' },
  { number: 4, arabic: 'عَلَّمَهُ الْبَيَانَ' },
  { number: 13, arabic: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ' },
  { number: 26, arabic: 'كُلُّ مَنْ عَلَيْهَا فَانٍ' },
  { number: 27, arabic: 'وَيَبْقَىٰ وَجْهُ رَبِّكَ ذُو الْجَلَالِ وَالْإِكْرَامِ' },
  { number: 60, arabic: 'هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ' },
  { number: 78, arabic: 'تَبَارَكَ اسْمُ رَبِّكَ ذِي الْجَلَالِ وَالْإِكْرَامِ' },
];

export default function ArRahmanPage() {
  return (
    <>
      <Head>
        <title>سورة الرحمن | عروس القرآن - تفسير وفضائل - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="سورة الرحمن كاملة مع التفسير | عروس القرآن، فبأي آلاء ربكما تكذبان. تفسير سورة الرحمن وفضائلها ومعانيها."
        />
        <meta 
          name="keywords" 
          content="سورة الرحمن, عروس القرآن, فبأي آلاء ربكما تكذبان, تفسير الرحمن, نعم الله, الجنة في سورة الرحمن"
        />
        <link rel="canonical" href="https://www.yafaqih.app/surah/ar-rahman" />
        
        <meta property="og:title" content="سورة الرحمن | Ya Faqih يا فقيه" />
        <meta property="og:description" content="سورة الرحمن - عروس القرآن - مع التفسير والفضائل" />
        <meta property="og:url" content="https://www.yafaqih.app/surah/ar-rahman" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-pink-900 to-rose-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/tafsir" className="inline-flex items-center text-pink-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للتفسير
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-pink-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold">٥٥</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">سورة الرحمن</h1>
                <div className="flex items-center gap-4 mt-2 text-pink-200">
                  <span>مدنية</span>
                  <span>•</span>
                  <span>٧٨ آية</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    عروس القرآن
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Surah Info */}
          <div className="bg-pink-900/30 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-3 text-pink-400">عن السورة</h2>
            <p className="text-gray-300 leading-relaxed">
              سورة الرحمن سُميت بعروس القرآن لجمالها وحسن نظمها. تتحدث عن نعم الله على عباده، 
              وتتكرر فيها الآية: ﴿فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ﴾ واحدة وثلاثين مرة، 
              في تذكير بنعم الله وتوبيخ لمن يُنكرها.
            </p>
          </div>

          {/* Key Verse */}
          <div className="bg-gradient-to-br from-pink-800 to-rose-900 rounded-2xl p-8 mb-8 text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-4 text-pink-300" />
            <p className="text-3xl font-arabic leading-loose mb-4">
              فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ
            </p>
            <p className="text-pink-200">
              هذه الآية تتكرر 31 مرة في السورة، تذكيراً بنعم الله التي لا تُحصى
            </p>
          </div>

          {/* Selected Verses */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 text-pink-400">آيات مختارة</h2>
            <div className="space-y-4">
              {SELECTED_VERSES.map((verse) => (
                <div key={verse.number} className="flex items-center gap-4 bg-gray-900/50 rounded-xl p-4">
                  <span className="w-10 h-10 bg-pink-900 rounded-full flex items-center justify-center text-pink-400 font-bold flex-shrink-0">
                    {verse.number}
                  </span>
                  <p className="text-xl font-arabic text-white">{verse.arabic}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-pink-800 to-rose-600 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن سورة الرحمن</h2>
                <p className="text-pink-100">احصل على تفسير مفصل للآيات</p>
              </div>
              <Link 
                href="/?prompt=فسر لي سورة الرحمن بالتفصيل"
                className="bg-white text-pink-700 px-6 py-3 rounded-xl font-bold hover:bg-pink-50 transition"
              >
                اطلب التفسير
              </Link>
            </div>
          </div>

          {/* Themes */}
          <section className="bg-gray-800/50 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">موضوعات السورة</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-pink-400 font-bold mb-2">🌟 نعم الله في الدنيا</h3>
                <p className="text-gray-300 text-sm">خلق الإنسان، تعليم القرآن، الشمس والقمر، النجم والشجر، السماء والميزان</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-pink-400 font-bold mb-2">🌊 آيات الكون</h3>
                <p className="text-gray-300 text-sm">مرج البحرين يلتقيان، اللؤلؤ والمرجان، السفن كالأعلام</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-pink-400 font-bold mb-2">⚖️ يوم القيامة</h3>
                <p className="text-gray-300 text-sm">فناء الخلق، بقاء وجه الله، الحساب والجزاء</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-pink-400 font-bold mb-2">🏞️ نعيم الجنة</h3>
                <p className="text-gray-300 text-sm">جنتان ذواتا أفنان، عينان تجريان، حور مقصورات في الخيام</p>
              </div>
            </div>
          </section>

          {/* Virtues */}
          <section className="bg-gray-800/50 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">فضائل السورة</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                قال النبي ﷺ: «لكل شيء عروس، وعروس القرآن سورة الرحمن».
              </p>
              <p>
                وقرأها النبي ﷺ على الجن فقالوا: «لا بشيء من آلائك ربنا نكذب، فلك الحمد».
              </p>
            </div>
          </section>

          {/* Related */}
          <section>
            <h2 className="text-xl font-bold mb-4">سور ذات صلة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'الواقعة', slug: 'al-waqiah' },
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
