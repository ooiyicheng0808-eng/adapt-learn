import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { useUser } from '../contexts/UserContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export interface AgentStep {
  agent: string;
  status: string;
  statusType?: 'pending' | 'active' | 'done' | 'error';
}

export function useChat(pageContext: 'CustomerService' | 'AiAssistant' = 'CustomerService') {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const { chargePlanner } = useUser();

  const initSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("No auth token");

      // Always create a new session for a fresh chat experience
      const newSession = await api.post('/chat/session', { title: "Customer Support" });
      setSessionId(newSession.id);
      setMessages([]);
      setSteps([]);
    } catch (error) {
      console.error("Failed to initialize chat session", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSteps = useCallback((agent: string, status: string, statusType: 'pending' | 'active' | 'done' | 'error' = 'active') => {
    setSteps(prev => {
      const existingIdx = prev.findIndex(s => s.agent === agent);
      if (existingIdx === -1) {
        const updatedPrev = prev.map(s => ({ ...s, statusType: 'done' as const }));
        return [
          ...updatedPrev,
          { agent, status, statusType }
        ];
      } else {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          statusType
        };
        return updated;
      }
    });
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
    setSteps([]); // Reset steps

    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

    try {
      const response = await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          content,
          pageContext
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream");

      const decoder = new TextDecoder("utf-8");
      let aiContent = "";
      const aiTempId = "ai-temp-" + Date.now();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;
          const dataStr = line.slice(6);
          try {
            const data = JSON.parse(dataStr);
            if (data.event === "userMessage") {
              setMessages(prev => [
                ...prev.filter(m => m.id !== tempId),
                data.userMessage
              ]);
            } else if (data.event === "status") {
              // Gating logic if it's the Planner agent checking balance
              if (data.agent === "Planner Agent" && data.message === "Checking VIP/Diamond balance...") {
                const chargeResult = chargePlanner();
                if (chargeResult === 'insufficient_diamonds') {
                  updateSteps("Planner Agent", "insufficient diamond currently", "error");
                  setMessages(prev => [
                    ...prev.filter(m => m.id !== aiTempId),
                    { id: aiTempId, role: 'assistant', content: "insufficient diamond currently. Please recharge your diamonds at the Profile." }
                  ]);
                  await reader.cancel();
                  setIsTyping(false);
                  return;
                } else if (chargeResult === 'insufficient_uses') {
                  updateSteps("Planner Agent", "Free planner uses limit reached (3/month)", "error");
                  setMessages(prev => [
                    ...prev.filter(m => m.id !== aiTempId),
                    { id: aiTempId, role: 'assistant', content: "You have reached your limit of 3 free Planner requests. Please upgrade to VIP at your profile to get unlimited access!" }
                  ]);
                  await reader.cancel();
                  setIsTyping(false);
                  return;
                } else if (chargeResult === 'success') {
                  updateSteps("Planner Agent", "Payment authorized (50 Diamonds deducted)", "done");
                } else if (chargeResult === 'vip') {
                  updateSteps("Planner Agent", "VIP status active (Unlimited access)", "done");
                }
              } else {
                updateSteps(data.agent, data.message);
              }
            } else if (data.event === "token") {
              aiContent += data.token;
              setMessages(prev => {
                const filtered = prev.filter(m => m.id !== aiTempId);
                return [
                  ...filtered,
                  { id: aiTempId, role: 'assistant', content: aiContent }
                ];
              });
            } else if (data.event === "done") {
              setMessages(prev => [
                ...prev.filter(m => m.id !== aiTempId),
                data.aiMessage
              ]);
              setSteps(prev => prev.map(s => ({ ...s, statusType: 'done' as const })));
            } else if (data.event === "error") {
              throw new Error(data.message);
            }
          } catch (e) {
            // ignore chunk errors
          }
        }
      }
    } catch (error: any) {
      console.error("Failed to send message", error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      updateSteps("System", error.message || "Failed to get AI response", "error");
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, pageContext, chargePlanner, updateSteps]);

  return {
    messages,
    isLoading,
    isTyping,
    steps,
    initSession,
    sendMessage
  };
}
