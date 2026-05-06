import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, Plus, Ticket, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-around border border-border/50 bg-background/70 px-4 py-3 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-white/10 mx-auto max-w-lg md:bottom-8">
      <NavButton
        active={activeTab === 'home'}
        icon={<Home size={22} />}
        label="Home"
        onClick={() => onTabChange('home')}
      />
      <NavButton
        active={activeTab === 'explore'}
        icon={<Compass size={22} />}
        label="Map"
        onClick={() => onTabChange('explore')}
      />
      
      <div className="relative -top-8 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_30px_rgba(79,70,229,0.4)] ring-4 ring-background transition-shadow hover:shadow-primary/60"
        >
          <Plus className="h-8 w-8" />
        </motion.button>
      </div>

      <NavButton
        active={activeTab === 'tickets'}
        icon={<Ticket size={22} />}
        label="Tickets"
        onClick={() => onTabChange('tickets')}
      />
      <NavButton
        active={activeTab === 'profile'}
        icon={<User size={22} />}
        label="Profile"
        onClick={() => onTabChange('profile')}
      />
    </nav>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center gap-1 transition-all duration-300 min-w-[64px] ${
        active ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground'
      }`}
    >
      <div className={`flex items-center justify-center p-1.5 rounded-2xl transition-all duration-300 ${active ? 'bg-primary/10 shadow-sm' : 'group-active:scale-90'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-tighter transition-all duration-300 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="active-pill"
          className="absolute -bottom-1 h-1 w-4 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
}
