import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export function LoadingScreen() {
  const { loadingProgress } = useAppContext();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Brutalist geometric accents */}
      <div className="absolute top-8 left-8 h-16 w-16 border-[3px] border-foreground bg-brutal-yellow" />
      <div className="absolute top-28 left-8 h-4 w-32 border-[2px] border-foreground bg-brutal-pink" />
      <div className="absolute bottom-8 right-8 h-16 w-16 border-[3px] border-foreground bg-brutal-blue" />
      <div className="absolute bottom-28 right-8 h-4 w-32 border-[2px] border-foreground bg-brutal-green" />

      <div className="relative flex flex-col items-center w-full max-w-xs">
        {/* Central Logo */}
        <motion.div
          animate={{ 
            y: [0, -8, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-12"
        >
          <div className="h-24 w-24 bg-primary border-[4px] border-foreground shadow-[6px_6px_0_0_var(--foreground)] flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Brand Name */}
        <h1 className="text-4xl font-heading font-extrabold tracking-tight mb-8 uppercase">
          CAMPUS<span className="text-primary">PULSE</span>
        </h1>

        {/* Progress bar — brutalist */}
        <div className="w-full space-y-3">
          <div className="w-full h-4 border-[2.5px] border-foreground bg-muted/30 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-primary"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <motion.p 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[10px] font-bold font-mono uppercase tracking-[0.3em] text-foreground"
            >
              {loadingProgress < 30 ? 'ESTABLISHING' : loadingProgress < 60 ? 'SYNCHRONIZING' : loadingProgress < 100 ? 'AUTHENTICATING' : 'WELCOME'}
            </motion.p>
            <span className="text-xs font-black font-mono text-muted-foreground tabular-nums">
              {Math.round(loadingProgress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
