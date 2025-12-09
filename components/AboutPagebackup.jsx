import React from 'react';
import { X, BookOpen, Sparkles, Heart, Shield, Zap, Users, Mail, Globe, Github, Twitter, MessageCircle } from 'lucide-react';

/**
 * صفحة "حول" لتطبيق يا فقيه
 * صفحة معلومات كاملة عن التطبيق بالعربية
 */
export default function AboutPage({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-8 rounded-t-2xl text-white">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">يا فقيه</h1>
            <p className="text-xl text-emerald-50">مساعدك الإسلامي الذكي</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          
          {/* مهمتنا */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-row-reverse">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">مهمتنا</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-right" dir="rtl">
              يا فقيه هو مساعد إسلامي ذكي مصمم لمساعدة المسلمين في جميع أنحاء العالم على فهم دينهم بشكل أفضل. 
              نحن نوفر إجابات موثوقة ودقيقة مستندة إلى القرآن الكريم والسنة النبوية الصحيحة، 
              مع التركيز على التقاليد السنية الأصيلة. هدفنا هو جعل العلوم الإسلامية متاحة وسهلة الفهم للجميع،
              مع الحفاظ على الدقة والأمانة في نقل المعرفة الإسلامية.
            </p>
          </section>

          {/* الميزات */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-row-reverse">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">الميزات</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* الميزة 1 */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">تفسير القرآن الكريم</h3>
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-right" dir="rtl">
                  شروحات مفصلة للآيات القرآنية مع مراجع من التفاسير الموثوقة والمعتمدة
                </p>
              </div>

              {/* الميزة 2 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">شرح الأحاديث النبوية</h3>
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-right" dir="rtl">
                  شرح الأحاديث الصحيحة من البخاري ومسلم وغيرها من المصادر الموثوقة
                </p>
              </div>

              {/* الميزة 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">أسئلة الفقه الإسلامي</h3>
                  <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-right" dir="rtl">
                  إجابات على أسئلة الفقه الإسلامي بناءً على المذاهب الأربعة المعتمدة
                </p>
              </div>

              {/* الميزة 4 */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">إعداد الخطب والمواعظ</h3>
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-right" dir="rtl">
                  مساعدة في تحضير الخطب والمواعظ الإسلامية المنظمة والمؤثرة
                </p>
              </div>

              {/* الميزة 5 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
                <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">التعرف الصوتي على الكلام</h3>
                  <span className="text-xl">🎤</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-right" dir="rtl">
                  اطرح أسئلتك بصوتك باللغة العربية مع النسخ التلقائي للنص
                </p>
              </div>

              {/* الميزة 6 */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 p-4 rounded-xl border border-cyan-100 dark:border-cyan-800/30">
                <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">القراءة الصوتية</h3>
                  <span className="text-xl">🔊</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-right" dir="rtl">
                  استمع إلى الإجابات صوتياً مع تقنية التوليف الصوتي العربي
                </p>
              </div>
            </div>
          </section>

          {/* مبادئنا */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-row-reverse">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">مبادئنا</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-right flex-row-reverse" dir="rtl">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">الالتزام بالمنهج السني</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    نلتزم بمنهج أهل السنة والجماعة ونستند إلى المصادر الموثوقة والمعتمدة
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-right flex-row-reverse" dir="rtl">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">الدقة والموثوقية</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    نحرص على تقديم معلومات دقيقة ومراجع صحيحة في جميع إجاباتنا
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-right flex-row-reverse" dir="rtl">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">الوسطية والاعتدال</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    نتبع منهجاً وسطياً معتدلاً في فهم الإسلام وتطبيقه
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-right flex-row-reverse" dir="rtl">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">احترام العلماء</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    نحترم آراء العلماء المعتبرين ونشجع على الرجوع إليهم في المسائل المعقدة
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* التقنية */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-row-reverse">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">التقنية المستخدمة</h2>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-right" dir="rtl">
                يستخدم تطبيق يا فقيه تقنيات الذكاء الاصطناعي المتقدمة مع قاعدة معرفية إسلامية محققة بعناية
                لتقديم إجابات دقيقة وموثوقة. نحن نجمع بين قوة التكنولوجيا الحديثة وأصالة العلوم الإسلامية.
              </p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-right" dir="rtl">
                  <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">ذكاء اصطناعي متطور</div>
                  <div className="text-gray-600 dark:text-gray-400">نماذج لغوية حديثة ومتقدمة</div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-right" dir="rtl">
                  <div className="font-semibold text-purple-600 dark:text-purple-400 mb-1">مصادر موثوقة</div>
                  <div className="text-gray-600 dark:text-gray-400">قاعدة بيانات معتمدة ومحققة</div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg text-right" dir="rtl">
                  <div className="font-semibold text-pink-600 dark:text-pink-400 mb-1">تحديث مستمر</div>
                  <div className="text-gray-600 dark:text-gray-400">تطوير وتحسين دائم</div>
                </div>
              </div>
            </div>
          </section>

          {/* فريق العمل */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-row-reverse">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">فريق العمل</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-right" dir="rtl">
              يا فقيه هو ثمرة تعاون بين متخصصين في العلوم الإسلامية ومطورين تقنيين متميزين. 
              نحن نعمل بجد واجتهاد لتقديم أفضل تجربة ممكنة للمسلمين في جميع أنحاء العالم،
              مع الحرص على الجمع بين الأصالة الإسلامية والابتكار التقني. فريقنا ملتزم بخدمة 
              الإسلام والمسلمين من خلال تسهيل الوصول إلى المعرفة الإسلامية الصحيحة.
            </p>
          </section>

          {/* التواصل والدعم */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-row-reverse">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">التواصل والدعم</h2>
            </div>
            
            <div className="space-y-4">
              {/* البريد الإلكتروني */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex-row-reverse">
                <div className="flex-1 text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">البريد الإلكتروني للدعم</div>
                  <a 
                    href="mailto:info@yafaqih.com" 
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                    dir="ltr"
                  >
                    info@yafaqih.com
                  </a>
                </div>
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* الموقع الإلكتروني */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 flex-row-reverse">
                <div className="flex-1 text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">الموقع الإلكتروني</div>
                  <a 
                    href="https://yafaqih.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    dir="ltr"
                  >
                    www.yafaqih.com
                  </a>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* ملاحظة الدعم */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border-r-4 border-blue-500 p-4 rounded text-right" dir="rtl">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>هل تحتاج إلى مساعدة؟</strong> فريق الدعم لدينا متاح للإجابة على 
                  أسئلتك. لا تتردد في التواصل معنا عبر info@yafaqih.com
                </p>
              </div>
            </div>
          </section>

          {/* تنبيه مهم */}
          <section className="mb-4">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6">
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="flex-1 text-right">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">تنبيه مهم</h3>
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed" dir="rtl">
                    يا فقيه هو أداة مساعدة وليس بديلاً عن العلماء المتخصصين. للمسائل الفقهية المعقدة 
                    أو القضايا الشخصية الحساسة، يُرجى استشارة عالم أو مفتي معتمد في منطقتك.
                    هذا التطبيق مصمم لتسهيل الوصول إلى المعلومات الإسلامية الأساسية، ولكنه لا يغني 
                    عن الرجوع إلى أهل العلم في المسائل الخاصة والمعقدة.
                  </p>
                </div>
                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              </div>
            </div>
          </section>

          {/* التذييل */}
          <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2" dir="rtl">
              بارك الله فيكم وجزاكم الله خيراً
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs" dir="rtl">
              © ٢٠٢٤ يا فقيه. جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}