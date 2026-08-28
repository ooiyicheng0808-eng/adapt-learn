import { z } from "zod";

export const createSessionSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").optional().default("New Chat"),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid("Invalid session ID"),
    content: z.string().min(1, "Message content is required"),
    pageContext: z.enum(['CustomerService', 'AiAssistant']).optional(),
  }),
});
