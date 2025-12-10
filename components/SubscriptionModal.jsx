import React from 'react';
import { X, Heart, BookOpen, Clock, Compass, MapPin, Download, MessageSquare, Globe, Moon, Volume2, Sparkles, Search, Star, Mic, Image } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * SubscriptionModal - Modal "Soutenez Ya Faqih"
 * ✅ Affiche toutes les fonctionnalités gratuites
 * ✅ Bouton de don LemonSqueezy
 */
export default function SubscriptionModal({ isOpen, onClose }) {
  const { language, isRTL } = useLanguage();

  // ✅ URL pour les dons
  const DONATION_URL = 'https://yafaqih.lemonsqueezy.com/buy/f61ce506-089b-476f-92a9-acbc7c050626';

  // Traductions
  const txt = {
    ar: {
      title: 'يا فقيه - مجاني 100%',
      subtitle: 'جميع الميزات متاحة مجاناً للجميع',
      allFeatures: 'جميع الميزات المتاحة',
      supportUs: 'ادعمنا',
      supportText: 'إذا أعجبك التطبيق، يمكنك دعمنا بتبرع صغير للمساعدة في تطويره',
      makeDonation: 'تبرع لدعم المشروع 💝',
      thankYou: 'جزاكم الله خيراً على دعمكم',
      features: [
        { icon: 'MessageSquare', text: 'محادثة ذكية مع مساعد إسلامي' },
        { icon: 'BookOpen', text: 'تلاوة القرآن الكريم (114 سورة)' },
        { icon: 'Volume2', text: '8 قراء مشهورين' },
        { icon: 'Clock', text: 'مواقيت الصلاة حسب موقعك' },
        { icon: 'Compass', text: 'بوصلة القبلة' },
        { icon: 'MapPin', text: 'البحث عن المساجد القريبة' },
        { icon: 'Download', text: 'تصدير المحادثات PDF' },
        { icon: 'Star', text: 'حفظ الإجابات المفضلة' },
        { icon: 'Globe', text: 'متعدد اللغات (عربي/فرنسي/إنجليزي)' },
        { icon: 'Moon', text: 'الوضع الليلي' },
        { icon: 'Image', text: 'تحليل الصور' },
        { icon: 'Mic', text: 'الإدخال الصوتي' },
        { icon: 'Search', text: 'مراجع من القرآن والسنة' }
      ]
    },
    fr: {
      title: 'Ya Faqih - 100% Gratuit',
      subtitle: 'Toutes les fonctionnalités sont gratuites pour tous',
      allFeatures: 'Toutes les fonctionnalités',
      supportUs: 'Soutenez-nous',
      supportText: 'Si vous aimez l\'application, vous pouvez nous soutenir avec un petit don',
      makeDonation: 'Faire un Don 💝',
      thankYou: 'Merci pour votre soutien',
      features: [
        { icon: 'MessageSquare', text: 'Chat intelligent avec assistant islamique' },
        { icon: 'BookOpen', text: 'Récitation du Coran (114 sourates)' },
        { icon: 'Volume2', text: '8 récitateurs célèbres' },
        { icon: 'Clock', text: 'Horaires de prière selon votre position' },
        { icon: 'Compass', text: 'Boussole Qibla' },
        { icon: 'MapPin', text: 'Recherche de mosquées à proximité' },
        { icon: 'Download', text: 'Export des conversations en PDF' },
        { icon: 'Star', text: 'Sauvegarde des réponses favorites' },
        { icon: 'Globe', text: 'Multilingue (Arabe/Français/Anglais)' },
        { icon: 'Moon', text: 'Mode sombre' },
        { icon: 'Image', text: 'Analyse d\'images' },
        { icon: 'Mic', text: 'Saisie vocale' },
        { icon: 'Search', text: 'Références Coran & Hadiths' }
      ]
    },
    en: {
      title: 'Ya Faqih - 100% Free',
      subtitle: 'All features are free for everyone',
      allFeatures: 'All Features',
      supportUs: 'Support Us',
      supportText: 'If you like the app, you can support us with a small donation',
      makeDonation: 'Make a Donation 💝',
      thankYou: 'Thank you for your support',
      features: [
        { icon: 'MessageSquare', text: 'Smart chat with Islamic assistant' },
        { icon: 'BookOpen', text: 'Quran recitation (114 surahs)' },
        { icon: 'Volume2', text: '8 famous reciters' },
        { icon: 'Clock', text: 'Prayer times based on your location' },
        { icon: 'Compass', text: 'Qibla compass' },
        { icon: 'MapPin', text: 'Find nearby mosques' },
        { icon: 'Download', text: 'Export conversations to PDF' },
        { icon: 'Star', text: 'Save favorite answers' },
        { icon: 'Globe', text: 'Multilingual (Arabic/French/English)' },
        { icon: 'Moon', text: 'Dark mode' },
        { icon: 'Image', text: 'Image analysis' },
        { icon: 'Mic', text: 'Voice input' },
        { icon: 'Search', text: 'Quran & Hadith references' }
      ]
    }
  }[language] || {
    title: 'Ya Faqih - 100% Gratuit',
    subtitle: 'Toutes les fonctionnalités sont gratuites pour tous',
    allFeatures: 'Toutes les fonctionnalités',
    supportUs: 'Soutenez-nous',
    supportText: 'Si vous aimez l\'application, vous pouvez nous soutenir avec un petit don',
    makeDonation: 'Faire un Don 💝',
    thankYou: 'Merci pour votre soutien',
    features: []
  };

  // Map des icônes
  const iconMap = {
    MessageSquare, BookOpen, Volume2, Clock, Compass, MapPin, 
    Download, Star, Globe, Moon, Image, Mic, Search
  };

  const handleDonation = () => {
    window.open(DONATION_URL, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className={`flex items-start justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{txt.title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{txt.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Badge gratuit */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 px-6 py-2 rounded-full">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {txt.allFeatures}
                <Sparkles className="w-5 h-5" />
              </span>
            </div>
          </div>

          {/* Liste des fonctionnalités */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 mb-6">
            <div className="grid grid-cols-1 gap-3">
              {txt.features.map((feature, idx) => {
                const Icon = iconMap[feature.icon] || Sparkles;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className={`text-sm text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {feature.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Don */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-5 border border-pink-200 dark:border-pink-800/50">
            <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Heart className="w-5 h-5 text-pink-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">{txt.supportUs}</h3>
            </div>
            <p className={`text-sm text-gray-600 dark:text-gray-400 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {txt.supportText}
            </p>
            <button
              onClick={handleDonation}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Heart className="w-5 h-5" />
              <span>{txt.makeDonation}</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{txt.thankYou}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
