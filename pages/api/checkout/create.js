import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

/**
 * API: Créer une session checkout LemonSqueezy
 * POST /api/checkout/create
 * 
 * Body: { variantId: "123456", promoCode: "PROMO2024" }
 * 
 * Documentation LemonSqueezy:
 * https://docs.lemonsqueezy.com/api/checkouts
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { variantId, promoCode } = req.body;

    if (!variantId) {
      return res.status(400).json({ error: 'variantId requis' });
    }

    // ⚠️ REMPLACEZ PAR VOTRE CLE API LEMONSQUEEZY
    const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
    // ⚠️ REMPLACEZ PAR VOTRE STORE ID
    const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;

    if (!LEMONSQUEEZY_API_KEY) {
      console.error('LEMONSQUEEZY_API_KEY non configurée');
      return res.status(500).json({ error: 'Configuration serveur manquante' });
    }

    // Construire les données du checkout
    const checkoutData = {
      data: {
        type: 'checkouts',
        attributes: {
          // URL de redirection après paiement
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
            desc: true,
            discount: true,
            dark: false,
            subscription_preview: true,
            button_color: '#10b981' // Couleur emerald
          },
          checkout_data: {
            email: session.user.email,
            name: session.user.name || '',
            custom: {
              user_id: session.user.id // Pour identifier l'utilisateur dans le webhook
            }
          },
          product_options: {
            enabled_variants: [parseInt(variantId)],
            redirect_url: `${process.env.NEXTAUTH_URL || 'https://www.yafaqih.app'}/subscription/success`,
            receipt_button_text: 'Retour à Ya Faqih',
            receipt_link_url: `${process.env.NEXTAUTH_URL || 'https://www.yafaqih.app'}`,
            receipt_thank_you_note: 'Merci pour votre abonnement à Ya Faqih !'
          },
          // Expiration du checkout (24h)
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: LEMONSQUEEZY_STORE_ID
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId
            }
          }
        }
      }
    };

    // ✅ Si un code promo est fourni, l'ajouter au checkout
    // Note: Le code doit exister dans LemonSqueezy avec le même nom
    if (promoCode) {
      // Option 1: Ajouter le code promo aux données
      checkoutData.data.attributes.checkout_data.discount_code = promoCode;
      
      // Option 2: Chercher l'ID du discount dans LemonSqueezy (plus robuste)
      // const discountId = await findLemonSqueezyDiscountId(promoCode);
      // if (discountId) {
      //   checkoutData.data.relationships.discount = {
      //     data: { type: 'discounts', id: discountId }
      //   };
      // }
    }

    // Créer le checkout via l'API LemonSqueezy
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`
      },
      body: JSON.stringify(checkoutData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur LemonSqueezy:', data);
      return res.status(response.status).json({ 
        error: data.errors?.[0]?.detail || 'Erreur création checkout' 
      });
    }

    // Retourner l'URL de checkout
    return res.status(200).json({
      success: true,
      checkoutUrl: data.data.attributes.url,
      checkoutId: data.data.id
    });

  } catch (error) {
    console.error('❌ Erreur création checkout:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * Fonction helper pour trouver l'ID d'un discount LemonSqueezy par son code
 * Utile si vous voulez valider que le code existe dans LemonSqueezy
 */
async function findLemonSqueezyDiscountId(code) {
  const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
  const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;

  try {
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/discounts?filter[store_id]=${LEMONSQUEEZY_STORE_ID}&filter[code]=${code}`,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`
        }
      }
    );

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0].id;
    }

    return null;
  } catch (error) {
    console.error('Erreur recherche discount:', error);
    return null;
  }
}
