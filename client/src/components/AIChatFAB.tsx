import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Sparkles, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SUGGESTIONS = [
  'Events with free food today',
  'How to join the coding club?',
  'Upcoming tech workshops',
  'Events near the library',
];

export function AIChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ from: 'ai' | 'user'; text: string }>>([
    { from: 'ai', text: "I'm Nexus, your Campus AI. Looking for something specific? Try asking about events, clubs, or campus resources!" },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || inputText.trim();
    if (!msg) return;
    
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInputText('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        from: 'ai', 
        text: `I found some great options for "${msg}". Check out the Discover feed above — I've highlighted the most relevant results for you!` 
      }]);
    }, 800);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-32 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 h-[420px] bg-background/95 backdrop-blur-3xl border border-border/40 rounded-[2rem] shadow-2xl shadow-primary/10 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/20 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest block leading-none">Nexus AI</span>
                  <span className="text-[9px] font-medium text-muted-foreground">Campus Intelligence</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 no-scrollbar">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed font-medium ${
                    msg.from === 'ai' 
                      ? 'self-start bg-card border border-border/30 text-foreground/80 rounded-tl-sm' 
                      : 'self-end bg-primary text-primary-foreground rounded-br-sm'
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
              
              {/* Quick suggestions */}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUGGESTIONS.map(s => (
                    <button 
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-[9px] font-bold text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-3 border-t border-border/20 bg-card/30">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative flex items-center gap-2"
              >
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Nexus..." 
                  className="flex-1 bg-background border border-border/40 rounded-xl h-10 px-4 text-xs font-medium outline-none focus:border-primary/40 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-all shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 sm:right-6 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-center z-50 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X className="h-6 w-6 relative z-10" /> : <MessageSquare className="h-6 w-6 relative z-10" />}
      </motion.button>
    </>
  );
}
