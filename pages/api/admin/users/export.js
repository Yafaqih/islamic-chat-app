import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '../../../../lib/prisma';

/**
 * API: Export CSV des utilisateurs
 * GET /api/admin/users/export?tier=pro
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

    const { tier, search } = req.query;

    // Construction des filtres
    const where = {};
    if (tier && tier !== 'all') {
      where.subscriptionTier = tier;
    }
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
        messageCount: true,
        isAdmin: true,
        createdAt: true
      }
    });

    // Générer le CSV
    const csvHeader = [
      'ID',
      'Nom',
      'Email',
      'Abonnement',
      'Messages',
      'Admin',
      'Date Inscription'
    ].join(',');

    const csvRows = users.map(user => [
      user.id,
      `"${(user.name || '').replace(/"/g, '""')}"`,
      user.email || '',
      user.subscriptionTier || 'free',
      user.messageCount || 0,
      user.isAdmin ? 'Oui' : 'Non',
      new Date(user.createdAt).toISOString().split('T')[0]
    ].join(','));

    const csv = [csvHeader, ...csvRows].join('\n');

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
      message: error.message
    });
  }
}
