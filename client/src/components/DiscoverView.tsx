import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Map as MapIcon, ChevronRight, TrendingUp, Flame, Sparkles, Bookmark, MapPin, Calendar, ArrowLeft, Grid2X2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventCard } from './EventCard';
import { AnnouncementCard, RecruitmentCard } from './PostCards';
import { FilterDrawer } from './FilterDrawer';
import { StoryReel } from './StoryReel';
import { MapView } from './MapView';
import { EventCategory, CampusEvent } from '../types';

interface DiscoverViewProps {
  events: CampusEvent[];
  registeredEventIds: string[];
  registerForEvent: (id: string) => void;
}

// Mock data for the polymorphic feed
const MOCK_ANNOUNCEMENTS = [
  { id: 'a1', title: 'Campus Wi-Fi Maintenance', description: 'Network maintenance tonight 2-4 AM. Block A–D affected.', tags: ['urgent'], date: new Date().toISOString(), organizerId: 'IT Services', priority: 'high' as const },
  { id: 'a2', title: 'Library Extended Hours — Exam Week', description: 'Central library open 24/7 during exam period (May 10–20).', tags: ['academic'], date: new Date(Date.now() - 86400000).toISOString(), organizerId: 'Library', priority: 'medium' as const },
];

const MOCK_RECRUITMENTS = [
  { id: 'r1', title: 'Tech Club — Core Team 2026', description: 'Join the core team for hackathons and workshops.', role: 'Frontend Developer', roles: ['Frontend Dev', 'Backend Eng', 'UI/UX'], deadline: new Date(Date.now() + 3*86400000).toISOString(), date: new Date().toISOString(), organizerId: 'Tech Club', eligibility: '2nd year+', applicationUrl: '#' },
];

export function DiscoverView({ events, registeredEventIds, registerForEvent }: DiscoverViewProps) {
  const [viewMode, setViewMode] = useState<'map' | 'feed'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Today', ...Object.values(EventCategory), 'Free'];

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.tags?.some(t => t.toLowerCase().includes(q)));
    }
    if (selectedCategory === 'Today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(e => new Date(e.date).toDateString() === today);
    } else if (selectedCategory !== 'All' && selectedCategory !== 'Free') {
      filtered = filtered.filter(e => e.category?.includes(selectedCategory as EventCategory));
    }
    return filtered;
  }, [events, searchQuery, selectedCategory]);

  // ── MAP VIEW ──
  if (viewMode === 'map') {
    return (
      <div className="relative w-full h-[calc(100vh-140px)] -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 -mt-6 md:-mt-8">
        {/* Full-screen Map */}
        <div className="absolute inset-0">
          <MapView events={filteredEvents} />
        </div>

        {/* Top search overlay — brutalist */}
        <div className="absolute top-4 left-4 right-4 z-30 flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <input
                type="text"
                placeholder="Search events near you..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-background border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] pl-11 pr-4 text-sm font-medium outline-none focus:shadow-[5px_5px_0_0_var(--foreground)] transition-shadow placeholder:text-muted-foreground/40"
              />
            </div>
            <button
              onClick={() => setViewMode('feed')}
              className="h-12 w-12 bg-background border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] flex items-center justify-center text-foreground hover:bg-brutal-yellow/30 transition-colors active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              <Grid2X2 className="h-5 w-5" />
            </button>
          </div>

          {/* Active Organizations Overlay inside Map */}
          <div className="bg-background border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] p-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-primary" /> Active Organizations
            </h3>
            <StoryReel events={filteredEvents} />
          </div>
        </div>

        {/* Bottom event carousel — brutalist cards */}
        <div className="absolute bottom-4 left-0 right-0 z-30">
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="snap-center shrink-0 w-72 sm:w-80"
              >
                <div className="bg-background border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] overflow-hidden">
                  {/* Event image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.assets?.bannerUrl || event.imageUrl}
                      className="h-full w-full object-cover"
                      alt={event.title}
                      referrerPolicy="no-referrer"
                    />
                    {/* Price badge */}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="green" className="text-[9px]">Free</Badge>
                    </div>
                    {/* Bookmark */}
                    <button className="absolute bottom-3 right-3 h-8 w-8 bg-background border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] flex items-center justify-center text-foreground hover:bg-brutal-yellow/30 transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Event info */}
                  <div className="p-4 space-y-2 border-t-[2.5px] border-foreground">
                    <h3 className="text-foreground font-extrabold text-sm leading-tight truncate uppercase">{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                      <Calendar className="h-3 w-3" />
                      <span className="font-mono text-[10px]">{new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(event.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate font-mono text-[10px] uppercase tracking-wider">{event.location}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="shrink-0 w-72 h-48 bg-background border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] flex items-center justify-center">
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">No events found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── FEED VIEW ──
  return (
    <div className="space-y-6 pb-24 relative">
      {/* Search + filter bar */}
      <div className="sticky top-[84px] z-40 bg-background pb-4 border-b-[2.5px] border-foreground flex gap-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <input type="text" placeholder="Search events, clubs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-card border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] pl-12 pr-6 text-sm font-medium outline-none focus:shadow-[5px_5px_0_0_var(--foreground)] transition-shadow placeholder:text-muted-foreground/40" />
        </div>
        <button onClick={() => setViewMode('map')} className="h-12 w-12 border-[2.5px] border-foreground bg-card shadow-[3px_3px_0_0_var(--foreground)] flex items-center justify-center text-foreground hover:bg-brutal-yellow/30 transition-colors shrink-0 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
          <MapIcon className="h-5 w-5" />
        </button>
        <FilterDrawer />
      </div>

      {/* Category chips — brutalist */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`h-10 px-5 text-[10px] font-black uppercase tracking-[0.15em] transition-all border-[2.5px] border-foreground whitespace-nowrap active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
              selectedCategory === cat 
                ? 'bg-primary text-primary-foreground shadow-none translate-x-[2px] translate-y-[2px]' 
                : 'bg-card text-foreground shadow-[3px_3px_0_0_var(--foreground)] hover:bg-brutal-yellow/20'}`}>
            {cat}
          </button>
        ))}
      </div>



      {/* Feed header */}
      <div className="flex items-center justify-between border-b-[2px] border-foreground pb-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Flame className="h-3.5 w-3.5" /> For You
        </h3>
        <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-muted-foreground">{filteredEvents.length} events</span>
      </div>

      {/* Event grid */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-[2.5px] border-dashed border-foreground/30 bg-card">
          <Search className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground/40 font-black uppercase tracking-widest text-xs">No results found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Interleave announcements */}
          {MOCK_ANNOUNCEMENTS[0] && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sm:col-span-2">
              <AnnouncementCard post={MOCK_ANNOUNCEMENTS[0]} />
            </motion.div>
          )}
          {filteredEvents.slice(0, 4).map((event, idx) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="aspect-[4/5]">
              <EventCard event={event} isRegistered={registeredEventIds.includes(event.id)} onRegister={() => registerForEvent(event.id)} className="h-full" size="md" />
            </motion.div>
          ))}
          {MOCK_RECRUITMENTS[0] && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <RecruitmentCard post={MOCK_RECRUITMENTS[0]} />
            </motion.div>
          )}
          {filteredEvents.slice(4).map((event, idx) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="aspect-[4/5]">
              <EventCard event={event} isRegistered={registeredEventIds.includes(event.id)} onRegister={() => registerForEvent(event.id)} className="h-full" size="md" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
