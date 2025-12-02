import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

/**
 * API: Vérifier et valider un code promo
 * POST /api/promo/verify
 * 
 * Body: { code: "PROMO2024", tier: "pro" }
 * 
 * Retourne les infos du code si valide, ou une erreur
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérifier l'authentification
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { code, tier } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code requis' });
    }

    // Normaliser le code
    const normalizedCode = code.trim().toUpperCase();

    // Chercher le code promo
    let promoCode;
    try {
      promoCode = await prisma.promoCode.findUnique({
        where: { code: normalizedCode }
      });
    } catch (e) {
      // Table n'existe pas encore
      return res.status(404).json({ 
        valid: false, 
        error: 'Code promo invalide' 
      });
    }

    if (!promoCode) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Code promo invalide' 
      });
    }

    // Vérifier si le code est actif
    if (!promoCode.isActive) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Ce code promo n\'est plus actif' 
      });
    }

    // Vérifier la date d'expiration
    if (promoCode.validUntil && new Date(promoCode.validUntil) < new Date()) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Ce code promo a expiré' 
      });
    }

    // Vérifier le nombre d'utilisations
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Ce code promo a atteint sa limite d\'utilisation' 
      });
    }

    // Vérifier si applicable au tier demandé
    if (promoCode.applicableTiers && tier) {
      const applicableTiers = Array.isArray(promoCode.applicableTiers) 
        ? promoCode.applicableTiers 
        : JSON.parse(promoCode.applicableTiers);
      
      if (applicableTiers.length > 0 && !applicableTiers.includes(tier)) {
        return res.status(400).json({ 
          valid: false, 
          error: `Ce code n'est pas applicable au plan ${tier}` 
        });
      }
    }

    // Vérifier si l'utilisateur a déjà utilisé ce code
    try {
      const existingUsage = await prisma.promoUsage.findFirst({
        where: {
          promoCodeId: promoCode.id,
          userId: session.user.id
        }
      });

      if (existingUsage) {
        return res.status(400).json({ 
          valid: false, 
          error: 'Vous avez déjà utilisé ce code promo' 
        });
      }
    } catch (e) {
      // Table PromoUsage n'existe pas, continuer
    }

    // Le code est valide !
    return res.status(200).json({
      valid: true,
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: Number(promoCode.discountValue),
      description: promoCode.description,
      // Code LemonSqueezy correspondant (si configuré)
      lemonSqueezyCode: promoCode.code // Utiliser le même code dans LemonSqueezy
    });

  } catch (error) {
    console.error('❌ Erreur vérification code promo:', error);
    return res.status(500).json({ 
      valid: false,
      error: 'Erreur serveur' 
    });
  }
}
