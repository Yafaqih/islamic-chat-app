import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Gestion code promo individuel
 * GET /api/admin/promo/[id] - Détails
 * PATCH /api/admin/promo/[id] - Modifier
 * DELETE /api/admin/promo/[id] - Supprimer
 */
export default async function handler(req, res) {
  try {
    // Vérification admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID requis' });
    }

    // GET - Détails du code promo
    if (req.method === 'GET') {
      const promoCode = await prisma.promoCode.findUnique({
        where: { id }
      });

      if (!promoCode) {
        return res.status(404).json({ error: 'Code promo non trouvé' });
      }

      return res.status(200).json({
        promoCode: {
          ...promoCode,
          discountValue: Number(promoCode.discountValue)
        }
      });
    }

    // PATCH - Modifier le code promo
    if (req.method === 'PATCH') {
      const {
        description,
        isActive,
        maxUses,
        validUntil,
        applicableTiers
      } = req.body;

      const updateData = {};
      
      if (description !== undefined) updateData.description = description;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (maxUses !== undefined) updateData.maxUses = maxUses ? parseInt(maxUses) : null;
      if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;
      if (applicableTiers !== undefined) updateData.applicableTiers = applicableTiers;

      // Mise à jour
      const updatedPromo = await prisma.promoCode.update({
        where: { id },
        data: updateData
      });

      return res.status(200).json({
        success: true,
        promoCode: {
          ...updatedPromo,
          discountValue: Number(updatedPromo.discountValue)
        }
      });
    }

    // DELETE - Supprimer le code promo
    if (req.method === 'DELETE') {
      const promoCode = await prisma.promoCode.findUnique({
        where: { id },
        select: {
          code: true,
          currentUses: true
        }
      });

      if (!promoCode) {
        return res.status(404).json({ error: 'Code promo non trouvé' });
      }

      if (promoCode.currentUses > 0) {
        return res.status(400).json({ 
          error: 'Impossible de supprimer un code qui a été utilisé. Vous pouvez le désactiver à la place.',
          suggestion: 'use_deactivate'
        });
      }

      // Supprimer le code
      await prisma.promoCode.delete({
        where: { id }
      });

      return res.status(200).json({
        success: true,
        message: 'Code promo supprimé'
      });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (error) {
    console.error('❌ Erreur gestion code promo:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Code promo non trouvé' });
    }

    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message
    });
  }
}
