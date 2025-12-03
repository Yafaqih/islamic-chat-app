// pages/hajj-umrah.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { MapPin, ChevronLeft, MessageCircle, CheckCircle, Info, Calendar } from 'lucide-react';

// مناسك الحج
const HAJJ_STEPS = [
  {
    day: 'يوم التروية (8 ذو الحجة)',
    title: 'الإحرام والتوجه إلى منى',
    steps: [
      'الإحرام من الميقات أو من مكة',
      'التلبية: لبيك اللهم لبيك...',
      'التوجه إلى منى',
      'صلاة الظهر والعصر والمغرب والعشاء في منى قصراً',
      'المبيت في منى'
    ]
  },
  {
    day: 'يوم عرفة (9 ذو الحجة)',
    title: 'الوقوف بعرفة',
    steps: [
      'التوجه إلى عرفة بعد طلوع الشمس',
      'صلاة الظهر والعصر جمعاً وقصراً',
      'الوقوف بعرفة والدعاء والذكر',
      'البقاء حتى غروب الشمس',
      'الانصراف إلى مزدلفة'
    ]
  },
  {
    day: 'يوم النحر (10 ذو الحجة)',
    title: 'رمي جمرة العقبة والحلق والطواف',
    steps: [
      'المبيت في مزدلفة وصلاة الفجر',
      'التوجه إلى منى',
      'رمي جمرة العقبة (7 حصيات)',
      'الذبح (الهدي)',
      'الحلق أو التقصير',
      'طواف الإفاضة',
      'السعي بين الصفا والمروة'
    ]
  },
  {
    day: 'أيام التشريق (11-12-13 ذو الحجة)',
    title: 'رمي الجمرات والمبيت بمنى',
    steps: [
      'المبيت في منى',
      'رمي الجمرات الثلاث بعد الزوال',
      'البدء بالصغرى ثم الوسطى ثم العقبة',
      'يجوز التعجل في اليوم الثاني عشر',
      'طواف الوداع قبل السفر'
    ]
  }
];

// مناسك العمرة
const UMRAH_STEPS = [
  {
    number: 1,
    title: 'الإحرام',
    description: 'الإحرام من الميقات مع نية العمرة والتلبية',
    details: 'يغتسل ويتطيب ويلبس ثياب الإحرام، ثم ينوي العمرة ويبدأ بالتلبية'
  },
  {
    number: 2,
    title: 'الطواف',
    description: 'الطواف حول الكعبة سبعة أشواط',
    details: 'يبدأ من الحجر الأسود ويجعل الكعبة عن يساره، مع الاضطباع في الأشواط السبعة والرمل في الثلاثة الأولى'
  },
  {
    number: 3,
    title: 'صلاة ركعتين',
    description: 'صلاة ركعتين خلف مقام إبراهيم',
    details: 'يصلي ركعتين خفيفتين يقرأ فيهما الكافرون والإخلاص'
  },
  {
    number: 4,
    title: 'السعي',
    description: 'السعي بين الصفا والمروة سبعة أشواط',
    details: 'يبدأ من الصفا وينتهي بالمروة، مع الهرولة بين العلمين الأخضرين للرجال'
  },
  {
    number: 5,
    title: 'الحلق أو التقصير',
    description: 'حلق الشعر أو تقصيره',
    details: 'الحلق أفضل للرجال، والتقصير للنساء قدر أنملة'
  }
];

