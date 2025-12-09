import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

// Singleton Prisma pour éviter de recréer la connexion à chaque requête
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * API pour gérer les préférences utilisateur (suggestions intelligentes)
 * GET - Récupérer les préférences
 * POST - Mettre à jour les préférences
 * PATCH - Mise à jour partielle
 */
export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      // Retourner des préférences vides si non connecté (pas d'erreur)
      return res.status(200).json({
        success: true,
        preferences: {},
        recentTopics: []
      });
    }

    // Récupérer l'utilisateur
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
    } catch (dbError) {
      console.error('DB error finding user:', dbError);
      // Retourner des préférences vides si erreur DB
      return res.status(200).json({
        success: true,
        preferences: {},
        recentTopics: [],
        error: 'db_error'
      });
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        preferences: {},
        recentTopics: []
      });
    }

    if (req.method === 'GET') {
      // Essayer de récupérer les préférences
      try {
        const prefs = await prisma.userPreferences.findUnique({
          where: { userId: user.id }
        });
        
        return res.status(200).json({
          success: true,
          preferences: prefs?.themes || {},
          recentTopics: prefs?.recentTopics || [],
          preferredLanguage: prefs?.preferredLanguage || 'ar'
        });
      } catch (prefsError) {
        // Table n'existe probablement pas encore
        console.error('Preferences table error:', prefsError.message);
        return res.status(200).json({
          success: true,
          preferences: {},
          recentTopics: [],
          note: 'preferences_table_not_ready'
        });
      }

    } else if (req.method === 'POST') {
      const { themes, recentTopics, preferredLanguage } = req.body;

      try {
        const updatedPrefs = await prisma.userPreferences.upsert({
          where: { userId: user.id },
          update: {
            themes: themes || {},
            recentTopics: recentTopics || [],
            preferredLanguage: preferredLanguage || 'ar'
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
          preferences: updatedPrefs.themes
        });
      } catch (upsertError) {
        console.error('Upsert error:', upsertError.message);
        return res.status(200).json({
          success: false,
          preferences: themes || {},
          note: 'saved_locally_only'
        });
      }

    } else if (req.method === 'PATCH') {
      const { theme, score, topic } = req.body;

      try {
        // Récupérer les préférences actuelles
        let currentPrefs = await prisma.userPreferences.findUnique({
          where: { userId: user.id }
        });

        let currentThemes = currentPrefs?.themes || {};
        let currentTopics = currentPrefs?.recentTopics || [];

        // Ajouter le score au thème
        if (theme && score) {
          currentThemes[theme] = (currentThemes[theme] || 0) + score;
        }

        // Ajouter le topic récent
        if (topic) {
          currentTopics = [topic, ...currentTopics.filter(t => t !== topic)].slice(0, 20);
        }

        const updatedPrefs = await prisma.userPreferences.upsert({
          where: { userId: user.id },
          update: {
            themes: currentThemes,
            recentTopics: currentTopics
          },
          create: {
            userId: user.id,
            themes: currentThemes,
            recentTopics: currentTopics
          }
        });

        return res.status(200).json({
          success: true,
          preferences: updatedPrefs.themes
        });
      } catch (patchError) {
        console.error('Patch error:', patchError.message);
        return res.status(200).json({
          success: false,
          note: 'saved_locally_only'
        });
      }

    } else {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }

  } catch (error) {
    console.error('Preferences API error:', error);
    // Toujours retourner 200 avec des données vides pour ne pas bloquer l'UI
    return res.status(200).json({
      success: false,
      preferences: {},
      recentTopics: [],
      error: 'server_error'
    });
  }
}
