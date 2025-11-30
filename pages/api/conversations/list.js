import Anthropic from '@anthropic-ai/sdk';
import prisma from '../../../lib/prisma';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Limites de messages par tier
const FREE_MESSAGE_LIMIT = 10;
const PRO_MESSAGE_LIMIT = 100;

// Fonction pour sauvegarder la conversation
async function saveConversation(userId, userMessage, assistantMessage, references) {
  try {
    // Chercher une conversation active pour aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let conversation = await prisma.conversation.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: today
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Si pas de conversation aujourd'hui, en créer une nouvelle
    if (!conversation) {
      // Extraire un titre du premier message (premiers 60 caractères)
      let title = userMessage.substring(0, 60);
      if (userMessage.length > 60) {
        title += '...';
      }
      
      conversation = await prisma.conversation.create({
        data: {
          userId: userId,
          title: title
        }
      });
      
      console.log('New conversation created:', conversation.id);
    }

    // Sauvegarder les messages
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          role: 'user',
          content: userMessage,
        },
        {
          conversationId: conversation.id,
          role: 'assistant',
          content: assistantMessage,
          references: references && references.length > 0 ? JSON.stringify(references) : null
        }
      ]
    });

    // Mettre à jour le timestamp de la conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    console.log('Messages saved to conversation:', conversation.id);
    return conversation.id;
  } catch (error) {
    console.error('Error saving conversation:', error);
    // Ne pas bloquer la réponse si la sauvegarde échoue
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, subscriptionTier, userId } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message requis' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID requis' });
  }

  try {
    // Récupérer l'utilisateur pour vérifier son tier et son compteur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        messageCount: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Déterminer la limite de messages selon le tier
    const currentTier = user.subscriptionTier || 'free';
    const messageLimit = currentTier === 'free' ? FREE_MESSAGE_LIMIT : 
                        currentTier === 'pro' ? PRO_MESSAGE_LIMIT : 
                        Infinity; // Premium = illimité

    // Vérifier si l'utilisateur a atteint sa limite
    if (user.messageCount >= messageLimit) {
      return res.status(403).json({ 
        error: 'Limite de messages atteinte',
        limit: messageLimit,
        current: user.messageCount,
        tier: currentTier
      });
    }

    // Construire le prompt système selon le tier
    let systemPrompt;
    let maxTokens;

    if (currentTier === 'premium') {
      systemPrompt = `Tu es un assistant islamique expert spécialisé dans la tradition sunnite. Tu dois:

1. Fournir des réponses détaillées et complètes
2. Citer des sources authentiques (Coran, Hadith sahih)
3. Expliquer les contextes et les nuances
4. Proposer des khutbas (sermons) bien structurés quand demandé
5. Répondre en arabe de manière claire et éloquente

Toujours inclure des références précises avec les numéros de sourate/verset ou la source du hadith.

Pour les khutbas, utilise cette structure:
- Introduction (المقدمة) avec louanges à Allah
- Corps du sermon (الموضوع) avec versets et hadiths
- Conclusion avec invocations (الخاتمة)`;
      maxTokens = 4000;
    } else if (currentTier === 'pro') {
      systemPrompt = `Tu es un assistant islamique basé sur la tradition sunnite. Tu fournis des réponses détaillées basées sur le Coran et les hadiths authentiques. Réponds en arabe de manière claire et cite tes sources.`;
      maxTokens = 2000;
    } else {
      systemPrompt = `Tu es un assistant islamique basé sur la tradition sunnite. Tu fournis des réponses concises basées sur le Coran et les hadiths authentiques. Réponds en arabe de manière claire.`;
      maxTokens = 1000;
    }

    // Appeler l'API Claude
    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    const response = completion.content[0].text;

    // Extraire les références du texte
    const references = [];
    
    // Détecter les sourates du Coran
    const surahMatches = response.matchAll(/سورة\s+[\u0600-\u06FF]+/g);
    for (const match of surahMatches) {
      if (!references.includes(match[0])) {
        references.push(match[0]);
      }
    }
    
    // Détecter les hadiths
    const hadithMatches = response.matchAll(/(صحيح البخاري|صحيح مسلم|سنن الترمذي|سنن أبي داود|سنن النسائي|سنن ابن ماجه)[^\.،]+/g);
    for (const match of hadithMatches) {
      if (!references.includes(match[0])) {
        references.push(match[0]);
      }
    }

    // Détecter les références au Coran avec versets
    const ayahMatches = response.matchAll(/[\u0600-\u06FF\s]+:\s*\d+/g);
    for (const match of ayahMatches) {
      if (match[0].includes('سورة') || match[0].length < 50) {
        if (!references.includes(match[0])) {
          references.push(match[0]);
        }
      }
    }

    // ✨ SAUVEGARDER LA CONVERSATION AUTOMATIQUEMENT
    const conversationId = await saveConversation(userId, message, response, references);

    // Mettre à jour le compteur de messages de l'utilisateur
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
      // On continue même si l'update échoue
    }

    return res.status(200).json({
      response,
      references: [...new Set(references)].slice(0, 5), // Dédupliquer et limiter à 5
      conversationId, // Retourner l'ID de la conversation
      usage: {
        messagesUsed: user.messageCount + 1,
        messagesLimit: messageLimit,
        tier: currentTier
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Gérer les erreurs spécifiques de l'API Anthropic
    if (error.status === 401) {
      return res.status(500).json({ error: 'Erreur de configuration API' });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' });
    }

    if (error.status === 400) {
      return res.status(400).json({ error: 'Requête invalide' });
    }
    
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}