export default function HajjUmrahPage() {
  const [activeTab, setActiveTab] = useState('umrah');

  return (
    <>
      <Head>
        <title>مناسك الحج والعمرة | دليل الحج والعمرة الشامل - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="دليل مناسك الحج والعمرة خطوة بخطوة | كيفية أداء الحج والعمرة بالتفصيل مع الأدعية والأذكار. تعلم مناسك الحج والعمرة الصحيحة."
        />
        <meta 
          name="keywords" 
          content="مناسك الحج, مناسك العمرة, كيفية الحج, كيفية العمرة, الطواف, السعي, الإحرام, رمي الجمرات, يوم عرفة, منى, مزدلفة"
        />
        <link rel="canonical" href="https://www.yafaqih.app/hajj-umrah" />
        
        {/* Open Graph */}
        <meta property="og:title" content="مناسك الحج والعمرة | Ya Faqih يا فقيه" />
        <meta property="og:description" content="دليل مناسك الحج والعمرة خطوة بخطوة" />
        <meta property="og:url" content="https://www.yafaqih.app/hajj-umrah" />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": "كيفية أداء العمرة",
              "description": "خطوات أداء العمرة بالتفصيل",
              "step": UMRAH_STEPS.map(step => ({
                "@type": "HowToStep",
                "name": step.title,
                "text": step.description
              }))
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-yellow-900 to-amber-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-yellow-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center text-3xl">
                🕋
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">الحج والعمرة</h1>
                <p className="text-yellow-200 mt-1">دليل مناسك الحج والعمرة الشامل</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab('umrah')}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition ${
                activeTab === 'umrah' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              🕌 مناسك العمرة
            </button>
            <button
              onClick={() => setActiveTab('hajj')}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition ${
                activeTab === 'hajj' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              🕋 مناسك الحج
            </button>
          </div>

          {/* Umrah Content */}
          {activeTab === 'umrah' && (
            <div className="space-y-4">
              <div className="bg-amber-900/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Info className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <p className="text-amber-200">
                  العمرة هي زيارة المسجد الحرام للطواف والسعي، وهي سنة مؤكدة يمكن أداؤها في أي وقت من السنة
                </p>
              </div>

              {UMRAH_STEPS.map((step, index) => (
                <div key={step.number} className="bg-gray-800 rounded-2xl p-5 hover:bg-gray-750 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-amber-400 mb-2">{step.title}</h3>
                      <p className="text-white mb-2">{step.description}</p>
                      <p className="text-gray-400 text-sm">{step.details}</p>
                    </div>
                  </div>
                  {index < UMRAH_STEPS.length - 1 && (
                    <div className="mr-6 mt-4 border-r-2 border-amber-600/30 h-4"></div>
                  )}
                </div>
              ))}

              <div className="bg-green-900/30 rounded-xl p-4 mt-6 flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                <p className="text-green-200">
                  بعد الحلق أو التقصير تكون قد أتممت العمرة وتحللت من الإحرام. تقبل الله عمرتك!
                </p>
              </div>
            </div>
          )}

          {/* Hajj Content */}
          {activeTab === 'hajj' && (
            <div className="space-y-6">
              <div className="bg-amber-900/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Calendar className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <p className="text-amber-200">
                  الحج يكون في أشهر الحج (شوال، ذو القعدة، ذو الحجة) وأيامه المعلومة من 8 إلى 13 ذو الحجة
                </p>
              </div>

              {HAJJ_STEPS.map((day, dayIndex) => (
                <div key={dayIndex} className="bg-gray-800 rounded-2xl overflow-hidden">
                  <div className="bg-amber-900 p-4">
                    <h3 className="text-xl font-bold">{day.day}</h3>
                    <p className="text-amber-200">{day.title}</p>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-3">
                      {day.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-amber-600/30 rounded-full flex items-center justify-center text-amber-400 text-sm flex-shrink-0">
                            {stepIndex + 1}
                          </span>
                          <span className="text-gray-200">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-amber-800 to-amber-600 rounded-2xl p-6 my-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن الحج والعمرة</h2>
                <p className="text-amber-100">احصل على إجابات لجميع أسئلتك عن المناسك</p>
              </div>
              <Link 
                href="/?prompt=ما هي محظورات الإحرام"
                className="bg-white text-amber-700 px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition shadow-lg"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Quick Questions */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">أسئلة شائعة</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'ما هي محظورات الإحرام؟',
                'ما الفرق بين التمتع والقران والإفراد؟',
                'هل يجوز العمرة بدون محرم؟',
                'ما هي شروط وجوب الحج؟',
                'كيف أؤدي طواف الوداع؟',
                'ما دعاء الطواف والسعي؟'
              ].map(question => (
                <Link
                  key={question}
                  href={`/?prompt=${question}`}
                  className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl transition text-gray-300 hover:text-white"
                >
                  {question}
                </Link>
              ))}
            </div>
          </section>

          {/* SEO Content */}
          <section className="bg-gray-800/50 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">فضل الحج والعمرة</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                الحج ركن من أركان الإسلام الخمسة، فرضه الله على المستطيع مرة في العمر.
                قال النبي ﷺ: «من حج فلم يرفث ولم يفسق رجع من ذنوبه كيوم ولدته أمه» متفق عليه.
              </p>
              <p>
                والعمرة سنة مؤكدة، قال النبي ﷺ: «العمرة إلى العمرة كفارة لما بينهما، والحج المبرور ليس له جزاء إلا الجنة» متفق عليه.
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
