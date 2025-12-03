// pages/names-of-allah.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronLeft, Search, MessageCircle, Star, Sparkles } from 'lucide-react';

// أسماء الله الحسنى
const NAMES = [
  { number: 1, arabic: 'الله', transliteration: 'Allah', meaning: 'الإله المعبود بحق' },
  { number: 2, arabic: 'الرحمن', transliteration: 'Ar-Rahman', meaning: 'ذو الرحمة الواسعة' },
  { number: 3, arabic: 'الرحيم', transliteration: 'Ar-Raheem', meaning: 'ذو الرحمة بالمؤمنين' },
  { number: 4, arabic: 'الملك', transliteration: 'Al-Malik', meaning: 'المالك لكل شيء' },
  { number: 5, arabic: 'القدوس', transliteration: 'Al-Quddus', meaning: 'المنزه عن كل نقص' },
  { number: 6, arabic: 'السلام', transliteration: 'As-Salam', meaning: 'السالم من كل عيب' },
  { number: 7, arabic: 'المؤمن', transliteration: 'Al-Mu\'min', meaning: 'المصدق لرسله' },
  { number: 8, arabic: 'المهيمن', transliteration: 'Al-Muhaymin', meaning: 'الرقيب الحافظ' },
  { number: 9, arabic: 'العزيز', transliteration: 'Al-Aziz', meaning: 'الغالب الذي لا يُغلب' },
  { number: 10, arabic: 'الجبار', transliteration: 'Al-Jabbar', meaning: 'الذي يجبر الخلق على مشيئته' },
  { number: 11, arabic: 'المتكبر', transliteration: 'Al-Mutakabbir', meaning: 'المتعالي عن صفات الخلق' },
  { number: 12, arabic: 'الخالق', transliteration: 'Al-Khaliq', meaning: 'الموجد للخلق' },
  { number: 13, arabic: 'البارئ', transliteration: 'Al-Bari\'', meaning: 'المُوجد من العدم' },
  { number: 14, arabic: 'المصور', transliteration: 'Al-Musawwir', meaning: 'المعطي كل مخلوق صورته' },
  { number: 15, arabic: 'الغفار', transliteration: 'Al-Ghaffar', meaning: 'الذي يغفر الذنوب' },
  { number: 16, arabic: 'القهار', transliteration: 'Al-Qahhar', meaning: 'الغالب على كل شيء' },
  { number: 17, arabic: 'الوهاب', transliteration: 'Al-Wahhab', meaning: 'كثير العطاء' },
  { number: 18, arabic: 'الرزاق', transliteration: 'Ar-Razzaq', meaning: 'المتكفل بالرزق' },
  { number: 19, arabic: 'الفتاح', transliteration: 'Al-Fattah', meaning: 'الذي يفتح المغلقات' },
  { number: 20, arabic: 'العليم', transliteration: 'Al-Alim', meaning: 'المحيط علمه بكل شيء' },
  { number: 21, arabic: 'القابض', transliteration: 'Al-Qabid', meaning: 'الذي يقبض الأرزاق' },
  { number: 22, arabic: 'الباسط', transliteration: 'Al-Basit', meaning: 'الذي يبسط الرزق' },
  { number: 23, arabic: 'الخافض', transliteration: 'Al-Khafid', meaning: 'الذي يخفض الجبارين' },
  { number: 24, arabic: 'الرافع', transliteration: 'Ar-Rafi\'', meaning: 'الذي يرفع المؤمنين' },
  { number: 25, arabic: 'المعز', transliteration: 'Al-Mu\'izz', meaning: 'الذي يعز من يشاء' },
  { number: 26, arabic: 'المذل', transliteration: 'Al-Mudhill', meaning: 'الذي يذل من يشاء' },
  { number: 27, arabic: 'السميع', transliteration: 'As-Sami\'', meaning: 'الذي يسمع كل شيء' },
  { number: 28, arabic: 'البصير', transliteration: 'Al-Basir', meaning: 'الذي يرى كل شيء' },
  { number: 29, arabic: 'الحكم', transliteration: 'Al-Hakam', meaning: 'الحاكم العادل' },
  { number: 30, arabic: 'العدل', transliteration: 'Al-Adl', meaning: 'العادل في حكمه' },
  { number: 31, arabic: 'اللطيف', transliteration: 'Al-Latif', meaning: 'اللطيف بعباده' },
  { number: 32, arabic: 'الخبير', transliteration: 'Al-Khabir', meaning: 'العالم ببواطن الأمور' },
  { number: 33, arabic: 'الحليم', transliteration: 'Al-Halim', meaning: 'الذي لا يعجل بالعقوبة' },
  { number: 34, arabic: 'العظيم', transliteration: 'Al-Azim', meaning: 'ذو العظمة والكبرياء' },
  { number: 35, arabic: 'الغفور', transliteration: 'Al-Ghafur', meaning: 'كثير المغفرة' },
  { number: 36, arabic: 'الشكور', transliteration: 'Ash-Shakur', meaning: 'الذي يثيب على القليل' },
  { number: 37, arabic: 'العلي', transliteration: 'Al-Ali', meaning: 'المتعالي فوق خلقه' },
  { number: 38, arabic: 'الكبير', transliteration: 'Al-Kabir', meaning: 'الكبير في ذاته وصفاته' },
  { number: 39, arabic: 'الحفيظ', transliteration: 'Al-Hafiz', meaning: 'الحافظ لكل شيء' },
  { number: 40, arabic: 'المقيت', transliteration: 'Al-Muqit', meaning: 'المقتدر الحفيظ' },
  { number: 41, arabic: 'الحسيب', transliteration: 'Al-Hasib', meaning: 'الكافي لعباده' },
  { number: 42, arabic: 'الجليل', transliteration: 'Al-Jalil', meaning: 'العظيم الجليل' },
  { number: 43, arabic: 'الكريم', transliteration: 'Al-Karim', meaning: 'الجواد المعطي' },
  { number: 44, arabic: 'الرقيب', transliteration: 'Ar-Raqib', meaning: 'المراقب لأعمال العباد' },
  { number: 45, arabic: 'المجيب', transliteration: 'Al-Mujib', meaning: 'الذي يجيب الدعاء' },
  { number: 46, arabic: 'الواسع', transliteration: 'Al-Wasi\'', meaning: 'الواسع في رحمته' },
  { number: 47, arabic: 'الحكيم', transliteration: 'Al-Hakim', meaning: 'الحكيم في أفعاله' },
  { number: 48, arabic: 'الودود', transliteration: 'Al-Wadud', meaning: 'المحب لعباده' },
  { number: 49, arabic: 'المجيد', transliteration: 'Al-Majid', meaning: 'العظيم المجد' },
  { number: 50, arabic: 'الباعث', transliteration: 'Al-Ba\'ith', meaning: 'الذي يبعث الخلق' },
  { number: 51, arabic: 'الشهيد', transliteration: 'Ash-Shahid', meaning: 'المطلع على كل شيء' },
  { number: 52, arabic: 'الحق', transliteration: 'Al-Haqq', meaning: 'الثابت الموجود' },
  { number: 53, arabic: 'الوكيل', transliteration: 'Al-Wakil', meaning: 'الذي يتولى أمور عباده' },
  { number: 54, arabic: 'القوي', transliteration: 'Al-Qawi', meaning: 'ذو القوة المتين' },
  { number: 55, arabic: 'المتين', transliteration: 'Al-Matin', meaning: 'الشديد القوي' },
  { number: 56, arabic: 'الولي', transliteration: 'Al-Wali', meaning: 'الناصر لأوليائه' },
  { number: 57, arabic: 'الحميد', transliteration: 'Al-Hamid', meaning: 'المستحق للحمد' },
  { number: 58, arabic: 'المحصي', transliteration: 'Al-Muhsi', meaning: 'المحيط بكل شيء عدداً' },
  { number: 59, arabic: 'المبدئ', transliteration: 'Al-Mubdi\'', meaning: 'الذي بدأ الخلق' },
  { number: 60, arabic: 'المعيد', transliteration: 'Al-Mu\'id', meaning: 'الذي يعيد الخلق' },
  { number: 61, arabic: 'المحيي', transliteration: 'Al-Muhyi', meaning: 'الذي يحيي الموتى' },
  { number: 62, arabic: 'المميت', transliteration: 'Al-Mumit', meaning: 'الذي يميت الأحياء' },
  { number: 63, arabic: 'الحي', transliteration: 'Al-Hayy', meaning: 'الدائم الحياة' },
  { number: 64, arabic: 'القيوم', transliteration: 'Al-Qayyum', meaning: 'القائم بذاته' },
  { number: 65, arabic: 'الواجد', transliteration: 'Al-Wajid', meaning: 'الغني الذي لا يفتقر' },
  { number: 66, arabic: 'الماجد', transliteration: 'Al-Majid', meaning: 'الكريم الواسع' },
  { number: 67, arabic: 'الواحد', transliteration: 'Al-Wahid', meaning: 'المنفرد بذاته' },
  { number: 68, arabic: 'الأحد', transliteration: 'Al-Ahad', meaning: 'الذي لا شريك له' },
  { number: 69, arabic: 'الصمد', transliteration: 'As-Samad', meaning: 'المقصود في الحوائج' },
  { number: 70, arabic: 'القادر', transliteration: 'Al-Qadir', meaning: 'التام القدرة' },
  { number: 71, arabic: 'المقتدر', transliteration: 'Al-Muqtadir', meaning: 'البالغ القدرة' },
  { number: 72, arabic: 'المقدم', transliteration: 'Al-Muqaddim', meaning: 'الذي يقدم من يشاء' },
  { number: 73, arabic: 'المؤخر', transliteration: 'Al-Mu\'akhkhir', meaning: 'الذي يؤخر من يشاء' },
  { number: 74, arabic: 'الأول', transliteration: 'Al-Awwal', meaning: 'الذي ليس قبله شيء' },
  { number: 75, arabic: 'الآخر', transliteration: 'Al-Akhir', meaning: 'الذي ليس بعده شيء' },
  { number: 76, arabic: 'الظاهر', transliteration: 'Az-Zahir', meaning: 'الذي ليس فوقه شيء' },
  { number: 77, arabic: 'الباطن', transliteration: 'Al-Batin', meaning: 'الذي ليس دونه شيء' },
  { number: 78, arabic: 'الوالي', transliteration: 'Al-Wali', meaning: 'المالك المتصرف' },
  { number: 79, arabic: 'المتعالي', transliteration: 'Al-Muta\'ali', meaning: 'المتعالي عن خلقه' },
  { number: 80, arabic: 'البر', transliteration: 'Al-Barr', meaning: 'كثير الإحسان' },
  { number: 81, arabic: 'التواب', transliteration: 'At-Tawwab', meaning: 'الذي يقبل التوبة' },
  { number: 82, arabic: 'المنتقم', transliteration: 'Al-Muntaqim', meaning: 'الذي ينتقم من العصاة' },
  { number: 83, arabic: 'العفو', transliteration: 'Al-Afuw', meaning: 'الذي يعفو عن الذنوب' },
  { number: 84, arabic: 'الرؤوف', transliteration: 'Ar-Ra\'uf', meaning: 'الرحيم بعباده' },
  { number: 85, arabic: 'مالك الملك', transliteration: 'Malik-ul-Mulk', meaning: 'المالك للملك كله' },
  { number: 86, arabic: 'ذو الجلال والإكرام', transliteration: 'Dhul-Jalal-wal-Ikram', meaning: 'صاحب العظمة والكرم' },
  { number: 87, arabic: 'المقسط', transliteration: 'Al-Muqsit', meaning: 'العادل في حكمه' },
  { number: 88, arabic: 'الجامع', transliteration: 'Al-Jami\'', meaning: 'الذي يجمع الخلق' },
  { number: 89, arabic: 'الغني', transliteration: 'Al-Ghani', meaning: 'الذي لا يحتاج لأحد' },
  { number: 90, arabic: 'المغني', transliteration: 'Al-Mughni', meaning: 'الذي يغني من يشاء' },
  { number: 91, arabic: 'المانع', transliteration: 'Al-Mani\'', meaning: 'الذي يمنع ما يشاء' },
  { number: 92, arabic: 'الضار', transliteration: 'Ad-Darr', meaning: 'الذي يضر من يشاء' },
  { number: 93, arabic: 'النافع', transliteration: 'An-Nafi\'', meaning: 'الذي ينفع من يشاء' },
  { number: 94, arabic: 'النور', transliteration: 'An-Nur', meaning: 'المنور للسموات والأرض' },
  { number: 95, arabic: 'الهادي', transliteration: 'Al-Hadi', meaning: 'الذي يهدي من يشاء' },
  { number: 96, arabic: 'البديع', transliteration: 'Al-Badi\'', meaning: 'المبدع لخلقه' },
  { number: 97, arabic: 'الباقي', transliteration: 'Al-Baqi', meaning: 'الدائم الذي لا يفنى' },
  { number: 98, arabic: 'الوارث', transliteration: 'Al-Warith', meaning: 'الذي يرث الأرض' },
  { number: 99, arabic: 'الرشيد', transliteration: 'Ar-Rashid', meaning: 'المرشد لعباده' },
  { number: 100, arabic: 'الصبور', transliteration: 'As-Sabur', meaning: 'الذي لا يعجل' },
];

