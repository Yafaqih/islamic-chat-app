// pages/api/prices.js
// Récupère les prix directement depuis LemonSqueezy

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_KEY = process.env.LEMONSQUEEZY_API_KEY;
    const PRO_VARIANT_ID = process.env.LEMONSQUEEZY_PRO_VARIANT_ID;
    const PREMIUM_VARIANT_ID = process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID;

    if (!API_KEY) {
      console.error('LEMONSQUEEZY_API_KEY not configured');
      return res.status(200).json({
        pro: { price: 9.99, currency: 'USD', formatted: '$9.99' },
        premium: { price: 29.99, currency: 'USD', formatted: '$29.99' }
      });
    }

    const headers = {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    };

    // Récupérer le prix Pro
    let proData = { price: 9.99, currency: 'USD', formatted: '$9.99' };
    if (PRO_VARIANT_ID) {
      try {
        const proResponse = await fetch(
          `https://api.lemonsqueezy.com/v1/variants/${PRO_VARIANT_ID}`,
          { headers, signal: AbortSignal.timeout(5000) }
        );
        
        if (proResponse.ok) {
          const proResult = await proResponse.json();
          const attrs = proResult.data?.attributes;
          if (attrs) {
            proData = {
              price: attrs.price / 100, // LemonSqueezy retourne en cents
              currency: attrs.currency || 'USD',
              formatted: attrs.price_formatted || `$${(attrs.price / 100).toFixed(2)}`,
              interval: attrs.interval || 'month',
              name: attrs.name
            };
          }
        }
      } catch (e) {
        console.error('Error fetching Pro variant:', e);
      }
    }

    // Récupérer le prix Premium
    let premiumData = { price: 29.99, currency: 'USD', formatted: '$29.99' };
    if (PREMIUM_VARIANT_ID) {
      try {
        const premiumResponse = await fetch(
          `https://api.lemonsqueezy.com/v1/variants/${PREMIUM_VARIANT_ID}`,
          { headers, signal: AbortSignal.timeout(5000) }
        );
        
        if (premiumResponse.ok) {
          const premiumResult = await premiumResponse.json();
          const attrs = premiumResult.data?.attributes;
          if (attrs) {
            premiumData = {
              price: attrs.price / 100,
              currency: attrs.currency || 'USD',
              formatted: attrs.price_formatted || `$${(attrs.price / 100).toFixed(2)}`,
              interval: attrs.interval || 'month',
              name: attrs.name
            };
          }
        }
      } catch (e) {
        console.error('Error fetching Premium variant:', e);
      }
    }

    // Détecter le pays
    let country = 'US';
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null;
    
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ip}/country/`, {
          signal: AbortSignal.timeout(3000)
        });
        if (geoResponse.ok) {
          country = await geoResponse.text();
        }
      } catch (e) {
        console.error('Geo lookup failed:', e);
      }
    }

    res.status(200).json({
      country,
      pro: proData,
      premium: premiumData
    });

  } catch (error) {
    console.error('Prices API error:', error);
    
    res.status(200).json({
      country: 'US',
      pro: { price: 9.99, currency: 'USD', formatted: '$9.99' },
      premium: { price: 29.99, currency: 'USD', formatted: '$29.99' }
    });
  }
}
