import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const initSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("No auth token");

      // Always create a new session for a fresh chat experience
      const newSession = await api.post('/chat/session', { title: "Customer Support" });
      setSessionId(newSession.id);
      setMessages([]);

    } catch (error) {
      console.error("Failed to initialize chat session", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId || !content.trim()) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Optimistically add user message
    const tempId = Date.now().toString();
    const newMsg: ChatMessage = { id: tempId, role: 'user', content };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    try {
      const response = await api.post('/chat/message', {
        sessionId,
        content
      });

      // Replace temp message with actual, and append AI message
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempId),
        response.userMessage,
        response.aiMessage
      ]);
    } catch (error) {
      console.error("Failed to send message", error);
      // Remove optimistic message if failed
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsTyping(false);
    }
  }, [sessionId]);

  return {
    messages,
    isLoading,
    isTyping,
    initSession,
    sendMessage
  };
}
