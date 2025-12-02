import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

/**
 * API: Statistiques globales du dashboard admin
 * GET /api/admin/stats?range=7days
 * 
 * Version simplifiée compatible avec le schema existant
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
        startDate.setFullYear(2020);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // 1️⃣ STATISTIQUES UTILISATEURS
    const totalUsers = await prisma.user.count();
    
    // Utilisateurs actifs (avec lastActivity récent, ou createdAt si lastActivity n'existe pas)
    let activeUsers = 0;
    try {
      activeUsers = await prisma.user.count({
        where: {
          OR: [
            { lastActivity: { gte: startDate } },
            { updatedAt: { gte: startDate } }
          ]
        }
      });
    } catch (e) {
      // Si lastActivity n'existe pas, utiliser updatedAt
      activeUsers = await prisma.user.count({
        where: {
          updatedAt: { gte: startDate }
        }
      });
    }
    
    // Nouveaux utilisateurs
    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // 2️⃣ RÉPARTITION ABONNEMENTS
    const subscriptionStats = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _count: {
        subscriptionTier: true
      }
    });

    const subscriptions = {
      free: subscriptionStats.find(s => s.subscriptionTier === 'free')?._count?.subscriptionTier || 0,
      pro: subscriptionStats.find(s => s.subscriptionTier === 'pro')?._count?.subscriptionTier || 0,
      premium: subscriptionStats.find(s => s.subscriptionTier === 'premium')?._count?.subscriptionTier || 0
    };

    // 3️⃣ STATISTIQUES MESSAGES (depuis la table Message)
    let totalMessages = 0;
    let messagesToday = 0;
    
    try {
      totalMessages = await prisma.message.count();
      
      messagesToday = await prisma.message.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });
    } catch (e) {
      // Si la table Message n'existe pas, utiliser messageCount des users
      const msgStats = await prisma.user.aggregate({
        _sum: {
          messageCount: true
        }
      });
      totalMessages = msgStats._sum?.messageCount || 0;
    }

    // 4️⃣ REVENUS ESTIMÉS (basé sur les abonnements)
    // Prix: Pro = $9.99, Premium = $29.99
    const totalRevenue = (subscriptions.pro * 9.99) + (subscriptions.premium * 29.99);
    const mrr = totalRevenue; // MRR simplifié

    // 5️⃣ TAUX DE CONVERSION
    const paidUsers = subscriptions.pro + subscriptions.premium;
    const conversion = totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(2) : 0;

    // 6️⃣ CONVERSATIONS
    let totalConversations = 0;
    try {
      totalConversations = await prisma.conversation.count();
    } catch (e) {
      totalConversations = 0;
    }

    // 📊 RÉPONSE FINALE
    return res.status(200).json({
      // Utilisateurs
      totalUsers,
      activeUsers,
      newUsers,
      
      // Abonnements
      subscriptions,
      
      // Revenus (estimés)
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      mrr: Math.round(mrr * 100) / 100,
      
      // Messages
      messages: {
        total: totalMessages,
        today: messagesToday
      },
      
      // Conversations
      totalConversations,
      
      // Métriques
      conversion: parseFloat(conversion),
      
      // Metadata
      dateRange: range,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur récupération stats:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
