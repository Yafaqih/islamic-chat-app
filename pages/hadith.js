// pages/hadith.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, ChevronLeft, Search, MessageCircle, Star, BookMarked } from 'lucide-react';

// أحاديث مختارة
const HADITHS = [
  {
    id: 1,
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    narrator: 'عمر بن الخطاب رضي الله عنه',
    source: 'صحيح البخاري',
    number: 1,
    topic: 'النية',
    explanation: 'هذا الحديث أصل عظيم في الدين، وعليه مدار الأعمال كلها'
  },
  {
    id: 2,
    arabic: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَصَوْمِ رَمَضَانَ، وَحَجِّ الْبَيْتِ',
    narrator: 'عبد الله بن عمر رضي الله عنهما',
    source: 'صحيح البخاري',
    number: 8,
    topic: 'أركان الإسلام',
    explanation: 'أركان الإسلام الخمسة التي يقوم عليها الدين'
  },
  {
    id: 3,
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    narrator: 'أنس بن مالك رضي الله عنه',
    source: 'صحيح البخاري',
    number: 13,
    topic: 'الإيمان',
    explanation: 'من علامات كمال الإيمان محبة الخير للمسلمين'
  },
  {
    id: 4,
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    narrator: 'أبو هريرة رضي الله عنه',
    source: 'صحيح البخاري',
    number: 6018,
    topic: 'الكلام',
    explanation: 'الحث على حفظ اللسان والكلام بالخير أو السكوت'
  },
  {
    id: 5,
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    narrator: 'عبد الله بن عمرو رضي الله عنهما',
    source: 'صحيح البخاري',
    number: 10,
    topic: 'الإسلام',
    explanation: 'المسلم الحقيقي من يأمن الناس شره'
  },
  {
    id: 6,
    arabic: 'لاَ يَدْخُلُ الْجَنَّةَ قَاطِعُ رَحِمٍ',
    narrator: 'جبير بن مطعم رضي الله عنه',
    source: 'صحيح البخاري',
    number: 5984,
    topic: 'صلة الرحم',
    explanation: 'تحذير شديد من قطيعة الرحم'
  },
  {
    id: 7,
    arabic: 'مَا مِنْ عَبْدٍ يَسْتَرْ عَبْدًا فِي الدُّنْيَا إِلاَّ سَتَرَهُ اللهُ يَوْمَ الْقِيَامَةِ',
    narrator: 'أبو هريرة رضي الله عنه',
    source: 'صحيح مسلم',
    number: 2590,
    topic: 'الستر',
    explanation: 'فضل الستر على المسلمين وعدم فضحهم'
  },
  {
    id: 8,
    arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
    narrator: 'أبو مالك الأشعري رضي الله عنه',
    source: 'صحيح مسلم',
    number: 223,
    topic: 'الطهارة',
    explanation: 'الطهارة نصف الإيمان لأهميتها العظيمة'
  },
  {
    id: 9,
    arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
    narrator: 'النعمان بن بشير رضي الله عنهما',
    source: 'سنن الترمذي',
    number: 3372,
    topic: 'الدعاء',
    explanation: 'الدعاء من أعظم العبادات وأجلها'
  },
  {
    id: 10,
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    narrator: 'عثمان بن عفان رضي الله عنه',
    source: 'صحيح البخاري',
    number: 5027,
    topic: 'القرآن',
    explanation: 'فضل تعلم القرآن وتعليمه للناس'
  },
  {
    id: 11,
    arabic: 'إِنَّ اللهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
    narrator: 'أبو هريرة رضي الله عنه',
    source: 'صحيح مسلم',
    number: 2564,
    topic: 'القلب',
    explanation: 'العبرة بصلاح القلب والعمل لا بالمظاهر'
  },
  {
    id: 12,
    arabic: 'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',
    narrator: 'أبو موسى الأشعري رضي الله عنه',
    source: 'صحيح البخاري',
    number: 6026,
    topic: 'الأخوة',
    explanation: 'المؤمنون يتعاونون ويتناصرون كالبنيان المتماسك'
  }
];

const TOPICS = [
  'الكل', 'النية', 'أركان الإسلام', 'الإيمان', 'الكلام', 'الإسلام', 
  'صلة الرحم', 'الستر', 'الطهارة', 'الدعاء', 'القرآن', 'القلب', 'الأخوة'
];

const BOOKS = [
  { name: 'صحيح البخاري', count: '7275 حديث', icon: '📗' },
  { name: 'صحيح مسلم', count: '3033 حديث', icon: '📘' },
  { name: 'سنن أبي داود', count: '5274 حديث', icon: '📙' },
  { name: 'سنن الترمذي', count: '3956 حديث', icon: '📕' },
  { name: 'سنن النسائي', count: '5758 حديث', icon: '📓' },
  { name: 'سنن ابن ماجه', count: '4341 حديث', icon: '📔' },
];

