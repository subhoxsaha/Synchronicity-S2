import React from 'react';
import { motion } from 'motion/react';
import { Home, Globe, Ticket, Bookmark, User, Plus, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role?: UserRole;
  isApproved?: boolean;
  onCreatePost?: () => void;
}

const TABS = [
  { id: 'home', icon: Home, label: 'HOME' },
  { id: 'discover', icon: Globe, label: 'DISCOVER' },
  { id: 'tickets', icon: Ticket, label: 'TICKETS' },
  { id: 'bookmarks', icon: Bookmark, label: 'SAVED' },
  { id: 'profile', icon: User, label: 'PROFILE' },
];

export function BottomNav({ activeTab, onTabChange, role, isApproved, onCreatePost }: BottomNavProps) {
  const showManage = role === UserRole.ADMIN || (role === UserRole.ORGANIZER && isApproved);

  const effectiveTab = activeTab === 'home' ? 'home' : activeTab;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-stretch bg-foreground border-t-[3px] border-foreground">
        {TABS.map((tab) => {
          const Icon = tab.icon;

          // Discover tab
          if (tab.id === 'discover') {
            const isActive = activeTab === 'map';
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange('map')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-100 border-r border-background/10 last:border-r-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-background/40 hover:text-background/70 hover:bg-background/5'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[8px] font-bold font-mono uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          }

          // Replace bookmarks with manage for admins/organizers
          if (tab.id === 'bookmarks' && showManage) {
            const isActive = activeTab === 'manage';
            return (
              <button
                key="manage"
                onClick={() => onTabChange('manage')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-100 border-r border-background/10 last:border-r-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-background/40 hover:text-background/70 hover:bg-background/5'
                }`}
              >
                {role === UserRole.ADMIN
                  ? <ShieldCheck className="h-5 w-5" />
                  : <LayoutDashboard className="h-5 w-5" />
                }
                <span className="text-[8px] font-bold font-mono uppercase tracking-wider">MANAGE</span>
              </button>
            );
          }

          const isActive = effectiveTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors duration-100 border-r border-background/10 last:border-r-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-background/40 hover:text-background/70 hover:bg-background/5'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[8px] font-bold font-mono uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
