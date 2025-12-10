import React, { useState, useEffect } from 'react';
import { X, Crown, Check, Sparkles, Zap, Star, Tag, Loader2, CheckCircle, XCircle, User, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * SubscriptionModal - Modal d'abonnement multilingue
 * ✅ Charge les plans depuis l'API (seuls les plans actifs sont affichés)
 */
export default function SubscriptionModal({ isOpen, onClose, currentTier = 'free' }) {
  const { language, isRTL } = useLanguage();
  
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
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
      loading: 'جاري التحميل...',
      noPlans: 'لا توجد خطط متاحة حالياً',
      month: '/شهر',
      free: 'مجاني'
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
      loading: 'Chargement...',
      noPlans: 'Aucun forfait disponible',
      month: '/mois',
      free: 'Gratuit'
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
      loading: 'Loading...',
      noPlans: 'No plans available',
      month: '/mo',
      free: 'Free'
    }
  }[language] || {
    choosePlan: 'اختر خطتك', upgradeExperience: 'ارتقِ بتجربتك مع المساعد الإسلامي', havePromoCode: 'هل لديك رمز خصم؟', enterCodeForDiscount: 'أدخل الرمز للحصول على خصم', enterPromoCode: 'أدخل رمز الخصم', verify: 'تحقق', discountApplied: 'تم تطبيق الخصم', invalidCode: 'رمز غير صالح', errorVerifying: 'خطأ في التحقق من الرمز', mostPopular: 'الأكثر شعبية ⭐', currentPlan: 'خطتك الحالية', startFree: 'البدء مجاناً', choose: 'اختر', securePayment: '🔒 الدفع آمن ومشفر', termsAgree: 'بالاشتراك، أنت توافق على شروط الخدمة', loading: 'جاري التحميل...', noPlans: 'لا توجد خطط متاحة', month: '/شهر', free: 'مجاني'
  };

  // ✅ Charger les plans depuis l'API quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch('/api/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Erreur chargement plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Obtenir l'icône du plan
  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'pro': return Zap;
      case 'premium': return Crown;
      default: return Sparkles;
    }
  };

  // Obtenir la couleur du plan
  const getPlanColor = (planId) => {
    switch (planId) {
      case 'pro': return 'from-blue-500 to-blue-600';
      case 'premium': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  // Obtenir la couleur du bouton
  const getButtonColor = (planId) => {
    switch (planId) {
      case 'pro': return 'bg-blue-500 hover:bg-blue-600';
      case 'premium': return 'bg-purple-500 hover:bg-purple-600';
      default: return 'bg-emerald-500 hover:bg-emerald-600';
    }
  };

  // Obtenir le nom du plan selon la langue
  const getPlanName = (plan) => {
    if (language === 'ar') return plan.nameAr || plan.name;
    if (language === 'fr') return plan.nameFr || plan.name;
    return plan.name;
  };

  // Obtenir la description du plan
  const getPlanDescription = (plan) => {
    if (language === 'ar') return plan.descriptionAr || plan.description || '';
    if (language === 'fr') return plan.descriptionFr || plan.description || '';
    return plan.description || '';
  };

  // Obtenir les features du plan
  const getPlanFeatures = (plan) => {
    if (language === 'ar') return plan.featuresAr || plan.features || [];
    if (language === 'fr') return plan.featuresFr || plan.features || [];
    return plan.features || [];
  };

  // Obtenir les limitations du plan
  const getPlanLimitations = (plan) => {
    if (language === 'ar') return plan.notIncludedAr || plan.notIncluded || [];
    if (language === 'fr') return plan.notIncludedFr || plan.notIncluded || [];
    return plan.notIncluded || [];
  };

  // Vérifier le code promo
  const verifyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setPromoStatus('checking');
    setPromoError('');

    try {
      const res = await fetch('/api/promo/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() })
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setPromoStatus('valid');
        setPromoData(data);
      } else {
        setPromoStatus('invalid');
        setPromoError(data.error || txt.invalidCode);
      }
    } catch (error) {
      console.error('Erreur vérification promo:', error);
      setPromoStatus('invalid');
      setPromoError(txt.errorVerifying);
    }
  };

  // Calculer le prix avec réduction
  const getDiscountedPrice = (price) => {
    if (!promoData || promoStatus !== 'valid' || price === 0) return price;

    if (promoData.discountType === 'percentage') {
      return price * (1 - promoData.discountValue / 100);
    } else {
      return Math.max(0, price - promoData.discountValue);
    }
  };

  // Gérer le checkout
  const handleCheckout = async (plan) => {
    if (plan.id === 'free' || plan.id === currentTier) return;

    setIsLoading(true);
    
    try {
      let checkoutUrl = CHECKOUT_URLS[plan.id];
      
      if (checkoutUrl) {
        // Ajouter le code promo à l'URL si valide
        if (promoStatus === 'valid' && promoCode) {
          checkoutUrl += `?checkout[discount_code]=${encodeURIComponent(promoCode)}`;
        }
        
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10 p-2 bg-white/80 dark:bg-gray-700/80 rounded-full hover:bg-white dark:hover:bg-gray-600 transition-all shadow-lg`}
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              {txt.choosePlan}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{txt.upgradeExperience}</p>
          </div>

          {/* Promo Code Section */}
          <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <Tag className="w-5 h-5 text-emerald-600" />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{txt.havePromoCode}</p>
                <p className="text-sm text-gray-500">{txt.enterCodeForDiscount}</p>
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
          {loadingPlans ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <span className="ml-3 text-gray-500">{txt.loading}</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{txt.noPlans}</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(plans.length, 3)} gap-6`}>
              {plans.map((plan) => {
                const Icon = getPlanIcon(plan.id);
                const isCurrentPlan = plan.id === currentTier;
                const discountedPrice = getDiscountedPrice(plan.price);
                const hasDiscount = promoStatus === 'valid' && discountedPrice < plan.price && plan.id !== 'free';
                const features = getPlanFeatures(plan);
                const limitations = getPlanLimitations(plan);

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 ${
                      plan.isPopular
                        ? 'border-blue-500 shadow-xl shadow-blue-500/20 scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {plan.isPopular && (
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
                        <div className={`w-12 h-12 bg-gradient-to-br ${getPlanColor(plan.id)} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{getPlanName(plan)}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{getPlanDescription(plan)}</p>
                        </div>
                      </div>

                      {/* Prix */}
                      <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {plan.price === 0 ? (
                          <div className={`flex items-baseline gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {txt.free}
                            </span>
                          </div>
                        ) : hasDiscount ? (
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
                              ${plan.price}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">{txt.month}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        {features.map((feature, idx) => (
                          <div key={idx} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className={`text-sm text-gray-700 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>{feature}</span>
                          </div>
                        ))}
                        {limitations.map((limitation, idx) => (
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
                            : getButtonColor(plan.id)
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
                            <span>{txt.choose} {getPlanName(plan)}</span>
                            <Star className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
