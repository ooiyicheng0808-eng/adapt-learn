import { prisma } from "../utils/prisma";

export class ChatService {
  static async createSession(userId: string, title: string = "New Session") {
    return prisma.chatSession.create({
      data: {
        userId,
        title,
      },
    });
  }

  static async getSessions(userId: string) {
    return prisma.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getSessionMessages(sessionId: string, userId: string) {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!session) {
      throw new Error("Session not found or unauthorized");
    }

    return session.messages;
  }

  static async addMessage(sessionId: string, role: "user" | "assistant", content: string) {
    return prisma.message.create({
      data: {
        sessionId,
        role,
        content,
      },
    });
  }
}
