import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, Ticket, Sparkles, Trash2, X } from 'lucide-react';
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
      <PopoverTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent/50 transition-all hover:bg-accent active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-black text-white ring-2 ring-background"
            >
              {unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-[2rem] border-none shadow-2xl overflow-hidden" align="end" sideOffset={8}>
        <div className="bg-background">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-heading font-black text-sm uppercase tracking-widest">Inbox</h3>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearNotifications}
                className="h-8 px-2 text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-80">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-bold">All caught up!</p>
                  <p className="text-xs text-muted-foreground">Check back later for new event updates.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`relative p-5 transition-colors cursor-pointer group ${
                      !notif.read ? 'bg-primary/5' : 'hover:bg-accent/30'
                    }`}
                    onClick={() => markNotificationAsRead(notif.id)}
                  >
                    <div className="flex gap-4">
                      <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        notif.type === NotificationType.UPCOMING_EVENT ? 'bg-secondary/10' : 'bg-primary/10'
                      }`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="space-y-1 grow">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-black uppercase tracking-tight ${
                            !notif.read ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] font-medium text-muted-foreground">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${
                          !notif.read ? 'text-foreground/80 font-medium' : 'text-muted-foreground font-normal'
                        }`}>
                          {notif.message}
                        </p>
                      </div>
                    </div>
                    {!notif.read && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {notifications.length > 0 && (
            <div className="p-4 border-t border-border bg-accent/10">
              <Button size="sm" variant="ghost" className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                View All Activity
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
