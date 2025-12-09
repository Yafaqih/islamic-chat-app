// pages/api/conversations/index.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  try {
    // Récupérer la session de l'utilisateur
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // GET - Récupérer les conversations
    if (req.method === 'GET') {
      const conversations = await prisma.conversation.findMany({
        where: {
          userId: user.id
        },
        orderBy: {
          updatedAt: 'desc'
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          messages: {
            select: {
              id: true,
              role: true,
              content: true,
              references: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        take: 50
      });

      // Transformer les données pour le frontend
      const formattedConversations = conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv.messages.length,
        preview: conv.messages.length > 0 
          ? conv.messages[0].content.substring(0, 100) + '...'
          : '',
        messages: conv.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          references: msg.references ? JSON.parse(msg.references) : [],
          createdAt: msg.createdAt
        }))
      }));

      return res.status(200).json({ 
        conversations: formattedConversations,
        count: formattedConversations.length
      });
    }

    // POST - Créer ou mettre à jour une conversation
    if (req.method === 'POST') {
      const { title, messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages requis' });
      }

      // Créer une nouvelle conversation
      const conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: title || 'محادثة جديدة',
        }
      });

      // Sauvegarder les messages
      if (messages.length > 0) {
        await prisma.message.createMany({
          data: messages.map(msg => ({
            conversationId: conversation.id,
            role: msg.role,
            content: msg.content,
            references: msg.references ? JSON.stringify(msg.references) : null
          }))
        });
      }

      return res.status(201).json({ 
        conversation: {
          id: conversation.id,
          title: conversation.title
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in conversations API:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Conflit de données' });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    return res.status(500).json({ 
      error: 'Erreur serveur',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
