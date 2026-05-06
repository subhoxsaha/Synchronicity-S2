import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Dynamic Background Pulse Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.5, 2.5],
              opacity: [0, 0.15, 0] 
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.2,
              ease: "easeOut"
            }}
            className="absolute h-[400px] w-[400px] rounded-full border border-primary/20"
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        {/* Central Logo with Breathing Effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            filter: [
              'drop-shadow(0 0 0px rgba(79,70,229,0))',
              'drop-shadow(0 0 30px rgba(79,70,229,0.25))',
              'drop-shadow(0 0 0px rgba(79,70,229,0))'
            ]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Logo className="h-28" showText={false} />
        </motion.div>

        {/* Status Indicators */}
        <div className="mt-16 flex flex-col items-center space-y-5">
          <div className="relative h-[2px] w-32 overflow-hidden bg-accent/30 rounded-full">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </div>
          
          <div className="flex flex-col items-center -space-y-0.5">
            <motion.p 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[11px] font-black uppercase tracking-[0.5em] text-primary"
            >
              Initializing Pulse
            </motion.p>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 font-mono">
              Nexus-7 // Handshake Protocol
            </p>
          </div>
        </div>
      </div>

      {/* Futuristic Corner Accents */}
      <div className="absolute top-10 left-10 flex gap-2">
        <motion.div 
          animate={{ width: [16, 48, 16] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="h-1 bg-primary/20 rounded-full" 
        />
        <div className="h-1 w-1 bg-primary/40 rounded-full" />
      </div>
      <div className="absolute bottom-10 right-10 flex gap-2 items-end flex-col">
        <div className="h-1 w-1 bg-secondary/40 rounded-full" />
        <motion.div 
          animate={{ width: [48, 16, 48] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="h-1 bg-secondary/20 rounded-full" 
        />
      </div>
    </div>
  );
}
