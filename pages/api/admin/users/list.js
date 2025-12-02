import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Liste des utilisateurs avec pagination et filtres
 * GET /api/admin/users/list?page=1&limit=20&search=john&tier=pro
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
      limit = '20',
      search = '',
      tier,
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
    if (tier && tier !== 'all') {
      where.subscriptionTier = tier;
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
          messageCount: true,
          createdAt: true,
          updatedAt: true,
          // Nouveaux champs (avec fallback si non existants)
          isAdmin: true,
          lastActivity: true,
          isBlocked: true,
          totalMessages: true,
          subscriptionStatus: true,
          revenue: true,
        }
      }),
      prisma.user.count({ where })
    ]);

    // Enrichir les données des utilisateurs
    const enrichedUsers = users.map(user => ({
      ...user,
      revenue: user.revenue ? Number(user.revenue) : 0,
      totalMessages: user.totalMessages || user.messageCount || 0,
      subscriptionStatus: user.subscriptionStatus || 'active',
      isAdmin: user.isAdmin || false,
      isBlocked: user.isBlocked || false,
    }));

    return res.status(200).json({
      users: enrichedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message
    });
  }
}
