// pages/prophets.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Users, ChevronLeft, MessageCircle, Search, BookOpen, Star } from 'lucide-react';

const PROPHETS = [
  { name: 'آدم', english: 'Adam', title: 'أبو البشر', mentioned: 25, description: 'أول نبي وأول إنسان خلقه الله من طين' },
  { name: 'إدريس', english: 'Idris', title: 'النبي الصادق', mentioned: 2, description: 'رفعه الله مكاناً علياً' },
  { name: 'نوح', english: 'Nuh', title: 'شيخ المرسلين', mentioned: 43, description: 'دعا قومه 950 سنة وبنى السفينة' },
  { name: 'هود', english: 'Hud', title: 'نبي عاد', mentioned: 7, description: 'أُرسل إلى قوم عاد في الأحقاف' },
  { name: 'صالح', english: 'Salih', title: 'نبي ثمود', mentioned: 9, description: 'أُرسل إلى قوم ثمود وأعطي الناقة آية' },
  { name: 'إبراهيم', english: 'Ibrahim', title: 'خليل الله', mentioned: 69, description: 'أبو الأنبياء وباني الكعبة مع إسماعيل' },
  { name: 'لوط', english: 'Lut', title: 'ابن أخي إبراهيم', mentioned: 27, description: 'أُرسل إلى قوم سدوم' },
  { name: 'إسماعيل', english: 'Ismail', title: 'الذبيح', mentioned: 12, description: 'ابن إبراهيم، جد العرب، بنى الكعبة مع أبيه' },
  { name: 'إسحاق', english: 'Ishaq', title: 'ابن إبراهيم', mentioned: 17, description: 'ابن إبراهيم من سارة، أبو يعقوب' },
  { name: 'يعقوب', english: 'Yaqub', title: 'إسرائيل', mentioned: 16, description: 'ابن إسحاق، أبو يوسف والأسباط' },
  { name: 'يوسف', english: 'Yusuf', title: 'الصديق', mentioned: 27, description: 'أُعطي شطر الحسن، قصته أحسن القصص' },
  { name: 'أيوب', english: 'Ayyub', title: 'الصابر', mentioned: 4, description: 'ضُرب به المثل في الصبر على البلاء' },
  { name: 'شعيب', english: 'Shuayb', title: 'خطيب الأنبياء', mentioned: 11, description: 'أُرسل إلى أهل مدين' },
  { name: 'موسى', english: 'Musa', title: 'كليم الله', mentioned: 136, description: 'أكثر الأنبياء ذكراً في القرآن، كلمه الله' },
  { name: 'هارون', english: 'Harun', title: 'أخو موسى', mentioned: 20, description: 'أخو موسى ووزيره' },
  { name: 'داود', english: 'Dawud', title: 'خليفة الله', mentioned: 16, description: 'أُوتي الزبور وأُلين له الحديد' },
  { name: 'سليمان', english: 'Sulayman', title: 'النبي الملك', mentioned: 17, description: 'سُخر له الجن والريح والطير' },
  { name: 'إلياس', english: 'Ilyas', title: 'من آل هارون', mentioned: 2, description: 'أُرسل إلى أهل بعلبك' },
  { name: 'اليسع', english: 'Al-Yasa', title: 'من الأخيار', mentioned: 2, description: 'من الصابرين والأخيار' },
  { name: 'يونس', english: 'Yunus', title: 'ذو النون', mentioned: 4, description: 'صاحب الحوت' },
  { name: 'ذو الكفل', english: 'Dhul-Kifl', title: 'من الصابرين', mentioned: 2, description: 'من الأخيار الصابرين' },
  { name: 'زكريا', english: 'Zakariya', title: 'كافل مريم', mentioned: 7, description: 'رزقه الله يحيى على كبره' },
  { name: 'يحيى', english: 'Yahya', title: 'الحصور', mentioned: 5, description: 'أول من سُمي بهذا الاسم' },
  { name: 'عيسى', english: 'Isa', title: 'روح الله', mentioned: 25, description: 'كلمة الله ألقاها إلى مريم، وُلد بلا أب' },
  { name: 'محمد ﷺ', english: 'Muhammad', title: 'خاتم النبيين', mentioned: 4, description: 'سيد الخلق وخاتم الأنبياء والمرسلين' },
];

const ULU_AL_AZM = ['نوح', 'إبراهيم', 'موسى', 'عيسى', 'محمد ﷺ'];