export default function HadithPage() {
  const [selectedTopic, setSelectedTopic] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHadiths = HADITHS.filter(hadith => {
    const matchesTopic = selectedTopic === 'الكل' || hadith.topic === selectedTopic;
    const matchesSearch = hadith.arabic.includes(searchQuery) || 
                         hadith.narrator.includes(searchQuery) ||
                         hadith.topic.includes(searchQuery);
    return matchesTopic && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>الأحاديث الصحيحة | شرح الأحاديث النبوية - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="الأحاديث الصحيحة من صحيح البخاري ومسلم | شرح الأحاديث النبوية مع تخريجها ودرجة صحتها. أحاديث الأربعين النووية، أحاديث الأخلاق، أحاديث العبادات."
        />
        <meta 
          name="keywords" 
          content="أحاديث صحيحة, صحيح البخاري, صحيح مسلم, شرح الأحاديث, الأربعين النووية, أحاديث نبوية, حديث اليوم, تخريج الأحاديث, درجة الحديث, السنة النبوية"
        />
        <link rel="canonical" href="https://www.yafaqih.app/hadith" />
        
        {/* Open Graph */}
        <meta property="og:title" content="الأحاديث الصحيحة | Ya Faqih يا فقيه" />
        <meta property="og:description" content="أحاديث صحيحة من البخاري ومسلم مع الشرح والتخريج" />
        <meta property="og:url" content="https://www.yafaqih.app/hadith" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "الأحاديث الصحيحة",
              "description": "أحاديث صحيحة من البخاري ومسلم",
              "url": "https://www.yafaqih.app/hadith"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900 to-blue-700 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">الأحاديث الصحيحة</h1>
                <p className="text-blue-200 mt-1">من صحيح البخاري ومسلم والسنن</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن أي حديث</h2>
                <p className="text-blue-100">احصل على شرح الحديث وتخريجه ودرجة صحته</p>
              </div>
              <Link 
                href="/?prompt=اشرح لي حديث إنما الأعمال بالنيات"
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Hadith Books */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-blue-500" />
              كتب الحديث الستة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {BOOKS.map(book => (
                <Link
                  key={book.name}
                  href={`/?prompt=أريد أحاديث من ${book.name}`}
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition text-center group"
                >
                  <span className="text-3xl block mb-2">{book.icon}</span>
                  <h3 className="font-bold text-sm mb-1">{book.name}</h3>
                  <p className="text-gray-400 text-xs">{book.count}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن حديث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pr-12 pl-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Topics */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
                  selectedTopic === topic 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Hadiths List */}
          <div className="space-y-4">
            {filteredHadiths.map(hadith => (
              <div key={hadith.id} className="bg-gray-800 rounded-2xl p-5 hover:bg-gray-750 transition">
                <div className="flex items-start justify-between mb-3">
                  <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm">
                    {hadith.topic}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {hadith.source} - رقم {hadith.number}
                  </span>
                </div>
                
                <p className="text-xl leading-loose text-white font-arabic mb-4 text-right">
                  قال رسول الله ﷺ: «{hadith.arabic}»
                </p>
                
                <div className="bg-gray-900/50 p-3 rounded-xl mb-3">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-blue-400">الراوي:</strong> {hadith.narrator}
                  </p>
                </div>
                
                <p className="text-gray-400 text-sm">
                  <strong className="text-blue-400">الشرح المختصر:</strong> {hadith.explanation}
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Link 
                    href={`/?prompt=اشرح لي حديث ${hadith.arabic.substring(0, 30)}`}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                  >
                    <Star className="w-4 h-4" />
                    اطلب شرحاً مفصلاً من يا فقيه
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* SEO Content */}
          <section className="mt-12 bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">ما هي الأحاديث الصحيحة؟</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                الحديث النبوي هو كل ما أُثر عن النبي محمد ﷺ من قول أو فعل أو تقرير أو صفة. 
                والحديث الصحيح هو ما اتصل سنده بنقل العدل الضابط عن مثله إلى منتهاه من غير شذوذ ولا علة.
              </p>
              <p>
                <strong>أشهر كتب الحديث:</strong> الصحيحان (البخاري ومسلم) وهما أصح الكتب بعد القرآن الكريم، 
                والسنن الأربعة (أبو داود، الترمذي، النسائي، ابن ماجه).
              </p>
              <p>
                يساعدك يا فقيه في شرح الأحاديث وتخريجها وبيان درجة صحتها، 
                مع ذكر فوائد الحديث وأقوال العلماء فيه.
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 py-8 px-4 mt-12 border-t border-gray-800">
          <div className="max-w-6xl mx-auto text-center text-gray-400">
            <p>© 2025 Ya Faqih - يا فقيه | مساعدك الإسلامي الذكي</p>
          </div>
        </footer>
      </div>
    </>
  );
}
