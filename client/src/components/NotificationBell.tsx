import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, Ticket, Sparkles, Trash2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { NotificationType } from '../types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NotificationBell() {
  const { notifications, markNotificationAsRead, clearNotifications } = useAppContext();
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.UPCOMING_EVENT:
        return <Ticket className="h-4 w-4 text-secondary" />;
      case NotificationType.NEW_EVENT:
        return <Sparkles className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger className="relative flex h-9 w-9 items-center justify-center border-[2px] border-background bg-background/10 transition-all hover:bg-background/20 active:translate-y-[2px] cursor-pointer outline-none">
        <Bell className="h-4 w-4 text-background" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-destructive text-[9px] font-black text-white border-[2px] border-background"
            >
              {unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-[2.5px] border-foreground shadow-[6px_6px_0_0_var(--foreground)] bg-card" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-[2.5px] border-foreground bg-foreground text-background">
          <h3 className="font-black text-xs uppercase tracking-[0.2em]">Inbox</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="h-7 px-2 text-[9px] font-black text-background/60 hover:text-destructive hover:bg-transparent transition-colors uppercase tracking-widest"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Body */}
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
              <div className="h-14 w-14 border-[2.5px] border-foreground/20 flex items-center justify-center">
                <Bell className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <div>
                <p className="text-sm font-black uppercase">All caught up</p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-1">No new notifications</p>
              </div>
            </div>
          ) : (
            <div className="divide-y-[2px] divide-foreground/10">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`relative p-4 transition-colors cursor-pointer group ${
                    !notif.read ? 'bg-primary/5' : 'hover:bg-accent/30'
                  }`}
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border-[2px] border-foreground/20 ${
                      notif.type === NotificationType.UPCOMING_EVENT ? 'bg-secondary/10' : 'bg-primary/10'
                    }`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="space-y-0.5 grow min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[10px] font-black uppercase tracking-tight truncate ${
                          !notif.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notif.title}
                        </p>
                        <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed line-clamp-2 ${
                        !notif.read ? 'text-foreground/80 font-medium' : 'text-muted-foreground'
                      }`}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                  {!notif.read && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 bg-primary" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t-[2.5px] border-foreground/10 bg-muted/30">
            <Button size="sm" variant="ghost" className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/10 active:translate-y-[2px] transition-transform">
              View All Activity
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
