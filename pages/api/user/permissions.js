// pages/api/user/permissions.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

/**
 * API: Récupérer les permissions de l'utilisateur connecté
 * GET /api/user/permissions
 * 
 * Retourne les permissions basées sur le tier de l'utilisateur
 */

// Permissions par défaut
const DEFAULT_PERMISSIONS = {
  free: {
    dailyMessageLimit: 10,
    quranAccess: true,
    prayerTimes: true,
    hadithAccess: false,
    qiblaCompass: false,
    saveConversations: false,
    exportPDF: false,
    prioritySupport: false,
    fastSupport: false,
    advancedResponses: false,
    responsesWithReferences: false,
    khutbaPreparation: false,
    exclusiveFeatures: false,
    mosqueFinder: true,
    darkMode: true,
    multiLanguage: true
  },
  pro: {
    dailyMessageLimit: 100,
    quranAccess: true,
    prayerTimes: true,
    hadithAccess: true,
    qiblaCompass: true,
    saveConversations: true,
    exportPDF: false,
    prioritySupport: false,
    fastSupport: true,
    advancedResponses: true,
    responsesWithReferences: false,
    khutbaPreparation: false,
    exclusiveFeatures: false,
    mosqueFinder: true,
    darkMode: true,
    multiLanguage: true
  },
  premium: {
    dailyMessageLimit: -1,
    quranAccess: true,
    prayerTimes: true,
    hadithAccess: true,
    qiblaCompass: true,
    saveConversations: true,
    exportPDF: true,
    prioritySupport: true,
    fastSupport: true,
    advancedResponses: true,
    responsesWithReferences: true,
    khutbaPreparation: true,
    exclusiveFeatures: true,
    mosqueFinder: true,
    darkMode: true,
    multiLanguage: true
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer la session
    const session = await getServerSession(req, res, authOptions);
    
    // Utilisateur non connecté = permissions free
    const userTier = session?.user?.subscriptionTier || 'free';

    // Récupérer les permissions configurées
    let allPermissions = DEFAULT_PERMISSIONS;

    try {
      const savedPermissions = await prisma.settings.findUnique({
        where: { key: 'plan_permissions' }
      });

      if (savedPermissions?.value) {
        allPermissions = JSON.parse(savedPermissions.value);
      }
    } catch (e) {
      console.log('Using default permissions');
    }

    // Récupérer les permissions pour le tier de l'utilisateur
    const userPermissions = allPermissions[userTier] || allPermissions.free;

    // Récupérer le compteur de messages du jour
    let messagesUsedToday = 0;
    if (session?.user?.id) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const messageCount = await prisma.message.count({
          where: {
            conversation: {
              userId: session.user.id
            },
            role: 'user',
            createdAt: {
              gte: today
            }
          }
        });

        messagesUsedToday = messageCount;
      } catch (e) {
        console.log('Error counting messages:', e.message);
      }
    }

    // Calculer les messages restants
    const dailyLimit = userPermissions.dailyMessageLimit;
    const messagesRemaining = dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - messagesUsedToday);
    const canSendMessage = dailyLimit === -1 || messagesRemaining > 0;

    return res.status(200).json({
      tier: userTier,
      permissions: userPermissions,
      usage: {
        messagesUsedToday,
        messagesRemaining,
        dailyLimit,
        canSendMessage
      }
    });

  } catch (error) {
    console.error('❌ Erreur permissions utilisateur:', error);
    
    // En cas d'erreur, retourner les permissions free
    return res.status(200).json({
      tier: 'free',
      permissions: DEFAULT_PERMISSIONS.free,
      usage: {
        messagesUsedToday: 0,
        messagesRemaining: 10,
        dailyLimit: 10,
        canSendMessage: true
      }
    });
  }
}
