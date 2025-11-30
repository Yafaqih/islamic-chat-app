import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    // Récupérer les informations utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        messageCount: true,
        subscriptionTier: true,
        createdAt: true
      }
    });

    // Compter le nombre total de conversations
    const totalConversations = await prisma.conversation.count({
      where: { userId }
    });

    // Compter le nombre total de messages
    const totalMessages = await prisma.message.count({
      where: {
        conversation: {
          userId
        }
      }
    });

    // Calculer le nombre de jours actifs
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const uniqueDays = new Set();
    conversations.forEach(conv => {
      const date = new Date(conv.createdAt).toDateString();
      uniqueDays.add(date);
    });

    // Messages par jour (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const messagesPerDay = await prisma.message.groupBy({
      by: ['createdAt'],
      where: {
        conversation: {
          userId
        },
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Conversations récentes
    const recentConversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    return res.status(200).json({
      messageCount: user.messageCount,
      subscriptionTier: user.subscriptionTier,
      totalConversations,
      totalMessages,
      daysActive: uniqueDays.size,
      messagesPerDay,
      recentConversations: recentConversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        messageCount: conv._count.messages,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      })),
      accountCreatedAt: user.createdAt
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}