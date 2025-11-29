import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier la signature du webhook Lemon Squeezy
    // const signature = req.headers['x-signature'];
    
    const { meta, data } = req.body;

    // Gérer les événements de Lemon Squeezy
    if (meta?.event_name === 'order_created' || meta?.event_name === 'subscription_created') {
      const customerEmail = data?.attributes?.user_email;
      const variantId = data?.attributes?.variant_id;

      if (!customerEmail) {
        return res.status(400).json({ error: 'Email manquant' });
      }

      // Déterminer le tier basé sur le variant_id
      let subscriptionTier = 'free';
      if (variantId === 'YOUR_PRO_VARIANT_ID') {
        subscriptionTier = 'pro';
      } else if (variantId === 'YOUR_PREMIUM_VARIANT_ID') {
        subscriptionTier = 'premium';
      }

      // Mettre à jour l'utilisateur
      await prisma.user.update({
        where: { email: customerEmail },
        data: {
          subscriptionTier,
          messageCount: 0 // Réinitialiser le compteur
        }
      });

      return res.status(200).json({ message: 'Webhook traité' });
    }

    return res.status(200).json({ message: 'Event non géré' });
  } catch (error) {
    console.error('Lemon Squeezy webhook error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}