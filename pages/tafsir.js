// pages/tafsir.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Book, Search, ChevronLeft, Star, BookOpen, MessageCircle } from 'lucide-react';

// Liste des 114 sourates
const SURAHS = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', verses: 7, type: 'مكية' },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', verses: 286, type: 'مدنية' },
  { number: 3, name: 'آل عمران', englishName: 'Al-Imran', verses: 200, type: 'مدنية' },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', verses: 176, type: 'مدنية' },
  { number: 5, name: 'المائدة', englishName: 'Al-Maidah', verses: 120, type: 'مدنية' },
  { number: 6, name: 'الأنعام', englishName: 'Al-Anam', verses: 165, type: 'مكية' },
  { number: 7, name: 'الأعراف', englishName: 'Al-Araf', verses: 206, type: 'مكية' },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', verses: 75, type: 'مدنية' },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah', verses: 129, type: 'مدنية' },
  { number: 10, name: 'يونس', englishName: 'Yunus', verses: 109, type: 'مكية' },
  { number: 11, name: 'هود', englishName: 'Hud', verses: 123, type: 'مكية' },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', verses: 111, type: 'مكية' },
  { number: 13, name: 'الرعد', englishName: 'Ar-Rad', verses: 43, type: 'مدنية' },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim', verses: 52, type: 'مكية' },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', verses: 99, type: 'مكية' },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', verses: 128, type: 'مكية' },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra', verses: 111, type: 'مكية' },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', verses: 110, type: 'مكية' },
  { number: 19, name: 'مريم', englishName: 'Maryam', verses: 98, type: 'مكية' },
  { number: 20, name: 'طه', englishName: 'Taha', verses: 135, type: 'مكية' },
  { number: 36, name: 'يس', englishName: 'Yaseen', verses: 83, type: 'مكية' },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', verses: 78, type: 'مدنية' },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqiah', verses: 96, type: 'مكية' },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', verses: 30, type: 'مكية' },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', verses: 4, type: 'مكية' },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', verses: 5, type: 'مكية' },
  { number: 114, name: 'الناس', englishName: 'An-Nas', verses: 6, type: 'مكية' },
];

// Sourates populaires
const POPULAR_SURAHS = [1, 2, 18, 36, 55, 56, 67, 112];

export default function TafsirPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredSurahs = SURAHS.filter(surah => {
    const matchesSearch = surah.name.includes(searchQuery) || 
                         surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         surah.number.toString().includes(searchQuery);
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'makki' && surah.type === 'مكية') ||
                         (selectedFilter === 'madani' && surah.type === 'مدنية');
    return matchesSearch && matchesFilter;
  });

  const popularSurahs = SURAHS.filter(s => POPULAR_SURAHS.includes(s.number));

  return (
    <>
      <Head>
        <title>تفسير القرآن الكريم | شرح الآيات بالتفصيل - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="تفسير القرآن الكريم بالتفصيل | شرح الآيات مع أقوال العلماء والتفاسير المعتمدة. تفسير ابن كثير، الطبري، السعدي. اسأل يا فقيه عن معاني الآيات."
        />
        <meta 
          name="keywords" 
          content="تفسير القرآن, تفسير الآيات, شرح القرآن, تفسير ابن كثير, تفسير الطبري, تفسير السعدي, معاني القرآن, سورة الفاتحة, سورة البقرة, سورة الكهف, سورة يس"
        />
        <link rel="canonical" href="https://www.yafaqih.app/tafsir" />
        
        {/* Open Graph */}
        <meta property="og:title" content="تفسير القرآن الكريم | Ya Faqih يا فقيه" />
        <meta property="og:description" content="تفسير القرآن الكريم بالتفصيل مع شرح الآيات وأقوال العلماء" />
        <meta property="og:url" content="https://www.yafaqih.app/tafsir" />
        <meta property="og:type" content="website" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "تفسير القرآن الكريم",
              "description": "تفسير القرآن الكريم بالتفصيل مع شرح الآيات",
              "url": "https://www.yafaqih.app/tafsir",
              "isPartOf": { "@id": "https://www.yafaqih.app/#website" },
              "about": {
                "@type": "Book",
                "name": "القرآن الكريم",
                "inLanguage": "ar"
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-900 to-emerald-700 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <Link href="/" className="inline-flex items-center text-emerald-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center">
                <Book className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">تفسير القرآن الكريم</h1>
                <p className="text-emerald-200 mt-1">شرح الآيات مع أقوال العلماء والتفاسير المعتمدة</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* CTA - Ask Ya Faqih */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن تفسير أي آية</h2>
                <p className="text-emerald-100">احصل على شرح مفصل لأي آية من القرآن الكريم مع ذكر أقوال المفسرين</p>
              </div>
              <Link 
                href="/?prompt=فسر لي آية"
                className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-gray-800 rounded-2xl p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن سورة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 text-white pr-12 pl-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-4 py-2 rounded-xl transition ${selectedFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setSelectedFilter('makki')}
                  className={`px-4 py-2 rounded-xl transition ${selectedFilter === 'makki' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  مكية
                </button>
                <button
                  onClick={() => setSelectedFilter('madani')}
                  className={`px-4 py-2 rounded-xl transition ${selectedFilter === 'madani' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  مدنية
                </button>
              </div>
            </div>
          </div>

          {/* Popular Surahs */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              السور الأكثر قراءة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularSurahs.map(surah => (
                <Link
                  key={surah.number}
                  href={`/?prompt=فسر لي سورة ${surah.name}`}
                  className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-xl p-4 hover:from-emerald-700 hover:to-emerald-800 transition shadow-lg group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-lg font-bold group-hover:scale-110 transition">
                      {surah.number}
                    </span>
                    <div>
                      <h3 className="font-bold text-lg">{surah.name}</h3>
                      <p className="text-emerald-300 text-sm">{surah.verses} آية</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* All Surahs */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-500" />
              جميع السور
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSurahs.map(surah => (
                <Link
                  key={surah.number}
                  href={`/?prompt=فسر لي سورة ${surah.name}`}
                  className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition flex items-center gap-4 group"
                >
                  <span className="w-12 h-12 bg-emerald-900 rounded-lg flex items-center justify-center text-lg font-bold group-hover:bg-emerald-700 transition">
                    {surah.number}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{surah.name}</h3>
                    <p className="text-gray-400 text-sm">{surah.englishName}</p>
                  </div>
                  <div className="text-left">
                    <span className={`text-xs px-2 py-1 rounded ${surah.type === 'مكية' ? 'bg-amber-900 text-amber-300' : 'bg-blue-900 text-blue-300'}`}>
                      {surah.type}
                    </span>
                    <p className="text-gray-400 text-sm mt-1">{surah.verses} آية</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* SEO Content */}
          <section className="mt-12 bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">ما هو تفسير القرآن الكريم؟</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                تفسير القرآن الكريم هو علم يُعنى بشرح معاني آيات القرآن الكريم وبيان مقاصدها. 
                يعتمد التفسير على فهم اللغة العربية، وأسباب النزول، والأحاديث النبوية الشريفة، 
                وأقوال الصحابة والتابعين.
              </p>
              <p>
                من أشهر كتب التفسير: تفسير ابن كثير، تفسير الطبري، تفسير القرطبي، تفسير السعدي، 
                وتفسير الجلالين. كل تفسير له منهجه الخاص في شرح الآيات.
              </p>
              <p>
                يساعدك يا فقيه في فهم تفسير أي آية من القرآن الكريم، مع ذكر أقوال المفسرين 
                وأسباب النزول والفوائد المستنبطة من الآيات.
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
