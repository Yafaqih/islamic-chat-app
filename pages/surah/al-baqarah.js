// pages/surah/al-baqarah.js
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, MessageCircle, BookOpen, Shield, Star } from 'lucide-react';

const KEY_VERSES = [
  { number: 255, name: 'آية الكرسي', description: 'أعظم آية في القرآن' },
  { number: '285-286', name: 'خواتيم البقرة', description: 'من قرأهما في ليلة كفتاه' },
  { number: 282, name: 'آية الدَّين', description: 'أطول آية في القرآن' },
  { number: 256, name: 'لا إكراه في الدين', description: 'آية الحرية الدينية' },
  { number: 152, name: 'فاذكروني أذكركم', description: 'فضل ذكر الله' },
  { number: 186, name: 'آية الدعاء', description: 'وإذا سألك عبادي عني' },
];

const TOPICS = [
  'أصول العقيدة والإيمان',
  'قصة آدم وإبليس',
  'قصص بني إسرائيل',
  'أحكام الصيام',
  'أحكام الحج',
  'أحكام الطلاق والعدة',
  'أحكام الربا والتجارة',
  'آية الدين',
  'آية الكرسي',
];

export default function AlBaqarahPage() {
  return (
    <>
      <Head>
        <title>سورة البقرة | أطول سورة في القرآن - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="سورة البقرة أطول سورة في القرآن الكريم | 286 آية. تحتوي على آية الكرسي وخواتيم البقرة. فضائل سورة البقرة وأحكامها."
        />
        <meta 
          name="keywords" 
          content="سورة البقرة, آية الكرسي, خواتيم البقرة, أطول سورة, فضل البقرة, قراءة البقرة, تفسير البقرة, آية الدين"
        />
        <link rel="canonical" href="https://www.yafaqih.app/surah/al-baqarah" />
        
        <meta property="og:title" content="سورة البقرة | Ya Faqih يا فقيه" />
        <meta property="og:description" content="سورة البقرة - أطول سورة في القرآن مع فضائلها" />
        <meta property="og:url" content="https://www.yafaqih.app/surah/al-baqarah" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900 to-indigo-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/tafsir" className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للتفسير
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold">٢</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">سورة البقرة</h1>
                <div className="flex items-center gap-4 mt-2 text-blue-200">
                  <span>مدنية</span>
                  <span>•</span>
                  <span>٢٨٦ آية</span>
                  <span>•</span>
                  <span>أطول سورة في القرآن</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Surah Info */}
          <div className="bg-blue-900/30 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-3 text-blue-400">عن السورة</h2>
            <p className="text-gray-300 leading-relaxed">
              سورة البقرة هي أطول سورة في القرآن الكريم، وتُسمى "فسطاط القرآن" و"سنام القرآن". 
              نزلت في المدينة وتحتوي على كثير من الأحكام الشرعية. 
              قال النبي ﷺ: «اقرؤوا سورة البقرة فإن أخذها بركة وتركها حسرة ولا تستطيعها البطلة».
            </p>
          </div>

          {/* Key Verses */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              آيات مشهورة في السورة
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {KEY_VERSES.map((verse, index) => (
                <Link
                  key={index}
                  href={`/?prompt=فسر لي الآية ${verse.number} من سورة البقرة`}
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition group"
                >
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-lg text-sm">
                      {verse.number}
                    </span>
                    <div>
                      <h3 className="font-bold text-blue-400">{verse.name}</h3>
                      <p className="text-gray-400 text-sm">{verse.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Last 2 Verses */}
          <section className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              خواتيم سورة البقرة
            </h2>
            <div className="space-y-4">
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-lg font-arabic text-white leading-loose">
                  آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ
                </p>
                <p className="text-blue-300 text-sm mt-2">الآية 285</p>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-lg font-arabic text-white leading-loose">
                  لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا...
                </p>
                <p className="text-blue-300 text-sm mt-2">الآية 286</p>
              </div>
            </div>
            <p className="text-blue-200 mt-4 text-sm">
              قال النبي ﷺ: «من قرأ بالآيتين من آخر سورة البقرة في ليلة كفتاه» متفق عليه
            </p>
          </section>

          {/* Topics */}
          <section className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              موضوعات السورة
            </h2>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic, index) => (
                <Link
                  key={index}
                  href={`/?prompt=ما ورد في سورة البقرة عن ${topic}`}
                  className="bg-gray-700 hover:bg-blue-900 px-4 py-2 rounded-lg transition text-sm"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-800 to-indigo-600 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن سورة البقرة</h2>
                <p className="text-blue-100">تفسير أي آية وشرح أحكامها</p>
              </div>
              <Link 
                href="/?prompt=فسر لي سورة البقرة وما فضل قراءتها"
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
              >
                اطلب التفسير
              </Link>
            </div>
          </div>

          {/* Virtues */}
          <section className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">فضائل سورة البقرة</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                <strong className="text-blue-400">طرد الشياطين:</strong> 
                قال النبي ﷺ: «لا تجعلوا بيوتكم مقابر، إن الشيطان ينفر من البيت الذي تُقرأ فيه سورة البقرة».
              </p>
              <p>
                <strong className="text-blue-400">الحماية من السحر:</strong> 
                قال النبي ﷺ: «اقرؤوا سورة البقرة فإن أخذها بركة وتركها حسرة ولا تستطيعها البطلة» أي السحرة.
              </p>
              <p>
                <strong className="text-blue-400">الشفاعة يوم القيامة:</strong> 
                تأتي سورة البقرة وآل عمران يوم القيامة كغمامتين تظلان صاحبهما.
              </p>
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
