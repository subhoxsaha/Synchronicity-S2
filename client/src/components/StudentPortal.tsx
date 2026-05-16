import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, User as UserIcon, MapPin, Sparkles, Users, Globe, Clock, Bell, Search, Bookmark } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { CampusEvent, EventStatus, UserRole } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import QRCode from 'react-qr-code';

import { Logo } from './Logo';
import { EventCard } from './EventCard';
import { BottomNav } from './BottomNav';
import { NotificationBell } from './NotificationBell';
import { AccountSection } from './AccountSection';
import { ManagementView } from './ManagementView';
import { CreatePostDialog } from './CreatePostDialog';
import { DiscoverView } from './DiscoverView';
import { AIChatFAB } from './AIChatFAB';
import { OrganizationProfile } from './OrganizationProfile';

// ── Route → tab mapping ──
const ROUTE_TO_TAB: Record<string, string> = {
  '/': 'home',
  '/discover': 'discover',
  '/tickets': 'tickets',
  '/bookmarks': 'bookmarks',
  '/manage': 'manage',
  '/profile': 'profile',
};

const TAB_TO_ROUTE: Record<string, string> = {
  home: '/',
  discover: '/discover',
  tickets: '/tickets',
  bookmarks: '/bookmarks',
  manage: '/manage',
  profile: '/profile',
};

const TAB_LABELS: Record<string, string> = {
  home: 'Feed',
  discover: 'Discover',
  tickets: 'Tickets',
  bookmarks: 'Saved',
  manage: 'Manage',
  profile: 'Profile',
};

