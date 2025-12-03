// pages/ruqyah.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Shield, ChevronLeft, MessageCircle, Copy, Check, Heart, AlertTriangle } from 'lucide-react';

const RUQYAH_VERSES = [
  {
    title: 'سورة الفاتحة',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    times: 7
  },
  {
    title: 'آية الكرسي',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    times: 3
  },
  {
    title: 'آخر آيتين من البقرة',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ',
    times: 1
  },
  {
    title: 'سورة الإخلاص',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    times: 3
  },
  {
    title: 'سورة الفلق',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    times: 3
  },
  {
    title: 'سورة الناس',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    times: 3
  }
];

const RUQYAH_DUAS = [
  {
    arabic: 'بِسْمِ اللهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللهُ يَشْفِيكَ، بِسْمِ اللهِ أَرْقِيكَ',
    source: 'صحيح مسلم'
  },
  {
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    source: 'صحيح مسلم'
  },
  {
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
    source: 'صحيح البخاري'
  },
  {
    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
    source: 'صحيح البخاري ومسلم'
  }
];

export default function RuqyahPage() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <Head>
        <title>الرقية الشرعية | رقية من القرآن والسنة - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="الرقية الشرعية الصحيحة من القرآن والسنة | رقية العين والحسد والسحر والمس. آيات الرقية وأدعية الشفاء من الكتاب والسنة."
        />
        <meta 
          name="keywords" 
          content="الرقية الشرعية, رقية العين, رقية الحسد, رقية السحر, رقية المس, آيات الشفاء, دعاء الشفاء, علاج بالقرآن, الفاتحة للرقية, آية الكرسي, المعوذات"
        />
        <link rel="canonical" href="https://www.yafaqih.app/ruqyah" />
        
        <meta property="og:title" content="الرقية الشرعية | Ya Faqih يا فقيه" />
        <meta property="og:description" content="الرقية الشرعية من القرآن والسنة للعين والحسد والسحر" />
        <meta property="og:url" content="https://www.yafaqih.app/ruqyah" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-900 to-cyan-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-teal-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">الرقية الشرعية</h1>
                <p className="text-teal-200 mt-1">من القرآن الكريم والسنة النبوية</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Warning */}
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-amber-200 font-bold">تنبيه هام</p>
              <p className="text-amber-300 text-sm">
                الرقية الشرعية الصحيحة تكون بالقرآن والأدعية المأثورة فقط. 
                احذر من الدجالين والمشعوذين الذين يدّعون العلاج بطرق شركية.
              </p>
            </div>
          </div>

          {/* Intro */}
          <div className="bg-teal-900/30 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-3 text-teal-400">ما هي الرقية الشرعية؟</h2>
            <p className="text-gray-300 leading-relaxed">
              الرقية الشرعية هي القراءة على المريض بآيات من القرآن الكريم وأدعية مأثورة من السنة النبوية، 
              بقصد طلب الشفاء من الله تعالى. وهي سنة ثابتة عن النبي ﷺ.
            </p>
          </div>

          {/* Verses */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">آيات الرقية الشرعية</h2>
            <div className="space-y-4">
              {RUQYAH_VERSES.map((verse, index) => (
                <div key={index} className="bg-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-teal-400">{verse.title}</h3>
                    <span className="bg-teal-900 text-teal-300 px-3 py-1 rounded-full text-sm">
                      {verse.times === 1 ? 'مرة واحدة' : `${verse.times} مرات`}
                    </span>
                  </div>
                  <p className="text-xl leading-loose text-white font-arabic mb-4">
                    {verse.arabic}
                  </p>
                  <button
                    onClick={() => handleCopy(verse.arabic, `verse-${index}`)}
                    className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition text-sm"
                  >
                    {copiedIndex === `verse-${index}` ? (
                      <>
                        <Check className="w-4 h-4" />
                        تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        نسخ
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Duas */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-400" />
              أدعية الرقية من السنة
            </h2>
            <div className="space-y-4">
              {RUQYAH_DUAS.map((dua, index) => (
                <div key={index} className="bg-gray-800 rounded-2xl p-5">
                  <p className="text-xl leading-loose text-white font-arabic mb-3">
                    {dua.arabic}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">📚 {dua.source}</span>
                    <button
                      onClick={() => handleCopy(dua.arabic, `dua-${index}`)}
                      className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition text-sm"
                    >
                      {copiedIndex === `dua-${index}` ? (
                        <>
                          <Check className="w-4 h-4" />
                          تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          نسخ
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How to do Ruqyah */}
          <section className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">كيفية الرقية الشرعية</h2>
            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-teal-900 rounded-full flex items-center justify-center text-teal-400 font-bold flex-shrink-0">1</span>
                <span>الوضوء واستقبال القبلة</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-teal-900 rounded-full flex items-center justify-center text-teal-400 font-bold flex-shrink-0">2</span>
                <span>وضع اليد على موضع الألم أو على الرأس</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-teal-900 rounded-full flex items-center justify-center text-teal-400 font-bold flex-shrink-0">3</span>
                <span>قراءة سورة الفاتحة 7 مرات</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-teal-900 rounded-full flex items-center justify-center text-teal-400 font-bold flex-shrink-0">4</span>
                <span>قراءة آية الكرسي 3 مرات</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-teal-900 rounded-full flex items-center justify-center text-teal-400 font-bold flex-shrink-0">5</span>
                <span>قراءة المعوذات 3 مرات مع النفث</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-teal-900 rounded-full flex items-center justify-center text-teal-400 font-bold flex-shrink-0">6</span>
                <span>الدعاء بالأدعية المأثورة</span>
              </li>
            </ol>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-teal-800 to-cyan-600 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن الرقية</h2>
                <p className="text-teal-100">احصل على إجابات لأسئلتك عن الرقية الشرعية</p>
              </div>
              <Link 
                href="/?prompt=ما هي الرقية الشرعية الصحيحة"
                className="bg-white text-teal-700 px-6 py-3 rounded-xl font-bold hover:bg-teal-50 transition"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Related */}
          <section>
            <h2 className="text-xl font-bold mb-4">مواضيع ذات صلة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/adhkar" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-center">
                <p className="font-bold">الأذكار</p>
              </Link>
              <Link href="/ayat-al-kursi" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-center">
                <p className="font-bold">آية الكرسي</p>
              </Link>
              <Link href="/dua" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-center">
                <p className="font-bold">الأدعية</p>
              </Link>
              <Link href="/surah/al-fatiha" className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-center">
                <p className="font-bold">الفاتحة</p>
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
