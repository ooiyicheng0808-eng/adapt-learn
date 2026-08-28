import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { AiService } from "../services/ai.service";
import { sendQuizResultsEmail } from "../utils/email";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export class ChatController {
  static async createSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { title } = req.body;
      const session = await ChatService.createSession(userId, title);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create session", error: error.message });
    }
  }

  static async getSessions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const sessions = await ChatService.getSessions(userId);
      res.status(200).json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
    }
  }

  static async getSessionMessages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;
      const messages = await ChatService.getSessionMessages(sessionId, userId);
      res.status(200).json(messages);
    } catch (error: any) {
      if (error.message === "Session not found or unauthorized") {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "Failed to fetch messages", error: error.message });
    }
  }

  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId, content, pageContext = 'CustomerService' } = req.body;

      // Ensure session belongs to user
      const history = await ChatService.getSessionMessages(sessionId, userId);

      // Save user message
      const userMessage = await ChatService.addMessage(sessionId, "user", content);

      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send the saved user message first to the client
      res.write(`data: ${JSON.stringify({ event: "userMessage", userMessage })}\n\n`);

      // Prepare context for AI
      const aiContext = history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
      aiContext.push({ role: "user", content });

      let aiResponseContent = "";

      // Call AI with multi-agent architecture
      await AiService.getChatCompletionStream(
        aiContext,
        pageContext,
        userId,
        (agent, status) => {
          res.write(`data: ${JSON.stringify({ event: "status", agent, message: status })}\n\n`);
        },
        (token) => {
          aiResponseContent += token;
          res.write(`data: ${JSON.stringify({ event: "token", token })}\n\n`);
        }
      );

      // Save AI message
      const aiMessage = await ChatService.addMessage(sessionId, "assistant", aiResponseContent);

      res.write(`data: ${JSON.stringify({ event: "done", aiMessage })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Error in streaming response:", error);
      res.write(`data: ${JSON.stringify({ event: "error", message: error.message })}\n\n`);
      res.end();
    }
  }

  static async generateCourse(req: AuthRequest, res: Response) {
    try {
      const { topicName } = req.body;
      if (!topicName) {
        return res.status(400).json({ message: "Topic name is required" });
      }

      const generatedCourse = await AiService.generateCourse(topicName);
      res.status(200).json(generatedCourse);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to generate course", error: error.message });
    }
  }

  static async evaluateQuiz(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const { courseId, courseName, score, total, answers } = req.body;

      if (!courseId || !courseName || score === undefined || !total || !answers) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Generate AI Evaluation
      const evaluation = await AiService.evaluateQuiz(score, total, answers, courseName);

      // Ensure course exists for foreign key constraint (important for hardcoded products)
      let course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        let dummySeller = await prisma.user.findFirst({ where: { role: 'seller' } });
        if (!dummySeller) {
          dummySeller = await prisma.user.create({
            data: { email: 'seller@community.com', username: 'Community Seller', role: 'seller', passwordHash: 'none' }
          });
        }
        course = await prisma.course.create({
          data: {
            id: courseId,
            name: courseName,
            sellerId: dummySeller.id,
            price: 0
          }
        });
      }

      // Save to QuizAttempt
      const attempt = await prisma.quizAttempt.create({
        data: {
          userId,
          courseId,
          score,
          total,
          weaknesses: evaluation.weaknesses,
          aiPlan: evaluation.aiPlan,
        }
      });

      // Send Email in background
      const emailContent = `
        <h1>Quiz Results: ${courseName}</h1>
        <p>You scored <strong>${score} out of ${total}</strong> (${Math.round((score/total)*100)}%).</p>
        <h2>Areas for Improvement</h2>
        <p>${evaluation.weaknesses}</p>
        <h2>Your Personalized Study Plan</h2>
        <p>${evaluation.aiPlan}</p>
      `;
      sendQuizResultsEmail(userEmail, `Your Quiz Results: ${courseName}`, `Quiz Score: ${score}/${total}`, emailContent).catch(console.error);

      res.status(200).json(evaluation);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: "Failed to evaluate quiz", error: error.message });
    }
  }
}
