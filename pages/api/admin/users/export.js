import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Export CSV des utilisateurs
 * GET /api/admin/users/export?tier=pro&status=active
 * 
 * Retourne un fichier CSV téléchargeable
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Vérification admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { tier, status, search } = req.query;

    // Construction des filtres
    const where = {};
    if (tier) where.subscriptionTier = tier;
    if (status) where.subscriptionStatus = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Récupérer tous les utilisateurs correspondants
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        messageCount: true,
        totalMessages: true,
        revenue: true,
        lastActivity: true,
        isAdmin: true,
        isBlocked: true,
        createdAt: true
      }
    });

    // Générer le CSV
    const csvHeader = [
      'ID',
      'Nom',
      'Email',
      'Abonnement',
      'Statut',
      'Messages (Mois)',
      'Messages (Total)',
      'Revenu',
      'Dernière Activité',
      'Admin',
      'Bloqué',
      'Date Inscription'
    ].join(',');

    const csvRows = users.map(user => [
      user.id,
      `"${user.name || ''}"`,
      user.email,
      user.subscriptionTier,
      user.subscriptionStatus,
      user.messageCount,
      user.totalMessages,
      Number(user.revenue).toFixed(2),
      user.lastActivity ? new Date(user.lastActivity).toISOString() : '',
      user.isAdmin ? 'Oui' : 'Non',
      user.isBlocked ? 'Oui' : 'Non',
      new Date(user.createdAt).toISOString()
    ].join(','));

    const csv = [csvHeader, ...csvRows].join('\n');

    // Logger l'export
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'users_export',
        details: {
          count: users.length,
          filters: { tier, status, search },
          exportedBy: session.user.email
        },
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      }
    });

    // Définir les headers pour le téléchargement
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    
    // Ajouter BOM pour UTF-8 (pour Excel)
    res.write('\uFEFF');
    res.write(csv);
    res.end();

  } catch (error) {
    console.error('❌ Erreur export utilisateurs:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
