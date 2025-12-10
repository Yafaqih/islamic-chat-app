// pages/api/admin/subscriptions/permissions.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Gestion des permissions par plan
 * GET /api/admin/subscriptions/permissions - Récupérer les permissions
 * PUT /api/admin/subscriptions/permissions - Mettre à jour les permissions
 */

// Permissions par défaut
const DEFAULT_PERMISSIONS = {
  free: {
    // Messages
    dailyMessageLimit: 10,
    
    // Fonctionnalités de base
    quranAccess: true,
    prayerTimes: true,
    
    // Fonctionnalités avancées
    hadithAccess: false,
    qiblaCompass: false,
    saveConversations: false,
    exportPDF: false,
    
    // Support
    prioritySupport: false,
    fastSupport: false,
    
    // Autres
    advancedResponses: false,
    responsesWithReferences: false,
    khutbaPreparation: false,
    exclusiveFeatures: false,
    mosqueFinder: true,
    
    // Personnalisation
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
    dailyMessageLimit: -1, // illimité
    
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

// Définition des permissions avec labels multilingues
export const PERMISSION_DEFINITIONS = [
  {
    key: 'dailyMessageLimit',
    type: 'number',
    category: 'messages',
    labels: {
      en: 'Daily message limit',
      fr: 'Limite de messages/jour',
      ar: 'حد الرسائل اليومية'
    },
    description: {
      en: '-1 for unlimited',
      fr: '-1 pour illimité',
      ar: '-1 للرسائل غير المحدودة'
    }
  },
  {
    key: 'quranAccess',
    type: 'boolean',
    category: 'content',
    labels: {
      en: 'Quran access',
      fr: 'Accès au Coran',
      ar: 'الوصول للقرآن'
    }
  },
  {
    key: 'hadithAccess',
    type: 'boolean',
    category: 'content',
    labels: {
      en: 'Hadith access',
      fr: 'Accès aux Hadiths',
      ar: 'الوصول للأحاديث'
    }
  },
  {
    key: 'prayerTimes',
    type: 'boolean',
    category: 'features',
    labels: {
      en: 'Prayer times',
      fr: 'Heures de prière',
      ar: 'أوقات الصلاة'
    }
  },
  {
    key: 'qiblaCompass',
    type: 'boolean',
    category: 'features',
    labels: {
      en: 'Qibla compass',
      fr: 'Boussole Qibla',
      ar: 'بوصلة القبلة'
    }
  },
  {
    key: 'mosqueFinder',
    type: 'boolean',
    category: 'features',
    labels: {
      en: 'Mosque finder',
      fr: 'Recherche de mosquées',
      ar: 'البحث عن المساجد'
    }
  },
  {
    key: 'saveConversations',
    type: 'boolean',
    category: 'features',
    labels: {
      en: 'Save conversations',
      fr: 'Sauvegarder les conversations',
      ar: 'حفظ المحادثات'
    }
  },
  {
    key: 'exportPDF',
    type: 'boolean',
    category: 'features',
    labels: {
      en: 'Export to PDF',
      fr: 'Export PDF',
      ar: 'تصدير PDF'
    }
  },
  {
    key: 'advancedResponses',
    type: 'boolean',
    category: 'ai',
    labels: {
      en: 'Advanced responses',
      fr: 'Réponses avancées',
      ar: 'ردود متقدمة'
    }
  },
  {
    key: 'responsesWithReferences',
    type: 'boolean',
    category: 'ai',
    labels: {
      en: 'Responses with references',
      fr: 'Réponses avec références',
      ar: 'ردود مع مراجع'
    }
  },
  {
    key: 'khutbaPreparation',
    type: 'boolean',
    category: 'ai',
    labels: {
      en: 'Khutba preparation',
      fr: 'Préparation de Khutba',
      ar: 'إعداد الخطبة'
    }
  },
  {
    key: 'fastSupport',
    type: 'boolean',
    category: 'support',
    labels: {
      en: 'Fast support',
      fr: 'Support rapide',
      ar: 'دعم سريع'
    }
  },
  {
    key: 'prioritySupport',
    type: 'boolean',
    category: 'support',
    labels: {
      en: 'Priority support',
      fr: 'Support prioritaire',
      ar: 'دعم أولوية'
    }
  },
  {
    key: 'exclusiveFeatures',
    type: 'boolean',
    category: 'other',
    labels: {
      en: 'Exclusive features',
      fr: 'Fonctionnalités exclusives',
      ar: 'مميزات حصرية'
    }
  },
  {
    key: 'darkMode',
    type: 'boolean',
    category: 'other',
    labels: {
      en: 'Dark mode',
      fr: 'Mode sombre',
      ar: 'الوضع الداكن'
    }
  },
  {
    key: 'multiLanguage',
    type: 'boolean',
    category: 'other',
    labels: {
      en: 'Multi-language',
      fr: 'Multi-langue',
      ar: 'متعدد اللغات'
    }
  }
];

export const PERMISSION_CATEGORIES = {
  messages: { en: 'Messages', fr: 'Messages', ar: 'الرسائل' },
  content: { en: 'Content', fr: 'Contenu', ar: 'المحتوى' },
  features: { en: 'Features', fr: 'Fonctionnalités', ar: 'المميزات' },
  ai: { en: 'AI Responses', fr: 'Réponses IA', ar: 'ردود الذكاء' },
  support: { en: 'Support', fr: 'Support', ar: 'الدعم' },
  other: { en: 'Other', fr: 'Autres', ar: 'أخرى' }
};

export default async function handler(req, res) {
  try {
    // Vérification admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // GET - Récupérer les permissions
    if (req.method === 'GET') {
      let permissions = DEFAULT_PERMISSIONS;

      try {
        const savedPermissions = await prisma.settings.findUnique({
          where: { key: 'plan_permissions' }
        });

        if (savedPermissions?.value) {
          permissions = JSON.parse(savedPermissions.value);
        }
      } catch (e) {
        console.log('Using default permissions');
      }

      return res.status(200).json({
        permissions,
        definitions: PERMISSION_DEFINITIONS,
        categories: PERMISSION_CATEGORIES
      });
    }

    // PUT - Mettre à jour les permissions
    if (req.method === 'PUT') {
      const { permissions } = req.body;

      if (!permissions) {
        return res.status(400).json({ error: 'Permissions requises' });
      }

      // Valider la structure
      for (const tier of ['free', 'pro', 'premium']) {
        if (!permissions[tier]) {
          return res.status(400).json({ error: `Permissions pour ${tier} manquantes` });
        }
      }

      // Sauvegarder
      await prisma.settings.upsert({
        where: { key: 'plan_permissions' },
        update: { 
          value: JSON.stringify(permissions),
          updatedAt: new Date()
        },
        create: {
          key: 'plan_permissions',
          value: JSON.stringify(permissions),
          category: 'subscriptions',
          description: 'Permissions par plan d\'abonnement'
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Permissions mises à jour',
        permissions
      });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });

  } catch (error) {
    console.error('❌ Erreur permissions:', error);
    return res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
}
