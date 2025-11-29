import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, subscriptionTier, userId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message requis' });
  }

  try {
    // Ici vous devrez intégrer votre logique de chat avec Claude API
    // Pour l'instant, retourner une réponse simple
    
    const response = `Merci pour votre message: "${message}". L'intégration avec l'API Claude sera ajoutée prochainement.`;
    
    const references = [
      'القرآن الكريم - سورة البقرة',
      'صحيح البخاري - كتاب الإيمان'
    ];

    // Optionnel: Sauvegarder la conversation dans la base de données
    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            messageCount: {
              increment: 1
            }
          }
        });
      } catch (dbError) {
        console.error('Error updating message count:', dbError);
      }
    }

    return res.status(200).json({
      response,
      references
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}