import React, { useState } from 'react';
import { 
  X, Check, Crown, Zap, Star, Tag, Loader2, 
  CheckCircle, XCircle, Sparkles 
} from 'lucide-react';

/**
 * Modal de sélection d'abonnement avec code promo
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - currentTier: 'free' | 'pro' | 'premium'
 */
export default function SubscriptionModal({ isOpen, onClose, currentTier = 'free' }) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState(null); // null, 'checking', 'valid', 'invalid'
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Configuration des plans
  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: 0,
      period: '',
      icon: Star,
      color: 'gray',
      features: [
        '10 messages par mois',
        'Réponses basiques',
        'Support communauté'
      ],
      buttonText: 'Plan actuel',
      disabled: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      period: '/mois',
      icon: Zap,
      color: 'blue',
      popular: true,
      // ⚠️ REMPLACEZ PAR VOTRE VARIANT ID LEMONSQUEEZY
      lemonSqueezyVariantId: 'VOTRE_VARIANT_ID_PRO',
      features: [
        '100 messages par mois',
        'Réponses détaillées',
        'Sources et références',
        'Support prioritaire'
      ],
      buttonText: 'Choisir Pro'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 29.99,
      period: '/mois',
      icon: Crown,
      color: 'purple',
      // ⚠️ REMPLACEZ PAR VOTRE VARIANT ID LEMONSQUEEZY
      lemonSqueezyVariantId: 'VOTRE_VARIANT_ID_PREMIUM',
      features: [
        'Messages illimités',
        'Réponses approfondies',
        'Export PDF',
        'Support VIP 24/7',
        'Accès anticipé nouveautés'
      ],
      buttonText: 'Choisir Premium'
    }
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
          code: promoCode,
          tier: selectedTier 
        })
      });

      const data = await response.json();

      if (data.valid) {
        setPromoStatus('valid');
        setPromoData(data);
      } else {
        setPromoStatus('invalid');
        setPromoError(data.error || 'Code invalide');
      }
    } catch (error) {
      setPromoStatus('invalid');
      setPromoError('Erreur de vérification');
    }
  };

  // Calculer le prix avec réduction
  const getDiscountedPrice = (originalPrice) => {
    if (!promoData || promoStatus !== 'valid') return null;

    if (promoData.discountType === 'percentage') {
      const discount = originalPrice * (promoData.discountValue / 100);
      return (originalPrice - discount).toFixed(2);
    } else {
      return Math.max(0, originalPrice - promoData.discountValue).toFixed(2);
    }
  };

  // Gérer le checkout LemonSqueezy
  const handleCheckout = async (plan) => {
    if (plan.disabled || plan.id === 'free') return;

    setIsLoading(true);
    setSelectedTier(plan.id);

    try {
      // Construire l'URL de checkout LemonSqueezy
      // ⚠️ REMPLACEZ PAR VOTRE STORE URL
      const storeUrl = 'https://votre-store.lemonsqueezy.com/checkout/buy';
      
      // Paramètres de base
      const params = new URLSearchParams({
        // Variant ID du produit
        variant: plan.lemonSqueezyVariantId,
        // Embed mode (optionnel)
        embed: '1',
        // Pré-remplir l'email si disponible
        // 'checkout[email]': session?.user?.email || '',
      });

      // ✅ AJOUTER LE CODE PROMO SI VALIDE
      if (promoStatus === 'valid' && promoData) {
        // LemonSqueezy utilise 'discount_code' comme paramètre
        params.append('discount_code', promoData.code);
      }

      // URL finale
      const checkoutUrl = `${storeUrl}/${plan.lemonSqueezyVariantId}?${params.toString()}`;

      // Option 1: Redirection
      window.location.href = checkoutUrl;

      // Option 2: Ouvrir dans une nouvelle fenêtre
      // window.open(checkoutUrl, '_blank');

      // Option 3: Utiliser LemonSqueezy.js (si installé)
      // if (window.LemonSqueezy) {
      //   window.LemonSqueezy.Url.Open(checkoutUrl);
      // }

    } catch (error) {
      console.error('Erreur checkout:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Alternative: Utiliser l'API pour créer une session checkout
  const handleCheckoutViaAPI = async (plan) => {
    if (plan.disabled || plan.id === 'free') return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: plan.lemonSqueezyVariantId,
          promoCode: promoStatus === 'valid' ? promoData.code : null
        })
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Erreur création checkout');
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Choisissez votre plan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Débloquez tout le potentiel de Ya Faqih
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Code Promo */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              Vous avez un code promo ?
            </span>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoStatus(null);
                  setPromoError('');
                }}
                placeholder="Entrez votre code"
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl font-mono uppercase tracking-wider
                  ${promoStatus === 'valid' 
                    ? 'border-green-500 focus:border-green-500' 
                    : promoStatus === 'invalid'
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-emerald-500'
                  }
                  text-gray-800 dark:text-gray-200 focus:outline-none transition-all`}
              />
              
              {/* Icône de statut */}
              {promoStatus === 'valid' && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
              {promoStatus === 'invalid' && (
                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>
            
            <button
              onClick={verifyPromoCode}
              disabled={!promoCode.trim() || promoStatus === 'checking'}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold
                hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all flex items-center gap-2"
            >
              {promoStatus === 'checking' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Appliquer'
              )}
            </button>
          </div>

          {/* Message de statut */}
          {promoStatus === 'valid' && promoData && (
            <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">
                Code valide ! 
                {promoData.discountType === 'percentage' 
                  ? ` -${promoData.discountValue}% sur votre abonnement`
                  : ` -$${promoData.discountValue} sur votre abonnement`
                }
              </span>
            </div>
          )}
          
          {promoStatus === 'invalid' && promoError && (
            <div className="mt-3 text-red-600 dark:text-red-400 text-sm">
              {promoError}
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = plan.id === currentTier;
              const discountedPrice = getDiscountedPrice(plan.price);
              
              const colors = {
                gray: {
                  bg: 'bg-gray-100 dark:bg-gray-800',
                  icon: 'text-gray-600 dark:text-gray-400',
                  border: 'border-gray-200 dark:border-gray-700'
                },
                blue: {
                  bg: 'bg-blue-100 dark:bg-blue-900/30',
                  icon: 'text-blue-600 dark:text-blue-400',
                  border: 'border-blue-500'
                },
                purple: {
                  bg: 'bg-purple-100 dark:bg-purple-900/30',
                  icon: 'text-purple-600 dark:text-purple-400',
                  border: 'border-purple-500'
                }
              };

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-6 transition-all
                    ${plan.popular 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                      : 'border-gray-200 dark:border-gray-700'
                    }
                    ${isCurrentPlan ? 'opacity-60' : 'hover:shadow-lg'}
                  `}
                >
                  {/* Badge populaire */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                      Populaire
                    </div>
                  )}

                  {/* Icône et nom */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 ${colors[plan.color].bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${colors[plan.color].icon}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {plan.name}
                      </h3>
                      {isCurrentPlan && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Plan actuel
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="mb-6">
                    {discountedPrice && plan.price > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                          ${discountedPrice}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          ${plan.price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {plan.period}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                          {plan.price === 0 ? 'Gratuit' : `$${plan.price}`}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {plan.period}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className={`w-5 h-5 mt-0.5 ${colors[plan.color].icon}`} />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Bouton */}
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={isCurrentPlan || plan.disabled || isLoading}
                    className={`w-full py-3 rounded-xl font-semibold transition-all
                      ${isCurrentPlan || plan.disabled
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : plan.color === 'blue'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : plan.color === 'purple'
                        ? 'bg-purple-500 hover:bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300'
                      }
                      ${isLoading && selectedTier === plan.id ? 'opacity-50' : ''}
                    `}
                  >
                    {isLoading && selectedTier === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Chargement...
                      </span>
                    ) : isCurrentPlan ? (
                      'Plan actuel'
                    ) : (
                      plan.buttonText
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Paiement sécurisé via LemonSqueezy • Annulation possible à tout moment
          </p>
        </div>
      </div>
    </div>
  );
}
