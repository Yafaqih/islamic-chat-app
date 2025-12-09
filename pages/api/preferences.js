import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API pour gérer les préférences utilisateur (suggestions intelligentes)
 * GET - Récupérer les préférences
 * POST - Mettre à jour les préférences
 */
export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (req.method === 'GET') {
      // Récupérer les préférences
      return res.status(200).json({
        success: true,
        preferences: user.preferences?.themes || {},
        recentTopics: user.preferences?.recentTopics || [],
        preferredLanguage: user.preferences?.preferredLanguage || 'ar',
        lastUpdated: user.preferences?.updatedAt || null
      });

    } else if (req.method === 'POST') {
      // Mettre à jour les préférences
      const { themes, recentTopics, preferredLanguage } = req.body;

      // Upsert - créer ou mettre à jour
      const updatedPrefs = await prisma.userPreferences.upsert({
        where: { userId: user.id },
        update: {
          themes: themes || {},
          recentTopics: recentTopics || [],
          preferredLanguage: preferredLanguage || 'ar',
          updatedAt: new Date()
        },
        create: {
          userId: user.id,
          themes: themes || {},
          recentTopics: recentTopics || [],
          preferredLanguage: preferredLanguage || 'ar'
        }
      });

      return res.status(200).json({
        success: true,
        preferences: updatedPrefs.themes,
        recentTopics: updatedPrefs.recentTopics,
        message: 'Préférences mises à jour'
      });

    } else if (req.method === 'PATCH') {
      // Mise à jour partielle (ajouter un thème sans écraser les autres)
      const { theme, score, topic } = req.body;

      let currentThemes = user.preferences?.themes || {};
      let currentTopics = user.preferences?.recentTopics || [];

      // Ajouter le score au thème existant
      if (theme && score) {
        currentThemes[theme] = (currentThemes[theme] || 0) + score;
      }

      // Ajouter le topic récent (garder les 20 derniers)
      if (topic) {
        currentTopics = [topic, ...currentTopics.filter(t => t !== topic)].slice(0, 20);
      }

      const updatedPrefs = await prisma.userPreferences.upsert({
        where: { userId: user.id },
        update: {
          themes: currentThemes,
          recentTopics: currentTopics,
          updatedAt: new Date()
        },
        create: {
          userId: user.id,
          themes: currentThemes,
          recentTopics: currentTopics
        }
      });

      return res.status(200).json({
        success: true,
        preferences: updatedPrefs.themes,
        recentTopics: updatedPrefs.recentTopics
      });

    } else {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

  } catch (error) {
    console.error('Preferences API error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    await prisma.$disconnect();
  }
}
