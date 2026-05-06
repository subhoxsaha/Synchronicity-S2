import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Ticket, User as UserIcon, ArrowRight, CheckCircle2, MapPin, Clock, Sparkles } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { CampusEvent, Registration } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { Logo } from './Logo';
import { EventCard } from './EventCard';
import { StoryReel } from './StoryReel';
import { BottomNav } from './BottomNav';
import { MapView } from './MapView';
import { NotificationBell } from './NotificationBell';

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState<'feed' | 'map'>('feed');
  const { events, currentUser, registrations, registerForEvent } = useAppContext();

  const registeredEventIds = registrations.map(r => r.eventId);

  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  return (
    <div className="flex flex-col pb-20 bg-background min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background/60 px-6 py-5 backdrop-blur-xl border-b border-border/50">
        <Logo className="h-9" />
        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="relative group">
            <Avatar className="h-10 w-10 border-2 border-primary/20 p-0.5 transition-all group-hover:scale-105 active:scale-95 cursor-pointer ring-offset-2 ring-offset-background group-hover:ring-2 group-hover:ring-primary/20">
              <AvatarImage src={currentUser?.avatar} className="rounded-full" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{currentUser?.name[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 border-2 border-background rounded-full shadow-sm" />
          </div>
        </div>
      </header>

      <main className="px-6 py-6 pb-24">
        {activeTab === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Search Bar & View Toggle */}
            <section className="space-y-6">
              <div className="group relative">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl transition-all group-focus-within:bg-primary/10" />
                <div className="relative flex items-center bg-accent/30 rounded-2xl border border-border shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background">
                  <Search className="ml-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Discover events, clubs, or workshops..."
                    className="h-14 w-full bg-transparent px-4 text-sm font-medium outline-none placeholder:text-muted-foreground/60"
                  />
                  <div className="mr-2 flex gap-1">
                    <kbd className="hidden sm:inline-flex h-8 items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </div>
              </div>

              <div className="flex p-1.5 bg-accent/40 rounded-2xl w-fit border border-border/40 backdrop-blur-sm mx-auto sm:mx-0">
                <button
                  onClick={() => setViewMode('feed')}
                  className={`flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all transform duration-300 ${
                    viewMode === 'feed' 
                    ? 'bg-background shadow-lg text-primary scale-100 border border-border/50' 
                    : 'text-muted-foreground/60 scale-95 hover:text-muted-foreground'
                  }`}
                >
                  <Ticket className="h-3.5 w-3.5" />
                  Live Feed
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all transform duration-300 ${
                    viewMode === 'map' 
                    ? 'bg-background shadow-lg text-primary scale-100 border border-border/50' 
                    : 'text-muted-foreground/60 scale-95 hover:text-muted-foreground'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Interactive Map
                </button>
              </div>
            </section>

            {viewMode === 'feed' ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key="feed-view"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="space-y-12"
                >
                  {/* Stories Section */}
                  <section className="space-y-5">
                    <div className="flex items-end justify-between px-1">
                      <div className="space-y-0.5">
                        <h2 className="font-heading text-2xl font-black tracking-tight">Campus Stories</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Moments from today</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                        Historical <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                    <StoryReel events={events} />
                  </section>

                  {/* Recommended Section */}
                  <section className="space-y-5">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-lg font-black tracking-tight">For You</h2>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] uppercase font-black px-2 tracking-widest">
                          <Sparkles className="h-2.5 w-2.5 mr-1" />
                          AI Smart
                        </Badge>
                      </div>
                    </div>
                    <div className="grid gap-5">
                      {events.slice(0, 2).map((event) => (
                        <EventCard 
                          key={event.id} 
                          event={event} 
                          isRegistered={registeredEventIds.includes(event.id)}
                          onRegister={() => registerForEvent(event.id)}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Feed Section */}
                  <section className="space-y-5 pb-8">
                    <div className="px-1 space-y-0.5">
                      <h2 className="font-heading text-lg font-black tracking-tight text-foreground/80">Trending Now</h2>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">High attendance expected</p>
                    </div>
                    <div className="grid gap-5">
                      {events.map((event) => (
                        <EventCard 
                          key={event.id} 
                          event={event} 
                          isRegistered={registeredEventIds.includes(event.id)}
                          onRegister={() => registerForEvent(event.id)}
                        />
                      ))}
                    </div>
                  </section>
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div
                key="map-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-1">
                   <div className="space-y-0.5">
                     <h2 className="font-heading text-xl font-black tracking-tight">Interactive Campus</h2>
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nearby hotspots</p>
                   </div>
                   <div className="flex items-center gap-1.5 bg-accent/30 rounded-xl px-3 py-1.5 border border-border/50">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-foreground">3 Events Live</span>
                   </div>
                </div>
                <MapView events={events} />
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="font-heading text-2xl font-bold">My Tickets</h2>
            {registrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <Ticket className="h-16 w-16 opacity-20 mb-4" />
                <p>No tickets found. Start exploring!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {registrations.map(reg => {
                  const event = events.find(e => e.id === reg.eventId);
                  if (!event) return null;
                  return (
                    <TicketCard key={reg.id} registration={reg} event={event} />
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* User Profile Info */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-xl">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback>{currentUser?.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
                <p className="text-muted-foreground">{currentUser?.major} • {currentUser?.year}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none bg-accent/30 rounded-3xl">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-black text-primary">{currentUser?.attendanceStreak}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Day Streak</p>
                </CardContent>
              </Card>
              <Card className="border-none bg-secondary/10 rounded-3xl">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-black text-secondary">{registrations.length}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Events Done</p>
                </CardContent>
              </Card>
            </div>

            {/* Badges */}
            <section className="space-y-4">
              <h3 className="font-heading text-lg font-bold">Earned Badges</h3>
              <div className="grid grid-cols-2 gap-3">
                {currentUser?.badges?.map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 rounded-2xl bg-accent/20 p-4 border border-border/50">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-black">
                      {badge[0]}
                    </div>
                    <span className="text-xs font-bold">{badge}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Interests Section */}
            <section className="space-y-4">
              <h3 className="font-heading text-lg font-bold">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {currentUser?.interests?.map((interest, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1 rounded-full text-xs font-bold border-none capitalize">
                    # {interest}
                  </Badge>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

const TicketCard: React.FC<{ registration: Registration, event: CampusEvent }> = ({ registration, event }) => {
  const [showQR, setShowQR] = useState(false);

  return (
    <Card className="overflow-hidden border-none bg-accent/20 rounded-3xl border border-border/50">
      <CardContent className="p-0">
        <div className="flex h-32">
          <div className="w-32 flex-shrink-0">
            <img src={`${event.imageUrl}?q=80&w=300`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col justify-center p-4 grow gap-1">
            <h3 className="font-heading font-bold line-clamp-1">{event.title}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {event.location}
            </p>
            <p className="text-xs font-bold text-primary mt-1">
              {new Date(event.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="w-16 flex items-center justify-center border-l border-dashed border-border/50">
            <Button variant="ghost" size="icon" onClick={() => setShowQR(true)} className="rounded-full hover:bg-primary/20">
              <ArrowRight className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] bg-background p-8 border-none shadow-2xl">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold">Admission Ticket</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">Show this at the entrance</DialogDescription>
            </div>
            
            <div className="relative p-4 bg-white rounded-3xl shadow-inner group">
               {/* Mock QR Code */}
               <div className="h-64 w-64 grid grid-cols-10 grid-rows-10 gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className={`rounded-sm ${(i*13) % 5 === 0 ? 'bg-primary' : 'bg-transparent'}`} />
                  ))}
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-lg p-2">
                     <img src={event.imageUrl} className="h-full w-full rounded-lg object-cover" referrerPolicy="no-referrer" />
                  </div>
               </div>
            </div>

            <div className="w-full space-y-2 border-t border-dashed pt-6">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Event Token</p>
               <p className="font-mono text-xs text-primary font-bold">{registration.qrCode.toUpperCase()}</p>
            </div>

            <div className="flex w-full items-center justify-between p-4 bg-accent/30 rounded-2xl">
               <div className="text-left">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                  <p className={`font-bold ${registration.checkedIn ? 'text-secondary' : 'text-primary'}`}>
                    {registration.checkedIn ? 'Checked In' : 'Valid Entry'}
                  </p>
               </div>
               <Badge variant="outline" className="rounded-full border-2">Verified</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
