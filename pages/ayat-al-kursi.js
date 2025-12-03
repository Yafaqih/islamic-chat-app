// pages/ayat-al-kursi.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, Shield, MessageCircle, Copy, Check, Star } from 'lucide-react';

const AYAT_AL_KURSI = {
  arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
  surah: 'البقرة',
  ayah: 255
};

const VIRTUES = [
  {
    title: 'أعظم آية في القرآن',
    hadith: 'قال النبي ﷺ لأُبي بن كعب: "أي آية في كتاب الله أعظم؟" قال: الله ورسوله أعلم. فقال: "آية الكرسي"',
    source: 'صحيح مسلم'
  },
  {
    title: 'حفظ من الشيطان',
    hadith: 'من قرأ آية الكرسي في ليلة لم يزل عليه من الله حافظ، ولا يقربه شيطان حتى يصبح',
    source: 'صحيح البخاري'
  },
  {
    title: 'سبب لدخول الجنة',
    hadith: 'من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت',
    source: 'النسائي وصححه الألباني'
  },
  {
    title: 'حماية البيت',
    hadith: 'إذا أويت إلى فراشك فاقرأ آية الكرسي، لن يزال معك من الله حافظ، ولا يقربك شيطان حتى تصبح',
    source: 'صحيح البخاري'
  }
];

const TIMES_TO_READ = [
  { time: 'بعد كل صلاة مكتوبة', benefit: 'سبب لدخول الجنة' },
  { time: 'قبل النوم', benefit: 'حفظ من الشيطان طوال الليل' },
  { time: 'عند الخروج من البيت', benefit: 'حفظ وحماية' },
  { time: 'في الصباح والمساء', benefit: 'من أذكار الصباح والمساء' },
  { time: 'عند الخوف', benefit: 'طمأنينة وسكينة' },
  { time: 'للرقية الشرعية', benefit: 'علاج من السحر والعين' },
];

export default function AyatAlKursiPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(AYAT_AL_KURSI.arabic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Head>
        <title>آية الكرسي | أعظم آية في القرآن مع الفضائل - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="آية الكرسي كاملة مكتوبة | أعظم آية في القرآن الكريم مع فضائلها وأوقات قراءتها. فضل قراءة آية الكرسي بعد الصلاة وقبل النوم."
        />
        <meta 
          name="keywords" 
          content="آية الكرسي, آية الكرسي مكتوبة, فضل آية الكرسي, آية الكرسي بعد الصلاة, آية الكرسي قبل النوم, أعظم آية في القرآن, الله لا إله إلا هو الحي القيوم"
        />
        <link rel="canonical" href="https://www.yafaqih.app/ayat-al-kursi" />
        
        <meta property="og:title" content="آية الكرسي | Ya Faqih يا فقيه" />
        <meta property="og:description" content="آية الكرسي - أعظم آية في القرآن الكريم" />
        <meta property="og:url" content="https://www.yafaqih.app/ayat-al-kursi" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-yellow-900 to-amber-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-yellow-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">آية الكرسي</h1>
                <p className="text-yellow-200 mt-1">أعظم آية في القرآن الكريم</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Ayah Display */}
          <div className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 rounded-3xl p-8 mb-8 border border-yellow-700/30">
            <div className="text-center mb-4">
              <span className="bg-yellow-600 text-white px-4 py-1 rounded-full text-sm">
                سورة {AYAT_AL_KURSI.surah} - الآية {AYAT_AL_KURSI.ayah}
              </span>
            </div>
            
            <p className="text-2xl md:text-3xl leading-loose text-white font-arabic text-center mb-6">
              {AYAT_AL_KURSI.arabic}
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-xl transition"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    نسخ الآية
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Times to Read */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              أوقات قراءة آية الكرسي
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {TIMES_TO_READ.map((item, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-8 h-8 bg-yellow-900 rounded-full flex items-center justify-center text-yellow-400 font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-white">{item.time}</p>
                    <p className="text-yellow-400 text-sm">{item.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Virtues */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">فضائل آية الكرسي</h2>
            <div className="space-y-4">
              {VIRTUES.map((virtue, index) => (
                <div key={index} className="bg-gray-800 rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">{virtue.title}</h3>
                  <p className="text-gray-200 mb-2">«{virtue.hadith}»</p>
                  <p className="text-gray-400 text-sm">📚 {virtue.source}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-yellow-800 to-amber-600 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن آية الكرسي</h2>
                <p className="text-yellow-100">احصل على تفسير مفصل ومعاني الكلمات</p>
              </div>
              <Link 
                href="/?prompt=فسر لي آية الكرسي بالتفصيل"
                className="bg-white text-yellow-700 px-6 py-3 rounded-xl font-bold hover:bg-yellow-50 transition"
              >
                اطلب التفسير
              </Link>
            </div>
          </div>

          {/* Tafsir Summary */}
          <section className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">تفسير مختصر</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                <strong className="text-yellow-400">﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ﴾</strong> - 
                توحيد الله، لا معبود بحق سواه.
              </p>
              <p>
                <strong className="text-yellow-400">﴿الْحَيُّ الْقَيُّومُ﴾</strong> - 
                الحي الذي لا يموت، القائم بنفسه المقيم لغيره.
              </p>
              <p>
                <strong className="text-yellow-400">﴿لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ﴾</strong> - 
                منزه عن النعاس والنوم، دائم اليقظة والحفظ.
              </p>
              <p>
                <strong className="text-yellow-400">﴿وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ﴾</strong> - 
                كرسيه أوسع من السموات والأرض.
              </p>
              <p>
                <strong className="text-yellow-400">﴿وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾</strong> - 
                العلي في ذاته وصفاته، العظيم الذي لا أعظم منه.
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
