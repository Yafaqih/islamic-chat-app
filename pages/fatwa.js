// pages/fatwa.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Scale, ChevronLeft, Search, MessageCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

// فتاوى شائعة
const FATWAS = [
  {
    id: 1,
    category: 'الصلاة',
    question: 'ما حكم من ترك الصلاة تكاسلاً؟',
    answer: 'ترك الصلاة تكاسلاً كبيرة من كبائر الذنوب، وقد اختلف العلماء في حكم تاركها: فذهب الحنفية والمالكية والشافعية إلى أنه فاسق يُستتاب، وذهب الحنابلة إلى كفره. والواجب على المسلم المحافظة على الصلاة في وقتها.',
    source: 'اللجنة الدائمة للإفتاء',
    popular: true
  },
  {
    id: 2,
    category: 'الصلاة',
    question: 'هل يجوز الجمع بين الصلاتين للمسافر؟',
    answer: 'نعم، يجوز للمسافر الجمع بين الظهر والعصر، وبين المغرب والعشاء، سواء جمع تقديم أو تأخير، وهذا من رخص السفر التي شرعها الله تيسيراً على عباده.',
    source: 'الشيخ ابن باز',
    popular: true
  },
  {
    id: 3,
    category: 'الصيام',
    question: 'ما حكم من أكل أو شرب ناسياً في رمضان؟',
    answer: 'من أكل أو شرب ناسياً وهو صائم فصومه صحيح ولا قضاء عليه، لقول النبي ﷺ: "من نسي وهو صائم فأكل أو شرب فليتم صومه فإنما أطعمه الله وسقاه" متفق عليه.',
    source: 'صحيح البخاري ومسلم',
    popular: true
  },
  {
    id: 4,
    category: 'الصيام',
    question: 'هل يجوز استخدام معجون الأسنان أثناء الصيام؟',
    answer: 'يجوز استخدام معجون الأسنان أثناء الصيام مع الحذر من ابتلاع شيء منه. والأفضل استخدام السواك، لكن لا حرج في استخدام المعجون مع الاحتياط.',
    source: 'الشيخ ابن عثيمين',
    popular: false
  },
  {
    id: 5,
    category: 'الزكاة',
    question: 'كيف أحسب زكاة المال؟',
    answer: 'زكاة المال تجب إذا بلغ النصاب (ما يعادل 85 غرام ذهب) وحال عليه الحول. والمقدار الواجب هو 2.5% (ربع العشر). فإذا كان لديك 100,000 ريال، فالزكاة = 2,500 ريال.',
    source: 'إجماع العلماء',
    popular: true
  },
  {
    id: 6,
    category: 'المعاملات',
    question: 'ما حكم العمل في البنوك الربوية؟',
    answer: 'العمل في البنوك الربوية محرم إذا كان العمل متعلقاً بالربا مباشرة كالمحاسبة والكتابة. أما الأعمال غير المتعلقة بالربا كالحراسة والنظافة ففيها خلاف، والأحوط تركها.',
    source: 'اللجنة الدائمة للإفتاء',
    popular: false
  },
  {
    id: 7,
    category: 'الطهارة',
    question: 'هل يجب الوضوء من لمس المرأة؟',
    answer: 'اختلف العلماء: فذهب الشافعية إلى نقض الوضوء بلمس المرأة الأجنبية بشهوة، وذهب الحنفية والمالكية إلى أنه لا ينقض إلا باللمس الفاحش. والراجح أن اللمس بشهوة ينقض الوضوء.',
    source: 'خلاف فقهي معتبر',
    popular: false
  },
  {
    id: 8,
    category: 'اللباس',
    question: 'ما حكم لبس الذهب للرجال؟',
    answer: 'لبس الذهب حرام على الرجال، لقول النبي ﷺ: "حُرِّم لباس الحرير والذهب على ذكور أمتي وأحل لإناثهم". والحكم يشمل الخاتم والسلسلة والساعة الذهبية.',
    source: 'صحيح الترمذي',
    popular: true
  },
  {
    id: 9,
    category: 'العقيدة',
    question: 'ما حكم الذهاب للسحرة والمشعوذين؟',
    answer: 'الذهاب للسحرة والمشعوذين حرام شرعاً، ومن أتاهم وصدقهم فقد كفر بما أنزل على محمد ﷺ. والعلاج يكون بالرقية الشرعية والأدعية المأثورة.',
    source: 'صحيح مسلم',
    popular: true
  },
  {
    id: 10,
    category: 'الأسرة',
    question: 'ما حكم عقوق الوالدين؟',
    answer: 'عقوق الوالدين من أكبر الكبائر، قال النبي ﷺ: "ألا أنبئكم بأكبر الكبائر؟ الإشراك بالله، وعقوق الوالدين". والواجب برهما والإحسان إليهما حتى لو كانا كافرين.',
    source: 'صحيح البخاري',
    popular: true
  }
];

