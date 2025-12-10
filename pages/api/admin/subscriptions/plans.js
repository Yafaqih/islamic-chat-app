// pages/api/admin/subscriptions/plans.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Gestion des plans d'abonnement
 * GET /api/admin/subscriptions/plans - Récupérer les plans
 * PUT /api/admin/subscriptions/plans - Mettre à jour les plans
 */

// Plans par défaut
const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    nameAr: 'مجاني',
    nameFr: 'Gratuit',
    price: 0,
    currency: 'USD',
    interval: 'month',
    messageLimit: 10,
    features: ['10 messages/jour', 'Accès Coran', 'Support basique'],
    featuresAr: ['10 رسائل/يوم', 'الوصول للقرآن', 'دعم أساسي'],
    featuresFr: ['10 messages/jour', 'Accès Coran', 'Support basique'],
    isActive: true,
    color: 'gray',
    order: 1
  },
  {
    id: 'pro',
    name: 'Pro',
    nameAr: 'احترافي',
    nameFr: 'Pro',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    messageLimit: 100,
    features: ['100 messages/jour', 'Accès Coran', 'Support prioritaire', 'Fonctionnalités avancées'],
    featuresAr: ['100 رسالة/يوم', 'الوصول للقرآن', 'دعم أولوية', 'مميزات متقدمة'],
    featuresFr: ['100 messages/jour', 'Accès Coran', 'Support prioritaire', 'Fonctionnalités avancées'],
    isActive: true,
    color: 'blue',
    order: 2
  },
  {
    id: 'premium',
    name: 'Premium',
    nameAr: 'مميز',
    nameFr: 'Premium',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    messageLimit: -1, // illimité
    features: ['Messages illimités', 'Support 24/7', 'Toutes les fonctionnalités', 'Accès prioritaire nouvelles fonctionnalités'],
    featuresAr: ['رسائل غير محدودة', 'دعم 24/7', 'جميع المميزات', 'أولوية الوصول للمميزات الجديدة'],
    featuresFr: ['Messages illimités', 'Support 24/7', 'Toutes les fonctionnalités', 'Accès prioritaire nouvelles fonctionnalités'],
    isActive: true,
    color: 'purple',
    order: 3
  }
];

export default async function handler(req, res) {
  try {
    // Vérification admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // GET - Récupérer les plans
    if (req.method === 'GET') {
      let plans = DEFAULT_PLANS;

      try {
        // Essayer de récupérer les plans personnalisés depuis Settings
        const savedPlans = await prisma.settings.findUnique({
          where: { key: 'subscription_plans' }
        });

        if (savedPlans?.value) {
          plans = JSON.parse(savedPlans.value);
        }
      } catch (e) {
        // Table Settings n'existe pas ou erreur, utiliser les plans par défaut
        console.log('Utilisation des plans par défaut');
      }

      // Compter les abonnés par plan
      const subscriptionStats = await prisma.user.groupBy({
        by: ['subscriptionTier'],
        _count: { subscriptionTier: true }
      });

      // Enrichir les plans avec le nombre d'abonnés
      const enrichedPlans = plans.map(plan => ({
        ...plan,
        subscriberCount: subscriptionStats.find(s => s.subscriptionTier === plan.id)?._count?.subscriptionTier || 0
      }));

      return res.status(200).json({ plans: enrichedPlans });
    }

    // PUT - Mettre à jour les plans
    if (req.method === 'PUT') {
      const { plans } = req.body;

      if (!plans || !Array.isArray(plans)) {
        return res.status(400).json({ error: 'Plans requis' });
      }

      // Valider les plans
      for (const plan of plans) {
        if (!plan.id || !plan.name || plan.price === undefined) {
          return res.status(400).json({ 
            error: 'Chaque plan doit avoir un id, name et price',
            invalidPlan: plan
          });
        }

        // Valider le prix
        if (typeof plan.price !== 'number' || plan.price < 0) {
          return res.status(400).json({ 
            error: 'Le prix doit être un nombre positif',
            plan: plan.id
          });
        }
      }

      try {
        // Sauvegarder dans Settings (upsert)
        await prisma.settings.upsert({
          where: { key: 'subscription_plans' },
          update: { 
            value: JSON.stringify(plans),
            updatedAt: new Date()
          },
          create: {
            key: 'subscription_plans',
            value: JSON.stringify(plans),
            description: 'Configuration des plans d\'abonnement'
          }
        });

        return res.status(200).json({ 
          success: true, 
          message: 'Plans mis à jour avec succès',
          plans 
        });
      } catch (e) {
        // Si la table Settings n'existe pas, la créer
        console.error('Erreur sauvegarde plans:', e);
        
        // Alternative: stocker dans un fichier JSON ou variable d'environnement
        return res.status(500).json({ 
          error: 'Impossible de sauvegarder les plans. Vérifiez que la table Settings existe.',
          details: e.message
        });
      }
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (error) {
    console.error('❌ Erreur gestion plans:', error);
    return res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
}
