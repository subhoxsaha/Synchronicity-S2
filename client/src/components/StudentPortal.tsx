import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, User as UserIcon, MapPin, Sparkles, Users, Globe, Clock, Bell, Search } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { CampusEvent, EventStatus, UserRole } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import { Logo } from './Logo';
import { EventCard } from './EventCard';
import { BottomNav } from './BottomNav';
import { MapView } from './MapView';
import { NotificationBell } from './NotificationBell';
import { AccountSection } from './AccountSection';
import { ManagementView } from './ManagementView';
import { CreatePostDialog } from './CreatePostDialog';
import { DiscoverView } from './DiscoverView';
import { AIChatFAB } from './AIChatFAB';

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('home');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { events, currentUser, registrations, registerForEvent, cancelRegistration, logout, users } = useAppContext();

  const registeredEventIds = registrations.map(r => r.eventId);
  const approvedEvents = events.filter(e => e.status === EventStatus.APPROVED);

  const studentStats = [
    { label: 'Followers', value: currentUser?.followers?.length || 0, icon: <Users className="h-5 w-5" /> },
    { label: 'Following', value: currentUser?.following?.length || 0, icon: <UserIcon className="h-5 w-5" /> },
    { label: 'Moments', value: events.filter(e => e.organizerId === currentUser?.id).length, icon: <Sparkles className="h-5 w-5" /> },
  ];

  const isFullBleed = activeTab === 'map';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30 pb-24">
      {/* ── TOP NAV — brutalist ── */}
      <nav className="sticky top-0 z-50 border-b-[3px] border-foreground bg-foreground px-4 sm:px-6 md:px-8 lg:px-12 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="h-9 w-9 bg-primary border-[2px] border-background flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-base font-extrabold tracking-tight leading-none text-background uppercase">
                Campus<span className="text-primary">Pulse</span>
              </span>
              <span className="text-[9px] font-bold font-mono text-background/50 uppercase tracking-widest">Student Hub</span>
            </div>
          </div>

          {/* Nav links - desktop — brutalist tabs */}
          <div className="hidden md:flex items-center gap-0">
            {[
              { id: 'home', label: 'Feed' },
              { id: 'map', label: 'Discover' },
              { id: 'tickets', label: 'Tickets' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-xs font-black uppercase tracking-widest transition-colors border-x border-background/10 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-background/40 hover:text-background/80 hover:bg-background/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="h-6 w-px bg-background/20 mx-1 hidden md:block" />
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setActiveTab('profile')}>
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold leading-none text-background">{currentUser?.name}</span>
                <span className="text-[9px] font-bold font-mono text-primary uppercase">{currentUser?.role}</span>
              </div>
              <Avatar className="h-9 w-9 border-[2.5px] border-background transition-all group-hover:border-primary">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground font-black text-xs">{currentUser?.name?.[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className={`flex-1 relative z-10 ${isFullBleed ? '' : 'max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8'}`}>
        <AnimatePresence mode="wait">
          {/* HOME / FEED */}
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-[1600px] mx-auto px-0">
              <DiscoverView events={approvedEvents} registeredEventIds={registeredEventIds} registerForEvent={registerForEvent} />
            </motion.div>
          )}

          {/* MAP / DISCOVER */}
          {activeTab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6">
              <DiscoverView events={approvedEvents} registeredEventIds={registeredEventIds} registerForEvent={registerForEvent} />
            </motion.div>
          )}

          {/* TICKETS */}
          {activeTab === 'tickets' && (
            <motion.div key="tickets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="py-8 max-w-5xl mx-auto space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight uppercase">My Tickets</h2>
                <p className="text-muted-foreground text-sm font-mono uppercase tracking-wider">Your registered events and passes</p>
              </div>

              {registrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 border-[2.5px] border-dashed border-foreground/30 bg-card">
                  <Ticket className="h-16 w-16 text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground/40 font-bold text-sm uppercase tracking-widest">No tickets yet</p>
                  <p className="text-muted-foreground/30 text-xs mt-1 font-mono">Register for events to see them here</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {registrations.map(reg => {
                    const event = events.find(e => e.id === reg.eventId);
                    if (!event) return null;
                    return <TicketCard key={reg.id} registration={reg} event={event} onCancel={cancelRegistration} />;
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* MANAGE */}
          {activeTab === 'manage' && (
            <motion.div key="manage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
              <ManagementView />
            </motion.div>
          )}

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="py-8 max-w-[1200px] mx-auto">
              <AccountSection user={currentUser} logout={logout} stats={studentStats} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CreatePostDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <AIChatFAB />
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role={currentUser?.role}
        isApproved={currentUser?.isApproved}
        onCreatePost={() => setIsCreateOpen(true)}
      />
    </div>
  );
}

// ── TICKET CARD — brutalist ──
const TicketCard: React.FC<{
  registration: any,
  event: CampusEvent,
  onCancel: (id: string) => Promise<void>
}> = ({ registration, event, onCancel }) => {
  const [showQR, setShowQR] = useState(false);

  return (
    <Card className="overflow-hidden border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-all group">
      <CardContent className="p-0">
        <div className="flex h-36">
          <div className="w-36 shrink-0 relative overflow-hidden border-r-[2.5px] border-foreground">
            <img src={event.imageUrl} className="h-full w-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
            <Badge variant="default" className="absolute top-3 left-3 text-[9px]">Ticket</Badge>
          </div>
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm leading-tight line-clamp-1 uppercase">{event.title}</h3>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">{event.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-primary">
                <Clock className="h-3 w-3" />
                <span className="text-[10px] font-bold font-mono">{new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onCancel(registration.id)} className="h-7 text-[9px] font-black uppercase text-destructive hover:bg-destructive/10">Cancel</Button>
                <Button size="sm" onClick={() => setShowQR(true)} className="h-7 text-[9px] font-black uppercase">View</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm p-0 overflow-hidden border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)]">
          <DialogTitle className="sr-only">Ticket QR Code</DialogTitle>
          <div className="bg-primary p-10 flex flex-col items-center text-primary-foreground space-y-4">
            <div className="bg-white p-5 border-[3px] border-foreground shadow-[4px_4px_0_0_var(--foreground)]"><img src={registration.qrCode} className="h-44 w-44" alt="QR" /></div>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">Admission Pass</p>
              <h2 className="text-lg font-extrabold uppercase">{event.title}</h2>
            </div>
          </div>
          <div className="p-6 text-center bg-background">
            <div className="flex justify-around mb-4">
              <div><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Seat</p><p className="text-base font-extrabold">GENERAL</p></div>
              <div className="h-8 w-px bg-foreground/20" />
              <div><p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Gate</p><p className="text-base font-extrabold">B-42</p></div>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Present this QR code at the entrance for check-in.</p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
