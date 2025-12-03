// pages/api/prices.js
// Récupère les prix depuis LemonSqueezy et convertit selon le pays du visiteur

// Taux de change approximatifs (base USD)
// Tu peux les mettre à jour manuellement ou utiliser une API de taux de change
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  MAD: 10.0,
  SAR: 3.75,
  AED: 3.67,
  EGP: 50.0,
  DZD: 135.0,
  TND: 3.1,
  KWD: 0.31,
  QAR: 3.64,
  BHD: 0.38,
  OMR: 0.38,
  JOD: 0.71,
  IQD: 1310,
  LYD: 4.85,
  SDG: 601,
  YER: 250,
  SYP: 13000,
  ILS: 3.7,
  XOF: 605,
  XAF: 605,
  NGN: 1550,
  ZAR: 18.5,
  TRY: 32,
  PKR: 280,
  BDT: 110,
  IDR: 15700,
  MYR: 4.7,
  INR: 83,
  MXN: 17.2,
  CHF: 0.88,
};

// Mapping pays -> devise
const COUNTRY_TO_CURRENCY = {
  US: 'USD', CA: 'CAD', MX: 'MXN',
  GB: 'GBP', 
  FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', BE: 'EUR', NL: 'EUR', PT: 'EUR', AT: 'EUR',
  CH: 'CHF',
  MA: 'MAD', SA: 'SAR', AE: 'AED', EG: 'EGP', DZ: 'DZD', TN: 'TND',
  KW: 'KWD', QA: 'QAR', BH: 'BHD', OM: 'OMR', JO: 'JOD',
  IQ: 'IQD', LY: 'LYD', SD: 'SDG', YE: 'YER', SY: 'SYP', PS: 'ILS', LB: 'USD',
  SN: 'XOF', CI: 'XOF', ML: 'XOF', CM: 'XAF',
  NG: 'NGN', ZA: 'ZAR',
  TR: 'TRY', PK: 'PKR', BD: 'BDT', ID: 'IDR', MY: 'MYR', IN: 'INR',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_KEY = process.env.LEMONSQUEEZY_API_KEY;
    const PRO_VARIANT_ID = process.env.LEMONSQUEEZY_PRO_VARIANT_ID;
    const PREMIUM_VARIANT_ID = process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID;

    // 1. Détecter le pays du visiteur via IP
    let country = 'US';
    let currency = 'USD';
    
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null;
    
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: AbortSignal.timeout(3000)
        });
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          country = geoData.country_code || 'US';
        }
      } catch (e) {
        console.error('Geo lookup failed:', e);
      }
    }

    currency = COUNTRY_TO_CURRENCY[country] || 'USD';
    const rate = EXCHANGE_RATES[currency] || 1;

    // 2. Récupérer les prix depuis LemonSqueezy
    let proPriceUSD = 9.99;  // Prix par défaut
    let premiumPriceUSD = 19.99;

    if (API_KEY && PRO_VARIANT_ID) {
      try {
        const headers = {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/vnd.api+json',
        };

        // Prix Pro
        const proResponse = await fetch(
          `https://api.lemonsqueezy.com/v1/variants/${PRO_VARIANT_ID}`,
          { headers, signal: AbortSignal.timeout(5000) }
        );
        if (proResponse.ok) {
          const proData = await proResponse.json();
          proPriceUSD = (proData.data?.attributes?.price || 999) / 100;
        }

        // Prix Premium
        if (PREMIUM_VARIANT_ID) {
          const premiumResponse = await fetch(
            `https://api.lemonsqueezy.com/v1/variants/${PREMIUM_VARIANT_ID}`,
            { headers, signal: AbortSignal.timeout(5000) }
          );
          if (premiumResponse.ok) {
            const premiumData = await premiumResponse.json();
            premiumPriceUSD = (premiumData.data?.attributes?.price || 1999) / 100;
          }
        }
      } catch (e) {
        console.error('LemonSqueezy API error:', e);
      }
    }

    // 3. Convertir les prix
    let proPrice = proPriceUSD * rate;
    let premiumPrice = premiumPriceUSD * rate;

    // Arrondir intelligemment
    if (rate > 100) {
      // Grandes devises (IQD, IDR, etc.) - arrondir aux centaines
      proPrice = Math.round(proPrice / 100) * 100;
      premiumPrice = Math.round(premiumPrice / 100) * 100;
    } else if (rate > 10) {
      // Devises moyennes (MAD, EGP, etc.) - arrondir à l'entier
      proPrice = Math.round(proPrice);
      premiumPrice = Math.round(premiumPrice);
    } else if (rate > 1) {
      // Devises proches (CAD, etc.) - 1 décimale
      proPrice = Math.round(proPrice * 10) / 10;
      premiumPrice = Math.round(premiumPrice * 10) / 10;
    } else {
      // Devises fortes (EUR, GBP, KWD) - 2 décimales
      proPrice = Math.round(proPrice * 100) / 100;
      premiumPrice = Math.round(premiumPrice * 100) / 100;
    }

    // 4. Retourner les données
    res.status(200).json({
      country,
      currency,
      pro: {
        priceUSD: proPriceUSD,
        price: proPrice,
        variantId: PRO_VARIANT_ID
      },
      premium: {
        priceUSD: premiumPriceUSD,
        price: premiumPrice,
        variantId: PREMIUM_VARIANT_ID
      }
    });

  } catch (error) {
    console.error('Prices API error:', error);
    
    // Retourner des valeurs par défaut en cas d'erreur
    res.status(200).json({
      country: 'US',
      currency: 'USD',
      pro: { priceUSD: 9.99, price: 9.99 },
      premium: { priceUSD: 19.99, price: 19.99 }
    });
  }
}
