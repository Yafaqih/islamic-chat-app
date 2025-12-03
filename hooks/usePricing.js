import { useState, useEffect } from 'react';

// Symboles de devises
const CURRENCY_SYMBOLS = {
  USD: { symbol: '$', position: 'before' },
  EUR: { symbol: '€', position: 'after' },
  GBP: { symbol: '£', position: 'before' },
  CAD: { symbol: 'CA$', position: 'before' },
  CHF: { symbol: 'CHF', position: 'before' },
  MAD: { symbol: 'د.م.', position: 'after' },
  SAR: { symbol: 'ر.س', position: 'after' },
  AED: { symbol: 'د.إ', position: 'after' },
  EGP: { symbol: 'ج.م', position: 'after' },
  DZD: { symbol: 'د.ج', position: 'after' },
  TND: { symbol: 'د.ت', position: 'after' },
  KWD: { symbol: 'د.ك', position: 'after' },
  QAR: { symbol: 'ر.ق', position: 'after' },
  BHD: { symbol: 'د.ب', position: 'after' },
  OMR: { symbol: 'ر.ع', position: 'after' },
  JOD: { symbol: 'د.أ', position: 'after' },
  IQD: { symbol: 'د.ع', position: 'after' },
  LYD: { symbol: 'د.ل', position: 'after' },
  SDG: { symbol: 'ج.س', position: 'after' },
  YER: { symbol: 'ر.ي', position: 'after' },
  SYP: { symbol: 'ل.س', position: 'after' },
  ILS: { symbol: '₪', position: 'before' },
  XOF: { symbol: 'CFA', position: 'after' },
  XAF: { symbol: 'FCFA', position: 'after' },
  NGN: { symbol: '₦', position: 'before' },
  ZAR: { symbol: 'R', position: 'before' },
  TRY: { symbol: '₺', position: 'before' },
  PKR: { symbol: 'Rs', position: 'before' },
  BDT: { symbol: '৳', position: 'before' },
  IDR: { symbol: 'Rp', position: 'before' },
  MYR: { symbol: 'RM', position: 'before' },
  INR: { symbol: '₹', position: 'before' },
  MXN: { symbol: 'MX$', position: 'before' },
};

const ARAB_COUNTRIES = ['MA', 'SA', 'AE', 'EG', 'DZ', 'TN', 'KW', 'QA', 'BH', 'OM', 'JO', 'IQ', 'LY', 'SD', 'YE', 'SY', 'PS', 'LB'];

export function usePricing() {
  const [data, setData] = useState({
    country: null,
    currency: 'USD',
    pro: null,
    premium: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Vérifier le cache (valide 1 heure)
        const cached = localStorage.getItem('pricingData');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.timestamp && Date.now() - parsed.timestamp < 60 * 60 * 1000) {
            setData(parsed.data);
            setLoading(false);
            return;
          }
        }

        // Appeler l'API
        const response = await fetch('/api/prices');
        if (!response.ok) throw new Error('Failed to fetch prices');
        
        const result = await response.json();
        setData(result);

        // Mettre en cache
        localStorage.setItem('pricingData', JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));

      } catch (err) {
        console.error('Error fetching prices:', err);
        setError(err.message);
        
        // Valeurs par défaut
        setData({
          country: 'US',
          currency: 'USD',
          pro: { price: 9.99 },
          premium: { price: 19.99 }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Obtenir le symbole de devise
  const currencyInfo = CURRENCY_SYMBOLS[data.currency] || CURRENCY_SYMBOLS.USD;

  // Vérifier si pays arabe
  const isArabic = ARAB_COUNTRIES.includes(data.country);

  // Formater un prix
  const formatPrice = (amount, period = null) => {
    if (amount === null || amount === undefined) return '...';

    let displayAmount;
    if (Number.isInteger(amount)) {
      displayAmount = amount;
    } else {
      displayAmount = amount % 1 === 0 ? amount : amount.toFixed(2);
    }

    let formatted;
    if (currencyInfo.position === 'before') {
      formatted = `${currencyInfo.symbol}${displayAmount}`;
    } else {
      formatted = `${displayAmount} ${currencyInfo.symbol}`;
    }

    if (period) {
      const periodText = {
        month: isArabic ? '/شهر' : '/mo',
        year: isArabic ? '/سنة' : '/yr'
      };
      formatted += periodText[period] || '';
    }

    return formatted;
  };

  return {
    // Prix formatés prêts à afficher
    proPrice: formatPrice(data.pro?.price, 'month'),
    premiumPrice: formatPrice(data.premium?.price, 'month'),
    
    // Prix bruts (pour calculs)
    proPriceRaw: data.pro?.price,
    premiumPriceRaw: data.premium?.price,
    
    // Infos devise
    currency: data.currency,
    currencySymbol: currencyInfo.symbol,
    
    // Infos pays
    country: data.country,
    isArabic,
    
    // État
    loading,
    error,
    
    // Fonction utilitaire
    formatPrice
  };
}

export default usePricing;
