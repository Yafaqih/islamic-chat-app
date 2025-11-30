// pages/api/conversations/list.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  // ✅ CORRECTION: Accepter GET au lieu de POST
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Récupérer les conversations de l'utilisateur
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
      take: 50 // Limiter à 50 conversations pour la performance
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

  } catch (error) {
    console.error('Error fetching conversations:', error);
    
    // Gérer les erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Conflit de données' });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    return res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des conversations',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}