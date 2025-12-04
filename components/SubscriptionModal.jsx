import React, { useState } from 'react';
import { X, Crown, Check, Sparkles, Zap, Star, Tag, Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * SubscriptionModal - Modal d'abonnement avec prix fixes en USD
 */
export default function SubscriptionModal({ isOpen, onClose, currentTier = 'free' }) {
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState(null);
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ URLs de checkout LemonSqueezy
  const CHECKOUT_URLS = {
    pro: 'https://yafaqih.lemonsqueezy.com/buy/669f5834-1817-42d3-ab4a-a8441db40737',
    premium: 'https://yafaqih.lemonsqueezy.com/buy/c1fd514d-562d-45b0-8dff-c5f1ab34743f'
  };

  // Configuration des plans avec prix fixes en USD
  const plans = [
    {
      id: 'free',
      name: 'مجاني',
      price: 0,
      priceFormatted: 'مجاني',
      description: 'للتجربة والاستكشاف',
      features: [
        '10 رسائل يومياً',
        'إجابات أساسية',
        'الوصول للقرآن الكريم',
        'أوقات الصلاة',
      ],
      limitations: [
        'بدون تصدير PDF',
        'بدون أولوية الدعم',
      ],
      icon: Sparkles,
      color: 'from-gray-500 to-gray-600',
      buttonColor: 'bg-gray-500 hover:bg-gray-600',
      popular: false,
    },
    {
      id: 'pro',
      name: 'احترافي',
      price: 3.99,
      priceFormatted: '$3.99/شهر',
      description: 'للاستخدام المتقدم',
      features: [
        '100 رسالة يومياً',
        'إجابات متقدمة ومفصلة',
        'الوصول للقرآن والأحاديث',
        'أوقات الصلاة واتجاه القبلة',
        'حفظ المحادثات',
        'دعم سريع',
      ],
      limitations: [
        'بدون تصدير PDF',
      ],
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
      popular: true,
      checkoutUrl: CHECKOUT_URLS.pro,
    },
    {
      id: 'premium',
      name: 'مميز',
      price: 5.99,
      priceFormatted: '$5.99/شهر,
      description: 'للمحترفين والمؤسسات',
      features: [
        'رسائل غير محدودة',
        'إجابات متقدمة مع المراجع',
        'الوصول الكامل لجميع المصادر',
        'تصدير المحادثات PDF',
        'أولوية الدعم الفني',
        'ميزات حصرية قادمة',
        'إعداد الخطب المتقدم',
      ],
      limitations: [],
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      buttonColor: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
      popular: false,
      checkoutUrl: CHECKOUT_URLS.premium,
    },
  ];

  // Vérifier le code promo
  const verifyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setPromoStatus('checking');
    setPromoError('');
    setPromoData(null);

    try {
      const response = await fetch('/api/promo/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setPromoStatus('valid');
        setPromoData(data);
      } else {
        setPromoStatus('invalid');
        setPromoError(data.error || 'رمز غير صالح');
      }
    } catch (error) {
      setPromoStatus('invalid');
      setPromoError('خطأ في التحقق من الرمز');
    }
  };

  // Calculer le prix avec réduction
  const getDiscountedPrice = (originalPrice) => {
    if (!promoData || promoStatus !== 'valid') return originalPrice;

    if (promoData.discountType === 'percentage') {
      return originalPrice * (1 - promoData.discountValue / 100);
    } else {
      return Math.max(0, originalPrice - promoData.discountValue);
    }
  };

  // Gérer le checkout
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">اختر خطتك</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">ارتقِ بتجربتك مع المساعد الإسلامي</p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Section Code Promo */}
          <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">هل لديك رمز خصم؟</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">أدخل الرمز للحصول على خصم</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoStatus(null);
                    setPromoError('');
                  }}
                  placeholder="أدخل رمز الخصم"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-right focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  dir="ltr"
                />
                {promoStatus === 'valid' && (
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
                {promoStatus === 'invalid' && (
                  <XCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                )}
              </div>
              <button
                onClick={verifyPromoCode}
                disabled={!promoCode.trim() || promoStatus === 'checking'}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {promoStatus === 'checking' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'تحقق'
                )}
              </button>
            </div>

            {promoStatus === 'valid' && promoData && (
              <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-700 dark:text-green-300 text-sm">
                ✅ تم تطبيق الخصم: {promoData.discountType === 'percentage' ? `${promoData.discountValue}%` : `$${promoData.discountValue}`}
                {promoData.description && ` - ${promoData.description}`}
              </div>
            )}
            {promoStatus === 'invalid' && (
              <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-700 dark:text-red-300 text-sm">
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
                        الأكثر شعبية ⭐
                      </div>
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-4 right-4">
                      <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        خطتك الحالية
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="mb-6">
                      {hasDiscount ? (
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                            ${plan.price}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">/mo</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {plan.priceFormatted}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, idx) => (
                        <div key={idx} className="flex items-center gap-3 opacity-50">
                          <div className="w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <X className="w-3 h-3 text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{limitation}</span>
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
                        'خطتك الحالية'
                      ) : plan.id === 'free' ? (
                        'البدء مجاناً'
                      ) : (
                        <>
                          <span>اختر {plan.name}</span>
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🔒 الدفع آمن ومشفر • يمكنك إلغاء اشتراكك في أي وقت
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              بالاشتراك، أنت توافق على شروط الخدمة وسياسة الخصوصية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
