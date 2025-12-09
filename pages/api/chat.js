import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../../lib/prisma';
import { withRateLimit } from '../../lib/rateLimit';

// Vérifier la clé API au démarrage
const apiKey = process.env.ANTHROPIC_API_KEY;
console.log('=== API CONFIG CHECK ===');
console.log('API Key exists:', !!apiKey);
console.log('API Key length:', apiKey?.length || 0);
console.log('API Key prefix:', apiKey?.substring(0, 15) || 'MISSING');
console.log('========================');

const anthropic = new Anthropic({
  apiKey: apiKey,
});

// Limites de messages par tier
const FREE_MESSAGE_LIMIT = 10;
const PRO_MESSAGE_LIMIT = 100;

// Fonction pour sauvegarder la conversation
async function saveConversation(userId, userMessage, assistantMessage, references) {
  try {
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

    if (!conversation) {
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

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    console.log('Messages saved to conversation:', conversation.id);
    return conversation.id;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérifier la clé API avant tout
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set!');
    return res.status(500).json({ 
      error: 'Clé API non configurée',
      debug: 'ANTHROPIC_API_KEY missing from environment'
    });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const rateLimitPassed = await withRateLimit(
    req, 
    res, 
    'chat', 
    10, 
    () => session.user.id
  );
  
  if (!rateLimitPassed) {
    return;
  }

  // ✅ CORRECTION: Accepter les deux formats (message string OU messages array)
  const { message, messages } = req.body;
  const userId = session.user.id;

  // Extraire le dernier message utilisateur
  let userMessage;
  let conversationHistory = [];

  if (message) {
    // Format simple: { message: "string" }
    userMessage = message;
  } else if (messages && Array.isArray(messages) && messages.length > 0) {
    // Format avec historique: { messages: [{role, content}, ...] }
    // Trouver le dernier message de l'utilisateur
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      userMessage = userMessages[userMessages.length - 1].content;
    }
    // Garder l'historique pour le contexte (limité aux 10 derniers messages)
    conversationHistory = messages.slice(-10);
  }

  if (!userMessage) {
    return res.status(400).json({ error: 'Message requis' });
  }

  try {
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

    const currentTier = user.subscriptionTier || 'free';
    const messageLimit = currentTier === 'free' ? FREE_MESSAGE_LIMIT : 
                        currentTier === 'pro' ? PRO_MESSAGE_LIMIT : 
                        Infinity;

    if (user.messageCount >= messageLimit) {
      return res.status(403).json({ 
        error: 'Limite de messages atteinte',
        limit: messageLimit,
        current: user.messageCount,
        tier: currentTier
      });
    }

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

    console.log('Calling Anthropic API...');
    
    // ✅ Construire les messages pour l'API avec l'historique
    let apiMessages;
    if (conversationHistory.length > 0) {
      // Utiliser l'historique de conversation pour le contexte
      apiMessages = conversationHistory.map(m => ({
        role: m.role,
        content: m.content
      }));
    } else {
      // Juste le message actuel
      apiMessages = [{ role: 'user', content: userMessage }];
    }
    
    const completion = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: apiMessages
    });

    console.log('Anthropic API response received');

    const response = completion.content[0].text;

    const references = [];
    
    const surahMatches = response.matchAll(/سورة\s+[\u0600-\u06FF]+/g);
    for (const match of surahMatches) {
      if (!references.includes(match[0])) {
        references.push(match[0]);
      }
    }
    
    const hadithMatches = response.matchAll(/(صحيح البخاري|صحيح مسلم|سنن الترمذي|سنن أبي داود|سنن النسائي|سنن ابن ماجه)[^\.،]+/g);
    for (const match of hadithMatches) {
      if (!references.includes(match[0])) {
        references.push(match[0]);
      }
    }

    const ayahMatches = response.matchAll(/[\u0600-\u06FF\s]+:\s*\d+/g);
    for (const match of ayahMatches) {
      if (match[0].includes('سورة') || match[0].length < 50) {
        if (!references.includes(match[0])) {
          references.push(match[0]);
        }
      }
    }

    const conversationId = await saveConversation(userId, userMessage, response, references);

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

    // ✅ CORRECTION: Retourner "message" au lieu de "response" pour le frontend
    return res.status(200).json({
      message: response,  // Le frontend attend "message"
      response: response, // Garder "response" pour compatibilité
      references: [...new Set(references)].slice(0, 5),
      conversationId,
      messageCount: user.messageCount + 1,
      usage: {
        messagesUsed: user.messageCount + 1,
        messagesLimit: messageLimit,
        tier: currentTier
      }
    });

  } catch (error) {
    console.error('=== CHAT ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Full error:', JSON.stringify(error, null, 2));
    console.error('==================');
    
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'Erreur de configuration API',
        debug: 'API key invalid or unauthorized'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' });
    }

    if (error.status === 400) {
      return res.status(400).json({ error: 'Requête invalide' });
    }
    
    return res.status(500).json({ 
      error: 'Erreur serveur',
      debug: error.message 
    });
  }
}
