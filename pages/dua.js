// pages/dua.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Heart, ChevronLeft, Copy, Check, MessageCircle, Sparkles, Search } from 'lucide-react';

// الأدعية المأثورة
const DUAS = [
  {
    id: 1,
    category: 'استخارة',
    title: 'دعاء الاستخارة',
    arabic: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ، وَتَعْلَمُ وَلاَ أَعْلَمُ، وَأَنْتَ عَلاَّمُ الْغُيُوبِ. اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ',
    source: 'البخاري',
    occasion: 'عند الحيرة في أمر من الأمور'
  },
  {
    id: 2,
    category: 'كرب',
    title: 'دعاء الكرب والهم',
    arabic: 'لَا إِلَهَ إِلَّا اللهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللهُ رَبُّ السَّمَوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
    source: 'البخاري ومسلم',
    occasion: 'عند الكرب والهم والحزن'
  },
  {
    id: 3,
    category: 'كرب',
    title: 'دعاء الهم والحزن',
    arabic: 'اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي',
    source: 'أحمد',
    occasion: 'عند الهم والحزن'
  },
  {
    id: 4,
    category: 'سفر',
    title: 'دعاء السفر',
    arabic: 'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ',
    source: 'مسلم',
    occasion: 'عند ركوب السيارة أو الطائرة للسفر'
  },
  {
    id: 5,
    category: 'مغفرة',
    title: 'سيد الاستغفار',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    source: 'البخاري',
    occasion: 'صباحاً ومساءً - من قالها موقناً بها فمات دخل الجنة'
  },
  {
    id: 6,
    category: 'رزق',
    title: 'دعاء الرزق',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    source: 'ابن ماجه',
    occasion: 'بعد صلاة الفجر'
  },
  {
    id: 7,
    category: 'شفاء',
    title: 'دعاء الشفاء للمريض',
    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ، شِفَاءً لاَ يُغَادِرُ سَقَمًا',
    source: 'البخاري ومسلم',
    occasion: 'عند زيارة المريض أو الدعاء له'
  },
  {
    id: 8,
    category: 'حماية',
    title: 'دعاء الحفظ من الشر',
    arabic: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    source: 'أبو داود والترمذي',
    occasion: '3 مرات صباحاً ومساءً - لم يضره شيء'
  },
  {
    id: 9,
    category: 'صلاة',
    title: 'دعاء دخول المسجد',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    source: 'مسلم',
    occasion: 'عند دخول المسجد'
  },
  {
    id: 10,
    category: 'صلاة',
    title: 'دعاء الخروج من المسجد',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    source: 'مسلم',
    occasion: 'عند الخروج من المسجد'
  },
  {
    id: 11,
    category: 'نوم',
    title: 'دعاء قبل النوم',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    source: 'البخاري',
    occasion: 'قبل النوم'
  },
  {
    id: 12,
    category: 'نوم',
    title: 'دعاء الاستيقاظ من النوم',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    source: 'البخاري',
    occasion: 'عند الاستيقاظ من النوم'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: '📿' },
  { id: 'استخارة', label: 'الاستخارة', icon: '🤲' },
  { id: 'كرب', label: 'الكرب والهم', icon: '💔' },
  { id: 'سفر', label: 'السفر', icon: '✈️' },
  { id: 'مغفرة', label: 'الاستغفار', icon: '🌙' },
  { id: 'رزق', label: 'الرزق', icon: '💰' },
  { id: 'شفاء', label: 'الشفاء', icon: '💚' },
  { id: 'حماية', label: 'الحماية', icon: '🛡️' },
  { id: 'صلاة', label: 'الصلاة', icon: '🕌' },
  { id: 'نوم', label: 'النوم', icon: '😴' },
];

export default function DuaPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredDuas = DUAS.filter(dua => {
    const matchesCategory = selectedCategory === 'all' || dua.category === selectedCategory;
    const matchesSearch = dua.title.includes(searchQuery) || dua.arabic.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <Head>
        <title>الأدعية المستجابة | أدعية من القرآن والسنة - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="الأدعية المستجابة من القرآن الكريم والسنة النبوية | دعاء الاستخارة، دعاء الكرب، دعاء السفر، دعاء الشفاء، دعاء الرزق. أدعية مأثورة صحيحة."
        />
        <meta 
          name="keywords" 
          content="دعاء, أدعية مستجابة, دعاء الاستخارة, دعاء الكرب, دعاء السفر, دعاء الشفاء, دعاء الرزق, دعاء المريض, الدعاء المستجاب, أدعية من السنة, أدعية صحيحة"
        />
        <link rel="canonical" href="https://www.yafaqih.app/dua" />
        
        {/* Open Graph */}
        <meta property="og:title" content="الأدعية المستجابة | Ya Faqih يا فقيه" />
        <meta property="og:description" content="أدعية مستجابة من القرآن والسنة - دعاء الاستخارة، الكرب، السفر، الشفاء" />
        <meta property="og:url" content="https://www.yafaqih.app/dua" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "الأدعية المستجابة",
              "description": "أدعية مستجابة من القرآن والسنة",
              "url": "https://www.yafaqih.app/dua"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-900 to-purple-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-purple-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">الأدعية المستجابة</h1>
                <p className="text-purple-200 mt-1">أدعية من القرآن الكريم والسنة النبوية الصحيحة</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* CTA */}
          <div className="bg-gradient-to-r from-purple-800 to-purple-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن أي دعاء</h2>
                <p className="text-purple-100">احصل على الدعاء المناسب لأي موقف مع شرحه وفضله</p>
              </div>
              <Link 
                href="/?prompt=ما هو دعاء الاستخارة وكيف أصليها"
                className="bg-white text-purple-700 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن دعاء..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pr-12 pl-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
                  selectedCategory === cat.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Duas List */}
          <div className="space-y-4">
            {filteredDuas.map(dua => (
              <div key={dua.id} className="bg-gray-800 rounded-2xl p-5 hover:bg-gray-750 transition">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-purple-400">{dua.title}</h3>
                  <span className="bg-purple-900 text-purple-300 px-3 py-1 rounded-full text-sm">
                    {dua.category}
                  </span>
                </div>
                
                <p className="text-xl leading-loose text-white font-arabic mb-4 text-right bg-gray-900/50 p-4 rounded-xl">
                  {dua.arabic}
                </p>
                
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">📚 {dua.source}</span>
                    <span className="text-purple-400 text-sm">⏰ {dua.occasion}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(dua.arabic, dua.id)}
                    className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
                  >
                    {copiedId === dua.id ? (
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

          {filteredDuas.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد أدعية مطابقة للبحث</p>
            </div>
          )}

          {/* SEO Content */}
          <section className="mt-12 bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">آداب الدعاء المستجاب</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                الدعاء هو العبادة، وهو سلاح المؤمن. قال الله تعالى: ﴿وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ﴾ [غافر: 60].
              </p>
              <p>
                <strong>من آداب الدعاء:</strong> الإخلاص لله، البدء بحمد الله والصلاة على النبي ﷺ، 
                استقبال القبلة، رفع اليدين، اليقين بالإجابة، عدم الاستعجال.
              </p>
              <p>
                <strong>أوقات إجابة الدعاء:</strong> الثلث الأخير من الليل، بين الأذان والإقامة، 
                يوم الجمعة، عند نزول المطر، في السجود، عند الإفطار من الصيام.
              </p>
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
