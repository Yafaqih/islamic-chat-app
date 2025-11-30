import Anthropic from '@anthropic-ai/sdk';
import prisma from '../../lib/prisma';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, subscriptionTier, userId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message requis' });
  }

  try {
    // Construire le prompt système selon le tier
    const systemPrompt = subscriptionTier === 'premium' 
      ? `Tu es un assistant islamique expert spécialisé dans la tradition sunnite. Tu dois:

1. Fournir des réponses détaillées et complètes
2. Citer des sources authentiques (Coran, Hadith sahih)
3. Expliquer les contextes et les nuances
4. Proposer des khutbas (sermons) bien structurés quand demandé
5. Répondre en arabe de manière claire et éloquente

Toujours inclure des références précises avec les numéros de sourate/verset ou la source du hadith.`
      : `Tu es un assistant islamique basé sur la tradition sunnite. Tu fournis des réponses concises basées sur le Coran et les hadiths authentiques. Réponds en arabe de manière claire.`;

    // Appeler l'API Claude
    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: subscriptionTier === 'premium' ? 4000 : subscriptionTier === 'pro' ? 2000 : 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    const response = completion.content[0].text;

    // Extraire les références du texte (simple regex pour détecter les citations)
    const references = [];
    
    // Détecter les sourates
    const surahMatches = response.matchAll(/سورة\s+[\u0600-\u06FF]+/g);
    for (const match of surahMatches) {
      references.push(match[0]);
    }
    
    // Détecter les hadiths
    const hadithMatches = response.matchAll(/(صحيح البخاري|صحيح مسلم|سنن الترمذي|سنن أبي داود|سنن النسائي|سنن ابن ماجه)[^\.]+/g);
    for (const match of hadithMatches) {
      references.push(match[0]);
    }

    // Mettre à jour le compteur de messages de l'utilisateur
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
      references: [...new Set(references)].slice(0, 5) // Dédupliquer et limiter à 5
    });
  } catch (error) {
    console.error('Chat error:', error);
    
    if (error.status === 401) {
      return res.status(500).json({ error: 'Erreur de configuration API' });
    }
    
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}