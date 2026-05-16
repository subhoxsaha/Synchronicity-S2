import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut, 
  ChevronUp, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import { toast } from 'sonner';

export default function UnifiedSidebarAccount() {
  const { currentUser, activeRole, setActiveRole, logout } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!currentUser) return null;

  const handleLogout = () => {
    toast.loading("Signing out...");
    setTimeout(logout, 800);
  };

  const roles = [
    { id: UserRole.STUDENT, label: 'Student', icon: <Users className="h-3.5 w-3.5" />, color: 'bg-primary' },
    { id: UserRole.ORGANIZER, label: 'Organizer', icon: <Briefcase className="h-3.5 w-3.5" />, color: 'bg-secondary' },
    { id: UserRole.PLATFORM_ADMIN, label: 'Admin', icon: <ShieldCheck className="h-3.5 w-3.5" />, color: 'bg-destructive' },
  ];

  return (
    <div className="relative group/account">
      {/* Admin Toggle Bar (Horizontal above the profile div) */}
      {currentUser.role === UserRole.PLATFORM_ADMIN && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-1 p-1 mb-3 bg-accent/20 rounded-2xl border border-border/40 backdrop-blur-sm"
        >
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setActiveRole(r.id);
                toast.success(`Switched to ${r.label} view`);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${
                activeRole === r.id 
                ? `${r.color} text-white shadow-lg ring-2 ring-background` 
                : 'text-muted-foreground hover:bg-background hover:text-foreground'
              }`}
            >
              {r.icon}
              <span className="hidden xl:inline">{r.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Main Profile Div */}
      <div 
        id="sidebar-account-div"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-3 p-4 bg-gradient-to-br from-accent/40 to-accent/10 rounded-[2rem] border border-border/60 hover:bg-accent/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative">
          <Avatar className="h-11 w-11 border-2 border-background shadow-xl group-hover:scale-105 transition-transform">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="font-black bg-primary/10 text-primary uppercase">
              {(currentUser.name || '?')[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-background rounded-full shadow-sm" />
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <p className="text-sm font-black truncate text-foreground group-hover:text-primary transition-colors tracking-tight">
            {currentUser.name}
          </p>
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
              {activeRole === UserRole.PLATFORM_ADMIN ? 'System Root' : activeRole === UserRole.ORGANIZER ? 'Club Lead' : 'Campus Member'}
            </p>
          </div>
        </div>
        
        <div className={`relative transition-all duration-500 ${isMenuOpen ? 'rotate-180 text-primary' : 'text-muted-foreground/30 group-hover:text-primary/50'}`}>
           <ChevronUp className="h-5 w-5" />
        </div>
      </div>

      {/* Popover Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-full left-0 right-0 mb-3 z-[70] bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden p-2"
            >
              <div className="space-y-1">
                 <button className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-2xl transition-colors text-left group">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                       <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground">View Profile</span>
                 </button>
                 <button className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-2xl transition-colors text-left group">
                    <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                       <Settings className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Settings</span>
                 </button>
                 <div className="h-px bg-border/40 my-2 mx-2" />
                 <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 hover:bg-destructive/10 rounded-2xl transition-colors text-left group"
                 >
                    <div className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive group-hover:scale-110 transition-transform">
                       <LogOut className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-destructive">Sign Out</span>
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
