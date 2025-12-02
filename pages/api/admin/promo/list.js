import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Liste des codes promo
 * GET /api/admin/promo/list
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

    const { active, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Construction des filtres
    const where = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    // Tri
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Récupérer tous les codes promo
    const promoCodes = await prisma.promoCode.findMany({
      where,
      orderBy,
      include: {
        usage: {
          select: {
            id: true,
            discountApplied: true,
            usedAt: true
          }
        },
        subscriptions: {
          select: {
            id: true,
            amount: true
          }
        }
      }
    });

    // Enrichir avec des statistiques
    const enrichedPromoCodes = promoCodes.map(promo => {
      const now = new Date();
      const isExpired = promo.validUntil && new Date(promo.validUntil) < now;
      const maxReached = promo.maxUses && promo.currentUses >= promo.maxUses;
      
      // Calculer le total des réductions appliquées
      const totalDiscountApplied = promo.usage.reduce(
        (sum, usage) => sum + Number(usage.discountApplied),
        0
      );

      // Calculer le revenu généré (via les subscriptions)
      const revenueGenerated = promo.subscriptions.reduce(
        (sum, sub) => sum + Number(sub.amount),
        0
      );

      return {
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: Number(promo.discountValue),
        maxUses: promo.maxUses,
        currentUses: promo.currentUses,
        validFrom: promo.validFrom,
        validUntil: promo.validUntil,
        isActive: promo.isActive,
        applicableTiers: promo.applicableTiers,
        createdBy: promo.createdBy,
        createdAt: promo.createdAt,
        
        // Statistiques
        stats: {
          isExpired,
          maxReached,
          canBeUsed: promo.isActive && !isExpired && !maxReached,
          usageCount: promo.usage.length,
          totalDiscountApplied: Math.round(totalDiscountApplied * 100) / 100,
          revenueGenerated: Math.round(revenueGenerated * 100) / 100,
          usageRate: promo.maxUses 
            ? Math.round((promo.currentUses / promo.maxUses) * 100) 
            : null
        }
      };
    });

    // Statistiques globales
    const globalStats = {
      total: promoCodes.length,
      active: promoCodes.filter(p => p.isActive).length,
      expired: promoCodes.filter(p => p.validUntil && new Date(p.validUntil) < new Date()).length,
      totalUses: promoCodes.reduce((sum, p) => sum + p.currentUses, 0),
      totalDiscountGiven: Math.round(
        promoCodes.reduce((sum, p) => 
          sum + p.usage.reduce((s, u) => s + Number(u.discountApplied), 0), 0
        ) * 100
      ) / 100
    };

    return res.status(200).json({
      promoCodes: enrichedPromoCodes,
      stats: globalStats
    });

  } catch (error) {
    console.error('❌ Erreur récupération codes promo:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
