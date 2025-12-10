// pages/api/admin/subscriptions/[userId].js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Gestion de l'abonnement d'un utilisateur
 * GET /api/admin/subscriptions/[userId] - Détails de l'abonnement
 * PATCH /api/admin/subscriptions/[userId] - Modifier l'abonnement
 */
export default async function handler(req, res) {
  try {
    // Vérification admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'ID utilisateur requis' });
    }

    // GET - Détails de l'abonnement
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      return res.status(200).json({ user });
    }

    // PATCH - Modifier l'abonnement
    if (req.method === 'PATCH') {
      const {
        subscriptionTier,
        subscriptionStatus,
        subscriptionEndDate,
        messageCount,
        reason
      } = req.body;

      // Vérifier que l'utilisateur existe
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, subscriptionTier: true }
      });

      if (!existingUser) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Préparer les données de mise à jour
      const updateData = {};

      if (subscriptionTier !== undefined) {
        // Valider le tier
        if (!['free', 'pro', 'premium'].includes(subscriptionTier)) {
          return res.status(400).json({ error: 'Tier invalide. Utilisez: free, pro, ou premium' });
        }
        updateData.subscriptionTier = subscriptionTier;

        // Si upgrade vers un plan payant, définir la date de début
        if (subscriptionTier !== 'free' && existingUser.subscriptionTier === 'free') {
          updateData.subscriptionStartDate = new Date();
        }
      }

      if (subscriptionStatus !== undefined) {
        // Valider le statut
        if (!['active', 'cancelled', 'expired', 'trial'].includes(subscriptionStatus)) {
          return res.status(400).json({ error: 'Statut invalide' });
        }
        updateData.subscriptionStatus = subscriptionStatus;
      }

      if (subscriptionEndDate !== undefined) {
        updateData.subscriptionEndDate = subscriptionEndDate ? new Date(subscriptionEndDate) : null;
      }

      if (messageCount !== undefined) {
        updateData.messageCount = parseInt(messageCount);
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
          messageCount: true
        }
      });

      // Logger l'action admin (optionnel - si vous avez une table de logs)
      try {
        await prisma.adminLog.create({
          data: {
            action: 'UPDATE_SUBSCRIPTION',
            adminId: session.user.id,
            targetUserId: userId,
            details: JSON.stringify({
              previousTier: existingUser.subscriptionTier,
              newTier: subscriptionTier,
              reason: reason || 'Modification admin'
            }),
            createdAt: new Date()
          }
        });
      } catch (e) {
        // Table AdminLog n'existe peut-être pas, ignorer
      }

      return res.status(200).json({
        success: true,
        message: 'Abonnement mis à jour avec succès',
        user: updatedUser
      });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (error) {
    console.error('❌ Erreur gestion abonnement:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    return res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
}