export default function StudentPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const { events, posts, currentUser, registrations, registerForEvent, cancelRegistration, logout, users } = useAppContext();

  const registeredEventIds = registrations.map(r => r.eventId);
  const allContent = [...events, ...posts].sort((a: any, b: any) => new Date(b.date || b.createdAt || Date.now()).getTime() - new Date(a.date || a.createdAt || Date.now()).getTime());
  const approvedEvents = allContent.filter((e: any) => e.status === EventStatus.APPROVED || e.status === 'approved');

  // Derive activeTab from URL
  const activeTab = ROUTE_TO_TAB[location.pathname] || 'home';

  const handleTabChange = (tab: string) => {
    const route = TAB_TO_ROUTE[tab] || '/';
    navigate(route);
  };

  const studentStats = [
    { label: 'Followers', value: currentUser?.followers?.length || 0, icon: <Users className="h-5 w-5" /> },
    { label: 'Following', value: currentUser?.following?.length || 0, icon: <UserIcon className="h-5 w-5" /> },
    { label: 'Moments', value: events.filter(e => e.organizerId === currentUser?.id).length, icon: <Sparkles className="h-5 w-5" /> },
  ];

  const isFullBleed = activeTab === 'discover';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30 pb-[72px] sm:pb-24">
      {/* ── TOP NAV — brutalist ── */}
      <nav className="sticky top-0 z-50 border-b-[3px] border-foreground bg-foreground px-4 sm:px-6 md:px-8 lg:px-12 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('home')}>
            <div className="h-9 w-9 bg-primary border-[2px] border-background flex items-center justify-center shrink-0">
              <Globe className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight leading-none text-background uppercase">
                  Campus<span className="text-primary">Pulse</span>
                </span>
                <span className="text-[9px] font-bold font-mono text-background/50 uppercase tracking-widest">Student Hub</span>
              </div>
              <span className="text-background/30 font-light text-2xl leading-none -mt-1 pb-1">|</span>
              <span className="text-sm font-black text-background uppercase tracking-widest">
                {TAB_LABELS[activeTab] || activeTab}
              </span>
            </div>
          </div>


          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="h-6 w-px bg-background/20 mx-1 hidden md:block" />
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleTabChange('profile')}>
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

      {/* ── MAIN CONTENT (route-based) ── */}
      <main className={`flex-1 relative z-10 ${isFullBleed ? '' : 'max-w-[1600px] mx-auto w-full px-3 py-4 sm:py-6 sm:px-6 md:p-8'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* HOME / FEED */}
            <Route path="/" element={
              <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="w-full max-w-[1600px] mx-auto px-0">
                <DiscoverView events={approvedEvents} registeredEventIds={registeredEventIds} registerForEvent={registerForEvent} defaultTab="feed" hideTabs />
              </motion.div>
            } />

            {/* DISCOVER */}
            <Route path="/discover" element={
              <motion.div key="discover" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="w-full max-w-[1600px] mx-auto px-0">
                <DiscoverView events={approvedEvents} registeredEventIds={registeredEventIds} registerForEvent={registerForEvent} defaultTab="feed" showMapInitial />
              </motion.div>
            } />

            {/* TICKETS */}
            <Route path="/tickets" element={
              <motion.div key="tickets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-5xl mx-auto space-y-6 md:space-y-8 w-full">
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase">My Tickets</h2>
                  <p className="text-muted-foreground text-[10px] md:text-sm font-mono uppercase tracking-wider">Your registered events and passes</p>
                </div>

                {registrations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 sm:py-32 border-[2.5px] border-dashed border-foreground/30 bg-card">
                    <Ticket className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground/40 font-bold text-sm uppercase tracking-widest">No tickets yet</p>
                    <p className="text-muted-foreground/30 text-xs mt-1 font-mono">Register for events to see them here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {registrations.map((reg, index) => {
                      const event = events.find(e => e.id === reg.eventId);
                      if (!event) return null;
                      return (
                        <motion.div key={reg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                          <TicketCard registration={reg} event={event} onCancel={cancelRegistration} />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            } />

            {/* BOOKMARKS */}
            <Route path="/bookmarks" element={
              <motion.div key="bookmarks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 w-full">
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase">Saved Events</h2>
                  <p className="text-muted-foreground text-[10px] md:text-sm font-mono uppercase tracking-wider">Your bookmarked items</p>
                </div>

                {(!currentUser?.bookmarkedEvents || currentUser.bookmarkedEvents.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-20 sm:py-32 border-[2.5px] border-dashed border-foreground/30 bg-card">
                    <Bookmark className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground/40 font-bold text-sm uppercase tracking-widest">No saved events</p>
                    <p className="text-muted-foreground/30 text-xs mt-1 font-mono">Bookmark events to see them here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                    {currentUser.bookmarkedEvents.map((eventId, index) => {
                      const event = events.find(e => e.id === eventId);
                      if (!event) return null;
                      return (
                        <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="h-full">
                          <EventCard 
                            event={event as CampusEvent}
                            onRegister={() => registerForEvent(event.id)}
                            isRegistered={registeredEventIds.includes(event.id)}
                            isExpanded={expandedCardId === event.id}
                            onToggleExpand={(id) => setExpandedCardId(prev => prev === id ? null : id)}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            } />

            {/* MANAGE */}
            <Route path="/manage" element={
              <motion.div key="manage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="flex-1 w-full">
                <ManagementView />
              </motion.div>
            } />

            {/* PROFILE */}
            <Route path="/profile" element={
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="max-w-[1200px] mx-auto w-full">
                <AccountSection user={currentUser} logout={logout} stats={studentStats} />
              </motion.div>
            } />

            {/* ORGANIZATION PROFILE */}
            <Route path="/org/:orgId" element={
              <motion.div key="org" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="w-full">
                <OrganizationProfile />
              </motion.div>
            } />

            {/* Catch-all → redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <CreatePostDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <AIChatFAB />
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
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
        <div className="flex h-32 sm:h-36">
          <div className="w-24 sm:w-36 shrink-0 relative overflow-hidden border-r-[2.5px] border-foreground">
            <img src={event.imageUrl} className="h-full w-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
            <Badge variant="default" className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[9px]">Ticket</Badge>
          </div>
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between min-w-0">
            <div className="space-y-1">
              <h3 className="font-extrabold text-xs sm:text-sm leading-tight line-clamp-1 uppercase">{event.title}</h3>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">{event.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-primary shrink-0">
                <Clock className="h-3 w-3" />
                <span className="text-[10px] font-bold font-mono">{new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex gap-1.5 sm:gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => onCancel(registration.id)} className="h-7 px-2 sm:px-3 text-[8px] sm:text-[9px] font-black uppercase text-destructive hover:bg-destructive/10">Cancel</Button>
                <Button size="sm" onClick={() => setShowQR(true)} className="h-7 px-2 sm:px-3 text-[8px] sm:text-[9px] font-black uppercase">View</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-[90vw] sm:max-w-sm p-0 overflow-hidden border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)]">
          <DialogTitle className="sr-only">Ticket QR Code</DialogTitle>
          <div className="bg-primary p-6 sm:p-10 flex flex-col items-center text-primary-foreground space-y-4">
            <div className="bg-white p-4 sm:p-5 border-[3px] border-foreground shadow-[4px_4px_0_0_var(--foreground)]"><QRCode value={registration.qrCode} size={160} /></div>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">Admission Pass</p>
              <h2 className="text-base sm:text-lg font-extrabold uppercase">{event.title}</h2>
            </div>
          </div>
          <div className="p-4 sm:p-6 text-center bg-background">
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
