import crypto from 'crypto';
import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérifier la signature du webhook
    const signature = req.headers['x-signature'];
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(JSON.stringify(req.body)).digest('hex');
      
      if (digest !== signature) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { meta, data } = req.body;
    const eventName = meta?.event_name;

    console.log('Lemon Squeezy webhook received:', eventName);

    // Gérer les événements
    if (eventName === 'order_created' || eventName === 'subscription_created') {
      const customerEmail = data?.attributes?.user_email;
      const variantId = data?.attributes?.variant_id?.toString();
      const orderId = data?.id;

      if (!customerEmail) {
        console.error('No customer email in webhook');
        return res.status(400).json({ error: 'Email manquant' });
      }

      // Déterminer le tier selon le variant ID
      let subscriptionTier = 'free';
      const proVariantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID;
      const premiumVariantId = process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID;

      if (variantId === proVariantId) {
        subscriptionTier = 'pro';
      } else if (variantId === premiumVariantId) {
        subscriptionTier = 'premium';
      }

      console.log(`Upgrading ${customerEmail} to ${subscriptionTier}`);

      // Mettre à jour l'utilisateur
      try {
        const updatedUser = await prisma.user.update({
          where: { email: customerEmail },
          data: {
            subscriptionTier,
            messageCount: 0, // Réinitialiser le compteur
          }
        });

        console.log('User upgraded successfully:', updatedUser.id);
      } catch (error) {
        console.error('Error updating user:', error);
        
        // Si l'utilisateur n'existe pas encore, le créer
        if (error.code === 'P2025') {
          await prisma.user.create({
            data: {
              email: customerEmail,
              name: customerEmail.split('@')[0],
              subscriptionTier,
              messageCount: 0,
            }
          });
          console.log('New user created with subscription');
        }
      }

      return res.status(200).json({ message: 'Subscription activated' });
    }

    // Gérer la mise à jour d'abonnement
    if (eventName === 'subscription_updated') {
      const customerEmail = data?.attributes?.user_email;
      const status = data?.attributes?.status;

      if (status === 'cancelled' || status === 'expired') {
        await prisma.user.update({
          where: { email: customerEmail },
          data: {
            subscriptionTier: 'free',
          }
        });
        console.log(`Subscription cancelled for ${customerEmail}`);
      }

      return res.status(200).json({ message: 'Subscription updated' });
    }

    // Gérer l'annulation d'abonnement
    if (eventName === 'subscription_cancelled') {
      const customerEmail = data?.attributes?.user_email;

      await prisma.user.update({
        where: { email: customerEmail },
        data: {
          subscriptionTier: 'free',
        }
      });

      console.log(`Subscription cancelled for ${customerEmail}`);
      return res.status(200).json({ message: 'Subscription cancelled' });
    }

    return res.status(200).json({ message: 'Event received' });
  } catch (error) {
    console.error('Lemon Squeezy webhook error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Important pour Next.js API routes avec body brut
export const config = {
  api: {
    bodyParser: true,
  },
};