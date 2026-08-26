import React, { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { api } from '../lib/api';
import { useUser } from '../contexts/UserContext';

interface ConversationUser {
  id: string;
  username: string;
  profilePic?: string;
  role: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: ConversationUser;
  receiver: ConversationUser;
}

export function SellerInbox() {
  const { userProfile } = useUser();
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch unique conversations
    api.get('/messages/inbox').then(res => {
      const msgs = res.data as Message[];
      // Filter out unique users to chat with
      const uniqueUsers = new Map<string, Message>();
      msgs.forEach(msg => {
        const otherUserId = msg.senderId === userProfile?.id ? msg.receiverId : msg.senderId;
        if (!uniqueUsers.has(otherUserId)) {
          uniqueUsers.set(otherUserId, msg);
        }
      });
      setInboxMessages(Array.from(uniqueUsers.values()));
    }).catch(console.error);
  }, [userProfile?.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedUserId) {
      const fetchConversation = () => {
        api.get(`/messages/conversation/${selectedUserId}`)
          .then(res => setConversation(res.data))
          .catch(console.error);
      };
      fetchConversation();
      interval = setInterval(fetchConversation, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedUserId) return;
    try {
      const res = await api.post('/messages', {
        receiverId: selectedUserId,
        content: inputText
      });
      setConversation([...conversation, res.data]);
      setInputText('');
    } catch (error) {
      console.error(error);
    }
  };

  const getOtherUser = (msg: Message) => {
    return msg.senderId === userProfile?.id ? msg.receiver : msg.sender;
  };

  return (
    <div className="flex w-full h-[600px] border rounded-lg overflow-hidden bg-card shadow-sm">
      <div className="w-1/3 border-r flex flex-col bg-muted/20">
        <div className="p-4 border-b bg-muted/40 font-semibold text-lg">Inbox</div>
        <div className="flex-1 overflow-y-auto">
          {inboxMessages.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">No messages yet.</div>
          )}
          {inboxMessages.map(msg => {
            const otherUser = getOtherUser(msg);
            const isSelected = selectedUserId === otherUser.id;
            return (
              <button
                key={otherUser.id}
                onClick={() => setSelectedUserId(otherUser.id)}
                className={`w-full text-left p-4 border-b flex items-center gap-3 transition-colors ${isSelected ? 'bg-primary/10' : 'hover:bg-muted'}`}
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm truncate">{otherUser.username || 'Student'}</p>
                  <p className="text-xs text-muted-foreground truncate">{msg.content}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {!selectedUserId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to view messages.
          </div>
        ) : (
          <>
            <div className="p-4 border-b font-semibold flex items-center gap-3 bg-muted/10">
              <User className="h-5 w-5 text-primary" />
              Chatting with Student
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {conversation.map(msg => {
                const isMe = msg.senderId === userProfile?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t flex gap-2 bg-muted/10">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your reply..."
                className="flex-1 bg-background border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button size="icon" className="rounded-full h-10 w-10 shrink-0" onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
