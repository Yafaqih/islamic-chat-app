// pages/tasbeeh.js
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, Volume2, VolumeX, Settings, Check } from 'lucide-react';

const TASBEEH_OPTIONS = [
  { arabic: 'سُبْحَانَ اللهِ', transliteration: 'Subhan Allah', meaning: 'سبحان الله', target: 33 },
  { arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', meaning: 'الحمد لله', target: 33 },
  { arabic: 'اللهُ أَكْبَرُ', transliteration: 'Allahu Akbar', meaning: 'الله أكبر', target: 34 },
  { arabic: 'لَا إِلَهَ إِلَّا اللهُ', transliteration: 'La ilaha illa Allah', meaning: 'لا إله إلا الله', target: 100 },
  { arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', transliteration: 'Subhan Allah wa bihamdihi', meaning: 'سبحان الله وبحمده', target: 100 },
  { arabic: 'أَسْتَغْفِرُ اللهَ', transliteration: 'Astaghfirullah', meaning: 'أستغفر الله', target: 100 },
  { arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', transliteration: 'La hawla wa la quwwata illa billah', meaning: 'لا حول ولا قوة إلا بالله', target: 100 },
  { arabic: 'سُبْحَانَ اللهِ الْعَظِيمِ وَبِحَمْدِهِ', transliteration: 'Subhan Allah al-Azim', meaning: 'سبحان الله العظيم وبحمده', target: 100 },
];

export default function TasbeehPage() {
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(TASBEEH_OPTIONS[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showSelector, setShowSelector] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('tasbeeh-total');
    if (saved) setTotalCount(parseInt(saved));
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('tasbeeh-total', totalCount.toString());
  }, [totalCount]);

  const handleCount = () => {
    setCount(prev => prev + 1);
    setTotalCount(prev => prev + 1);
    
    // Vibration
    if (vibrationEnabled && navigator.vibrate) {
      if (count + 1 === selectedDhikr.target) {
        navigator.vibrate([100, 50, 100, 50, 100]); // Triple vibration at target
      } else {
        navigator.vibrate(30);
      }
    }
    
    // Sound (would need audio file)
    if (soundEnabled && count + 1 === selectedDhikr.target) {
      // Play completion sound
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const progress = Math.min((count / selectedDhikr.target) * 100, 100);
  const isComplete = count >= selectedDhikr.target;

  return (
    <>
      <Head>
        <title>سبحة إلكترونية | عداد التسبيح - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="سبحة إلكترونية وعداد تسبيح | عد سبحان الله، الحمد لله، الله أكبر، أستغفر الله. سبحة رقمية مجانية لأذكارك اليومية."
        />
        <meta 
          name="keywords" 
          content="سبحة إلكترونية, عداد تسبيح, سبحة رقمية, سبحان الله, الحمد لله, الله أكبر, أستغفر الله, عداد أذكار, تطبيق تسبيح"
        />
        <link rel="canonical" href="https://www.yafaqih.app/tasbeeh" />
        
        <meta property="og:title" content="سبحة إلكترونية | Ya Faqih يا فقيه" />
        <meta property="og:description" content="سبحة إلكترونية وعداد تسبيح لأذكارك اليومية" />
        <meta property="og:url" content="https://www.yafaqih.app/tasbeeh" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-900 to-teal-700 py-6 px-4">
          <div className="max-w-md mx-auto">
            <Link href="/" className="inline-flex items-center text-emerald-200 hover:text-white mb-2 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">سبحة إلكترونية</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setVibrationEnabled(!vibrationEnabled)}
                  className={`p-2 rounded-lg transition ${vibrationEnabled ? 'bg-emerald-600' : 'bg-gray-700'}`}
                >
                  📳
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg transition ${soundEnabled ? 'bg-emerald-600' : 'bg-gray-700'}`}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-8">
          {/* Dhikr Selector */}
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="w-full bg-gray-800 rounded-2xl p-4 mb-6 text-right"
          >
            <p className="text-gray-400 text-sm mb-1">الذكر المختار</p>
            <p className="text-xl font-bold text-emerald-400">{selectedDhikr.arabic}</p>
            <p className="text-gray-400 text-sm">الهدف: {selectedDhikr.target}</p>
          </button>

          {showSelector && (
            <div className="bg-gray-800 rounded-2xl p-4 mb-6 space-y-2">
              {TASBEEH_OPTIONS.map((dhikr, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedDhikr(dhikr);
                    setShowSelector(false);
                    setCount(0);
                  }}
                  className={`w-full p-3 rounded-xl text-right transition flex items-center justify-between ${
                    selectedDhikr.arabic === dhikr.arabic 
                      ? 'bg-emerald-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <span className="text-sm text-gray-300">{dhikr.target}×</span>
                  <span className="font-bold">{dhikr.arabic}</span>
                </button>
              ))}
            </div>
          )}

          {/* Counter Display */}
          <div className="relative mb-8">
            {/* Progress Ring */}
            <div className="w-64 h-64 mx-auto relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="#1f2937"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke={isComplete ? '#10b981' : '#059669'}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
              
              {/* Count Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-6xl font-bold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>
                  {count}
                </span>
                <span className="text-gray-400">/ {selectedDhikr.target}</span>
                {isComplete && (
                  <div className="flex items-center gap-1 text-emerald-400 mt-2">
                    <Check className="w-5 h-5" />
                    <span>مكتمل</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Count Button */}
          <button
            onClick={handleCount}
            className={`w-full py-8 rounded-3xl text-3xl font-bold transition-all active:scale-95 ${
              isComplete 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
            }`}
          >
            {selectedDhikr.arabic}
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full mt-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-5 h-5" />
            إعادة العد
          </button>

          {/* Total Stats */}
          <div className="mt-8 bg-gray-800 rounded-2xl p-4 text-center">
            <p className="text-gray-400 text-sm">إجمالي التسبيحات</p>
            <p className="text-3xl font-bold text-emerald-400">{totalCount.toLocaleString('ar-SA')}</p>
          </div>

          {/* Virtue */}
          <div className="mt-6 bg-emerald-900/30 rounded-xl p-4">
            <p className="text-emerald-400 font-bold mb-2">فضل التسبيح</p>
            <p className="text-gray-300 text-sm">
              قال النبي ﷺ: «من قال سبحان الله وبحمده في يوم مائة مرة حُطَّت خطاياه وإن كانت مثل زبد البحر»
            </p>
            <p className="text-gray-400 text-xs mt-1">متفق عليه</p>
          </div>

          {/* Related */}
          <section className="mt-8">
            <h2 className="text-lg font-bold mb-3">مواضيع ذات صلة</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/adhkar" className="bg-gray-800 hover:bg-gray-700 p-3 rounded-xl transition text-center text-sm">
                أذكار الصباح والمساء
              </Link>
              <Link href="/dua" className="bg-gray-800 hover:bg-gray-700 p-3 rounded-xl transition text-center text-sm">
                الأدعية المستجابة
              </Link>
            </div>
          </section>
        </main>

        <footer className="bg-gray-900 py-6 px-4 mt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center text-gray-400 text-sm">
            <p>© 2025 Ya Faqih - يا فقيه</p>
          </div>
        </footer>
      </div>
    </>
  );
}
