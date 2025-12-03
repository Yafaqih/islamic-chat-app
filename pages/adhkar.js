// pages/adhkar.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { Sun, Moon, Bed, Clock, ChevronLeft, Copy, Check, MessageCircle } from 'lucide-react';

// أذكار الصباح
const MORNING_ADHKAR = [
  {
    id: 1,
    text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    count: 1,
    reward: 'من قالها حين يصبح فقد أدى شكر يومه',
    source: 'أبو داود'
  },
  {
    id: 2,
    text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    count: 1,
    reward: 'من أذكار الصباح المأثورة',
    source: 'الترمذي'
  },
  {
    id: 3,
    text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    count: 1,
    reward: 'سيد الاستغفار، من قالها موقناً بها فمات دخل الجنة',
    source: 'البخاري'
  },
  {
    id: 4,
    text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
    count: 100,
    reward: 'من قالها مائة مرة حين يصبح وحين يمسي لم يأت أحد يوم القيامة بأفضل مما جاء به',
    source: 'مسلم'
  },
  {
    id: 5,
    text: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    count: 10,
    reward: 'كانت له عدل عشر رقاب، وكتبت له مائة حسنة، ومحيت عنه مائة سيئة',
    source: 'البخاري ومسلم'
  },
  {
    id: 6,
    text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ',
    count: 3,
    reward: 'ما سُئل الله شيئاً أحب إليه من العافية',
    source: 'ابن ماجه'
  },
  {
    id: 7,
    text: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    count: 3,
    reward: 'لم يضره شيء',
    source: 'أبو داود والترمذي'
  },
  {
    id: 8,
    text: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    count: 3,
    reward: 'لم يضره شيء',
    source: 'مسلم'
  }
];

// أذكار المساء
const EVENING_ADHKAR = [
  {
    id: 1,
    text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَـهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    count: 1,
    reward: 'من قالها حين يمسي فقد أدى شكر ليلته',
    source: 'أبو داود'
  },
  {
    id: 2,
    text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    count: 1,
    reward: 'من أذكار المساء المأثورة',
    source: 'الترمذي'
  },
  {
    id: 3,
    text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
    count: 1,
    reward: 'من أذكار المساء',
    source: 'أبو داود'
  },
  {
    id: 4,
    text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
    count: 100,
    reward: 'حُطَّت خطاياه وإن كانت مثل زَبَد البحر',
    source: 'البخاري ومسلم'
  },
  {
    id: 5,
    text: 'أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ',
    count: 100,
    reward: 'من لزم الاستغفار جعل الله له من كل ضيق مخرجاً',
    source: 'أبو داود'
  }
];

// أذكار النوم
const SLEEP_ADHKAR = [
  {
    id: 1,
    text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    count: 1,
    reward: 'من أذكار النوم',
    source: 'البخاري'
  },
  {
    id: 2,
    text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    count: 3,
    reward: 'من أذكار النوم',
    source: 'أبو داود والترمذي'
  },
  {
    id: 3,
    text: 'سُبْحَانَ اللهِ (33) وَالْحَمْدُ لِلَّهِ (33) وَاللهُ أَكْبَرُ (34)',
    count: 1,
    reward: 'خير لكما من خادم',
    source: 'البخاري ومسلم'
  },
  {
    id: 4,
    text: 'قراءة آية الكرسي',
    count: 1,
    reward: 'لا يزال عليك من الله حافظ ولا يقربك شيطان حتى تصبح',
    source: 'البخاري'
  },
  {
    id: 5,
    text: 'قراءة سورة الإخلاص والمعوذتين',
    count: 3,
    reward: 'تكفيك من كل شيء',
    source: 'أبو داود والترمذي'
  }
];

