// pages/api/admin/subscriptions/history.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Historique des abonnements
 * GET /api/admin/subscriptions/history?page=1&limit=20&status=active&search=john
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

    const {
      page = '1',
      limit = '20',
      status = 'all',
      search = '',
      tier = 'all'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Construire les filtres
    const where = {};

    // Filtre par tier (exclure free si on veut voir que les payants)
    if (tier !== 'all') {
      where.subscriptionTier = tier;
    } else {
      // Par défaut, montrer uniquement les abonnés payants
      where.subscriptionTier = { in: ['pro', 'premium'] };
    }

    // Filtre par statut
    if (status !== 'all') {
      where.subscriptionStatus = status;
    }

    // Filtre de recherche
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Récupérer les utilisateurs avec abonnements
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    // Récupérer les prix des plans
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
      // Utiliser les prix par défaut
    }

    // Formater les données pour l'historique
    const subscriptions = users.map(user => ({
      id: `sub_${user.id}`,
      user: {
        id: user.id,
        name: user.name || 'Utilisateur',
        email: user.email,
        image: user.image
      },
      plan: user.subscriptionTier || 'free',
      amount: prices[user.subscriptionTier] || 0,
      status: user.subscriptionStatus || 'active',
      startDate: user.subscriptionStartDate || user.createdAt,
      endDate: user.subscriptionEndDate,
      nextBilling: user.subscriptionEndDate || calculateNextBilling(user.subscriptionStartDate || user.createdAt),
      paymentMethod: 'Stripe' // À personnaliser selon votre intégration
    }));

    return res.status(200).json({
      subscriptions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total
      }
    });

  } catch (error) {
    console.error('❌ Erreur historique abonnements:', error);
    return res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
}

// Calculer la prochaine date de facturation
function calculateNextBilling(startDate) {
  const next = new Date(startDate);
  const now = new Date();
  
  // Avancer mois par mois jusqu'à dépasser aujourd'hui
  while (next <= now) {
    next.setMonth(next.getMonth() + 1);
  }
  
  return next.toISOString();
}
