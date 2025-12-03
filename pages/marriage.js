// pages/marriage.js
import Head from 'next/head';
import Link from 'next/link';
import { Heart, ChevronLeft, MessageCircle, Users, FileText, Gift } from 'lucide-react';

const MARRIAGE_PILLARS = [
  { title: 'الزوجان', description: 'رجل وامرأة خاليان من موانع النكاح' },
  { title: 'الولي', description: 'ولي المرأة (الأب أو من ينوب عنه)' },
  { title: 'الشهود', description: 'شاهدان عدلان على الأقل' },
  { title: 'الصيغة', description: 'الإيجاب من الولي والقبول من الزوج' },
  { title: 'المهر', description: 'الصداق المتفق عليه' },
];

const MARRIAGE_RIGHTS = {
  wife: [
    'المهر المتفق عليه',
    'النفقة (السكن والطعام والكسوة)',
    'حسن المعاشرة والمعاملة بالمعروف',
    'العدل بين الزوجات إن تعددن',
    'عدم إفشاء أسرار البيت',
  ],
  husband: [
    'الطاعة في المعروف',
    'حفظ نفسها وماله في غيبته',
    'عدم إدخال من يكره إلى بيته',
    'القيام بشؤون البيت',
    'عدم الخروج إلا بإذنه',
  ]
};

const WEDDING_SUNNAHS = [
  { sunnah: 'خطبة الحاجة', description: 'البدء بخطبة الحاجة في عقد النكاح' },
  { sunnah: 'إعلان النكاح', description: 'الإعلان وعدم الإسرار' },
  { sunnah: 'الوليمة', description: 'إطعام الطعام ولو بشاة' },
  { sunnah: 'الدعاء للعروسين', description: 'بارك الله لكما وبارك عليكما' },
  { sunnah: 'صلاة ركعتين', description: 'ليلة الدخلة قبل الدخول' },
  { sunnah: 'الدعاء عند الجماع', description: 'بسم الله اللهم جنبنا الشيطان' },
];

export default function MarriagePage() {
  return (
    <>
      <Head>
        <title>الزواج في الإسلام | أحكام النكاح وآدابه - Ya Faqih يا فقيه</title>
        <meta 
          name="description" 
          content="أحكام الزواج في الإسلام | أركان عقد النكاح، شروط الزواج الصحيح، حقوق الزوجين، سنن الزفاف، الخطوبة. دليل شامل للزواج الإسلامي."
        />
        <meta 
          name="keywords" 
          content="الزواج في الإسلام, عقد النكاح, أركان الزواج, شروط الزواج, حقوق الزوج, حقوق الزوجة, المهر, الصداق, الخطبة, الوليمة, سنن الزفاف, دعاء الزواج"
        />
        <link rel="canonical" href="https://www.yafaqih.app/marriage" />
        
        <meta property="og:title" content="الزواج في الإسلام | Ya Faqih يا فقيه" />
        <meta property="og:description" content="أحكام الزواج في الإسلام - أركانه وشروطه وآدابه" />
        <meta property="og:url" content="https://www.yafaqih.app/marriage" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-rose-900 to-pink-700 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center text-rose-200 hover:text-white mb-4 transition">
              <ChevronLeft className="w-5 h-5 ml-1" />
              العودة للرئيسية
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">الزواج في الإسلام</h1>
                <p className="text-rose-200 mt-1">أحكام النكاح وآدابه وحقوق الزوجين</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Intro */}
          <div className="bg-rose-900/30 rounded-2xl p-6 mb-8 text-center">
            <p className="text-xl font-arabic text-white mb-4">
              ﴿وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً﴾
            </p>
            <p className="text-rose-300">سورة الروم - الآية 21</p>
          </div>

          {/* Pillars */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-rose-400" />
              أركان وشروط عقد النكاح
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {MARRIAGE_PILLARS.map((pillar, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-4 flex items-start gap-3">
                  <span className="w-8 h-8 bg-rose-900 rounded-full flex items-center justify-center text-rose-400 font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-white">{pillar.title}</p>
                    <p className="text-gray-400 text-sm">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-rose-400" />
              حقوق الزوجين
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Wife's Rights */}
              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-pink-400 mb-4 text-center">حقوق الزوجة</h3>
                <ul className="space-y-2">
                  {MARRIAGE_RIGHTS.wife.map((right, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-pink-400">♀</span>
                      {right}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Husband's Rights */}
              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-blue-400 mb-4 text-center">حقوق الزوج</h3>
                <ul className="space-y-2">
                  {MARRIAGE_RIGHTS.husband.map((right, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-blue-400">♂</span>
                      {right}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Sunnahs */}
          <section className="bg-gray-800 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6 text-yellow-400" />
              سنن الزواج والزفاف
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {WEDDING_SUNNAHS.map((item, index) => (
                <div key={index} className="bg-gray-900/50 rounded-xl p-4">
                  <p className="font-bold text-yellow-400">{item.sunnah}</p>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Wedding Dua */}
          <section className="bg-gradient-to-br from-rose-900/50 to-pink-900/50 rounded-2xl p-6 mb-8 text-center">
            <h2 className="text-xl font-bold mb-4">دعاء للعروسين</h2>
            <p className="text-2xl font-arabic text-white mb-4">
              بَارَكَ اللهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
            </p>
            <p className="text-rose-300 text-sm">رواه أبو داود والترمذي</p>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-rose-800 to-pink-600 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-bold mb-1">اسأل يا فقيه عن الزواج</h2>
                <p className="text-rose-100">أجوبة لجميع أسئلتك عن أحكام النكاح</p>
              </div>
              <Link 
                href="/?prompt=ما هي شروط الزواج الصحيح في الإسلام"
                className="bg-white text-rose-700 px-6 py-3 rounded-xl font-bold hover:bg-rose-50 transition"
              >
                اسأل الآن
              </Link>
            </div>
          </div>

          {/* Quick Questions */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">أسئلة شائعة عن الزواج</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'ما هي صفات الزوجة الصالحة؟',
                'هل يجوز رؤية المخطوبة؟',
                'ما حكم الزواج العرفي؟',
                'كيف تكون ليلة الدخلة؟',
                'ما هي حقوق المطلقة؟',
                'متى يجوز الطلاق؟'
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
            <h2 className="text-2xl font-bold mb-4">الزواج في الإسلام</h2>
            <div className="text-gray-300 space-y-4 leading-relaxed">
              <p>
                الزواج في الإسلام سنة النبي ﷺ، قال: «يا معشر الشباب، من استطاع منكم الباءة فليتزوج».
                والزواج ميثاق غليظ بين الرجل والمرأة، يهدف لبناء أسرة مسلمة مستقرة.
              </p>
              <p>
                من مقاصد الزواج: إحصان الفرج، وتكثير النسل، وتحقيق السكن والمودة والرحمة، 
                وتكوين الأسرة التي هي لبنة المجتمع المسلم.
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