export default function NamesOfAllahPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNames = NAMES.filter(name => 
    name.arabic.includes(searchQuery) || 
    name.meaning.includes(searchQuery) ||
    name.transliteration.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>أسماء الله الحسنى | 99 اسماً لله مع الشرح - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="أسماء الله الحسنى التسعة والتسعين مع المعاني والشرح | الرحمن، الرحيم، الملك، القدوس. تعرف على أسماء الله وصفاته."
        />
        <meta 
          name="keywords" 
          content="أسماء الله الحسنى, 99 اسم لله, صفات الله, الرحمن, الرحيم, الملك, القدوس, أسماء الله, معاني أسماء الله"
        />
        <link rel="canonical" href="https://www.yafaqih.app/names-of-allah" />
        
        <meta property="og:title" content="أسماء الله الحسنى | Ya Faqih يا فقيه" />
        <meta property="og:description" content="أسماء الله الحسنى التسعة والتسعين مع المعاني والشرح" />
        <meta property="og:url" content="https://www.yafaqih.app/names-of-allah" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-cyan-900 to-teal-700 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="inline-flex items-center text-cyan-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-cyan-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">أسماء الله الحسنى</h1>
                <p className="text-cyan-200 mt-1">التسعة والتسعون اسماً مع المعاني</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Hadith */}
          <div className="bg-cyan-900/30 rounded-2xl p-6 mb-8 text-center">
            <p className="text-xl font-arabic text-white mb-4">
              «إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا، مِائَةً إِلَّا وَاحِدًا، مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ»
            </p>
            <p className="text-cyan-300">رواه البخاري ومسلم</p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن اسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pr-12 pl-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          {/* Names Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {filteredNames.map(name => (
              <Link
                key={name.number}
                href={`/?prompt=اشرح لي اسم الله ${name.arabic}`}
                className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 bg-cyan-900 rounded-full flex items-center justify-center text-cyan-400 text-xs font-bold">
                    {name.number}
                  </span>
                  <span className="text-2xl font-bold text-cyan-400 group-hover:text-cyan-300">
                    {name.arabic}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{name.meaning}</p>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-cyan-800 to-teal-600 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن أسماء الله</h2>
                <p className="text-cyan-100">احصل على شرح مفصل لأي اسم من أسماء الله</p>
              </div>
              <Link 
                href="/?prompt=اشرح لي معنى اسم الله الرحمن"
                className="bg-white text-cyan-700 px-6 py-3 rounded-xl font-bold hover:bg-cyan-50 transition"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Info */}
          <section className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">فضل إحصاء أسماء الله الحسنى</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                معنى "إحصاؤها" ليس مجرد حفظها، بل يشمل: حفظها، وفهم معانيها، 
                والعمل بمقتضاها، والدعاء بها.
              </p>
              <p>
                قال الله تعالى: ﴿وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا﴾ [الأعراف: 180].
              </p>
              <p>
                من أحصاها بهذه الكيفية دخل الجنة بإذن الله، كما جاء في الحديث الشريف.
              </p>
            </div>
          </section>
        </main>

        <footer className="bg-gray-900 py-8 px-4 mt-12 border-t border-gray-800">
          <div className="max-w-6xl mx-auto text-center text-gray-400">
            <p>© 2025 Ya Faqih - يا فقيه | مساعدك الإسلامي الذكي</p>
          </div>
        </footer>
      </div>
    </>
  );
}
