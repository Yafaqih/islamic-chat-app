// pages/khutba.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Mic, ChevronLeft, Search, MessageCircle, Calendar, Clock, FileText } from 'lucide-react';

// مواضيع الخطب
const KHUTBA_TOPICS = [
  {
    id: 1,
    title: 'خطبة عن الصبر على البلاء',
    category: 'الأخلاق',
    description: 'خطبة تتحدث عن فضل الصبر وأجره العظيم عند الله، مع ذكر قصص الصابرين من القرآن والسنة',
    duration: '15-20 دقيقة',
    occasion: 'عامة',
    keywords: ['الصبر', 'البلاء', 'الاحتساب', 'الرضا بالقضاء']
  },
  {
    id: 2,
    title: 'خطبة عن بر الوالدين',
    category: 'الأسرة',
    description: 'خطبة عن حقوق الوالدين وفضل برهما وخطر عقوقهما',
    duration: '15-20 دقيقة',
    occasion: 'عامة',
    keywords: ['بر الوالدين', 'حق الأم', 'حق الأب', 'العقوق']
  },
  {
    id: 3,
    title: 'خطبة استقبال رمضان',
    category: 'المناسبات',
    description: 'خطبة عن فضائل شهر رمضان وكيفية استغلاله في الطاعات',
    duration: '20-25 دقيقة',
    occasion: 'رمضان',
    keywords: ['رمضان', 'الصيام', 'القيام', 'ليلة القدر']
  },
  {
    id: 4,
    title: 'خطبة عيد الفطر',
    category: 'المناسبات',
    description: 'خطبة عيد الفطر المبارك مع التهنئة وآداب العيد',
    duration: '10-15 دقيقة',
    occasion: 'عيد الفطر',
    keywords: ['عيد الفطر', 'زكاة الفطر', 'صلاة العيد']
  },
  {
    id: 5,
    title: 'خطبة عيد الأضحى',
    category: 'المناسبات',
    description: 'خطبة عيد الأضحى المبارك مع فضل الأضحية وأحكامها',
    duration: '10-15 دقيقة',
    occasion: 'عيد الأضحى',
    keywords: ['عيد الأضحى', 'الأضحية', 'الحج', 'يوم عرفة']
  },
  {
    id: 6,
    title: 'خطبة عن التوبة والاستغفار',
    category: 'الإيمان',
    description: 'خطبة عن فضل التوبة وشروطها وكيفية الرجوع إلى الله',
    duration: '15-20 دقيقة',
    occasion: 'عامة',
    keywords: ['التوبة', 'الاستغفار', 'المغفرة', 'الرجوع إلى الله']
  },
  {
    id: 7,
    title: 'خطبة عن حفظ اللسان',
    category: 'الأخلاق',
    description: 'خطبة عن آفات اللسان وخطر الغيبة والنميمة والكذب',
    duration: '15-20 دقيقة',
    occasion: 'عامة',
    keywords: ['اللسان', 'الغيبة', 'النميمة', 'الكذب']
  },
  {
    id: 8,
    title: 'خطبة عن الصدق',
    category: 'الأخلاق',
    description: 'خطبة عن فضل الصدق وأهميته في حياة المسلم',
    duration: '15-20 دقيقة',
    occasion: 'عامة',
    keywords: ['الصدق', 'الأمانة', 'الصديقين']
  },
  {
    id: 9,
    title: 'خطبة عن صلة الرحم',
    category: 'الأسرة',
    description: 'خطبة عن فضل صلة الرحم وخطر قطيعتها',
    duration: '15-20 دقيقة',
    occasion: 'عامة',
    keywords: ['صلة الرحم', 'القرابة', 'قطيعة الرحم']
  },
  {
    id: 10,
    title: 'خطبة عن الإسراء والمعراج',
    category: 'المناسبات',
    description: 'خطبة عن رحلة الإسراء والمعراج ودروسها وعبرها',
    duration: '20-25 دقيقة',
    occasion: 'رجب',
    keywords: ['الإسراء', 'المعراج', 'المسجد الأقصى']
  },
  {
    id: 11,
    title: 'خطبة عن المولد النبوي',
    category: 'المناسبات',
    description: 'خطبة عن سيرة النبي ﷺ وأخلاقه الكريمة',
    duration: '20-25 دقيقة',
    occasion: 'ربيع الأول',
    keywords: ['المولد النبوي', 'السيرة النبوية', 'أخلاق النبي']
  },
  {
    id: 12,
    title: 'خطبة عن تربية الأبناء',
    category: 'الأسرة',
    description: 'خطبة عن مسؤولية الآباء في تربية الأبناء على الإسلام',
    duration: '15-20 دقيقة',
    occasion: 'عامة',
    keywords: ['تربية الأبناء', 'الأسرة المسلمة', 'حق الأولاد']
  }
];

