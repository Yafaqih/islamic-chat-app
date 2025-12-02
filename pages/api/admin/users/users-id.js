import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Gestion utilisateur individuel
 * GET /api/admin/users/[id] - Obtenir détails
 * PATCH /api/admin/users/[id] - Modifier utilisateur
 * DELETE /api/admin/users/[id] - Supprimer utilisateur
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
      return res.status(400).json({ error: 'ID utilisateur requis' });
    }

    // GET - Obtenir détails utilisateur
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          conversations: {
            orderBy: { updatedAt: 'desc' },
            take: 5,
            select: {
              id: true,
              title: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      return res.status(200).json({
        user: {
          ...user,
          revenue: user.revenue ? Number(user.revenue) : 0
        }
      });
    }

    // PATCH - Modifier utilisateur
    if (req.method === 'PATCH') {
      const {
        name,
        email,
        subscriptionTier,
        subscriptionStatus,
        messageCount,
        isAdmin,
        isBlocked,
        blockedReason
      } = req.body;

      // Préparer les données de mise à jour
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (subscriptionTier !== undefined) updateData.subscriptionTier = subscriptionTier;
      if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
      if (messageCount !== undefined) updateData.messageCount = parseInt(messageCount);
      if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
      if (isBlocked !== undefined) {
        updateData.isBlocked = isBlocked;
        if (isBlocked) {
          updateData.blockedAt = new Date();
          updateData.blockedReason = blockedReason || 'Bloqué par admin';
        } else {
          updateData.blockedAt = null;
          updateData.blockedReason = null;
        }
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      });

      return res.status(200).json({
        success: true,
        user: {
          ...updatedUser,
          revenue: updatedUser.revenue ? Number(updatedUser.revenue) : 0
        }
      });
    }

    // DELETE - Supprimer utilisateur
    if (req.method === 'DELETE') {
      // Vérifier que l'utilisateur n'est pas admin
      const user = await prisma.user.findUnique({
        where: { id },
        select: { isAdmin: true, email: true }
      });

      if (user?.isAdmin) {
        return res.status(400).json({ 
          error: 'Impossible de supprimer un compte administrateur' 
        });
      }

      // Supprimer l'utilisateur (cascade sur les relations)
      await prisma.user.delete({
        where: { id }
      });

      return res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (error) {
    console.error('❌ Erreur gestion utilisateur:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message
    });
  }
}
