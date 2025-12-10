// pages/api/plans.js
import prisma from '../../lib/prisma';

/**
 * API Publique: Récupérer les plans d'abonnement actifs
 * GET /api/plans
 * 
 * Retourne uniquement les plans avec isActive: true
 */

// Plans par défaut si aucun plan n'est configuré
const DEFAULT_PLANS = [
  {
    id: 'free',
    name: 'Free',
    nameAr: 'مجاني',
    nameFr: 'Gratuit',
    description: 'Pour découvrir',
    descriptionAr: 'للاكتشاف',
    descriptionFr: 'Pour découvrir',
    price: 0,
    currency: 'USD',
    interval: 'month',
    messageLimit: 10,
    features: [
      '10 messages/day',
      'Basic responses',
      'Quran access',
      'Prayer times'
    ],
    featuresAr: [
      '10 رسائل/يوم',
      'ردود أساسية',
      'الوصول للقرآن',
      'أوقات الصلاة'
    ],
    featuresFr: [
      '10 messages/jour',
      'Réponses basiques',
      'Accès au Coran',
      'Heures de prière'
    ],
    notIncluded: ['PDF export', 'Priority support'],
    notIncludedAr: ['تصدير PDF', 'دعم أولوية'],
    notIncludedFr: ['Sans export PDF', 'Sans support prioritaire'],
    isActive: true,
    isPopular: false,
    color: 'gray',
    order: 1
  },
  {
    id: 'pro',
    name: 'Pro',
    nameAr: 'احترافي',
    nameFr: 'Pro',
    description: 'Advanced usage',
    descriptionAr: 'استخدام متقدم',
    descriptionFr: 'Utilisation avancée',
    price: 3.99,
    currency: 'USD',
    interval: 'month',
    messageLimit: 100,
    features: [
      '100 messages/day',
      'Detailed responses',
      'Quran & Hadiths access',
      'Prayer & Qibla',
      'Save conversations',
      'Fast support'
    ],
    featuresAr: [
      '100 رسالة/يوم',
      'ردود مفصلة',
      'الوصول للقرآن والحديث',
      'الصلاة والقبلة',
      'حفظ المحادثات',
      'دعم سريع'
    ],
    featuresFr: [
      '100 messages/jour',
      'Réponses détaillées',
      'Accès Coran et Hadiths',
      'Prière et Qibla',
      'Sauvegarder les conversations',
      'Support rapide'
    ],
    notIncluded: ['PDF export'],
    notIncludedAr: ['تصدير PDF'],
    notIncludedFr: ['Sans export PDF'],
    isActive: true,
    isPopular: true,
    color: 'blue',
    order: 2
  },
  {
    id: 'premium',
    name: 'Premium',
    nameAr: 'مميز',
    nameFr: 'Premium',
    description: 'For professionals',
    descriptionAr: 'للمحترفين',
    descriptionFr: 'Pour les professionnels',
    price: 5.99,
    currency: 'USD',
    interval: 'month',
    messageLimit: -1,
    features: [
      'Unlimited messages',
      'Responses with references',
      'Full access',
      'PDF export',
      'Priority support',
      'Exclusive features',
      'Advanced Khutba preparation'
    ],
    featuresAr: [
      'رسائل غير محدودة',
      'ردود مع مراجع',
      'وصول كامل',
      'تصدير PDF',
      'دعم أولوية',
      'مميزات حصرية',
      'إعداد خطبة متقدم'
    ],
    featuresFr: [
      'Messages illimités',
      'Réponses avec références',
      'Accès complet',
      'Export PDF',
      'Support prioritaire',
      'Fonctionnalités exclusives',
      'Préparation de Khutba avancée'
    ],
    notIncluded: [],
    notIncludedAr: [],
    notIncludedFr: [],
    isActive: true,
    isPopular: false,
    color: 'purple',
    order: 3
  }
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    let plans = DEFAULT_PLANS;

    // Essayer de récupérer les plans depuis la base de données
    try {
      const savedPlans = await prisma.settings.findUnique({
        where: { key: 'subscription_plans' }
      });

      if (savedPlans?.value) {
        const dbPlans = JSON.parse(savedPlans.value);
        // Fusionner avec les plans par défaut pour avoir toutes les traductions
        plans = dbPlans.map(dbPlan => {
          const defaultPlan = DEFAULT_PLANS.find(p => p.id === dbPlan.id);
          return {
            ...defaultPlan,
            ...dbPlan
          };
        });
      }
    } catch (e) {
      console.log('Using default plans:', e.message);
    }

    // ⚠️ IMPORTANT: Filtrer uniquement les plans actifs
    const activePlans = plans
      .filter(plan => plan.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Ajouter les headers de cache (5 minutes)
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    return res.status(200).json({
      plans: activePlans,
      currency: 'USD',
      interval: 'month'
    });

  } catch (error) {
    console.error('❌ Erreur API plans:', error);
    
    // En cas d'erreur, retourner les plans par défaut actifs
    return res.status(200).json({
      plans: DEFAULT_PLANS.filter(p => p.isActive !== false),
      currency: 'USD',
      interval: 'month'
    });
  }
}
