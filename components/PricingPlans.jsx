// components/PricingPlans.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Check, Star, Zap, Crown, User, Tag, 
  RefreshCw, AlertCircle, Shield
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * PricingPlans - Affiche les plans d'abonnement depuis l'API
 * Ne montre QUE les plans actifs (isActive: true)
 */
export default function PricingPlans({ isOpen, onClose, currentPlan = 'free', onSelectPlan }) {
  const { language, isRTL } = useLanguage();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [verifyingPromo, setVerifyingPromo] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  const txt = {
    ar: {
      title: 'اختر خطتك',
      havePromo: 'هل لديك كود خصم؟',
      enterPromo: 'أدخل الكود للحصول على خصم',
      promoPlaceholder: 'أدخل كود الخصم',
      verify: 'تحقق',
      free: 'مجاني',
      month: '/شهر',
      current: 'خطتك الحالية',
      choose: 'اختر',
      mostPopular: 'الأكثر شعبية',
      securePay: 'دفع آمن',
      cancelAnytime: 'إلغاء في أي وقت',
      termsAccept: 'بالاشتراك، أنت توافق على شروط الاستخدام',
      loading: 'جاري التحميل...',
      noPlans: 'لا توجد خطط متاحة حالياً',
      unlimited: 'غير محدود',
      promoApplied: 'تم تطبيق الخصم!',
      promoInvalid: 'كود غير صالح',
      startFree: 'ابدأ مجاناً',
      choosePro: 'اختر Pro',
      choosePremium: 'اختر Premium'
    },
    fr: {
      title: 'Choisissez votre forfait',
      havePromo: 'Avez-vous un code promo ?',
      enterPromo: 'Entrez le code pour obtenir une réduction',
      promoPlaceholder: 'Entrez le code promo',
      verify: 'Vérifier',
      free: 'Gratuit',
      month: '/mois',
      current: 'Votre forfait actuel',
      choose: 'Choisir',
      mostPopular: 'Le plus populaire',
      securePay: 'Paiement sécurisé',
      cancelAnytime: 'Annulez à tout moment',
      termsAccept: 'En vous abonnant, vous acceptez les conditions d\'utilisation',
      loading: 'Chargement...',
      noPlans: 'Aucun forfait disponible',
      unlimited: 'Illimité',
      promoApplied: 'Réduction appliquée !',
      promoInvalid: 'Code invalide',
      startFree: 'Commencer gratuitement',
      choosePro: 'Choisir Pro',
      choosePremium: 'Choisir Premium'
    },
    en: {
      title: 'Choose your plan',
      havePromo: 'Have a promo code?',
      enterPromo: 'Enter the code to get a discount',
      promoPlaceholder: 'Enter promo code',
      verify: 'Verify',
      free: 'Free',
      month: '/month',
      current: 'Your current plan',
      choose: 'Choose',
      mostPopular: 'Most popular',
      securePay: 'Secure payment',
      cancelAnytime: 'Cancel anytime',
      termsAccept: 'By subscribing, you accept the terms of use',
      loading: 'Loading...',
      noPlans: 'No plans available',
      unlimited: 'Unlimited',
      promoApplied: 'Discount applied!',
      promoInvalid: 'Invalid code',
      startFree: 'Start free',
      choosePro: 'Choose Pro',
      choosePremium: 'Choose Premium'
    }
  }[language] || {};

  // Charger les plans depuis l'API
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Erreur chargement plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier le code promo
  const verifyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setVerifyingPromo(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const res = await fetch('/api/promo/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() })
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        setPromoSuccess(txt.promoApplied);
        setAppliedDiscount(data);
      } else {
        setPromoError(data.error || txt.promoInvalid);
      }
    } catch (error) {
      setPromoError(txt.promoInvalid);
    } finally {
      setVerifyingPromo(false);
    }
  };

  // Calculer le prix avec réduction
  const getDiscountedPrice = (originalPrice) => {
    if (!appliedDiscount || originalPrice === 0) return originalPrice;

    if (appliedDiscount.discountType === 'percentage') {
      return originalPrice * (1 - appliedDiscount.discountValue / 100);
    } else {
      return Math.max(0, originalPrice - appliedDiscount.discountValue);
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
    if (language === 'ar') return plan.descriptionAr || plan.description;
    if (language === 'fr') return plan.descriptionFr || plan.description;
    return plan.description;
  };

  // Obtenir les features du plan
  const getPlanFeatures = (plan) => {
    if (language === 'ar') return plan.featuresAr || plan.features || [];
    if (language === 'fr') return plan.featuresFr || plan.features || [];
    return plan.features || [];
  };

  // Obtenir les features non incluses
  const getNotIncluded = (plan) => {
    if (language === 'ar') return plan.notIncludedAr || plan.notIncluded || [];
    if (language === 'fr') return plan.notIncludedFr || plan.notIncluded || [];
    return plan.notIncluded || [];
  };

  // Obtenir le texte du bouton
  const getButtonText = (plan) => {
    if (plan.id === currentPlan) return txt.current;
    if (plan.id === 'free') return txt.startFree;
    if (plan.id === 'pro') return txt.choosePro;
    if (plan.id === 'premium') return txt.choosePremium;
    return `${txt.choose} ${getPlanName(plan)}`;
  };

  // Icône du plan
  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'pro': return Zap;
      case 'premium': return Crown;
      default: return User;
    }
  };

  // Couleur du plan
  const getPlanColors = (planId, isPopular) => {
    if (isPopular) {
      return {
        border: 'border-blue-500 shadow-lg shadow-blue-500/20',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'bg-blue-500 text-white',
        button: 'bg-blue-500 hover:bg-blue-600 text-white'
      };
    }
    switch (planId) {
      case 'premium':
        return {
          border: 'border-purple-200 dark:border-purple-800',
          bg: 'bg-white dark:bg-gray-800',
          icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
          button: 'bg-purple-500 hover:bg-purple-600 text-white'
        };
      default:
        return {
          border: 'border-gray-200 dark:border-gray-700',
          bg: 'bg-white dark:bg-gray-800',
          icon: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
          button: 'bg-emerald-500 hover:bg-emerald-600 text-white'
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{txt.title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Promo Code Section */}
        <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800">
          <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <Tag className="w-5 h-5 text-emerald-600" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{txt.havePromo}</p>
              <p className="text-sm text-gray-500">{txt.enterPromo}</p>
            </div>
          </div>
          
          <div className={`flex gap-3 mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder={txt.promoPlaceholder}
              className={`flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 ${isRTL ? 'text-right' : ''}`}
            />
            <button
              onClick={verifyPromoCode}
              disabled={verifyingPromo || !promoCode.trim()}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {verifyingPromo ? <RefreshCw className="w-5 h-5 animate-spin" /> : txt.verify}
            </button>
          </div>

          {promoError && (
            <p className={`text-red-500 text-sm mt-2 ${isRTL ? 'text-right' : ''}`}>{promoError}</p>
          )}
          {promoSuccess && (
            <p className={`text-green-500 text-sm mt-2 ${isRTL ? 'text-right' : ''}`}>{promoSuccess}</p>
          )}
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <span className="ml-3 text-gray-500">{txt.loading}</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{txt.noPlans}</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(plans.length, 3)} gap-6`}>
              {plans.map((plan) => {
                const Icon = getPlanIcon(plan.id);
                const colors = getPlanColors(plan.id, plan.isPopular);
                const isCurrentPlan = plan.id === currentPlan;
                const originalPrice = plan.price;
                const discountedPrice = getDiscountedPrice(originalPrice);
                const hasDiscount = appliedDiscount && originalPrice > 0 && discountedPrice < originalPrice;
                const features = getPlanFeatures(plan);
                const notIncluded = getNotIncluded(plan);

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border-2 ${colors.border} ${colors.bg} p-6 transition-all hover:shadow-lg`}
                  >
                    {/* Badge populaire */}
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {txt.mostPopular}
                        </span>
                      </div>
                    )}

                    {/* Header du plan */}
                    <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.icon}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className={isRTL ? 'text-right' : ''}>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                          {getPlanName(plan)}
                        </h3>
                        <p className="text-sm text-gray-500">{getPlanDescription(plan)}</p>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className={`mb-6 ${isRTL ? 'text-right' : ''}`}>
                      {originalPrice === 0 ? (
                        <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                          {txt.free}
                        </div>
                      ) : (
                        <div>
                          {hasDiscount && (
                            <div className="text-lg text-gray-400 line-through">
                              ${originalPrice.toFixed(2)}{txt.month}
                            </div>
                          )}
                          <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                            ${(hasDiscount ? discountedPrice : originalPrice).toFixed(2)}
                            <span className="text-base font-normal text-gray-500">{txt.month}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Features incluses */}
                    <ul className="space-y-3 mb-6">
                      {features.map((feature, idx) => (
                        <li 
                          key={idx} 
                          className={`flex items-center gap-2 text-sm ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                        >
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                        </li>
                      ))}
                      
                      {/* Features non incluses */}
                      {notIncluded.map((feature, idx) => (
                        <li 
                          key={`not-${idx}`} 
                          className={`flex items-center gap-2 text-sm opacity-50 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                        >
                          <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-400">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Bouton */}
                    <button
                      onClick={() => onSelectPlan && onSelectPlan(plan.id, appliedDiscount?.code)}
                      disabled={isCurrentPlan}
                      className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        isCurrentPlan 
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
                          : colors.button
                      }`}
                    >
                      {getButtonText(plan)}
                      {!isCurrentPlan && plan.isPopular && <Star className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className={`flex items-center justify-center gap-6 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>{txt.securePay}</span>
            </div>
            <span>•</span>
            <span>{txt.cancelAnytime}</span>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">{txt.termsAccept}</p>
        </div>
      </div>
    </div>
  );
}
