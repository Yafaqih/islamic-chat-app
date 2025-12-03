import { useState, useEffect } from 'react';

// Pays arabes pour le suffixe /شهر
const ARAB_COUNTRIES = ['MA', 'SA', 'AE', 'EG', 'DZ', 'TN', 'KW', 'QA', 'BH', 'OM', 'JO', 'IQ', 'LY', 'SD', 'YE', 'SY', 'PS', 'LB'];

export function usePricing() {
  const [data, setData] = useState({
    country: null,
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
          pro: { price: 9.99, currency: 'USD', formatted: '$9.99' },
          premium: { price: 29.99, currency: 'USD', formatted: '$29.99' }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Vérifier si pays arabe
  const isArabic = ARAB_COUNTRIES.includes(data.country);
  const periodSuffix = isArabic ? '/شهر' : '/mo';

  // Formater le prix avec la période
  const formatWithPeriod = (formatted) => {
    if (!formatted) return '...';
    return `${formatted}${periodSuffix}`;
  };

  // Prix formatés avec période
  const proPrice = formatWithPeriod(data.pro?.formatted);
  const premiumPrice = formatWithPeriod(data.premium?.formatted);

  return {
    // Prix formatés prêts à afficher (ex: "$9.99/mo" ou "9.99 د.م./شهر")
    proPrice,
    premiumPrice,
    
    // Prix bruts (pour calculs)
    proPriceRaw: data.pro?.price,
    premiumPriceRaw: data.premium?.price,
    
    // Devise
    currency: data.pro?.currency || 'USD',
    currencySymbol: data.pro?.formatted?.replace(/[\d.,\s]/g, '').trim() || '$',
    
    // Pays
    country: data.country,
    isArabic,
    
    // État
    loading,
    error,
    
    // Données brutes
    rawData: data
  };
}

export default usePricing;
