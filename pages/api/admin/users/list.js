import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Liste des utilisateurs avec pagination et filtres
 * GET /api/admin/users/list?page=1&limit=50&search=john&tier=pro&status=active
 * 
 * Paramètres:
 * - page: numéro de page (défaut: 1)
 * - limit: nombre d'éléments par page (défaut: 50)
 * - search: recherche par nom ou email
 * - tier: filtre par tier ('free', 'pro', 'premium')
 * - status: filtre par statut ('active', 'cancelled', 'expired', 'suspended')
 * - sortBy: tri ('createdAt', 'totalMessages', 'revenue', 'lastActivity')
 * - sortOrder: ordre ('asc', 'desc')
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

    // Paramètres de requête
    const {
      page = '1',
      limit = '50',
      search = '',
      tier,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Construction des filtres
    const where = {};

    // Filtre de recherche
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filtre par tier
    if (tier) {
      where.subscriptionTier = tier;
    }

    // Filtre par statut
    if (status) {
      where.subscriptionStatus = status;
    }

    // Construction du tri
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Récupération des utilisateurs + total
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
          messageCount: true,
          totalMessages: true,
          revenue: true,
          lastActivity: true,
          isAdmin: true,
          isBlocked: true,
          blockedReason: true,
          createdAt: true,
          updatedAt: true,
          // Inclure les abonnements actifs
          subscriptions: {
            where: { status: 'active' },
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              tier: true,
              amount: true,
              billingPeriod: true,
              startDate: true,
              endDate: true,
              autoRenew: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Enrichir les données des utilisateurs
    const enrichedUsers = users.map(user => ({
      ...user,
      revenue: Number(user.revenue),
      currentSubscription: user.subscriptions[0] || null,
      subscriptions: undefined, // Retirer le tableau pour éviter confusion
      // Calculs supplémentaires
      avgMessagesPerDay: user.lastActivity 
        ? Math.round(user.totalMessages / Math.max(1, Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))))
        : 0,
      daysSinceJoined: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
      daysSinceLastActivity: user.lastActivity 
        ? Math.floor((new Date() - new Date(user.lastActivity)) / (1000 * 60 * 60 * 24))
        : null
    }));

    return res.status(200).json({
      users: enrichedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total
      },
      filters: {
        search: search || null,
        tier: tier || null,
        status: status || null,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
