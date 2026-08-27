import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bot, Send, Plus, LoaderCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useChat } from '../hooks/useChat';
import { useUser } from '../contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useSettings } from '../contexts/SettingsContext';

export function CustomerService() {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const { t } = useSettings();
  const { messages, isLoading, isTyping, steps, initSession, sendMessage } = useChat('AiAssistant');
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, steps]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const username = userProfile?.username || 'User';
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-16 shrink-0 border-b flex items-center px-4 bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">{t('customerService')}</h1>
            <p className="text-xs text-muted-foreground mt-1">Platform Assistant</p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 scroll-smooth bg-muted/20">
        <div className="max-w-3xl mx-auto space-y-6 flex flex-col">
          {/* Welcome Message */}
          <div className="flex w-full justify-center my-4">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              Today
            </span>
          </div>

          {!isLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center opacity-50 py-10">
              <Bot className="w-16 h-16 mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">Ask me anything about EsEdu!</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-end gap-2 w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  {!isUser && (
                    <Avatar className="w-8 h-8 shrink-0 mb-1 ring-1 ring-border">
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    </Avatar>
                  )}
                  
                  <div 
                    className={`relative max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      isUser 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-card text-card-foreground border border-border/50 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>

                  {isUser && (
                    <Avatar className="w-8 h-8 shrink-0 mb-1 ring-1 ring-primary/30">
                      <AvatarImage src={userProfile?.profilePic} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initial}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="flex flex-col gap-3 w-full animate-in fade-in duration-300">
              {/* Steps Visualizer */}
              {steps && steps.length > 0 && (
                <div className="bg-card/40 border border-border/40 rounded-2xl p-4 shadow-sm space-y-3 max-w-[85%] ml-10">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">
                    AI Execution Pipeline
                  </span>
                  <div className="space-y-2">
                    {steps.map((s, idx) => {
                      const isActive = s.statusType === 'active';
                      const isDone = s.statusType === 'done';
                      const isError = s.statusType === 'error';
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs transition-all animate-in slide-in-from-left-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{s.agent}</span>
                            <span className="text-muted-foreground">• {s.status}</span>
                          </div>
                          <div>
                            {isActive && <LoaderCircle className="w-3.5 h-3.5 animate-spin text-primary" />}
                            {isDone && <span className="text-green-500 font-bold">✓</span>}
                            {isError && <span className="text-destructive font-bold">✗</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* standard typing bubble */}
              <div className="flex items-end gap-2 w-full justify-start animate-in fade-in slide-in-from-bottom-2">
                <Avatar className="w-8 h-8 shrink-0 mb-1 ring-1 ring-border">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                </Avatar>
                <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-4 shadow-sm flex items-center gap-1 w-fit">
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="h-max shrink-0 bg-background border-t p-3 md:px-6 fixed bottom-0 left-0 right-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <form 
          onSubmit={handleSend}
          className="max-w-3xl mx-auto flex items-end gap-2 bg-muted/30 p-1 md:p-2 rounded-[1.5rem] border border-border focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all duration-300"
        >
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="shrink-0 h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Plus className="w-5 h-5" />
          </Button>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-1 placeholder:text-muted-foreground min-h-12 py-3 resize-none"
            autoComplete="off"
            disabled={isTyping}
          />

          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputValue.trim() || isTyping}
            className={`shrink-0 h-10 w-10 rounded-full transition-all duration-300 ${inputValue.trim() ? 'bg-primary text-primary-foreground shadow-md rotate-0' : 'bg-muted text-muted-foreground opacity-50 -rotate-12'}`}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
