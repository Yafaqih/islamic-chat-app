import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

/**
 * API: Statistiques globales du dashboard admin
 * GET /api/admin/stats?range=7days
 * 
 * Paramètres:
 * - range: 'today' | '7days' | '30days' | '90days' | 'all'
 */
export default async function handler(req, res) {
  // Vérifier la méthode
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérifier l'authentification et les droits admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!session.user.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé - Admin requis' });
    }

    const { range = '7days' } = req.query;
    
    // Calculer la date de début selon la période
    const now = new Date();
    const startDate = new Date();
    
    switch(range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        startDate.setFullYear(2020); // Début de l'app
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // 1️⃣ STATISTIQUES UTILISATEURS
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      // Total utilisateurs
      prisma.user.count(),
      
      // Utilisateurs actifs (activité récente)
      prisma.user.count({
        where: {
          lastActivity: { gte: startDate }
        }
      }),
      
      // Nouveaux utilisateurs
      prisma.user.count({
        where: {
          createdAt: { gte: startDate }
        }
      })
    ]);

    // 2️⃣ RÉPARTITION ABONNEMENTS
    const subscriptionStats = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: {
        subscriptionTier: true
      }
    });

    const subscriptions = {
      free: subscriptionStats.find(s => s.subscriptionTier === 'free')?._count.subscriptionTier || 0,
      pro: subscriptionStats.find(s => s.subscriptionTier === 'pro')?._count.subscriptionTier || 0,
      premium: subscriptionStats.find(s => s.subscriptionTier === 'premium')?._count.subscriptionTier || 0
    };

    // 3️⃣ STATISTIQUES REVENUS
    const revenueData = await prisma.subscription.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: 'active'
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    // MRR (Monthly Recurring Revenue)
    const mrrData = await prisma.subscription.aggregate({
      where: {
        status: 'active',
        billingPeriod: 'monthly'
      },
      _sum: {
        amount: true
      }
    });

    // ARR (Annual Recurring Revenue)
    const arrData = await prisma.subscription.aggregate({
      where: {
        status: 'active',
        billingPeriod: 'yearly'
      },
      _sum: {
        amount: true
      }
    });

    const totalRevenue = Number(revenueData._sum.amount || 0);
    const mrr = Number(mrrData._sum.amount || 0);
    const arr = Number(arrData._sum.amount || 0);

    // 4️⃣ STATISTIQUES MESSAGES
    const messageStats = await prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: {
        eventType: 'message_sent',
        timestamp: { gte: startDate }
      },
      _count: true
    });

    const messagesToday = await prisma.analyticsEvent.count({
      where: {
        eventType: 'message_sent',
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Statistiques totales des messages (depuis tous les users)
    const totalMessagesData = await prisma.user.aggregate({
      _sum: {
        totalMessages: true
      }
    });

    const messages = {
      total: totalMessagesData._sum.totalMessages || 0,
      today: messagesToday,
      period: messageStats[0]?._count || 0
    };

    // 5️⃣ TAUX DE CONVERSION
    const paidUsers = subscriptions.pro + subscriptions.premium;
    const conversion = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(2) : 0;

    // 6️⃣ CROISSANCE
    // Utilisateurs du mois précédent
    const previousMonthStart = new Date();
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    previousMonthStart.setDate(1);
    previousMonthStart.setHours(0, 0, 0, 0);

    const previousMonthEnd = new Date();
    previousMonthEnd.setDate(0);
    previousMonthEnd.setHours(23, 59, 59, 999);

    const previousMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      }
    });

    const growthRate = previousMonthUsers > 0 
      ? (((newUsers - previousMonthUsers) / previousMonthUsers) * 100).toFixed(1)
      : '+100';

    // 7️⃣ CHURN RATE (Taux de désabonnement)
    const cancelledSubscriptions = await prisma.subscription.count({
      where: {
        status: 'cancelled',
        cancelledAt: { gte: startDate }
      }
    });

    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: 'active'
      }
    });

    const churnRate = activeSubscriptions > 0
      ? ((cancelledSubscriptions / activeSubscriptions) * 100).toFixed(2)
      : 0;

    // 📊 RÉPONSE FINALE
    return res.status(200).json({
      // Utilisateurs
      totalUsers,
      activeUsers,
      newUsers,
      growthRate: `${growthRate > 0 ? '+' : ''}${growthRate}%`,
      
      // Abonnements
      subscriptions,
      
      // Revenus
      totalRevenue: Math.round(totalRevenue),
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      
      // Messages
      messages,
      
      // Métriques
      conversion: parseFloat(conversion),
      churnRate: parseFloat(churnRate),
      
      // Metadata
      dateRange: range,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