const CATEGORIES = [
  { id: 'all', label: 'جميع الخطب', icon: '📋' },
  { id: 'الأخلاق', label: 'الأخلاق', icon: '⭐' },
  { id: 'الإيمان', label: 'الإيمان', icon: '❤️' },
  { id: 'الأسرة', label: 'الأسرة', icon: '👨‍👩‍👧‍👦' },
  { id: 'المناسبات', label: 'المناسبات', icon: '📅' },
];

export default function KhutbaPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKhutbas = KHUTBA_TOPICS.filter(khutba => {
    const matchesCategory = selectedCategory === 'all' || khutba.category === selectedCategory;
    const matchesSearch = khutba.title.includes(searchQuery) || 
                         khutba.description.includes(searchQuery) ||
                         khutba.keywords.some(k => k.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>خطب الجمعة | خطب مكتوبة جاهزة للخطباء - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="خطب الجمعة مكتوبة وجاهزة | خطب قصيرة ومؤثرة عن الصبر، التوبة، بر الوالدين، رمضان، العيدين. إعداد خطب مخصصة مع يا فقيه."
        />
        <meta 
          name="keywords" 
          content="خطبة الجمعة, خطب مكتوبة, خطب جاهزة, خطبة قصيرة, خطبة عن الصبر, خطبة رمضان, خطبة العيد, خطبة التوبة, خطب للخطباء"
        />
        <link rel="canonical" href="https://www.yafaqih.app/khutba" />
        
        {/* Open Graph */}
        <meta property="og:title" content="خطب الجمعة | Ya Faqih يا فقيه" />
        <meta property="og:description" content="خطب الجمعة مكتوبة وجاهزة للخطباء والأئمة" />
        <meta property="og:url" content="https://www.yafaqih.app/khutba" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "خطب الجمعة",
              "description": "خطب الجمعة مكتوبة وجاهزة للخطباء",
              "url": "https://www.yafaqih.app/khutba"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-900 to-indigo-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-indigo-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">خطب الجمعة</h1>
                <p className="text-indigo-200 mt-1">خطب مكتوبة وجاهزة للخطباء والأئمة</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اطلب خطبة مخصصة من يا فقيه</h2>
                <p className="text-indigo-100">احصل على خطبة كاملة في أي موضوع تريده</p>
              </div>
              <Link 
                href="/?prompt=اكتب لي خطبة جمعة عن"
                className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg"
              >
                اطلب خطبة
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن خطبة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pr-12 pl-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Khutbas List */}
          <div className="grid gap-4">
            {filteredKhutbas.map(khutba => (
              <Link
                key={khutba.id}
                href={`/?prompt=اكتب لي خطبة جمعة كاملة عن ${khutba.title.replace('خطبة عن ', '').replace('خطبة ', '')}`}
                className="bg-gray-800 rounded-2xl p-5 hover:bg-gray-700 transition group block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-900 text-indigo-300 px-3 py-1 rounded-full text-sm">
                      {khutba.category}
                    </span>
                    {khutba.occasion !== 'عامة' && (
                      <span className="bg-amber-900 text-amber-300 px-2 py-1 rounded-full text-xs">
                        {khutba.occasion}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {khutba.duration}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition">
                  {khutba.title}
                </h3>
                
                <p className="text-gray-400 mb-3">{khutba.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {khutba.keywords.map(keyword => (
                    <span key={keyword} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      #{keyword}
                    </span>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">اضغط للحصول على الخطبة الكاملة</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Request Buttons */}
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              طلب سريع
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'خطبة قصيرة جداً',
                'خطبة مؤثرة',
                'خطبة للشباب',
                'خطبة للأطفال',
                'خطبة عن الموت',
                'خطبة عن الشكر',
                'خطبة عن الدعاء',
                'خطبة عن الصدقة'
              ].map(topic => (
                <Link
                  key={topic}
                  href={`/?prompt=اكتب لي ${topic}`}
                  className="bg-gray-800 hover:bg-indigo-900 text-center py-3 px-4 rounded-xl transition text-sm"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </section>

          {/* SEO Content */}
          <section className="mt-12 bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">خدمة إعداد خطب الجمعة</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                يقدم يا فقيه خدمة إعداد خطب الجمعة للخطباء والأئمة، مع مراعاة الضوابط الشرعية 
                والأسلوب المناسب للمقام.
              </p>
              <p>
                <strong>مميزات الخطب:</strong> تتضمن الخطب آيات قرآنية وأحاديث صحيحة، 
                مع تدرج في الموضوع من المقدمة إلى الخاتمة، والدعاء المناسب.
              </p>
              <p>
                يمكنك طلب خطبة في أي موضوع تريده، وتحديد المدة المطلوبة (قصيرة، متوسطة، طويلة)، 
                وسيقوم يا فقيه بإعداد خطبة متكاملة لك.
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
