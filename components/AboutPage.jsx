import React from 'react';
import { X, BookOpen, Sparkles, Heart, Shield, Zap, Users, Mail, Globe, MessageCircle, Bell, Compass } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * AboutPage - Page "À propos" multilingue pour Ya Faqih
 */
export default function AboutPage({ onClose }) {
  const { language, isRTL } = useLanguage();

  // Traductions
  const txt = {
    ar: {
      appName: 'يا فقيه',
      tagline: 'مساعدك الإسلامي الذكي',
      missionTitle: 'مهمتنا',
      missionText: 'يا فقيه هو مساعد إسلامي ذكي مصمم لمساعدة المسلمين في جميع أنحاء العالم على فهم دينهم بشكل أفضل. نحن نوفر إجابات موثوقة ودقيقة مستندة إلى القرآن الكريم والسنة النبوية الصحيحة، مع التركيز على التقاليد السنية الأصيلة.',
      featuresTitle: 'الميزات',
      feature1Title: 'تفسير القرآن الكريم',
      feature1Desc: 'شروحات مفصلة للآيات القرآنية مع مراجع من التفاسير الموثوقة والمعتمدة',
      feature2Title: 'شرح الأحاديث النبوية',
      feature2Desc: 'شرح الأحاديث الصحيحة من البخاري ومسلم وغيرها من المصادر الموثوقة',
      feature3Title: 'أسئلة الفقه الإسلامي',
      feature3Desc: 'إجابات على أسئلة الفقه الإسلامي بناءً على المذاهب الأربعة المعتمدة',
      feature4Title: 'إعداد الخطب والمواعظ',
      feature4Desc: 'مساعدة في تحضير الخطب والمواعظ الإسلامية المنظمة والمؤثرة',
      feature5Title: 'التعرف الصوتي على الكلام',
      feature5Desc: 'اطرح أسئلتك بصوتك باللغة العربية مع النسخ التلقائي للنص',
      feature6Title: 'القراءة الصوتية',
      feature6Desc: 'استمع إلى الإجابات صوتياً مع تقنية التوليف الصوتي',
      feature7Title: 'اتجاه القبلة',
      feature7Desc: 'بوصلة ذكية لتحديد اتجاه القبلة بدقة عالية من أي مكان في العالم',
      feature8Title: 'مواقيت الصلاة',
      feature8Desc: 'إشعارات بأوقات الصلاة حسب موقعك مع إمكانية تشغيل الأذان',
      principlesTitle: 'مبادئنا',
      principle1: 'الدقة العلمية: نعتمد فقط على المصادر الموثوقة والمعتمدة',
      principle2: 'الشفافية: نذكر دائماً مصادر المعلومات والمراجع',
      principle3: 'الاحترام: نحترم جميع المذاهب الإسلامية المعتمدة',
      principle4: 'الأمانة: نميز بين ما هو متفق عليه وما هو مختلف فيه',
      techTitle: 'التقنية المستخدمة',
      techText: 'يستخدم تطبيق يا فقيه تقنيات الذكاء الاصطناعي المتقدمة مع قاعدة معرفية إسلامية محققة بعناية لتقديم إجابات دقيقة وموثوقة.',
      tech1: 'ذكاء اصطناعي متطور',
      tech1Desc: 'نماذج لغوية حديثة ومتقدمة',
      tech2: 'مصادر موثوقة',
      tech2Desc: 'قاعدة بيانات معتمدة ومحققة',
      tech3: 'تحديث مستمر',
      tech3Desc: 'تطوير وتحسين دائم',
      teamTitle: 'فريق العمل',
      teamText: 'يا فقيه هو مشروع مبني على مصادر إسلامية موثوقة ومعتمدة، تم تطويره بواسطة فريق تقني متخصص. نحن نستخدم المراجع والتفاسير المعتمدة لتقديم أفضل تجربة ممكنة للمسلمين في جميع أنحاء العالم.',
      contactTitle: 'التواصل والدعم',
      emailSupport: 'البريد الإلكتروني للدعم',
      website: 'الموقع الإلكتروني',
      needHelp: '💡 هل تحتاج إلى مساعدة؟ فريق الدعم لدينا متاح للإجابة على أسئلتك.',
      warningTitle: 'تنبيه مهم',
      warningText: 'يا فقيه هو أداة مساعدة وليس بديلاً عن العلماء المتخصصين. للمسائل الفقهية المعقدة أو القضايا الشخصية الحساسة، يُرجى استشارة عالم أو مفتي معتمد في منطقتك.',
      blessings: 'بارك الله فيكم وجزاكم الله خيراً',
      copyright: '© ٢٠٢٤ يا فقيه. جميع الحقوق محفوظة'
    },
    fr: {
      appName: 'Ya Faqih',
      tagline: 'Votre assistant islamique intelligent',
      missionTitle: 'Notre mission',
      missionText: 'Ya Faqih est un assistant islamique intelligent conçu pour aider les musulmans du monde entier à mieux comprendre leur religion. Nous fournissons des réponses fiables et précises basées sur le Coran et la Sunna authentique.',
      featuresTitle: 'Fonctionnalités',
      feature1Title: 'Exégèse du Coran',
      feature1Desc: 'Explications détaillées des versets coraniques avec références des tafsirs reconnus',
      feature2Title: 'Explication des Hadiths',
      feature2Desc: 'Explication des hadiths authentiques de Bukhari, Muslim et autres sources fiables',
      feature3Title: 'Questions de Fiqh',
      feature3Desc: 'Réponses aux questions de jurisprudence islamique selon les quatre écoles',
      feature4Title: 'Préparation de Khutbas',
      feature4Desc: 'Aide à la préparation de sermons islamiques structurés et impactants',
      feature5Title: 'Reconnaissance vocale',
      feature5Desc: 'Posez vos questions à voix haute avec transcription automatique',
      feature6Title: 'Lecture audio',
      feature6Desc: 'Écoutez les réponses avec la technologie de synthèse vocale',
      feature7Title: 'Direction de la Qibla',
      feature7Desc: 'Boussole intelligente pour déterminer la direction de la Qibla avec précision depuis n\'importe où',
      feature8Title: 'Horaires de prière',
      feature8Desc: 'Notifications des heures de prière selon votre position avec option d\'Adhan',
      principlesTitle: 'Nos principes',
      principle1: 'Rigueur scientifique : Nous nous appuyons uniquement sur des sources fiables',
      principle2: 'Transparence : Nous citons toujours nos sources et références',
      principle3: 'Respect : Nous respectons toutes les écoles islamiques reconnues',
      principle4: 'Honnêteté : Nous distinguons le consensuel du divergent',
      techTitle: 'Technologie',
      techText: 'Ya Faqih utilise des technologies d\'IA avancées avec une base de connaissances islamiques vérifiée pour fournir des réponses précises et fiables.',
      tech1: 'IA avancée',
      tech1Desc: 'Modèles linguistiques modernes',
      tech2: 'Sources fiables',
      tech2Desc: 'Base de données vérifiée',
      tech3: 'Mise à jour continue',
      tech3Desc: 'Amélioration constante',
      teamTitle: 'Notre équipe',
      teamText: 'Ya Faqih est un projet basé sur des sources islamiques fiables et reconnues, développé par une équipe technique spécialisée. Nous utilisons des références et tafsirs reconnus pour offrir la meilleure expérience possible aux musulmans du monde entier.',
      contactTitle: 'Contact et support',
      emailSupport: 'Email de support',
      website: 'Site web',
      needHelp: '💡 Besoin d\'aide ? Notre équipe de support est disponible pour répondre à vos questions.',
      warningTitle: 'Avertissement important',
      warningText: 'Ya Faqih est un outil d\'assistance et ne remplace pas les savants qualifiés. Pour les questions complexes de fiqh, veuillez consulter un savant ou mufti reconnu.',
      blessings: 'Qu\'Allah vous bénisse',
      copyright: '© 2024 Ya Faqih. Tous droits réservés'
    },
    en: {
      appName: 'Ya Faqih',
      tagline: 'Your intelligent Islamic assistant',
      missionTitle: 'Our mission',
      missionText: 'Ya Faqih is an intelligent Islamic assistant designed to help Muslims worldwide better understand their religion. We provide reliable and accurate answers based on the Quran and authentic Sunnah.',
      featuresTitle: 'Features',
      feature1Title: 'Quran Exegesis',
      feature1Desc: 'Detailed explanations of Quranic verses with references from recognized tafsirs',
      feature2Title: 'Hadith Explanation',
      feature2Desc: 'Explanation of authentic hadiths from Bukhari, Muslim and other reliable sources',
      feature3Title: 'Fiqh Questions',
      feature3Desc: 'Answers to Islamic jurisprudence questions according to the four schools',
      feature4Title: 'Khutba Preparation',
      feature4Desc: 'Help preparing structured and impactful Islamic sermons',
      feature5Title: 'Voice Recognition',
      feature5Desc: 'Ask your questions by voice with automatic transcription',
      feature6Title: 'Audio Reading',
      feature6Desc: 'Listen to answers with text-to-speech technology',
      feature7Title: 'Qibla Direction',
      feature7Desc: 'Smart compass to determine Qibla direction accurately from anywhere in the world',
      feature8Title: 'Prayer Times',
      feature8Desc: 'Prayer time notifications based on your location with Adhan option',
      principlesTitle: 'Our principles',
      principle1: 'Scientific rigor: We rely only on reliable sources',
      principle2: 'Transparency: We always cite our sources and references',
      principle3: 'Respect: We respect all recognized Islamic schools',
      principle4: 'Honesty: We distinguish between consensus and divergence',
      techTitle: 'Technology',
      techText: 'Ya Faqih uses advanced AI technologies with a verified Islamic knowledge base to provide accurate and reliable answers.',
      tech1: 'Advanced AI',
      tech1Desc: 'Modern language models',
      tech2: 'Reliable sources',
      tech2Desc: 'Verified database',
      tech3: 'Continuous updates',
      tech3Desc: 'Constant improvement',
      teamTitle: 'Our team',
      teamText: 'Ya Faqih is a project built on reliable and recognized Islamic sources, developed by a specialized technical team. We use recognized references and tafsirs to offer the best possible experience to Muslims worldwide.',
      contactTitle: 'Contact and support',
      emailSupport: 'Support email',
      website: 'Website',
      needHelp: '💡 Need help? Our support team is available to answer your questions.',
      warningTitle: 'Important notice',
      warningText: 'Ya Faqih is an assistance tool and does not replace qualified scholars. For complex fiqh questions, please consult a recognized scholar or mufti.',
      blessings: 'May Allah bless you',
      copyright: '© 2024 Ya Faqih. All rights reserved'
    }
  }[language] || {
    appName: 'يا فقيه', tagline: 'مساعدك الإسلامي الذكي', missionTitle: 'مهمتنا', missionText: 'يا فقيه هو مساعد إسلامي ذكي مصمم لمساعدة المسلمين.', featuresTitle: 'الميزات', principlesTitle: 'مبادئنا', techTitle: 'التقنية', teamTitle: 'فريق العمل', contactTitle: 'التواصل', warningTitle: 'تنبيه مهم', blessings: 'بارك الله فيكم', copyright: '© ٢٠٢٤ يا فقيه'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-8 rounded-t-2xl text-white">
          <button
            onClick={onClose}
            className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-2 hover:bg-white/20 rounded-lg transition-all`}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">{txt.appName}</h1>
            <p className="text-xl text-emerald-50">{txt.tagline}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          
          {/* Mission */}
          <section className="mb-8">
            <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{txt.missionTitle}</h2>
            </div>
            <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {txt.missionText}
            </p>
          </section>

          {/* Features */}
          <section className="mb-8">
            <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{txt.featuresTitle}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{txt.feature1Title}</h3>
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.feature1Desc}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{txt.feature2Title}</h3>
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.feature2Desc}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{txt.feature3Title}</h3>
                  <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.feature3Desc}</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{txt.feature4Title}</h3>
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.feature4Desc}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-xl border border-green-100 dark:border-green-800/30">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{txt.feature5Title}</h3>
                  <span className="text-xl">🎤</span>
                </div>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.feature5Desc}</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 p-4 rounded-xl border border-cyan-100 dark:border-cyan-800/30">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{txt.feature6Title}</h3>
                  <span className="text-xl">🔊</span>
                </div>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.feature6Desc}</p>
              </div>

              {/* NEW: Qibla Direction */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-800/30">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{txt.feature7Title}</h3>
                  <span className="text-xl">🕋</span>
                </div>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.feature7Desc}</p>
              </div>

              {/* NEW: Prayer Times */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 p-4 rounded-xl border border-violet-100 dark:border-violet-800/30">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{txt.feature8Title}</h3>
                  <Bell className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <p className={`text-sm text-gray-600 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{txt.feature8Desc}</p>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section className="mb-8">
            <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{txt.techTitle}</h2>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <p className={`text-gray-700 dark:text-gray-300 leading-relaxed mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {txt.techText}
              </p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className={`bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{txt.tech1}</div>
                  <div className="text-gray-600 dark:text-gray-400">{txt.tech1Desc}</div>
                </div>
                <div className={`bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="font-semibold text-purple-600 dark:text-purple-400 mb-1">{txt.tech2}</div>
                  <div className="text-gray-600 dark:text-gray-400">{txt.tech2Desc}</div>
                </div>
                <div className={`bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="font-semibold text-pink-600 dark:text-pink-400 mb-1">{txt.tech3}</div>
                  <div className="text-gray-600 dark:text-gray-400">{txt.tech3Desc}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="mb-8">
            <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{txt.teamTitle}</h2>
            </div>
            
            <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {txt.teamText}
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{txt.contactTitle}</h2>
            </div>
            
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{txt.emailSupport}</div>
                  <a href="mailto:info@yafaqih.com" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline" dir="ltr">
                    info@yafaqih.com
                  </a>
                </div>
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{txt.website}</div>
                  <a href="https://yafaqih.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline" dir="ltr">
                    www.yafaqih.app
                  </a>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className={`bg-blue-50 dark:bg-blue-900/10 border-${isRTL ? 'r' : 'l'}-4 border-blue-500 p-4 rounded ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-sm text-blue-800 dark:text-blue-200">{txt.needHelp}</p>
              </div>
            </div>
          </section>

          {/* Warning */}
          <section className="mb-4">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-6">
              <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">{txt.warningTitle}</h3>
                  <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    {txt.warningText}
                  </p>
                </div>
                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{txt.blessings}</p>
            <p className="text-gray-500 dark:text-gray-500 text-xs">{txt.copyright}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