export default function ProphetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUluAlAzm, setShowUluAlAzm] = useState(false);

  const filteredProphets = PROPHETS.filter(prophet => {
    const matchesSearch = prophet.name.includes(searchQuery) || 
                         prophet.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prophet.title.includes(searchQuery);
    const matchesFilter = !showUluAlAzm || ULU_AL_AZM.includes(prophet.name);
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <Head>
        <title>قصص الأنبياء | 25 نبياً في القرآن - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="قصص الأنبياء والرسل في القرآن الكريم | قصة آدم، نوح، إبراهيم، موسى، عيسى، محمد ﷺ. تعرف على الأنبياء الـ25 المذكورين في القرآن."
        />
        <meta 
          name="keywords" 
          content="قصص الأنبياء, الأنبياء في القرآن, أولو العزم, قصة موسى, قصة إبراهيم, قصة يوسف, قصة نوح, قصة آدم, سيرة النبي محمد, أنبياء الله"
        />
        <link rel="canonical" href="https://www.yafaqih.app/prophets" />
        
        <meta property="og:title" content="قصص الأنبياء | Ya Faqih يا فقيه" />
        <meta property="og:description" content="قصص الأنبياء والرسل في القرآن الكريم" />
        <meta property="og:url" content="https://www.yafaqih.app/prophets" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-amber-900 to-yellow-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-amber-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">قصص الأنبياء</h1>
                <p className="text-amber-200 mt-1">25 نبياً مذكورين في القرآن الكريم</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Intro */}
          <div className="bg-amber-900/30 rounded-2xl p-6 mb-8 text-center">
            <p className="text-xl font-arabic text-white mb-4">
              ﴿وَلَقَدْ أَرْسَلْنَا رُسُلًا مِّن قَبْلِكَ مِنْهُم مَّن قَصَصْنَا عَلَيْكَ وَمِنْهُم مَّن لَّمْ نَقْصُصْ عَلَيْكَ﴾
            </p>
            <p className="text-amber-300">سورة غافر - الآية 78</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن نبي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 text-white pr-12 pl-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <button
              onClick={() => setShowUluAlAzm(!showUluAlAzm)}
              className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
                showUluAlAzm ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Star className="w-5 h-5" />
              أولو العزم
            </button>
          </div>

          {/* Ulu al-Azm Info */}
          {showUluAlAzm && (
            <div className="bg-amber-900/30 rounded-xl p-4 mb-6">
              <p className="text-amber-200">
                <strong>أولو العزم من الرسل</strong> هم: نوح، إبراهيم، موسى، عيسى، ومحمد ﷺ. 
                سُموا بذلك لصبرهم وعزيمتهم في تبليغ الرسالة.
              </p>
            </div>
          )}

          {/* Prophets Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {filteredProphets.map((prophet, index) => {
              const isUluAlAzm = ULU_AL_AZM.includes(prophet.name);
              return (
                <Link
                  key={index}
                  href={`/?prompt=أخبرني عن قصة النبي ${prophet.name} بالتفصيل`}
                  className={`rounded-2xl p-5 transition group ${
                    isUluAlAzm 
                      ? 'bg-gradient-to-br from-amber-900 to-yellow-900 hover:from-amber-800 hover:to-yellow-800' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {prophet.name}
                        {isUluAlAzm && <Star className="w-4 h-4 text-yellow-400" />}
                      </h3>
                      <p className="text-amber-400">{prophet.title}</p>
                    </div>
                    <span className="bg-gray-900/50 px-2 py-1 rounded text-xs text-gray-400">
                      ذُكر {prophet.mentioned} مرة
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{prophet.description}</p>
                  <p className="text-amber-400/70 text-xs mt-2 group-hover:text-amber-400">
                    اضغط لقراءة القصة كاملة ←
                  </p>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-amber-800 to-yellow-600 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن قصص الأنبياء</h2>
                <p className="text-amber-100">احصل على قصة أي نبي بالتفصيل</p>
              </div>
              <Link 
                href="/?prompt=أخبرني عن قصة سيدنا يوسف كاملة"
                className="bg-white text-amber-700 px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* SEO Content */}
          <section className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">الأنبياء في القرآن الكريم</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                ذكر الله في القرآن الكريم 25 نبياً ورسولاً بالاسم، وأخبرنا أن هناك أنبياء آخرين لم يُذكروا.
                قال تعالى: ﴿وَرُسُلًا قَدْ قَصَصْنَاهُمْ عَلَيْكَ مِن قَبْلُ وَرُسُلًا لَّمْ نَقْصُصْهُمْ عَلَيْكَ﴾.
              </p>
              <p>
                في قصص الأنبياء عبر وعظات للمؤمنين. قال تعالى: ﴿لَقَدْ كَانَ فِي قَصَصِهِمْ عِبْرَةٌ لِّأُولِي الْأَلْبَابِ﴾.
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
