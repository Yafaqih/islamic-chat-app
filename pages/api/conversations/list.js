import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID requis' });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: userId  // String maintenant, pas parseInt
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error loading conversations:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}