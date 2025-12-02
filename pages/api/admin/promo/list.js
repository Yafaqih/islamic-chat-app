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

    // Vérifier si la table PromoCode existe
    let promoCodes = [];
    let stats = {
      total: 0,
      active: 0,
      totalUses: 0
    };

    try {
      promoCodes = await prisma.promoCode.findMany({
        orderBy: { createdAt: 'desc' }
      });

      // Enrichir avec des statistiques
      const enrichedPromoCodes = promoCodes.map(promo => {
        const now = new Date();
        const isExpired = promo.validUntil && new Date(promo.validUntil) < now;
        const maxReached = promo.maxUses && promo.currentUses >= promo.maxUses;
        
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
          createdAt: promo.createdAt,
          stats: {
            isExpired,
            maxReached,
            canBeUsed: promo.isActive && !isExpired && !maxReached,
            usageRate: promo.maxUses 
              ? Math.round((promo.currentUses / promo.maxUses) * 100) 
              : null
          }
        };
      });

      stats = {
        total: promoCodes.length,
        active: promoCodes.filter(p => p.isActive).length,
        totalUses: promoCodes.reduce((sum, p) => sum + (p.currentUses || 0), 0)
      };

      return res.status(200).json({
        promoCodes: enrichedPromoCodes,
        stats
      });

    } catch (e) {
      // Si la table n'existe pas encore
      console.log('Table PromoCode non trouvée, retour liste vide');
      return res.status(200).json({
        promoCodes: [],
        stats: {
          total: 0,
          active: 0,
          totalUses: 0
        },
        message: 'Table PromoCode non initialisée'
      });
    }

  } catch (error) {
    console.error('❌ Erreur récupération codes promo:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message
    });
  }
}
