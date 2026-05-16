import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "h-8", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex h-full aspect-square items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]"
        >
          {/* Outer Ring pulses slightly in CSS maybe, but here abstract */}
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" className="text-secondary opacity-30" />
          
          {/* Main Logo Mark: Interlocking P for Pulse/Platform */}
          <path
            d="M35 25V75M35 25H65C75 25 75 45 65 45H35M35 45L65 75"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />
          
          {/* Dynamic Accents */}
          <circle cx="65" cy="75" r="8" fill="currentColor" className="text-secondary" />
          <path d="M75 25L85 15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-secondary" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col -space-y-1 text-left">
          <span className="font-heading text-xl font-black tracking-tighter text-foreground uppercase">
            PRISMA<span className="text-primary italic">PULSE</span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
            Chromatic Hub
          </span>
        </div>
      )}
    </div>
  );
}
