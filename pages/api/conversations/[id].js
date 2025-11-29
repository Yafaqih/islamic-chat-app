import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID requis' });
  }

  // GET - Récupérer une conversation
  if (req.method === 'GET') {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: parseInt(id) },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      return res.status(200).json({ conversation });
    } catch (error) {
      console.error('Error loading conversation:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // DELETE - Supprimer une conversation
  if (req.method === 'DELETE') {
    try {
      // Supprimer d'abord les messages
      await prisma.message.deleteMany({
        where: { conversationId: parseInt(id) }
      });

      // Puis supprimer la conversation
      await prisma.conversation.delete({
        where: { id: parseInt(id) }
      });

      return res.status(200).json({ message: 'Conversation supprimée' });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}