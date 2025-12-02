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
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          conversations: {
            orderBy: { updatedAt: 'desc' },
            take: 5,
            select: {
              id: true,
              title: true,
              isFavorite: true,
              createdAt: true,
              updatedAt: true
            }
          },
          promoUsage: {
            include: {
              promoCode: {
                select: {
                  code: true,
                  description: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Calculer des statistiques supplémentaires
      const stats = {
        totalSpent: Number(user.revenue),
        activeSubscription: user.subscriptions.find(s => s.status === 'active'),
        subscriptionHistory: user.subscriptions,
        recentConversations: user.conversations,
        promoCodesUsed: user.promoUsage.length,
        accountAge: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
      };

      return res.status(200).json({
        user: {
          ...user,
          revenue: Number(user.revenue)
        },
        stats
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
      if (messageCount !== undefined) updateData.messageCount = messageCount;
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

      // Logger l'action admin
      await prisma.adminLog.create({
        data: {
          adminId: session.user.id,
          action: 'user_update',
          targetType: 'user',
          targetId: id,
          details: {
            changes: updateData,
            changedBy: session.user.email
          },
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        }
      });

      return res.status(200).json({
        success: true,
        user: {
          ...updatedUser,
          revenue: Number(updatedUser.revenue)
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

      // Logger l'action
      await prisma.adminLog.create({
        data: {
          adminId: session.user.id,
          action: 'user_delete',
          targetType: 'user',
          targetId: id,
          details: {
            deletedEmail: user.email,
            deletedBy: session.user.email
          },
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (error) {
    console.error('❌ Erreur gestion utilisateur:', error);
    
    // Erreur spécifique : utilisateur non trouvé
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Erreur spécifique : email déjà utilisé
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}