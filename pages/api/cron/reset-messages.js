import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérification du secret pour sécuriser l'endpoint
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Reset le messageCount pour tous les utilisateurs Pro
    const result = await prisma.user.updateMany({
      where: {
        subscriptionTier: 'pro'
      },
      data: {
        messageCount: 0
      }
    });

    console.log(`[CRON] Reset mensuel: ${result.count} utilisateurs Pro réinitialisés`);

    return res.status(200).json({
      success: true,
      message: `${result.count} utilisateurs Pro réinitialisés`,
      resetCount: result.count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors du reset mensuel:', error);
    return res.status(500).json({ 
      error: 'Erreur lors du reset',
      details: error.message 
    });
  }
}