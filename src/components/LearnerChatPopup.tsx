import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { api } from '../lib/api';
import { useUser } from '../contexts/UserContext';

interface Seller {
  id: string;
  username: string;
  profilePic?: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export function LearnerChatPopup() {
  const { userProfile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenChat = (e: CustomEvent<{seller: Seller}>) => {
      setIsOpen(true);
      setSelectedSeller(e.detail.seller);
    };
    window.addEventListener('open-chat', handleOpenChat as EventListener);
    return () => window.removeEventListener('open-chat', handleOpenChat as EventListener);
  }, []);

  useEffect(() => {
    if (isOpen && sellers.length === 0) {
      api.get('/messages/sellers').then(res => setSellers(res)).catch(console.error);
    }
  }, [isOpen, sellers.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedSeller && isOpen) {
      const fetchMessages = () => {
        api.get(`/messages/conversation/${selectedSeller.id}`)
          .then(res => setMessages(res.data))
          .catch(console.error);
      };
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedSeller, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedSeller) return;
    try {
      const res = await api.post('/messages', {
        receiverId: selectedSeller.id,
        content: inputText
      });
      setMessages([...messages, res.data]);
      setInputText('');
    } catch (error) {
      console.error(error);
    }
  };

  if (userProfile?.role === 'seller') return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg flex items-center justify-center transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <Card className="w-80 h-96 flex flex-col shadow-xl animate-in slide-in-from-bottom-5">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
            <CardTitle className="text-md font-semibold">
              {selectedSeller ? `Chat with ${selectedSeller.username || 'Seller'}` : 'Contact Sellers'}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-muted/10">
            {!selectedSeller ? (
              <div className="overflow-y-auto p-2">
                {sellers.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">No sellers found.</div>}
                {sellers.map(seller => (
                  <button
                    key={seller.id}
                    onClick={() => setSelectedSeller(seller)}
                    className="w-full text-left p-3 hover:bg-muted rounded-md flex items-center gap-3 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{seller.username || 'Unknown Seller'}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && <div className="text-center text-xs text-muted-foreground my-4">Send a message to start the conversation.</div>}
                {messages.map(msg => {
                  const isMe = msg.senderId === userProfile?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>

          {selectedSeller && (
            <CardFooter className="p-3 border-t shrink-0 flex gap-2 bg-background">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSelectedSeller(null)}>
                <X className="h-4 w-4" />
              </Button>
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 text-sm bg-transparent border-0 focus:ring-0 p-0"
              />
              <Button size="icon" className="h-8 w-8 rounded-full shrink-0" onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