function AdhkarCard({ dhikr, onCopy, copied }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-5 hover:bg-gray-750 transition">
      <p className="text-xl leading-loose text-white font-arabic mb-4 text-right">
        {dhikr.text}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-4">
          <span className="bg-emerald-900 text-emerald-300 px-3 py-1 rounded-full text-sm">
            {dhikr.count === 1 ? 'مرة واحدة' : `${dhikr.count} مرات`}
          </span>
          <span className="text-gray-400 text-sm">{dhikr.source}</span>
        </div>
        <button
          onClick={() => onCopy(dhikr.text)}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
        >
          {copied === dhikr.id ? (
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
      <p className="text-emerald-400 text-sm mt-3">✨ {dhikr.reward}</p>
    </div>
  );
}

export default function AdhkarPage() {
  const [activeTab, setActiveTab] = useState('morning');
  const [copied, setCopied] = useState(null);

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs = [
    { id: 'morning', label: 'أذكار الصباح', icon: Sun, data: MORNING_ADHKAR },
    { id: 'evening', label: 'أذكار المساء', icon: Moon, data: EVENING_ADHKAR },
    { id: 'sleep', label: 'أذكار النوم', icon: Bed, data: SLEEP_ADHKAR },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <>
      <Head>
        <title>أذكار الصباح والمساء | الأذكار الصحيحة من السنة - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="أذكار الصباح والمساء الصحيحة من الكتاب والسنة | أذكار النوم، أذكار الاستيقاظ، أذكار بعد الصلاة. احفظ أذكارك اليومية مع يا فقيه."
        />
        <meta 
          name="keywords" 
          content="أذكار الصباح, أذكار المساء, أذكار النوم, أذكار الاستيقاظ, أذكار بعد الصلاة, الأذكار الصحيحة, حصن المسلم, سبحان الله وبحمده, سيد الاستغفار, آية الكرسي"
        />
        <link rel="canonical" href="https://www.yafaqih.app/adhkar" />
        
        {/* Open Graph */}
        <meta property="og:title" content="أذكار الصباح والمساء | Ya Faqih يا فقيه" />
        <meta property="og:description" content="أذكار الصباح والمساء الصحيحة من الكتاب والسنة" />
        <meta property="og:url" content="https://www.yafaqih.app/adhkar" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "أذكار الصباح والمساء",
              "description": "أذكار الصباح والمساء الصحيحة من الكتاب والسنة",
              "url": "https://www.yafaqih.app/adhkar"
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-amber-900 to-amber-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-amber-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">الأذكار اليومية</h1>
                <p className="text-amber-200 mt-1">أذكار الصباح والمساء والنوم من السنة الصحيحة</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* CTA */}
          <div className="bg-gradient-to-r from-amber-800 to-amber-600 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن أي ذكر</h2>
                <p className="text-amber-100">احصل على شرح الأذكار وفضائلها ومعانيها</p>
              </div>
              <Link 
                href="/?prompt=ما هو فضل أذكار الصباح"
                className="bg-white text-amber-700 px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Time indicator */}
          <div className="flex items-center gap-2 text-amber-400 mb-6">
            <Clock className="w-5 h-5" />
            <span>
              {activeTab === 'morning' && 'وقت أذكار الصباح: من بعد صلاة الفجر إلى طلوع الشمس'}
              {activeTab === 'evening' && 'وقت أذكار المساء: من بعد صلاة العصر إلى غروب الشمس'}
              {activeTab === 'sleep' && 'وقت أذكار النوم: قبل النوم مباشرة'}
            </span>
          </div>

          {/* Adhkar List */}
          <div className="space-y-4">
            {currentTab.data.map(dhikr => (
              <AdhkarCard 
                key={dhikr.id} 
                dhikr={dhikr} 
                onCopy={(text) => handleCopy(text, dhikr.id)}
                copied={copied === dhikr.id ? dhikr.id : null}
              />
            ))}
          </div>

          {/* SEO Content */}
          <section className="mt-12 bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">فضل الأذكار اليومية</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                أذكار الصباح والمساء من أعظم الأعمال التي يتقرب بها العبد إلى الله تعالى. 
                قال الله تعالى: ﴿فَاذْكُرُونِي أَذْكُرْكُمْ﴾ [البقرة: 152].
              </p>
              <p>
                المحافظة على أذكار الصباح والمساء تحفظ العبد من الشيطان والعين والحسد، 
                وتجلب البركة والرزق والطمأنينة في الحياة.
              </p>
              <p>
                من أهم الأذكار: سيد الاستغفار، وآية الكرسي، والمعوذتين، 
                والتسبيح مائة مرة صباحاً ومساءً.
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
