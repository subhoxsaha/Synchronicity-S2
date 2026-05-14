import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Settings, Users, Trophy, MapPin, Building2, UserPlus, Globe, ChevronRight, ShieldCheck, Search } from 'lucide-react';
import { EventCategory, CampusEvent, PostType, Organization, OrgStatus, AnyPost } from '../types';
import { EventCard } from './EventCard';
import { Map, Marker } from '@/components/ui/map';
import { useAppContext } from '../contexts/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { FilterDrawer } from './FilterDrawer';

interface DiscoverViewProps {
  events: (CampusEvent | AnyPost)[];
  registeredEventIds: string[];
  registerForEvent: (id: string) => void;
  defaultTab?: 'feed' | 'organizations';
  hideTabs?: boolean;
  showMapInitial?: boolean;
}

type DiscoverTab = 'feed' | 'organizations';

export function DiscoverView({ events, registeredEventIds, registerForEvent, defaultTab = 'feed', hideTabs = false, showMapInitial = false }: DiscoverViewProps) {
  const { organizations, currentUser, joinOrganization, followOrganization, unfollowOrganization } = useAppContext();
  const [selectedVibe, setSelectedVibe] = useState('Campus Hub');
  const [selectedTimeline, setSelectedTimeline] = useState('All');
  const [activeTab, setActiveTab] = useState<DiscoverTab>(defaultTab);
  const [showMap, setShowMap] = useState(showMapInitial);
  const [orgTypeFilter, setOrgTypeFilter] = useState('all');
  const [activeFilters, setActiveFilters] = useState<{ types: string[], department: string, freeOnly: boolean, hasRsvp: boolean } | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedCardId(prev => prev === id ? null : id);
  }, []);

  const approvedOrgs = useMemo(() =>
    organizations.filter(o => o.status === 'approved'),
    [organizations]
  );

  const filteredOrgs = useMemo(() => {
    let result = approvedOrgs;
    if (orgTypeFilter !== 'all') {
      result = result.filter(o => o.type === orgTypeFilter);
    }
    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.name.toLowerCase().includes(sq) || 
        o.description?.toLowerCase().includes(sq) || 
        o.tags?.some(t => t.toLowerCase().includes(sq))
      );
    }
    return result;
  }, [approvedOrgs, orgTypeFilter, searchQuery]);

  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Search Filter
    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase();
      filtered = filtered.filter(e => {
        const title = (e.title || '').toLowerCase();
        const desc = (e.description || '').toLowerCase();
        const tags = (e.tags || []).map(t => t.toLowerCase());
        const loc = (e.location || '').toLowerCase();
        const orgName = ((e as any).organizationName || '').toLowerCase();
        
        return title.includes(sq) || desc.includes(sq) || tags.some(t => t.includes(sq)) || loc.includes(sq) || orgName.includes(sq);
      });
    }

    // Vibe filter logic (event-specific category — safe with optional chaining)
    if (selectedVibe === 'Workshops') {
      filtered = filtered.filter(e => (e as any).category?.includes(EventCategory.WORKSHOP));
    } else if (selectedVibe === 'Socials') {
      filtered = filtered.filter(e => (e as any).category?.includes(EventCategory.SOCIAL));
    } else if (selectedVibe === 'Sports') {
      filtered = filtered.filter(e => (e as any).category?.includes(EventCategory.SPORTS));
    }
    
    // Timeline filter (event-specific date — safe with optional chaining)
    const now = new Date();
    const today = now.toDateString();
    if (selectedTimeline === 'Today') {
      filtered = filtered.filter(e => (e as any).date && new Date((e as any).date).toDateString() === today);
    } else if (selectedTimeline === 'Week') {
      const weekFromNow = new Date(now.getTime() + 7 * 86400000);
      filtered = filtered.filter(e => {
        if (!(e as any).date) return false;
        const d = new Date((e as any).date);
        return d >= now && d <= weekFromNow;
      });
    } else if (selectedTimeline === 'Now') {
      const twoHours = 2 * 60 * 60 * 1000;
      filtered = filtered.filter(e => {
        if (!(e as any).date) return false;
        const d = new Date((e as any).date);
        return Math.abs(d.getTime() - now.getTime()) < twoHours;
      });
    }
    
    // Apply Drawer Filters
    if (activeFilters) {
      if (activeFilters.types.length > 0) {
        filtered = filtered.filter(e => {
          if (activeFilters.types.includes('Event') && (e.type === PostType.EVENT || !e.type)) return true;
          if (activeFilters.types.includes('Announcement') && e.type === PostType.ANNOUNCEMENT) return true;
          if (activeFilters.types.includes('Recruitment') && e.type === PostType.RECRUITMENT) return true;
          return false;
        });
      }
      if (activeFilters.department !== 'Any Department') {
        filtered = filtered.filter(e => (e as any).category?.includes(activeFilters.department as EventCategory));
      }
      if (activeFilters.freeOnly) {
        filtered = filtered.filter(e => !(e as any).ticketPrice || (e as any).ticketPrice === 0);
      }
      if (activeFilters.hasRsvp) {
        filtered = filtered.filter(e => registeredEventIds.includes(e.id));
      }
    }
    
    return filtered;
  }, [events, selectedVibe, selectedTimeline, activeFilters, searchQuery]);

  // Center map on the first event with valid coordinates, otherwise default
  const firstGeoEvent = events.find(e => (e as any).coordinates?.lat && (e as any).coordinates?.lng);
  const defaultCenter = firstGeoEvent ? {
    latitude: (firstGeoEvent as any).coordinates.lat,
    longitude: (firstGeoEvent as any).coordinates.lng
  } : {
    latitude: 37.4275,
    longitude: -122.1697
  };

  const handleFollowOrg = async (orgId: string) => {
    try {
      const org = organizations.find(o => o.id === orgId);
      const isFollowing = org?.followerIds?.includes(currentUser?.id || '');
      if (isFollowing) {
        await unfollowOrganization(orgId);
        toast.success('Unfollowed organization');
      } else {
        await followOrganization(orgId);
        toast.success('Following organization!');
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleJoinOrg = async (orgId: string) => {
    try {
      await joinOrganization(orgId);
      toast.success('Join request sent!');
    } catch (err) {
      toast.error('Failed to join');
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 max-w-[1200px] mx-auto pb-20 pt-4 md:pt-8 px-3 sm:px-5 lg:px-8">
      {/* ── HEADER & MAIN FILTERS ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none mb-2">
            {activeTab === 'feed' ? (hideTabs ? 'Feed' : 'Discovery') : 'Organizations'}
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] md:text-xs max-w-lg border-l-[3px] border-foreground pl-3">
            {activeTab === 'feed' 
              ? (activeFilters ? 'Filtered results based on your preferences.' : 'The raw pulse of campus life.')
              : 'Campus hubs, clubs, and communities.'}
          </p>
          {activeFilters && activeTab === 'feed' && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary rounded-none shadow-[2px_2px_0_0_var(--foreground)] uppercase text-[9px] font-black">
                Filters Active
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setActiveFilters(null)} className="h-6 text-[10px] font-black uppercase text-muted-foreground hover:text-foreground">Clear All</Button>
            </div>
          )}
        </div>
        
        {/* Main Tab Switcher */}
        {!hideTabs && (
          <div className="flex items-center gap-1.5 bg-card border-[2.5px] border-foreground p-1 shadow-[4px_4px_0_0_var(--foreground)] w-full max-w-full lg:w-auto overflow-x-auto no-scrollbar shrink-0 mt-2 lg:mt-0">
            <TabButton 
              icon={<Home className="h-4 w-4" />} 
              label="Feed" 
              active={activeTab === 'feed'} 
              onClick={() => setActiveTab('feed')} 
            />
            <TabButton 
              icon={<Building2 className="h-4 w-4" />} 
              label="Organizations" 
              active={activeTab === 'organizations'} 
              onClick={() => setActiveTab('organizations')}
              badge={approvedOrgs.length}
            />
          </div>
        )}
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="relative w-full z-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={3} />
        <input
          type="text"
          placeholder={activeTab === 'feed' ? "SEARCH FEED..." : "SEARCH ORGANIZATIONS..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 sm:h-14 pl-12 pr-4 bg-card border-[3px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] text-xs sm:text-sm font-black uppercase tracking-widest placeholder:text-muted-foreground/50 focus:outline-none focus:bg-background transition-colors"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center bg-muted hover:bg-foreground hover:text-background border-[2px] border-foreground transition-all"
          >
            <span className="font-black text-[10px] leading-none mb-[2px]">X</span>
          </button>
        )}
      </div>

      {/* ── COMPACT SECONDARY FILTERS ── */}
      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center justify-between bg-card p-2.5 sm:p-3 border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] w-full">
        {activeTab === 'feed' ? (
          <>
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar flex-1 w-full">
              <div className="flex items-center gap-1 sm:gap-1.5 border-r-[2.5px] border-foreground/20 pr-2 mr-1 shrink-0">
                <FilterPill label="All" active={selectedVibe === 'Campus Hub'} onClick={() => setSelectedVibe('Campus Hub')} />
                <FilterPill label="Workshops" active={selectedVibe === 'Workshops'} onClick={() => setSelectedVibe('Workshops')} />
                <FilterPill label="Socials" active={selectedVibe === 'Socials'} onClick={() => setSelectedVibe('Socials')} />
                <FilterPill label="Sports" active={selectedVibe === 'Sports'} onClick={() => setSelectedVibe('Sports')} />
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 pl-1 shrink-0">
                <FilterPill label="All Time" active={selectedTimeline === 'All'} onClick={() => setSelectedTimeline('All')} />
                <FilterPill label="Now" active={selectedTimeline === 'Now'} onClick={() => setSelectedTimeline('Now')} />
                <FilterPill label="Today" active={selectedTimeline === 'Today'} onClick={() => setSelectedTimeline('Today')} />
                <FilterPill label="Week" active={selectedTimeline === 'Week'} onClick={() => setSelectedTimeline('Week')} />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 border-t-[2.5px] border-foreground/20 sm:border-t-0 sm:border-l-[2.5px] pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-between sm:justify-end">
              <Button 
                variant="outline"
                className={`h-10 md:h-12 px-3 sm:px-4 md:px-5 rounded-none border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center font-black tracking-widest uppercase text-[9px] sm:text-[10px] ${showMap ? 'bg-brutal-blue text-white' : 'bg-background hover:bg-brutal-blue/20'}`}
                onClick={() => setShowMap(!showMap)}
              >
                <MapPin className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">{showMap ? 'Hide Map' : 'Map'}</span>
              </Button>
              <FilterDrawer onApply={setActiveFilters} />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar w-full">
            <FilterPill label="All Types" active={orgTypeFilter === 'all'} onClick={() => setOrgTypeFilter('all')} />
            <FilterPill label="Clubs" active={orgTypeFilter === 'club'} onClick={() => setOrgTypeFilter('club')} />
            <FilterPill label="Departments" active={orgTypeFilter === 'department'} onClick={() => setOrgTypeFilter('department')} />
            <FilterPill label="Other" active={orgTypeFilter === 'other'} onClick={() => setOrgTypeFilter('other')} />
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 space-y-8 min-w-0">
        <AnimatePresence mode="wait">
          {activeTab === 'feed' ? (
            <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {/* Map */}
              {showMap && (
                <div className="relative h-[250px] md:h-[300px] w-full border-[3px] border-foreground shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden bg-muted">
                  <Map 
                    initialViewState={{ ...defaultCenter, zoom: 13 }} 
                    mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                    scrollZoom={true}
                    dragPan={true}
                  >
                    {filteredEvents.filter(e => (e as any).coordinates && (e.type === PostType.EVENT || e.type === undefined)).map(e => (
                      <Marker key={e.id} latitude={(e as any).coordinates.lat} longitude={(e as any).coordinates.lng}>
                        <div className="h-6 w-6 bg-brutal-pink border-[2px] border-foreground rounded-none shadow-[2px_2px_0_0_var(--foreground)] flex items-center justify-center -translate-y-3">
                          <MapPin className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      </Marker>
                    ))}
                  </Map>
                </div>
              )}

              {/* Events Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {filteredEvents.map((event, index) => {

                  const isThisExpanded = expandedCardId === event.id;
                  return (
                    <motion.div 
                      key={event.id} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: index * 0.05 }} 
                      layout
                      className={`flex flex-col ${
                        isThisExpanded 
                          ? 'md:col-span-2 md:row-span-2 min-h-[500px]' 
                          : 'min-h-[350px]'
                      }`}
                    >
                      <EventCard 
                        event={event as CampusEvent} 
                        isRegistered={registeredEventIds.includes(event.id)} 
                        onRegister={() => registerForEvent(event.id)} 
                        size={isThisExpanded ? 'lg' : 'sm'} 
                        className="h-full" 
                        isExpanded={isThisExpanded}
                        onToggleExpand={handleToggleExpand}
                      />
                    </motion.div>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 h-36 border-[2.5px] border-dashed border-foreground flex items-center justify-center bg-card">
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No events found</p>
                  </div>
                )}
              </div>

              {/* Footer Button */}
              {filteredEvents.length > 0 && (
                <button className="w-full h-14 bg-brutal-yellow border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] text-lg font-black uppercase tracking-widest hover:bg-brutal-yellow/90 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                  See More Noise
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="orgs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {/* Org Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredOrgs.map((org, i) => (
                  <OrgCard
                    key={org.id}
                    org={org}
                    index={i}
                    currentUserId={currentUser?.id || ''}
                    onFollow={() => handleFollowOrg(org.id)}
                    onJoin={() => handleJoinOrg(org.id)}
                    onNavigate={() => window.location.href = `/org/${org.id}`}
                  />
                ))}
              </div>

              {filteredOrgs.length === 0 && (
                <div className="h-48 border-[2.5px] border-dashed border-foreground flex flex-col items-center justify-center bg-card gap-2">
                  <Building2 className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No organizations found</p>
                  <p className="text-muted-foreground/60 text-[10px] font-mono uppercase tracking-widest">Try a different filter</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─────────── ORG CARD ─────────── */

function OrgCard({ org, index, currentUserId, onFollow, onJoin, onNavigate }: { 
  org: Organization; index: number; currentUserId: string;
  onFollow: () => void; onJoin: () => void; onNavigate: () => void;
}) {
  const isMember = org.members?.some(m => m.userId === currentUserId);
  const isFollowing = org.followerIds?.includes(currentUserId);
  const memberCount = org.members?.length || 0;
  const followerCount = org.followerIds?.length || 0;

  const typeColors: Record<string, string> = {
    club: 'bg-brutal-blue/20 text-blue-700 dark:text-blue-300',
    department: 'bg-brutal-green/20 text-green-700 dark:text-green-300',
    fraternity: 'bg-brutal-pink/20 text-pink-700 dark:text-pink-300',
    other: 'bg-brutal-yellow/20 text-yellow-700 dark:text-yellow-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        onClick={onNavigate}
        className="cursor-pointer border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-all overflow-hidden group"
      >
        {/* Header strip */}
        <div className="h-2 bg-primary" />
        
        <CardContent className="p-6 space-y-5">
          {/* Logo + Name */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border-[2px] border-foreground shrink-0">
              {org.logo ? (
                <AvatarImage src={org.logo} />
              ) : null}
              <AvatarFallback className="font-black text-sm bg-primary/10 text-primary">
                {(org.name || '?')[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm uppercase tracking-tight truncate">{org.name}</h3>
                <ShieldCheck className="h-3 w-3 text-blue-500 shrink-0" />
              </div>
              <Badge className={`text-[8px] font-black uppercase px-1.5 py-0 mt-1 ${typeColors[org.type] || typeColors.other}`}>
                {org.type}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
            {org.description || 'No description provided.'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border-[2px] border-foreground/20 bg-muted/30">
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Members</p>
              <p className="text-sm font-black tabular-nums">{memberCount}</p>
            </div>
            <div className="p-2 border-[2px] border-foreground/20 bg-muted/30">
              <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Followers</p>
              <p className="text-sm font-black tabular-nums">{followerCount}</p>
            </div>
          </div>

          {/* Tags */}
          {org.tags && org.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {org.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[8px] font-bold px-1.5 py-0.5 bg-brutal-yellow/20 border-[1.5px] border-foreground">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t-[2px] border-foreground/10" onClick={e => e.stopPropagation()}>
            {isMember ? (
              <Button disabled variant="outline" size="sm" className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest">
                ✓ Member
              </Button>
            ) : (
              <Button 
                onClick={onJoin} 
                size="sm" 
                className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <UserPlus className="h-3 w-3 mr-1" /> Join
              </Button>
            )}
            <Button 
              onClick={onFollow}
              variant={isFollowing ? 'default' : 'outline'}
              size="sm" 
              className="h-9 text-[9px] font-black uppercase tracking-widest px-3"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─────────── TAB BUTTON ─────────── */

function TabButton({ icon, label, active, onClick, badge }: { icon?: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`shrink-0 flex items-center gap-2 px-4 py-2.5 border-[2.5px] border-foreground font-black uppercase text-[10px] md:text-xs tracking-widest transition-all ${
        active 
        ? 'bg-foreground text-background shadow-none translate-x-[3px] translate-y-[3px]' 
        : 'bg-background text-foreground hover:bg-background/80 shadow-[3px_3px_0_0_var(--foreground)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`text-[8px] font-black tabular-nums px-1 py-0.5 border-[1.5px] ${active ? 'border-background/40 text-background' : 'border-foreground/30 text-muted-foreground'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─────────── FILTER PILL ─────────── */

function FilterPill({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`shrink-0 h-10 md:h-12 px-3 sm:px-4 flex items-center justify-center border-[2.5px] border-foreground font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all whitespace-nowrap ${
        active 
        ? 'bg-foreground text-background shadow-none translate-x-[2px] translate-y-[2px]' 
        : 'bg-background text-foreground hover:bg-muted shadow-[2px_2px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
      }`}
    >
      {label}
    </button>
  );
}
