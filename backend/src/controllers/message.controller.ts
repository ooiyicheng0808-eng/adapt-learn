import { Request, Response } from 'express';
import { prisma } from '../index'; 

export const getInbox = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, email: true, profilePic: true, role: true } },
        receiver: { select: { id: true, username: true, email: true, profilePic: true, role: true } }
      }
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { otherUserId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, username: true, profilePic: true } },
        receiver: { select: { id: true, username: true, profilePic: true } }
      }
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user?.id;
    const { receiverId, courseId, content } = req.body;
    
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });
    if (!receiverId || !content) return res.status(400).json({ error: 'Receiver ID and content are required' });

    const message = await prisma.directMessage.create({
      data: {
        senderId,
        receiverId,
        courseId,
        content
      },
      include: {
        sender: { select: { id: true, username: true, profilePic: true } }
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await prisma.user.findMany({
      where: { role: 'seller' },
      select: { id: true, username: true, email: true, profilePic: true }
    });
    res.json(sellers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
};
