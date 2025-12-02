import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Créer un code promo
 * POST /api/admin/promo/create
 * 
 * Body:
 * {
 *   code: string (requis, unique, uppercase)
 *   description: string
 *   discountType: 'percentage' | 'fixed' (requis)
 *   discountValue: number (requis)
 *   maxUses: number (optionnel)
 *   validUntil: date (optionnel)
 *   applicableTiers: ['pro', 'premium'] (optionnel)
 *   minAmount: number (optionnel)
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérification admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      validUntil,
      applicableTiers,
      minAmount
    } = req.body;

    // Validation
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ 
        error: 'Champs requis manquants',
        required: ['code', 'discountType', 'discountValue']
      });
    }

    // Validation du type de réduction
    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ 
        error: 'discountType doit être "percentage" ou "fixed"' 
      });
    }

    // Validation de la valeur
    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ 
        error: 'discountValue doit être un nombre positif' 
      });
    }

    if (discountType === 'percentage' && value > 100) {
      return res.status(400).json({ 
        error: 'Pour un pourcentage, la valeur ne peut pas dépasser 100' 
      });
    }

    // Normaliser le code (uppercase, trim)
    const normalizedCode = code.trim().toUpperCase();

    // Vérifier que le code n'existe pas déjà
    const existingCode = await prisma.promoCode.findUnique({
      where: { code: normalizedCode }
    });

    if (existingCode) {
      return res.status(400).json({ 
        error: 'Ce code promo existe déjà' 
      });
    }

    // Préparer les données
    const promoData = {
      code: normalizedCode,
      description: description || null,
      discountType,
      discountValue: value,
      maxUses: maxUses ? parseInt(maxUses) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      applicableTiers: applicableTiers || null,
      minAmount: minAmount ? parseFloat(minAmount) : null,
      createdBy: session.user.id,
      isActive: true
    };

    // Créer le code promo
    const promoCode = await prisma.promoCode.create({
      data: promoData
    });

    // Logger l'action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'promo_create',
        targetType: 'promo_code',
        targetId: promoCode.id,
        details: {
          code: normalizedCode,
          discountType,
          discountValue: value,
          createdBy: session.user.email
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      }
    });

    return res.status(201).json({
      success: true,
      promoCode: {
        ...promoCode,
        discountValue: Number(promoCode.discountValue),
        minAmount: promoCode.minAmount ? Number(promoCode.minAmount) : null
      }
    });

  } catch (error) {
    console.error('❌ Erreur création code promo:', error);
    
    // Erreur unique constraint
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Ce code promo existe déjà' 
      });
    }

    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
