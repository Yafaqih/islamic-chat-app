import React, { useState } from 'react';
import { X, Crown, Check, Sparkles, Zap, Star, Tag, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * SubscriptionModal - Modal d'abonnement multilingue avec prix fixes en USD
 */
export default function SubscriptionModal({ isOpen, onClose, currentTier = 'free' }) {
  const { language, isRTL } = useLanguage();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState(null);
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // URLs de checkout LemonSqueezy
  const CHECKOUT_URLS = {
    pro: 'https://yafaqih.lemonsqueezy.com/buy/669f5834-1817-42d3-ab4a-a8441db40737',
    premium: 'https://yafaqih.lemonsqueezy.com/buy/c1fd514d-562d-45b0-8dff-c5f1ab34743f'
  };

  // Traductions
  const txt = {
    ar: {
      choosePlan: 'اختر خطتك',
      upgradeExperience: 'ارتقِ بتجربتك مع المساعد الإسلامي',
      havePromoCode: 'هل لديك رمز خصم؟',
      enterCodeForDiscount: 'أدخل الرمز للحصول على خصم',
      enterPromoCode: 'أدخل رمز الخصم',
      verify: 'تحقق',
      discountApplied: 'تم تطبيق الخصم',
      invalidCode: 'رمز غير صالح',
      errorVerifying: 'خطأ في التحقق من الرمز',
      mostPopular: 'الأكثر شعبية ⭐',
      currentPlan: 'خطتك الحالية',
      startFree: 'البدء مجاناً',
      choose: 'اختر',
      securePayment: '🔒 الدفع آمن ومشفر • يمكنك إلغاء اشتراكك في أي وقت',
      termsAgree: 'بالاشتراك، أنت توافق على شروط الخدمة وسياسة الخصوصية',
      free: 'مجاني',
      freePrice: 'مجاني',
      freeDesc: 'للتجربة والاستكشاف',
      pro: 'احترافي',
      proDesc: 'للاستخدام المتقدم',
      premium: 'مميز',
      premiumDesc: 'للمحترفين والمؤسسات',
      messagesDay: 'رسالة يومياً',
      unlimitedMessages: 'رسائل غير محدودة',
      basicAnswers: 'إجابات أساسية',
      advancedAnswers: 'إجابات متقدمة ومفصلة',
      advancedWithRefs: 'إجابات متقدمة مع المراجع',
      quranAccess: 'الوصول للقرآن الكريم',
      quranHadithAccess: 'الوصول للقرآن والأحاديث',
      fullAccess: 'الوصول الكامل لجميع المصادر',
      prayerTimes: 'أوقات الصلاة',
      prayerQibla: 'أوقات الصلاة واتجاه القبلة',
      saveConversations: 'حفظ المحادثات',
      fastSupport: 'دعم سريع',
      prioritySupport: 'أولوية الدعم الفني',
      exportPDF: 'تصدير المحادثات PDF',
      noPDF: 'بدون تصدير PDF',
      noPriority: 'بدون أولوية الدعم',
      exclusiveFeatures: 'ميزات حصرية قادمة',
      advancedKhutba: 'إعداد الخطب المتقدم',
      month: '/شهر'
    },
    fr: {
      choosePlan: 'Choisissez votre plan',
      upgradeExperience: 'Améliorez votre expérience avec l\'assistant islamique',
      havePromoCode: 'Avez-vous un code promo ?',
      enterCodeForDiscount: 'Entrez le code pour obtenir une réduction',
      enterPromoCode: 'Entrez le code promo',
      verify: 'Vérifier',
      discountApplied: 'Réduction appliquée',
      invalidCode: 'Code invalide',
      errorVerifying: 'Erreur de vérification',
      mostPopular: 'Le plus populaire ⭐',
      currentPlan: 'Votre plan actuel',
      startFree: 'Commencer gratuitement',
      choose: 'Choisir',
      securePayment: '🔒 Paiement sécurisé • Annulez à tout moment',
      termsAgree: 'En vous abonnant, vous acceptez les conditions d\'utilisation',
      free: 'Gratuit',
      freePrice: 'Gratuit',
      freeDesc: 'Pour découvrir',
      pro: 'Pro',
      proDesc: 'Utilisation avancée',
      premium: 'Premium',
      premiumDesc: 'Pour les professionnels',
      messagesDay: 'messages/jour',
      unlimitedMessages: 'Messages illimités',
      basicAnswers: 'Réponses basiques',
      advancedAnswers: 'Réponses détaillées',
      advancedWithRefs: 'Réponses avec références',
      quranAccess: 'Accès au Coran',
      quranHadithAccess: 'Accès Coran et Hadiths',
      fullAccess: 'Accès complet',
      prayerTimes: 'Heures de prière',
      prayerQibla: 'Prière et Qibla',
      saveConversations: 'Sauvegarder les conversations',
      fastSupport: 'Support rapide',
      prioritySupport: 'Support prioritaire',
      exportPDF: 'Export PDF',
      noPDF: 'Sans export PDF',
      noPriority: 'Sans support prioritaire',
      exclusiveFeatures: 'Fonctionnalités exclusives',
      advancedKhutba: 'Préparation de Khutba avancée',
      month: '/mois'
    },
    en: {
      choosePlan: 'Choose your plan',
      upgradeExperience: 'Upgrade your experience with the Islamic assistant',
      havePromoCode: 'Have a promo code?',
      enterCodeForDiscount: 'Enter code for discount',
      enterPromoCode: 'Enter promo code',
      verify: 'Verify',
      discountApplied: 'Discount applied',
      invalidCode: 'Invalid code',
      errorVerifying: 'Verification error',
      mostPopular: 'Most popular ⭐',
      currentPlan: 'Current plan',
      startFree: 'Start free',
      choose: 'Choose',
      securePayment: '🔒 Secure payment • Cancel anytime',
      termsAgree: 'By subscribing, you agree to our Terms of Service',
      free: 'Free',
      freePrice: 'Free',
      freeDesc: 'To explore',
      pro: 'Pro',
      proDesc: 'Advanced usage',
      premium: 'Premium',
      premiumDesc: 'For professionals',
      messagesDay: 'messages/day',
      unlimitedMessages: 'Unlimited messages',
      basicAnswers: 'Basic answers',
      advancedAnswers: 'Detailed answers',
      advancedWithRefs: 'Answers with references',
      quranAccess: 'Quran access',
      quranHadithAccess: 'Quran & Hadith access',
      fullAccess: 'Full access',
      prayerTimes: 'Prayer times',
      prayerQibla: 'Prayer & Qibla',
      saveConversations: 'Save conversations',
      fastSupport: 'Fast support',
      prioritySupport: 'Priority support',
      exportPDF: 'PDF export',
      noPDF: 'No PDF export',
      noPriority: 'No priority support',
      exclusiveFeatures: 'Exclusive features',
      advancedKhutba: 'Advanced Khutba preparation',
      month: '/mo'
    }
  }[language] || {
    choosePlan: 'اختر خطتك', upgradeExperience: 'ارتقِ بتجربتك مع المساعد الإسلامي', havePromoCode: 'هل لديك رمز خصم؟', enterCodeForDiscount: 'أدخل الرمز للحصول على خصم', enterPromoCode: 'أدخل رمز الخصم', verify: 'تحقق', discountApplied: 'تم تطبيق الخصم', invalidCode: 'رمز غير صالح', errorVerifying: 'خطأ في التحقق من الرمز', mostPopular: 'الأكثر شعبية ⭐', currentPlan: 'خطتك الحالية', startFree: 'البدء مجاناً', choose: 'اختر', securePayment: '🔒 الدفع آمن ومشفر', termsAgree: 'بالاشتراك، أنت توافق على شروط الخدمة', free: 'مجاني', freePrice: 'مجاني', freeDesc: 'للتجربة والاستكشاف', pro: 'احترافي', proDesc: 'للاستخدام المتقدم', premium: 'مميز', premiumDesc: 'للمحترفين والمؤسسات', messagesDay: 'رسالة يومياً', unlimitedMessages: 'رسائل غير محدودة', basicAnswers: 'إجابات أساسية', advancedAnswers: 'إجابات متقدمة ومفصلة', advancedWithRefs: 'إجابات متقدمة مع المراجع', quranAccess: 'الوصول للقرآن الكريم', quranHadithAccess: 'الوصول للقرآن والأحاديث', fullAccess: 'الوصول الكامل لجميع المصادر', prayerTimes: 'أوقات الصلاة', prayerQibla: 'أوقات الصلاة واتجاه القبلة', saveConversations: 'حفظ المحادثات', fastSupport: 'دعم سريع', prioritySupport: 'أولوية الدعم الفني', exportPDF: 'تصدير المحادثات PDF', noPDF: 'بدون تصدير PDF', noPriority: 'بدون أولوية الدعم', exclusiveFeatures: 'ميزات حصرية قادمة', advancedKhutba: 'إعداد الخطب المتقدم', month: '/شهر'
  };

  // Configuration des plans
  const plans = [
    {
      id: 'free',
      name: txt.free,
      price: 0,
      priceFormatted: txt.freePrice,
      description: txt.freeDesc,
      features: [
        `10 ${txt.messagesDay}`,
        txt.basicAnswers,
        txt.quranAccess,
        txt.prayerTimes,
      ],
      limitations: [txt.noPDF, txt.noPriority],
      icon: Sparkles,
      color: 'from-gray-500 to-gray-600',
      buttonColor: 'bg-gray-500 hover:bg-gray-600',
      popular: false,
    },
    {
      id: 'pro',
      name: txt.pro,
      price: 3.99,
      priceFormatted: `$3.99${txt.month}`,
      description: txt.proDesc,
      features: [
        `100 ${txt.messagesDay}`,
        txt.advancedAnswers,
        txt.quranHadithAccess,
        txt.prayerQibla,
        txt.saveConversations,
        txt.fastSupport,
      ],
      limitations: [txt.noPDF],
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
      popular: true,
      checkoutUrl: CHECKOUT_URLS.pro,
    },
    {
      id: 'premium',
      name: txt.premium,
      price: 5.99,
      priceFormatted: `$5.99${txt.month}`,
      description: txt.premiumDesc,
      features: [
        txt.unlimitedMessages,
        txt.advancedWithRefs,
        txt.fullAccess,
        txt.exportPDF,
        txt.prioritySupport,
        txt.exclusiveFeatures,
        txt.advancedKhutba,
      ],
      limitations: [],
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      buttonColor: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
      popular: false,
      checkoutUrl: CHECKOUT_URLS.premium,
    },
  ];

  const verifyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setPromoStatus('checking');
    setPromoError('');
    setPromoData(null);

    try {
      const response = await fetch('/api/promo/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setPromoStatus('valid');
        setPromoData(data);
      } else {
        setPromoStatus('invalid');
        setPromoError(data.error || txt.invalidCode);
      }
    } catch (error) {
      setPromoStatus('invalid');
      setPromoError(txt.errorVerifying);
    }
  };

  const getDiscountedPrice = (originalPrice) => {
    if (!promoData || promoStatus !== 'valid') return originalPrice;

    if (promoData.discountType === 'percentage') {
      return originalPrice * (1 - promoData.discountValue / 100);
    } else {
      return Math.max(0, originalPrice - promoData.discountValue);
    }
  };

  const handleCheckout = (plan) => {
    if (plan.id === 'free' || plan.id === currentTier) {
      onClose();
      return;
    }

    setIsLoading(true);

    let checkoutUrl = plan.checkoutUrl;
    
    if (promoStatus === 'valid' && promoData?.lemonSqueezyCode) {
      checkoutUrl += `?discount_code=${promoData.lemonSqueezyCode}`;
    }

    window.location.href = checkoutUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className={`sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{txt.choosePlan}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{txt.upgradeExperience}</p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Section Code Promo */}
          <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
            <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="font-bold text-gray-900 dark:text-white">{txt.havePromoCode}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{txt.enterCodeForDiscount}</p>
              </div>
            </div>

            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoStatus(null);
                    setPromoError('');
                  }}
                  placeholder={txt.enterPromoCode}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${isRTL ? 'text-right' : 'text-left'}`}
                  dir="ltr"
                />
                {promoStatus === 'valid' && (
                  <CheckCircle className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-green-500`} />
                )}
                {promoStatus === 'invalid' && (
                  <XCircle className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-red-500`} />
                )}
              </div>
              <button
                onClick={verifyPromoCode}
                disabled={!promoCode.trim() || promoStatus === 'checking'}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {promoStatus === 'checking' ? <Loader2 className="w-5 h-5 animate-spin" /> : txt.verify}
              </button>
            </div>

            {promoStatus === 'valid' && promoData && (
              <div className={`mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-700 dark:text-green-300 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                ✅ {txt.discountApplied}: {promoData.discountType === 'percentage' ? `${promoData.discountValue}%` : `$${promoData.discountValue}`}
                {promoData.description && ` - ${promoData.description}`}
              </div>
            )}
            {promoStatus === 'invalid' && (
              <div className={`mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-700 dark:text-red-300 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                ❌ {promoError}
              </div>
            )}
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = plan.id === currentTier;
              const discountedPrice = getDiscountedPrice(plan.price);
              const hasDiscount = promoStatus === 'valid' && discountedPrice < plan.price && plan.id !== 'free';

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 ${
                    plan.popular
                      ? 'border-blue-500 shadow-xl shadow-blue-500/20 scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                        {txt.mostPopular}
                      </div>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className={`absolute -top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                      <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {txt.currentPlan}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {hasDiscount ? (
                        <div className={`flex items-baseline gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                            ${plan.price}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">{txt.month}</span>
                        </div>
                      ) : (
                        <div className={`flex items-baseline gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {plan.priceFormatted}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className={`text-sm text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className={`flex items-center gap-3 opacity-50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <X className="w-3 h-3 text-gray-400" />
                          </div>
                          <span className={`text-sm text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>{limitation}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleCheckout(plan)}
                      disabled={isCurrentPlan || isLoading}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                        isCurrentPlan
                          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                          : plan.buttonColor
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : isCurrentPlan ? (
                        txt.currentPlan
                      ) : plan.id === 'free' ? (
                        txt.startFree
                      ) : (
                        <>
                          <span>{txt.choose} {plan.name}</span>
                          <Star className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{txt.securePayment}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{txt.termsAgree}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