const CATEGORIES = [
  { id: 'all', label: 'جميع الفتاوى', icon: '📋' },
  { id: 'الصلاة', label: 'الصلاة', icon: '🕌' },
  { id: 'الصيام', label: 'الصيام', icon: '🌙' },
  { id: 'الزكاة', label: 'الزكاة', icon: '💰' },
  { id: 'الطهارة', label: 'الطهارة', icon: '💧' },
  { id: 'المعاملات', label: 'المعاملات', icon: '🤝' },
  { id: 'اللباس', label: 'اللباس', icon: '👔' },
  { id: 'العقيدة', label: 'العقيدة', icon: '❤️' },
  { id: 'الأسرة', label: 'الأسرة', icon: '👨‍👩‍👧‍👦' },
];

function FatwaCard({ fatwa }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 text-right flex items-start justify-between gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-teal-900 text-teal-300 px-3 py-1 rounded-full text-sm">
              {fatwa.category}
            </span>
            {fatwa.popular && (
              <span className="bg-yellow-900 text-yellow-300 px-2 py-1 rounded-full text-xs">
                ⭐ شائع
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
            {fatwa.question}
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-700">
          <div className="bg-gray-900/50 p-4 rounded-xl mt-4">
            <p className="text-gray-200 leading-relaxed">{fatwa.answer}</p>
          </div>
          <p className="text-gray-400 text-sm mt-3">
            📚 المصدر: {fatwa.source}
          </p>
          <Link 
            href={`/?prompt=${fatwa.question}`}
            className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mt-3 text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            اسأل يا فقيه للمزيد من التفاصيل
          </Link>
        </div>
      )}
    </div>
  );
}

export default function FatwaPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  const filteredFatwas = FATWAS.filter(fatwa => {
    const matchesCategory = selectedCategory === 'all' || fatwa.category === selectedCategory;
    const matchesSearch = fatwa.question.includes(searchQuery) || fatwa.answer.includes(searchQuery);
    const matchesPopular = !showPopularOnly || fatwa.popular;
    return matchesCategory && matchesSearch && matchesPopular;
  });

  return (
    <>
      <Head>
        <title>فتاوى إسلامية | أسئلة وأجوبة شرعية - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="فتاوى إسلامية موثوقة من كبار العلماء | أسئلة وأجوبة في الصلاة، الصيام، الزكاة، الحج، المعاملات، الأسرة. اسأل يا فقيه عن أي حكم شرعي."
        />
        <meta 
          name="keywords" 
          content="فتاوى إسلامية, فتوى, أحكام شرعية, حلال وحرام, أسئلة دينية, فتاوى الصلاة, فتاوى الصيام, فتاوى الزكاة, اللجنة الدائمة, ابن باز, ابن عثيمين"
        />
        <link rel="canonical" href="https://www.yafaqih.app/fatwa" />
        
        {/* Open Graph */}
        <meta property="og:title" content="فتاوى إسلامية | Ya Faqih يا فقيه" />
        <meta property="og:description" content="فتاوى إسلامية موثوقة في الصلاة والصيام والزكاة والمعاملات" />
        <meta property="og:url" content="https://www.yafaqih.app/fatwa" />
        
        {/* JSON-LD FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": FATWAS.slice(0, 5).map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": f.answer
                }
              }))
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-900 to-teal-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-teal-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">الفتاوى الإسلامية</h1>
                <p className="text-teal-200 mt-1">أسئلة وأجوبة شرعية من كبار العلماء</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* CTA */}
          <div className="bg-gradient-to-r from-teal-800 to-teal-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه أي سؤال شرعي</h2>
                <p className="text-teal-100">احصل على إجابة مفصلة مع الأدلة من الكتاب والسنة</p>
              </div>
              <Link 
                href="/?prompt=ما حكم"
                className="bg-white text-teal-700 px-6 py-3 rounded-xl font-bold hover:bg-teal-50 transition shadow-lg"
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
              placeholder="ابحث عن فتوى..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pr-12 pl-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setShowPopularOnly(!showPopularOnly)}
              className={`px-4 py-2 rounded-xl font-bold transition ${
                showPopularOnly 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              ⭐ الأكثر بحثاً
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap ${
                  selectedCategory === cat.id 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Fatwas List */}
          <div className="space-y-3">
            {filteredFatwas.map(fatwa => (
              <FatwaCard key={fatwa.id} fatwa={fatwa} />
            ))}
          </div>

          {filteredFatwas.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد فتاوى مطابقة للبحث</p>
              <Link href="/" className="text-teal-400 hover:text-teal-300 mt-2 inline-block">
                اسأل يا فقيه مباشرة
              </Link>
            </div>
          )}

          {/* SEO Content */}
          <section className="mt-12 bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">ما هي الفتوى الشرعية؟</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                الفتوى هي بيان الحكم الشرعي في مسألة ما بناءً على الأدلة من القرآن الكريم 
                والسنة النبوية وإجماع العلماء والقياس الصحيح.
              </p>
              <p>
                يعتمد يا فقيه على فتاوى كبار العلماء مثل: اللجنة الدائمة للإفتاء، 
                الشيخ عبد العزيز بن باز، الشيخ محمد بن صالح العثيمين، وغيرهم من العلماء الموثوقين.
              </p>
              <p>
                <strong>ملاحظة هامة:</strong> يا فقيه يقدم معلومات عامة ولا يُغني عن استشارة 
                عالم متخصص في المسائل الخاصة والحساسة.
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
