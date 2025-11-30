import React from 'react';
import { X, BookOpen, Sparkles, Heart, Shield, Zap, Users, Mail, Globe, Github, Twitter, MessageCircle } from 'lucide-react';

/**
 * Composant "À propos" pour Ya Faqih
 * Page d'information complète sur l'application
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
            <h1 className="text-4xl font-bold mb-2">Ya Faqih</h1>
            <p className="text-xl text-emerald-50">يا فقيه - مساعدك الإسلامي الذكي</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          
          {/* Mission */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Notre Mission</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-right" dir="rtl">
              يا فقيه هو مساعد إسلامي ذكي مصمم لمساعدة المسلمين في جميع أنحاء العالم على فهم دينهم بشكل أفضل. 
              نحن نوفر إجابات موثوقة ودقيقة مستندة إلى القرآن الكريم والسنة النبوية الصحيحة، 
              مع التركيز على التقاليد السنية الأصيلة.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              Ya Faqih est un assistant islamique intelligent conçu pour aider les musulmans du monde entier 
              à mieux comprendre leur religion. Nous fournissons des réponses fiables et précises basées sur 
              le Coran et la Sunna authentique, en nous concentrant sur les traditions sunnites.
            </p>
          </section>

          {/* Fonctionnalités */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Fonctionnalités</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Fonctionnalité 1 */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">تفسير القرآن</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explications détaillées des versets coraniques avec références aux tafsirs authentiques
                </p>
              </div>

              {/* Fonctionnalité 2 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">شرح الأحاديث</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explications des hadiths authentiques de Bukhari, Muslim et autres recueils
                </p>
              </div>

              {/* Fonctionnalité 3 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">أسئلة الفقه</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Réponses aux questions de jurisprudence islamique basées sur les 4 écoles
                </p>
              </div>

              {/* Fonctionnalité 4 */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">إعداد الخطب</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Assistance pour préparer des sermons et discours islamiques structurés
                </p>
              </div>

              {/* Fonctionnalité 5 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎤</span>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Reconnaissance Vocale</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Posez vos questions en parlant en arabe - transcription automatique
                </p>
              </div>

              {/* Fonctionnalité 6 */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 p-4 rounded-xl border border-cyan-100 dark:border-cyan-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🔊</span>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Lecture Vocale</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Écoutez les réponses en audio avec synthèse vocale arabe
                </p>
              </div>
            </div>
          </section>

          {/* Principes */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Nos Principes</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-right" dir="rtl">
                <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">الأصالة والدقة</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    جميع إجاباتنا مستندة إلى المصادر الأصلية: القرآن الكريم، الأحاديث الصحيحة، 
                    وأقوال العلماء المعتبرين
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-right" dir="rtl">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">الشفافية</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    نذكر دائماً مصادر المعلومات ودرجة صحة الأحاديث (صحيح، حسن، ضعيف)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-right" dir="rtl">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">احترام المذاهب</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    نحترم المذاهب الفقهية الأربعة ونقدم آراء متوازنة
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-right" dir="rtl">
                <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">الخصوصية والأمان</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    نحافظ على خصوصية محادثاتك ولا نشارك بياناتك الشخصية
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Technologie */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Technologie</h2>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Ya Faqih utilise l'intelligence artificielle avancée combinée à une base de connaissances 
                islamiques soigneusement vérifiée pour fournir des réponses précises et fiables.
              </p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">IA Moderne</div>
                  <div className="text-gray-600 dark:text-gray-400">Modèles de langage avancés</div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className="font-semibold text-purple-600 dark:text-purple-400 mb-1">Sources Vérifiées</div>
                  <div className="text-gray-600 dark:text-gray-400">Base de données authentique</div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className="font-semibold text-pink-600 dark:text-pink-400 mb-1">Mise à jour</div>
                  <div className="text-gray-600 dark:text-gray-400">Amélioration continue</div>
                </div>
              </div>
            </div>
          </section>

          {/* Équipe */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Notre Équipe</h2>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-right" dir="rtl">
              يا فقيه هو ثمرة تعاون بين متخصصين في العلوم الإسلامية ومطورين تقنيين متميزين. 
              نحن نعمل بجد لتقديم أفضل تجربة ممكنة للمسلمين في جميع أنحاء العالم.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
              Ya Faqih est le fruit d'une collaboration entre des spécialistes des sciences islamiques 
              et des développeurs techniques talentueux. Nous travaillons dur pour offrir la meilleure 
              expérience possible aux musulmans du monde entier.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Contact & Support</h2>
            </div>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email de support</div>
                  <a 
                    href="mailto:info@yafaqih.com" 
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    info@yafaqih.com
                  </a>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Site web</div>
                  <a 
                    href="https://yafaqih.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    www.yafaqih.com
                  </a>
                </div>
              </div>

              {/* Note de support */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Besoin d'aide ?</strong> Notre équipe de support est disponible pour répondre 
                  à vos questions. N'hésitez pas à nous contacter à info@yafaqih.com
                </p>
              </div>
            </div>
          </section>

          {/* Avertissement */}
          <section className="mb-4">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Avertissement Important</h3>
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed text-right" dir="rtl">
                    يا فقيه هو أداة مساعدة وليس بديلاً عن العلماء المتخصصين. للمسائل الفقهية المعقدة 
                    أو القضايا الشخصية الحساسة، يُرجى استشارة عالم أو مفتي معتمد في منطقتك.
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed mt-2">
                    Ya Faqih est un outil d'assistance et ne remplace pas les savants spécialisés. 
                    Pour les questions juridiques complexes ou les affaires personnelles sensibles, 
                    veuillez consulter un érudit ou mufti qualifié de votre région.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              بارك الله فيكم - Qu'Allah vous bénisse
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              © 2024 Ya Faqih. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
