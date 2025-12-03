// pages/zakat.js
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Calculator, ChevronLeft, MessageCircle, DollarSign, HelpCircle, Info } from 'lucide-react';

// أسعار الذهب والفضة (تقريبية - يجب تحديثها)
const GOLD_PRICE_PER_GRAM = 250; // ريال سعودي تقريباً
const SILVER_PRICE_PER_GRAM = 3; // ريال سعودي تقريباً
const GOLD_NISAB_GRAMS = 85;
const SILVER_NISAB_GRAMS = 595;

export default function ZakatPage() {
  const [cash, setCash] = useState('');
  const [bankBalance, setBankBalance] = useState('');
  const [goldValue, setGoldValue] = useState('');
  const [silverValue, setSilverValue] = useState('');
  const [investments, setInvestments] = useState('');
  const [businessAssets, setBusinessAssets] = useState('');
  const [debtsOwed, setDebtsOwed] = useState('');
  const [debtsYouOwe, setDebtsYouOwe] = useState('');
  
  const [totalWealth, setTotalWealth] = useState(0);
  const [zakatAmount, setZakatAmount] = useState(0);
  const [isAboveNisab, setIsAboveNisab] = useState(false);
  const [goldNisab, setGoldNisab] = useState(0);

  useEffect(() => {
    // حساب النصاب بالذهب
    const nisab = GOLD_NISAB_GRAMS * GOLD_PRICE_PER_GRAM;
    setGoldNisab(nisab);

    // حساب إجمالي الثروة
    const total = 
      (parseFloat(cash) || 0) +
      (parseFloat(bankBalance) || 0) +
      (parseFloat(goldValue) || 0) +
      (parseFloat(silverValue) || 0) +
      (parseFloat(investments) || 0) +
      (parseFloat(businessAssets) || 0) +
      (parseFloat(debtsOwed) || 0) -
      (parseFloat(debtsYouOwe) || 0);

    setTotalWealth(Math.max(0, total));
    
    // التحقق من بلوغ النصاب
    const aboveNisab = total >= nisab;
    setIsAboveNisab(aboveNisab);
    
    // حساب الزكاة (2.5%)
    setZakatAmount(aboveNisab ? total * 0.025 : 0);
  }, [cash, bankBalance, goldValue, silverValue, investments, businessAssets, debtsOwed, debtsYouOwe]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ar-SA').format(Math.round(num));
  };

  const resetCalculator = () => {
    setCash('');
    setBankBalance('');
    setGoldValue('');
    setSilverValue('');
    setInvestments('');
    setBusinessAssets('');
    setDebtsOwed('');
    setDebtsYouOwe('');
  };

  return (
    <>
      <Head>
        <title>حاسبة الزكاة | حساب زكاة المال - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="حاسبة الزكاة | احسب زكاة المال بسهولة. معرفة نصاب الزكاة ومقدارها. حساب زكاة الذهب والفضة والأموال والاستثمارات."
        />
        <meta 
          name="keywords" 
          content="حاسبة الزكاة, حساب الزكاة, زكاة المال, نصاب الزكاة, زكاة الذهب, زكاة الفضة, مقدار الزكاة, 2.5 بالمئة, ربع العشر"
        />
        <link rel="canonical" href="https://www.yafaqih.app/zakat" />
        
        {/* Open Graph */}
        <meta property="og:title" content="حاسبة الزكاة | Ya Faqih يا فقيه" />
        <meta property="og:description" content="احسب زكاة المال بسهولة مع حاسبة الزكاة" />
        <meta property="og:url" content="https://www.yafaqih.app/zakat" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "حاسبة الزكاة",
              "description": "حاسبة لحساب زكاة المال",
              "url": "https://www.yafaqih.app/zakat",
              "applicationCategory": "FinanceApplication"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-900 to-green-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-green-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">حاسبة الزكاة</h1>
                <p className="text-green-200 mt-1">احسب زكاة المال بسهولة ودقة</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Nisab Info */}
          <div className="bg-green-900/50 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <Info className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-green-200">
                <strong>نصاب الزكاة الحالي:</strong> {formatNumber(goldNisab)} ريال سعودي 
                (ما يعادل {GOLD_NISAB_GRAMS} غرام ذهب)
              </p>
              <p className="text-green-300 text-sm mt-1">
                تجب الزكاة إذا بلغ المال النصاب وحال عليه الحول
              </p>
            </div>
          </div>

          {/* Calculator Form */}
          <div className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-500" />
              أدخل أموالك الزكوية
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* النقد */}
              <div>
                <label className="block text-gray-300 mb-2">💵 النقد في اليد</label>
                <input
                  type="number"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* الرصيد البنكي */}
              <div>
                <label className="block text-gray-300 mb-2">🏦 الرصيد البنكي</label>
                <input
                  type="number"
                  value={bankBalance}
                  onChange={(e) => setBankBalance(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* الذهب */}
              <div>
                <label className="block text-gray-300 mb-2">🥇 قيمة الذهب</label>
                <input
                  type="number"
                  value={goldValue}
                  onChange={(e) => setGoldValue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* الفضة */}
              <div>
                <label className="block text-gray-300 mb-2">🥈 قيمة الفضة</label>
                <input
                  type="number"
                  value={silverValue}
                  onChange={(e) => setSilverValue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* الاستثمارات */}
              <div>
                <label className="block text-gray-300 mb-2">📈 الاستثمارات والأسهم</label>
                <input
                  type="number"
                  value={investments}
                  onChange={(e) => setInvestments(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* عروض التجارة */}
              <div>
                <label className="block text-gray-300 mb-2">🏪 عروض التجارة</label>
                <input
                  type="number"
                  value={businessAssets}
                  onChange={(e) => setBusinessAssets(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* ديون لك */}
              <div>
                <label className="block text-gray-300 mb-2">📥 ديون لك عند الآخرين</label>
                <input
                  type="number"
                  value={debtsOwed}
                  onChange={(e) => setDebtsOwed(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* ديون عليك */}
              <div>
                <label className="block text-gray-300 mb-2">📤 ديون عليك (تُخصم)</label>
                <input
                  type="number"
                  value={debtsYouOwe}
                  onChange={(e) => setDebtsYouOwe(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={resetCalculator}
              className="mt-4 text-gray-400 hover:text-white transition text-sm"
            >
              🔄 إعادة تعيين
            </button>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">نتيجة الحساب</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-black/20 rounded-xl p-4 text-center">
                <p className="text-green-300 text-sm mb-1">إجمالي الثروة</p>
                <p className="text-2xl font-bold">{formatNumber(totalWealth)} ريال</p>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4 text-center">
                <p className="text-green-300 text-sm mb-1">حالة النصاب</p>
                <p className={`text-2xl font-bold ${isAboveNisab ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isAboveNisab ? '✅ بلغ النصاب' : '⚠️ لم يبلغ'}
                </p>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4 text-center">
                <p className="text-green-300 text-sm mb-1">مبلغ الزكاة (2.5%)</p>
                <p className="text-3xl font-bold text-white">{formatNumber(zakatAmount)} ريال</p>
              </div>
            </div>

            {isAboveNisab && zakatAmount > 0 && (
              <div className="mt-4 p-4 bg-green-700/50 rounded-xl">
                <p className="text-green-100">
                  💡 يمكنك إخراج الزكاة للفقراء والمساكين، أو من خلال الجمعيات الخيرية الموثوقة
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">لديك سؤال عن الزكاة؟</h2>
                <p className="text-green-100">اسأل يا فقيه عن أحكام الزكاة وتفاصيلها</p>
              </div>
              <Link 
                href="/?prompt=ما هي شروط وجوب الزكاة"
                className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* SEO Content */}
          <section className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">أحكام الزكاة</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                الزكاة ركن من أركان الإسلام الخمسة، وهي فريضة مالية تجب على كل مسلم 
                بلغ ماله النصاب وحال عليه الحول (سنة هجرية كاملة).
              </p>
              <p>
                <strong>نصاب الزكاة:</strong> يعادل 85 غراماً من الذهب أو 595 غراماً من الفضة. 
                والمقدار الواجب هو 2.5% (ربع العشر).
              </p>
              <p>
                <strong>مصارف الزكاة:</strong> ذكرها الله في قوله: 
                ﴿إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا 
                وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ 
                وَابْنِ السَّبِيلِ﴾ [التوبة: 60].
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 py-8 px-4 mt-12 border-t border-gray-800">
          <div className="max-w-4xl mx-auto text-center text-gray-400">
            <p>© 2025 Ya Faqih - يا فقيه | مساعدك الإسلامي الذكي</p>
            <p className="text-sm mt-2">⚠️ هذه الحاسبة للاسترشاد فقط، يُرجى مراجعة عالم للتأكد</p>
          </div>
        </footer>
      </div>
    </>
  );
}
