import React, { useState, useEffect, useRef } from 'react';
import { Send, User, ArrowLeft } from 'lucide-react';
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

  // MOCK DATA for hackathon
  useEffect(() => {
    const fakeLearners: Message[] = [
      {
        id: '1', senderId: 'learner1', receiverId: userProfile?.id || 'seller1', content: 'Hi, I need help with Module 2.', createdAt: new Date().toISOString(),
        sender: { id: 'learner1', username: 'Alex Johnson', role: 'learner' },
        receiver: { id: userProfile?.id || 'seller1', username: 'Me', role: 'seller' }
      },
      {
        id: '2', senderId: 'learner2', receiverId: userProfile?.id || 'seller1', content: 'Are there any discounts available?', createdAt: new Date().toISOString(),
        sender: { id: 'learner2', username: 'Sarah Williams', role: 'learner' },
        receiver: { id: userProfile?.id || 'seller1', username: 'Me', role: 'seller' }
      },
      {
        id: '3', senderId: 'learner3', receiverId: userProfile?.id || 'seller1', content: 'Thanks for the amazing course!', createdAt: new Date().toISOString(),
        sender: { id: 'learner3', username: 'Michael Chen', role: 'learner' },
        receiver: { id: userProfile?.id || 'seller1', username: 'Me', role: 'seller' }
      }
    ];
    setInboxMessages(fakeLearners);
  }, [userProfile?.id]);

  useEffect(() => {
    if (selectedUserId) {
      const relatedMsg = inboxMessages.find(m => m.senderId === selectedUserId || m.receiverId === selectedUserId);
      if (relatedMsg) {
        setConversation([relatedMsg]);
      } else {
        setConversation([]);
      }
    }
  }, [selectedUserId, inboxMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedUserId) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: userProfile?.id || 'me',
      receiverId: selectedUserId,
      content: inputText,
      createdAt: new Date().toISOString(),
      sender: { id: userProfile?.id || 'me', username: 'Me', role: 'seller' },
      receiver: { id: selectedUserId, username: 'Learner', role: 'learner' }
    };
    
    setConversation(prev => [...prev, newMsg]);
    
    setInputText('');
  };

  const getOtherUser = (msg: Message) => {
    return msg.senderId === userProfile?.id ? msg.receiver : msg.sender;
  };

  return (
    <div className="flex w-full h-[calc(100vh-150px)] md:h-[600px] border rounded-lg overflow-hidden bg-card shadow-sm">
      {/* Contact List */}
      <div className={`border-r flex-col bg-muted/20 ${selectedUserId ? 'hidden md:flex md:w-1/3' : 'flex w-full md:w-1/3'}`}>
        <div className="p-4 border-b bg-muted/40 font-semibold text-lg flex items-center justify-between">
          Inbox
        </div>
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
      
      {/* Chat Interface */}
      <div className={`flex-1 flex-col ${selectedUserId ? 'flex w-full' : 'hidden md:flex'}`}>
        {!selectedUserId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to view messages.
          </div>
        ) : (
          <>
            <div className="p-4 border-b font-semibold flex items-center gap-3 bg-muted/10 shrink-0">
              <button 
                onClick={() => setSelectedUserId(null)} 
                className="md:hidden p-2 -ml-2 rounded-full hover:bg-muted/50"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="truncate">
                {inboxMessages.find(m => getOtherUser(m).id === selectedUserId) ? getOtherUser(inboxMessages.find(m => getOtherUser(m).id === selectedUserId)!).username : 'Student'}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {conversation.map(msg => {
                const isMe = msg.senderId === userProfile?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] md:max-w-[70%] text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 md:p-4 border-t flex gap-2 bg-muted/10 shrink-0">
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
