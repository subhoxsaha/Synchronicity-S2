import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Sparkles, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../contexts/AppContext';
import { chatWithCampusAI } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const SUGGESTIONS = [
  'Events with free food today',
  'How to join the coding club?',
  'Upcoming tech workshops',
  'Events near the library',
];

export function AIChatFAB() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ from: 'ai' | 'user'; text: string }>>([
    { from: 'ai', text: "I'm Pulse AI, your Campus Assistant! Looking for something specific? Try asking about events, clubs, or campus resources!" },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const { events } = useAppContext();

  const handleSend = async (text?: string) => {
    const msg = text || inputText.trim();
    if (!msg) return;
    
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setInputText('');
    
    // Add loading indicator
    setMessages(prev => [...prev, { from: 'ai', text: '...' }]);
    
    // Fetch AI response
    const aiResponse = await chatWithCampusAI(msg, events, messages);
    
    let cleanResponse = aiResponse;
    const redirectMatch = aiResponse.match(/\[REDIRECT:(.*?)\]/);
    if (redirectMatch && redirectMatch[1]) {
      cleanResponse = aiResponse.replace(/\[REDIRECT:.*?\]/, '').trim();
      setTimeout(() => {
        navigate(redirectMatch[1].trim());
        setIsOpen(false);
      }, 1500); // Give user 1.5s to read the message before navigating
    }
    
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages.pop(); // Remove loading '...'
      newMessages.push({ from: 'ai', text: cleanResponse || "Navigating..." });
      return newMessages;
    });
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
            className="fixed bottom-32 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 h-[420px] bg-background border-[3px] border-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b-[3px] border-foreground flex items-center justify-between bg-brutal-yellow">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-background border-[2px] border-foreground flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  <Sparkles className="h-4 w-4 text-foreground animate-pulse" strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest block leading-none text-foreground">Pulse AI</span>
                  <span className="text-[9px] font-bold text-foreground/80 uppercase tracking-wider">Campus Intelligence</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="h-8 w-8 bg-background border-[2px] border-foreground flex items-center justify-center text-foreground hover:bg-brutal-pink transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                <X className="h-4 w-4" strokeWidth={3} />
              </button>
            </div>
            
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 no-scrollbar">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] p-3 text-xs leading-relaxed font-bold border-[2px] border-foreground shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                    msg.from === 'ai' 
                      ? 'self-start bg-brutal-pink text-foreground' 
                      : 'self-end bg-brutal-blue text-foreground'
                  }`}
                >
                  {msg.from === 'ai' && msg.text !== '...' ? (
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed font-bold text-[11px]" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-black uppercase tracking-wider text-[10px]" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1 font-bold text-[11px]" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1 font-bold text-[11px]" {...props} />,
                        li: ({node, ...props}) => <li className="leading-snug pl-1" {...props} />,
                        a: ({node, ...props}) => <a className="underline decoration-2 underline-offset-2 hover:bg-foreground hover:text-background transition-colors font-black cursor-pointer" target="_blank" rel="noopener noreferrer" {...props} />,
                        h1: ({node, ...props}) => <h1 className="font-black text-sm uppercase tracking-widest mb-2 mt-4 border-b-2 border-foreground pb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="font-black text-xs uppercase tracking-wider mb-2 mt-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="font-bold text-xs uppercase mb-1 mt-2" {...props} />,
                        code: ({node, ...props}) => <code className="bg-foreground/10 px-1 py-0.5 rounded-sm font-mono text-[10px]" {...props} />
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </motion.div>
              ))}
              
              {/* Quick suggestions */}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUGGESTIONS.map(s => (
                    <button 
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-[9px] font-black uppercase tracking-widest text-foreground bg-brutal-yellow border-[2px] border-foreground px-3 py-1.5 hover:bg-brutal-pink transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-3 border-t-[3px] border-foreground bg-muted/20">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative flex items-center gap-2"
              >
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Pulse AI..." 
                  className="flex-1 bg-background border-[2px] border-foreground h-10 px-4 text-xs font-black outline-none focus:bg-brutal-yellow/20 transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[4px_4px_0_0_rgba(0,0,0,1)] placeholder:text-muted-foreground/50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="h-10 w-10 bg-primary border-[2px] border-foreground text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-brutal-blue transition-all shrink-0 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <Send className="h-4 w-4" strokeWidth={2.5} />
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
        className="fixed bottom-24 right-4 sm:right-6 h-14 w-14 bg-brutal-yellow border-[3px] border-foreground text-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center z-50 hover:bg-brutal-pink transition-colors group"
      >
        {isOpen ? <X className="h-6 w-6" strokeWidth={3} /> : <MessageSquare className="h-6 w-6" strokeWidth={2.5} />}
      </motion.button>
    </>
  );
}
