// pages/api/admin/subscriptions/stats.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Statistiques des abonnements
 * GET /api/admin/subscriptions/stats
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérification admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Compter les utilisateurs par tier
    const subscriptionStats = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: { subscriptionTier: true }
    });

    const byPlan = {
      free: subscriptionStats.find(s => s.subscriptionTier === 'free')?._count?.subscriptionTier || 0,
      pro: subscriptionStats.find(s => s.subscriptionTier === 'pro')?._count?.subscriptionTier || 0,
      premium: subscriptionStats.find(s => s.subscriptionTier === 'premium')?._count?.subscriptionTier || 0
    };

    const totalSubscribers = byPlan.free + byPlan.pro + byPlan.premium;
    const activeSubscriptions = byPlan.pro + byPlan.premium;

    // Récupérer les prix des plans depuis Settings ou utiliser les valeurs par défaut
    let prices = { free: 0, pro: 9.99, premium: 29.99 };
    try {
      const plansSettings = await prisma.settings.findUnique({
        where: { key: 'subscription_plans' }
      });
      if (plansSettings?.value) {
        const savedPlans = JSON.parse(plansSettings.value);
        prices = {
          free: savedPlans.find(p => p.id === 'free')?.price || 0,
          pro: savedPlans.find(p => p.id === 'pro')?.price || 9.99,
          premium: savedPlans.find(p => p.id === 'premium')?.price || 29.99
        };
      }
    } catch (e) {
      // Table Settings n'existe pas, utiliser les valeurs par défaut
    }

    // Calcul des revenus
    const monthlyRevenue = (byPlan.pro * prices.pro) + (byPlan.premium * prices.premium);
    const yearlyRevenue = monthlyRevenue * 12;

    // Croissance (comparer avec le mois dernier)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthStats = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      where: {
        createdAt: { lt: lastMonth }
      },
      _count: { subscriptionTier: true }
    });

    const lastMonthPaid = (lastMonthStats.find(s => s.subscriptionTier === 'pro')?._count?.subscriptionTier || 0) +
                          (lastMonthStats.find(s => s.subscriptionTier === 'premium')?._count?.subscriptionTier || 0);

    const growth = lastMonthPaid > 0 
      ? (((activeSubscriptions - lastMonthPaid) / lastMonthPaid) * 100).toFixed(1)
      : (activeSubscriptions > 0 ? 100 : 0);

    return res.status(200).json({
      totalSubscribers,
      activeSubscriptions,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      yearlyRevenue: Math.round(yearlyRevenue * 100) / 100,
      byPlan,
      growth: parseFloat(growth),
      prices
    });

  } catch (error) {
    console.error('❌ Erreur stats abonnements:', error);
    return res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
}
