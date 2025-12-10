import React, { useState, useEffect } from 'react';
import { X, Crown, Check, Sparkles, Zap, Star, Tag, Loader2, CheckCircle, XCircle, User, RefreshCw, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * SubscriptionModal - Modal d'abonnement multilingue
 * ✅ Charge les plans depuis l'API (seuls les plans actifs sont affichés)
 * ✅ Bouton "Faire un Don" pour le plan gratuit
 * ✅ Section code promo cachée
 */
export default function SubscriptionModal({ isOpen, onClose, currentTier = 'free' }) {
  const { language, isRTL } = useLanguage();
  
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // URLs de checkout LemonSqueezy
  const CHECKOUT_URLS = {
    pro: 'https://yafaqih.lemonsqueezy.com/buy/669f5834-1817-42d3-ab4a-a8441db40737',
    premium: 'https://yafaqih.lemonsqueezy.com/buy/c1fd514d-562d-45b0-8dff-c5f1ab34743f'
  };

  // ✅ URL pour les dons
  const DONATION_URL = 'https://yafaqih.lemonsqueezy.com/buy/f61ce506-089b-476f-92a9-acbc7c050626';

  // Traductions
  const txt = {
    ar: {
      choosePlan: 'اختر خطتك',
      upgradeExperience: 'ارتقِ بتجربتك مع المساعد الإسلامي',
      mostPopular: 'الأكثر شعبية ⭐',
      currentPlan: 'خطتك الحالية',
      makeDonation: 'تبرع 💝', // ✅ NOUVEAU
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
      mostPopular: 'Le plus populaire ⭐',
      currentPlan: 'Votre plan actuel',
      makeDonation: 'Faire un Don 💝', // ✅ NOUVEAU
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
      mostPopular: 'Most popular ⭐',
      currentPlan: 'Current plan',
      makeDonation: 'Make a Donation 💝', // ✅ NOUVEAU
      choose: 'Choose',
      securePayment: '🔒 Secure payment • Cancel anytime',
      termsAgree: 'By subscribing, you agree to our Terms of Service',
      loading: 'Loading...',
      noPlans: 'No plans available',
      month: '/mo',
      free: 'Free'
    }
  }[language] || {
    choosePlan: 'اختر خطتك', upgradeExperience: 'ارتقِ بتجربتك مع المساعد الإسلامي', mostPopular: 'الأكثر شعبية ⭐', currentPlan: 'خطتك الحالية', makeDonation: 'تبرع 💝', choose: 'اختر', securePayment: '🔒 الدفع آمن ومشفر', termsAgree: 'بالاشتراك، أنت توافق على شروط الخدمة', loading: 'جاري التحميل...', noPlans: 'لا توجد خطط متاحة', month: '/شهر', free: 'مجاني'
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

  // ✅ Gérer le checkout
  const handleCheckout = (plan) => {
    if (plan.id === 'free') {
      // ✅ Pour le plan gratuit, ouvrir la page de don
      window.open(DONATION_URL, '_blank');
      return;
    }

    // Pour les plans payants
    const checkoutUrl = CHECKOUT_URLS[plan.id];
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-gray-50 dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className={`flex items-start justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{txt.choosePlan}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{txt.upgradeExperience}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* ✅ Section Code Promo SUPPRIMÉE */}

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

                      {/* ✅ Bouton modifié */}
                      <button
                        onClick={() => handleCheckout(plan)}
                        disabled={isCurrentPlan && plan.id !== 'free'}
                        className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                          isCurrentPlan && plan.id !== 'free'
                            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                            : plan.id === 'free'
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
                              : getButtonColor(plan.id)
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isCurrentPlan && plan.id !== 'free' ? (
                          txt.currentPlan
                        ) : plan.id === 'free' ? (
                          <>
                            <Heart className="w-5 h-5" />
                            <span>{txt.makeDonation}</span>
                          </>
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
