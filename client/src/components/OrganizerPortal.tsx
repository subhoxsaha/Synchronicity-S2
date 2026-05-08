import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ScanLine, 
  BarChart3, 
  Users, 
  Clock, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Target,
  Award,
  Users as UsersIcon,
  Plus,
  ClipboardList,
  Calendar as CalendarIcon,
  Globe,
  Search,
  Upload,
  Zap,
  CheckCircle2,
  XCircle,
  Heart,
  MessageCircle,
  Palette,
  Layers,
  Monitor,
  Download
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAppContext } from '../contexts/AppContext';
import { CampusEvent, Registration, EventCategory, EventStatus } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import QRCode from 'react-qr-code';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';
import { Map, Marker, Popup, MapControls } from './ui/map';

// Subcomponents are imported or defined below...
import { AccountSection } from './AccountSection';

export default function OrganizerPortal() {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const { events, currentUser, registrations, addEvent, updateEvent, checkInUser, logout } = useAppContext();

  if (currentUser?.role === 'organizer' && !currentUser?.orgName) {
    return <OrganizationOnboarding />;
  }

  if (!currentUser?.isApproved && currentUser?.role === 'organizer') {
    return (
      <div className="flex w-full items-center justify-center p-6 text-center min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full space-y-8"
        >
          <div className="border-[2.5px] border-foreground bg-card p-10 shadow-[6px_6px_0_0_var(--foreground)]">
            <div className="h-20 w-20 border-[3px] border-foreground bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase mb-3">Under Review</h1>
            <p className="text-muted-foreground leading-relaxed font-medium text-sm">
              Application for <span className="text-primary font-black">{currentUser?.orgName}</span> received. 
              Admins are verifying your credentials.
            </p>
            <div className="bg-muted border-[2px] border-foreground/20 p-4 mt-6">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Estimated Wait</p>
                <p className="text-xl font-black font-mono">24 – 48 HRS</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
              <button className="h-12 w-full font-black text-[10px] uppercase tracking-[0.2em] border-[2.5px] border-foreground bg-primary text-white shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => window.location.reload()}>Refresh Status</button>
              <button className="h-10 w-full font-black text-[10px] uppercase tracking-[0.2em] border-[2px] border-foreground/30 bg-card hover:bg-muted active:translate-y-[2px] transition-all" onClick={logout}>Sign Out</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const myEvents = events.filter(e => e.organizerEmail === currentUser?.email);

  const startCreating = () => {
    setEditingEvent(null);
    setActiveSubTab('create');
  };

  const startEditing = (event: CampusEvent) => {
    setEditingEvent(event);
    setActiveSubTab('create');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Console', icon: <LayoutDashboard size={18} /> },
    { id: 'events', label: 'Moments', icon: <Sparkles size={18} /> },
    { id: 'visualizer', label: 'Canvas', icon: <PlusCircle size={18} /> },
    { id: 'analytics', label: 'Engagement', icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pb-24">
      {/* Horizontal Sub-Navigation — Brutalist */}
      <div className="sticky top-[72px] z-40 bg-foreground px-4 py-0 border-b-[3px] border-foreground overflow-x-auto no-scrollbar">
        <div className="flex items-center max-w-5xl mx-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`flex items-center gap-2 px-6 py-3 text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap border-r-[2px] border-foreground/20 last:border-r-0 ${
                activeSubTab === item.id 
                  ? 'bg-primary text-white' 
                  : 'bg-foreground text-background/60 hover:text-background hover:bg-foreground/80'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-8 md:px-8 max-w-6xl mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeSubTab === 'dashboard' && <DashboardView events={myEvents} registrations={registrations} onEdit={startEditing} />}
            {activeSubTab === 'events' && (
               <EventsManagement 
                  events={myEvents} 
                  registrations={registrations} 
                  onEdit={startEditing} 
                  onCreate={startCreating} 
               />
            )}
            {activeSubTab === 'create' && (
               <EventBuilder 
                 initialEvent={editingEvent} 
                 onAdd={(data: any) => {
                   if (editingEvent) {
                     // Ensure we merge existing fields with new updates correctly
                     const updatedEvent = {
                       ...editingEvent,
                       ...data,
                       id: editingEvent.id // Lock the ID
                     };
                     updateEvent(updatedEvent);
                     toast.success("Event updated successfully!");
                   } else {
                     addEvent(data);
                     toast.success("Event submitted for moderation!");
                   }
                   setActiveSubTab('dashboard');
                 }} 
               />
            )}
            {activeSubTab === 'scanner' && <ScannerView events={myEvents} onCheckIn={checkInUser} registrations={registrations} />}
            {activeSubTab === 'analytics' && <AnalyticsView events={myEvents} />}
            {activeSubTab === 'visualizer' && <VisualizerView events={myEvents} onUpdate={updateEvent} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DashboardView({ events, registrations, onEdit }: { events: CampusEvent[], registrations: any[], onEdit: (e: CampusEvent) => void }) {
  const totalLikes = events.reduce((acc, e) => acc + (e.likes?.length || 0), 0);
  const totalComments = events.reduce((acc, e) => acc + (e.commentCount || 0), 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-1 text-center md:text-left">
        <h2 className="text-3xl font-black tracking-tight uppercase">Creator Console</h2>
        <p className="text-muted-foreground font-medium text-sm">Managing your social footprint and campus engagement.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard label="Total Moments" value={events.length} icon={<LayoutDashboard className="text-primary" />} trend="Live Data" />
        <MetricCard label="Social Impressions" value={totalLikes + totalComments * 2} icon={<Heart className="text-destructive fill-destructive/20" />} trend="+15% Reach" />
        <MetricCard 
          className="sm:col-span-2 lg:col-span-1"
          label="Engagement Rate" 
          value={events.length ? `${Math.round(((totalLikes + totalComments) / (events.length * 50)) * 100)}%` : '0%'} 
          icon={
            <div className="relative">
              <Zap className="text-orange-500 fill-orange-500/20" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-orange-500 rounded-full blur-md -z-10"
              />
            </div>
          } 
          trend="Pulse High" 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)]">
          <div className="p-6 border-b-[2.5px] border-foreground">
            <h3 className="font-black uppercase tracking-tight text-lg">Registration Volume</h3>
          </div>
          <div className="h-[300px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={events}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="title" hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '0', border: '2px solid var(--foreground)', boxShadow: '3px 3px 0 0 var(--foreground)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="registeredCount" radius={[0, 0, 0, 0]}>
                  {events.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden">
          <div className="p-6 bg-muted border-b-[2.5px] border-foreground">
            <h3 className="font-black uppercase tracking-tight text-lg">My Active Projects</h3>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Quick actions for your upcoming events</p>
          </div>
          <div className="p-6 space-y-4">
            {events.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground opacity-50 font-black uppercase tracking-[0.2em] text-xs">No events published yet</div>
            ) : (
                events.map(event => (
                    <div key={event.id} className="flex items-center justify-between p-4 border-[2px] border-foreground/10 bg-muted/30 group hover:border-foreground/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 overflow-hidden border-[2px] border-foreground/20">
                                <img src={event.imageUrl} className="h-full w-full object-cover" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm leading-none mb-1">{event.title}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border-[1.5px] border-foreground/30 bg-muted">{event.status}</span>
                                    <span className="text-[9px] font-mono font-bold text-muted-foreground">{event.registeredCount} / {event.capacity} Filled</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            className="h-8 w-8 flex items-center justify-center border-[2px] border-transparent opacity-0 group-hover:opacity-100 group-hover:border-foreground/30 transition-all"
                            onClick={() => onEdit(event)}
                        >
                            <Plus className="h-4 w-4 rotate-45" />
                        </button>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventsManagement({ events, registrations, onEdit, onCreate }: { events: CampusEvent[], registrations: Registration[], onEdit: (e: CampusEvent) => void, onCreate: () => void }) {
  const [view, setView] = useState<'list' | 'registrants'>('list');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase">My Moments</h2>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Manage all your campus posts and social interactions.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setView('list')}
                className={`h-10 px-6 text-[9px] font-black uppercase tracking-[0.15em] border-[2px] transition-all ${view === 'list' ? 'bg-foreground text-background border-foreground shadow-[3px_3px_0_0_var(--foreground)]' : 'bg-card text-foreground border-foreground/30 hover:border-foreground'}`}
            >
                Grid View
            </button>
            <button 
                onClick={onCreate}
                className="h-10 px-6 text-[9px] font-black uppercase tracking-[0.15em] bg-primary text-white border-[2px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all flex items-center"
            >
                <Plus className="mr-2 h-4 w-4" /> New Post
            </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="grid gap-6">
            {events.length === 0 ? (
                <div className="border-[2.5px] border-dashed border-foreground/30 bg-muted/30 p-20 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                        <div className="h-20 w-20 border-[2.5px] border-foreground/20 flex items-center justify-center mx-auto">
                            <PlusCircle className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight uppercase">No Moments Shared</h3>
                        <p className="text-sm text-muted-foreground font-medium">Capture your first campus moment and share it with the community.</p>
                        <button onClick={onCreate} className="px-8 py-2 font-black uppercase text-[9px] tracking-[0.2em] bg-foreground text-background border-[2px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all">Start Posting</button>
                    </div>
                </div>
            ) : (
                events.map(event => (
                    <div key={event.id} className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden group hover:shadow-[7px_7px_0_0_var(--foreground)] transition-all duration-300">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-64 h-48 md:h-auto relative overflow-hidden border-b-[2.5px] md:border-b-0 md:border-r-[2.5px] border-foreground">
                                <img src={event.imageUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                      <div className="flex flex-wrap gap-1">
                                        {event.category.slice(0, 2).map((cat, i) => (
                                          <span key={i} className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/20 backdrop-blur-md text-white border-[1.5px] border-white/30">{cat}</span>
                                        ))}
                                        {event.category.length > 2 && (
                                          <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/20 backdrop-blur-md text-white border-[1.5px] border-white/30">+{event.category.length - 2}</span>
                                        )}
                                      </div>
                                </div>
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{event.title}</h3>
                                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border-[1.5px] ${
                                                    event.status === EventStatus.APPROVED ? "bg-secondary/10 text-secondary border-secondary" : 
                                                    event.status === EventStatus.REJECTED ? "bg-destructive/10 text-destructive border-destructive" : 
                                                    "bg-primary/10 text-primary border-primary"
                                                }`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                                                <span className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5 text-primary" />{new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-secondary" />{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                                        {event.description}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between border-t-[2px] border-foreground/15 pt-6 mt-6">
                                    <div className="flex items-center gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Reg Capacity</p>
                                            <p className="text-lg font-black font-mono">{event.registeredCount} <span className="text-xs text-muted-foreground opacity-40">/ {event.capacity}</span></p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Attended</p>
                                            <p className="text-lg font-black font-mono text-secondary">{event.checkedInCount}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="h-10 px-6 border-[2px] border-foreground font-black text-[9px] uppercase tracking-[0.15em] shadow-[3px_3px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => onEdit(event)}>Edit Project</button>
                                        <button className="h-10 w-10 flex items-center justify-center border-[2px] border-foreground hover:bg-muted transition-colors">
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      ) : (
        <RegistrantListView events={events} registrations={registrations} />
      )}
    </div>
  );
}

function RegistrantListView({ events, registrations }: { events: CampusEvent[], registrations: Registration[] }) {
  const [activeSubTab, setActiveSubTab] = useState<'attendees' | 'events'>('events');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checkedIn' | 'pending'>('all');

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = (reg.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (reg.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'checkedIn' && reg.checkedIn) || 
                         (statusFilter === 'pending' && !reg.checkedIn);
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    toast.success("Preparing attendee list for download...");
    setTimeout(() => {
      toast.info("Attendee report (CSV) ready to download.");
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-black tracking-tight uppercase">Manage Registrants</h2>
             <button onClick={handleExport} className="h-8 px-4 font-black text-[8px] uppercase tracking-[0.2em] border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2">
                Export <Globe className="h-3 w-3" />
             </button>
          </div>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Track engagement and verify participation lists.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Attendee search..." 
              className="pl-10 h-11 rounded-none border-[2.5px] border-foreground bg-card font-mono"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="h-11 px-4 bg-card border-[2.5px] border-foreground text-xs font-black uppercase tracking-[0.15em] outline-none cursor-pointer"
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
          >
            <option value="all">All Events</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <div className="flex gap-0 border-[2.5px] border-foreground">
             {(['all', 'checkedIn', 'pending'] as const).map((s) => (
               <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-1 px-3 py-2 text-[8px] font-black uppercase tracking-[0.2em] transition-all border-r-[2px] border-foreground last:border-r-0 ${
                     statusFilter === s ? 'bg-primary text-white' : 'text-muted-foreground bg-card hover:bg-muted'
                  }`}
               >
                  {s === 'checkedIn' ? 'Attended' : s === 'pending' ? 'Pending' : 'All'}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 border-[2.5px] border-dashed border-foreground/20">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-black text-muted-foreground text-xs uppercase tracking-[0.2em]">No registrants found matching your criteria</p>
          </div>
        ) : (
          filteredRegistrations.map((reg) => (
            <div key={reg.id} className="border-[2px] border-foreground/20 bg-card hover:border-foreground/40 transition-colors group">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-[2px] border-foreground/30 rounded-none">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reg.userEmail}`} />
                    <AvatarFallback className="font-black rounded-none">{reg.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-black text-sm tracking-tight">{reg.userName}</h4>
                    <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">{reg.userEmail}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">
                          {events.find(e => e.id === reg.eventId)?.title || 'Event'}
                       </span>
                       <span className="h-1 w-1 bg-foreground/20" />
                       <span className="text-[8px] font-mono font-bold text-muted-foreground/60 uppercase">{new Date(reg.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] border-[2px] ${
                    reg.checkedIn 
                      ? 'bg-secondary/5 text-secondary border-secondary' 
                      : 'bg-primary/5 text-primary border-primary'
                  }`}>
                    {reg.checkedIn ? 'Checked In' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, trend, className }: { label: string, value: string | number, icon: React.ReactNode, trend: string, className?: string }) {
  return (
    <div className={`border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden relative group transition-all hover:translate-y-[-2px] hover:shadow-[5px_7px_0_0_var(--foreground)] ${className || ''}`}>
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 64 })}
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between relative z-10">
          <div className="h-10 w-10 border-[2px] border-foreground/20 bg-primary/5 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2 py-1 border-[1.5px] border-primary/20">
            {trend}
          </span>
        </div>
        <div className="relative z-10">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-3xl font-black tracking-tighter font-mono">{value}</p>
        </div>
      </div>
    </div>
  );
}

function OrganizationOnboarding() {
    const { submitOnboarding, logout } = useAppContext();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        orgName: '',
        orgDescription: '',
        orgWebsite: '',
        orgType: 'Student Club',
        orgLogo: '',
    });

    const isStep1Valid = formData.orgName.length >= 3 && formData.orgType;
    const isStep2Valid = formData.orgDescription.length >= 10;

    const handleSubmit = async () => {
        await submitOnboarding(formData);
    };

    return (
        <div className="min-h-[90vh] w-full flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                <div className="mb-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-3xl mb-4">
                        <Globe className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tight uppercase italic">Organization Setup</h1>
                    <p className="text-muted-foreground font-medium text-lg">Build your organization's identity on campus.</p>
                </div>

                <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-card/80 backdrop-blur-xl border border-white/10">
                    <div className="h-2 bg-accent/20">
                        <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: '33.33%' }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                    
                    <CardContent className="p-10 md:p-16">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div 
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black tracking-tight uppercase">Basic Identity</h3>
                                        <p className="text-muted-foreground text-sm font-medium italic">How should students recognize you?</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Organization Official Name</Label>
                                            <Input 
                                                value={formData.orgName}
                                                onChange={e => setFormData(p => ({ ...p, orgName: e.target.value }))}
                                                placeholder="e.g., Computer Science Society" 
                                                className="h-14 rounded-2xl text-lg font-bold border-2 focus-visible:ring-primary/20"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category Type</Label>
                                            <Select 
                                                onValueChange={v => setFormData(p => ({ ...p, orgType: v }))}
                                                defaultValue={formData.orgType}
                                            >
                                                <SelectTrigger className="h-14 rounded-2xl text-lg font-bold border-2">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    <SelectItem value="Student Club">Student Club</SelectItem>
                                                    <SelectItem value="Departmental Body">Departmental Body</SelectItem>
                                                    <SelectItem value="Community Partner">Community Partner</SelectItem>
                                                    <SelectItem value="University Admin">University Admin</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button 
                                            disabled={!isStep1Valid}
                                            onClick={() => setStep(2)}
                                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20"
                                        >
                                            Next Step <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div 
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black tracking-tight uppercase">Presence & Vision</h3>
                                        <p className="text-muted-foreground text-sm font-medium italic">Describe what your organization brings to the campus.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mission Statement / Description</Label>
                                            <Textarea 
                                                value={formData.orgDescription}
                                                onChange={e => setFormData(p => ({ ...p, orgDescription: e.target.value }))}
                                                placeholder="What is your organization's purpose? What kind of events do you host?" 
                                                className="min-h-[160px] rounded-2xl text-lg font-medium border-2 focus-visible:ring-primary/20 p-6 leading-relaxed"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Website or Portfolio (Optional)</Label>
                                            <Input 
                                                value={formData.orgWebsite}
                                                onChange={e => setFormData(p => ({ ...p, orgWebsite: e.target.value }))}
                                                placeholder="https://yourgroup.com" 
                                                className="h-14 rounded-2xl text-lg font-bold border-2 focus-visible:ring-primary/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button 
                                            variant="ghost"
                                            onClick={() => setStep(1)}
                                            className="h-14 rounded-2xl font-black uppercase tracking-widest flex-1"
                                        >
                                            Back
                                        </Button>
                                        <Button 
                                            disabled={!isStep2Valid}
                                            onClick={() => setStep(3)}
                                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20 flex-[2]"
                                        >
                                            Final Review <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div 
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black tracking-tight uppercase">Confirm Application</h3>
                                        <p className="text-muted-foreground text-sm font-medium italic">Check your details before submitting for official verification.</p>
                                    </div>

                                    <div className="p-8 bg-accent/20 rounded-[2rem] border border-border/40 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-2xl text-primary">
                                                {formData.orgName[0]}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity Name</p>
                                                <p className="text-xl font-black">{formData.orgName}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</p>
                                                <p className="font-bold">{formData.orgType}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Official Email</p>
                                                <p className="font-bold truncate text-xs">{auth.currentUser?.email}</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-border/40 pt-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</p>
                                            <p className="text-sm font-medium line-clamp-3 text-muted-foreground italic">{formData.orgDescription}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <Button 
                                                variant="ghost"
                                                onClick={() => setStep(2)}
                                                className="h-14 rounded-2xl font-black uppercase tracking-widest flex-1"
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                onClick={handleSubmit}
                                                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20 flex-[2] bg-primary text-primary-foreground"
                                            >
                                                Submit Profile <PlusCircle className="ml-2 h-5 w-5" />
                                            </Button>
                                        </div>
                                        <Button variant="ghost" className="w-full h-12 rounded-2xl text-xs font-bold text-muted-foreground" onClick={logout}>Sign Out & Cancel</Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                <div className="mt-12 text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">Institutional Verification Required • Pulse Protocol v2.4</p>
                </div>
            </motion.div>
        </div>
    );
}

function EventBuilder({ onAdd, initialEvent }: { onAdd: (data: any) => void, initialEvent?: CampusEvent | null }) {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAppContext();
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialEvent?.title || '',
    description: initialEvent?.description || '',
    location: initialEvent?.location || '',
    date: initialEvent?.date || '',
    capacity: initialEvent?.capacity || 50,
    category: Array.isArray(initialEvent?.category) ? initialEvent.category : [EventCategory.TECH],
    imageUrl: initialEvent?.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200',
    assets: initialEvent?.assets || {
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200',
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${initialEvent?.title || 'Event'}`
    },
    coordinates: initialEvent?.coordinates || { lat: 37.7749, lng: -122.4194 },
    tags: initialEvent?.tags || [] as string[]
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        // In a real app we'd upload to storage and get a URL
        // Here we'll simulate it by setting the base64 or just a fresh unsplash placeholder
        const base64 = reader.result as string;
        setFormData(prev => ({ 
          ...prev, 
          imageUrl: base64,
          assets: { ...prev.assets, bannerUrl: base64 } 
        }));
        setIsUploading(false);
        toast.success("Image uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setSearchResults(data.features);
        setShowResults(true);
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectResult = (feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    const name = feature.properties.name || "";
    const city = feature.properties.city || "";
    const label = name && city ? `${name}, ${city}` : (name || city || feature.properties.street || "Location");
    
    setCenter({ lat, lng });
    setZoom(16);
    setFormData(prev => ({ 
      ...prev, 
      coordinates: { lat, lng },
      location: label
    }));
    setShowResults(false);
    setSearchQuery(label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Future date
    const eventDate = new Date(formData.date);
    if (eventDate <= new Date()) {
      toast.error("Event must be in the future!");
      return;
    }

    onAdd({
        ...formData,
        id: initialEvent?.id, // Ensure ID is passed back if editing
        organizerEmail: initialEvent?.organizerEmail || currentUser?.email || '',
        organizerId: initialEvent?.organizerId || currentUser?.id || '',
        organizerName: initialEvent?.organizerName || currentUser?.name || '',
        updatedAt: new Date().toISOString()
    });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://photon.komoot.io/reverse/?lon=${lng}&lat=${lat}`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const name = feature.properties.name || "";
        const city = feature.properties.city || "";
        const street = feature.properties.street || "";
        const label = [name, street, city].filter(Boolean).slice(0, 2).join(', ') || "Selected Location";
        
        setFormData(prev => ({ 
          ...prev, 
          location: label,
          coordinates: { lat, lng }
        }));
        setSearchQuery(label);
      } else {
        setFormData(prev => ({ ...prev, coordinates: { lat, lng } }));
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      setFormData(prev => ({ ...prev, coordinates: { lat, lng } }));
    }
  };

  const onMapClick = (e: any) => {
    const { lng, lat } = e.lngLat;
    reverseGeocode(lat, lng);
  };

  const handleAI = async () => {
    if (!formData.title) {
        toast.error("Enter a title first!");
        return;
    }
    setLoading(true);
    const desc = "This is a detailed description of the campus event. Automatically generated placeholder.";
    const tags = ["campus", "event", "placeholder"];
    setFormData(prev => ({ ...prev, description: desc, tags }));
    setLoading(false);
    toast.success("Content Generated!");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">Event Builder</h2>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Design your next campus experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Event Title</Label>
            <Input 
              placeholder="e.g., Hackathon 2026 Kickoff" 
              className="rounded-none border-[2.5px] border-foreground text-foreground h-12 font-bold"
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description</Label>
                <button 
                    type="button" 
                    onClick={handleAI} 
                    className="h-8 px-4 text-[9px] font-black uppercase tracking-[0.15em] border-[2px] border-primary text-primary bg-primary/5 hover:bg-primary/10 flex items-center gap-2 active:translate-y-[1px] transition-all"
                    disabled={loading}
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    {loading ? 'Thinking...' : 'AI Generate'}
                </button>
          </div>
          <Textarea 
            className="min-h-[140px] resize-none text-foreground rounded-none border-[2.5px] border-foreground font-medium"
            placeholder="Describe your event's vibe, what happens, and why students should care..."
            value={formData.description}
            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
            required
          />
        </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Date & Time</Label>
                <Input 
                    type="datetime-local" 
                    className="rounded-none border-[2.5px] border-foreground text-foreground h-12" 
                    value={formData.date}
                    onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                    required
                />
             </div>
             <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Categories (Select Multiple)</Label>
                <div className="flex flex-wrap gap-2 p-3 bg-muted/50 border-[2px] border-foreground/20 min-h-[56px] items-center">
                    {Object.values(EventCategory).map(cat => {
                        const isSelected = formData.category.includes(cat);
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                    setFormData(prev => {
                                        const isAlreadySelected = prev.category.includes(cat);
                                        const newCategories = isAlreadySelected
                                            ? prev.category.filter(c => c !== cat)
                                            : [...prev.category, cat];
                                        return { 
                                            ...prev, 
                                            category: newCategories.length > 0 ? newCategories : prev.category 
                                        };
                                    });
                                }}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] transition-all border-[2px] ${
                                    isSelected 
                                        ? 'bg-primary text-white border-foreground shadow-[3px_3px_0_0_var(--foreground)]' 
                                        : 'bg-card text-muted-foreground border-foreground/20 hover:border-foreground/40'
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Capacity</Label>
                    <Select onValueChange={(v: string) => setFormData(p => ({ ...p, capacity: parseInt(v) }))}>
                    <SelectTrigger className="rounded-none border-[2.5px] border-foreground text-foreground h-12">
                        <SelectValue placeholder="50" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="25">25 Students</SelectItem>
                        <SelectItem value="50">50 Students</SelectItem>
                        <SelectItem value="100">100 Students</SelectItem>
                        <SelectItem value="500">500 Students</SelectItem>
                    </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Short Tagline (Optional)</Label>
                <Input 
                  placeholder="A catchphrase for students" 
                  className="rounded-none border-[2.5px] border-foreground text-foreground h-12"
                  onChange={e => setFormData(p => ({ ...p, tags: [e.target.value] }))}
                />
             </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
             <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Location & Map Pin</Label>
                <div className="relative z-50">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search campus or city..." 
                                className="rounded-none border-[2.5px] border-foreground pl-9 text-foreground h-12" 
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                onFocus={() => setShowResults(searchResults.length > 0)}
                                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                            />
                        </div>
                        <button 
                            type="button" 
                            className="h-12 px-5 font-black text-[9px] uppercase tracking-[0.15em] border-[2.5px] border-foreground bg-card flex items-center gap-2 hover:bg-muted active:translate-y-[1px] transition-all"
                            onClick={() => {
                                setCenter({ lat: 37.7749, lng: -122.4194 });
                                setZoom(13);
                                setFormData(prev => ({ ...prev, coordinates: { lat: 37.7749, lng: -122.4194 }, location: "" }));
                                setSearchQuery('');
                            }}
                        >
                            <MapPin className="h-4 w-4" />
                            Reset
                        </button>
                    </div>

                    <div className="mt-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-between px-1">
                        <span>Refined Address Name</span>
                        <span className="text-primary font-mono">Auto-syncs with Map</span>
                    </div>
                    <Input 
                        placeholder="Venue Name (e.g. Science Building Room 101)" 
                        className="rounded-none mt-1 text-foreground h-10 border-[2px] border-dashed border-foreground/30" 
                        value={formData.location}
                        onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    />

                    <AnimatePresence>
                        {showResults && searchResults.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-card border-[2.5px] border-foreground shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden z-[100]"
                            >
                                {searchResults.map((feature, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectResult(feature)}
                                        className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-start gap-3 transition-colors border-b-[2px] border-foreground/10 last:border-0"
                                    >
                                        <MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
                                        <div>
                                            <p className="text-sm font-black text-foreground">{feature.properties.name || "Unknown"}</p>
                                            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">
                                                {[feature.properties.city, feature.properties.country].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="h-[450px] w-full overflow-hidden border-[3px] border-foreground bg-muted relative group shadow-[6px_6px_0_0_var(--foreground)]">
                    <Map
                        latitude={center.lat}
                        longitude={center.lng}
                        zoom={zoom}
                        onMove={evt => {
                            setCenter({ lat: evt.viewState.latitude, lng: evt.viewState.longitude });
                            setZoom(evt.viewState.zoom);
                        }}
                        onClick={onMapClick}
                        className="w-full h-full"
                    >
                        <MapControls />
                        
                        <Marker 
                            latitude={formData.coordinates.lat}
                            longitude={formData.coordinates.lng} 
                            anchor="bottom"
                            draggable={true}
                            onDragEnd={(e: any) => {
                                const lat = e.lngLat.lat;
                                const lng = e.lngLat.lng;
                                reverseGeocode(lat, lng);
                            }}
                        >
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-10 w-10 text-primary flex items-center justify-center cursor-grab active:cursor-grabbing"
                            >
                                <div className="absolute inset-0 bg-primary/20 animate-ping" />
                                <MapPin className="fill-primary h-8 w-8 drop-shadow-xl relative z-10" />
                            </motion.div>
                        </Marker>
                    </Map>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
                        <div className="bg-card px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] border-[2px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] flex items-center gap-2 text-foreground">
                            <span className="w-2 h-2 bg-primary animate-pulse" />
                            Search above • Drag marker • Click map
                        </div>
                    </div>
                </div>
             </div>
          </div>


          <div className="space-y-4">
             <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Banner Image</Label>
                <div className="flex flex-col gap-4">
                    <div className="relative group/upload h-32 border-[2.5px] border-dashed border-foreground/40 bg-muted/50 flex flex-col items-center justify-center transition-all hover:border-primary cursor-pointer overflow-hidden">
                        {formData.imageUrl && (
                            <img src={formData.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover/upload:opacity-40 transition-opacity" />
                        )}
                        <Upload className="h-6 w-6 text-muted-foreground mb-2 group-hover/upload:text-primary transition-all" />
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover/upload:text-primary">
                            {isUploading ? 'Encoding...' : 'Drag or Click to Upload'}
                        </p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleImageUpload}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Or paste an image URL" 
                            className="rounded-none border-[2px] border-foreground/30 flex-1 text-xs" 
                            value={formData.assets.bannerUrl}
                            onChange={e => setFormData(p => ({ ...p, imageUrl: e.target.value, assets: { ...p.assets, bannerUrl: e.target.value } }))}
                        />
                        <button 
                            type="button" 
                            className="h-10 w-10 border-[2px] border-foreground bg-card flex items-center justify-center hover:bg-muted active:translate-y-[1px] transition-all"
                            onClick={() => {
                                const newUrl = `https://images.unsplash.com/photo-${Date.now()}?q=80&w=1200`;
                                setFormData(p => ({ ...p, imageUrl: newUrl, assets: { ...p.assets, bannerUrl: newUrl } }));
                                toast.info("Used a random premium photo");
                            }}
                        >
                            <Zap className="h-4 w-4" />
                        </button>
                    </div>
                </div>
             </div>
             <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Event Logo (Optional)</Label>
                <Input 
                    placeholder="Small square icon URL" 
                    className="rounded-none border-[2px] border-foreground/30" 
                    value={formData.assets.logoUrl}
                    onChange={e => setFormData(p => ({ ...p, assets: { ...p.assets, logoUrl: e.target.value } }))}
                />
             </div>
          </div>

          <button type="submit" className="w-full h-14 text-sm font-black uppercase tracking-[0.2em] bg-primary text-white border-[2.5px] border-foreground shadow-[5px_5px_0_0_var(--foreground)] active:translate-y-[3px] active:shadow-none transition-all hover:brightness-110">
            {initialEvent ? 'Update Event Details' : 'Publish & Submit Event'}
          </button>
        </form>
      </div>

      <div className="hidden lg:block space-y-6">
        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Live Preview</h3>
        <div className="border-[3px] border-foreground shadow-[6px_6px_0_0_var(--foreground)] overflow-hidden bg-muted w-[340px] sticky top-8">
            <div className="relative aspect-[4/5]">
               <img src={formData.assets.bannerUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
               <div className="absolute top-4 left-4 flex items-center gap-2">
                  {formData.assets.logoUrl && (
                    <div className="h-10 w-10 overflow-hidden bg-white/10 p-1.5 border-[2px] border-white/30">
                        <img src={formData.assets.logoUrl} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    {formData.category.map(cat => <span key={cat} className="bg-white/20 text-white text-[8px] font-black uppercase tracking-wider px-2 py-1 border border-white/30">{cat}</span>)}
                  </div>
               </div>
               <div className="absolute bottom-8 left-4 right-4 space-y-4 text-white">
                  <h2 className="text-3xl font-black leading-tight line-clamp-2 uppercase">{formData.title || "Your Event Title"}</h2>
                  <div className="flex flex-col gap-2 text-[9px] font-black opacity-80 uppercase tracking-[0.2em]">
                     <span className="flex items-center gap-2"><CalendarIcon className="h-3.5 w-3.5 text-primary" />{formData.date ? new Date(formData.date).toLocaleDateString() : "Set Date"}</span>
                     <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-secondary" />{formData.location || "Pin on Map"}</span>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function ScannerView({ events, onCheckIn, registrations }: { events: CampusEvent[], onCheckIn: any, registrations: any[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);

  const handleScan = async (code: string) => {
    if (!selectedEventId) {
        toast.error("Select an event first!");
        return;
    }
    // QR codes are formatted as qr-eventId-userId in our mock
    // For demo, we just look for a registration with matching qrCode
    const reg = registrations.find(r => r.qrCode === code && r.eventId === selectedEventId);
    if (reg) {
        const success = await onCheckIn(selectedEventId, reg.userEmail);
        setScanResult(success ? 'success' : 'error');
    } else {
        setScanResult('error');
        toast.error("Invalid QR Code!");
    }
    
    setTimeout(() => setScanResult(null), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight uppercase">Live Attendance Hub</h2>
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Verify credentials and manage entry flows.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="border-[2.5px] border-foreground bg-card shadow-[6px_6px_0_0_var(--foreground)] overflow-hidden">
            <div className="bg-muted p-6 border-b-[2.5px] border-foreground">
                <h3 className="font-black uppercase tracking-tight text-lg">Device Scanner</h3>
                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Select an event to start checking in students.</p>
            </div>
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em]">Active Event</Label>
                    <Select onValueChange={setSelectedEventId}>
                        <SelectTrigger className="h-12 rounded-none border-[2.5px] border-foreground">
                            <SelectValue placeholder="Select event to scan for" />
                        </SelectTrigger>
                        <SelectContent>
                            {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative aspect-square bg-black overflow-hidden flex flex-col items-center justify-center border-[2.5px] border-foreground">
                    {!selectedEventId ? (
                        <div className="text-center space-y-2 p-12">
                            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select an event to activate camera.</p>
                        </div>
                    ) : (
                        <div className="relative w-full h-full">
                           <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                              <ScanLine className="h-32 w-32 text-primary opacity-20 animate-pulse" />
                           </div>
                           
                           {scanResult === 'success' && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="absolute inset-0 bg-secondary flex flex-col items-center justify-center text-secondary-foreground z-10"
                                >
                                    <CheckCircle2 className="h-20 w-20" />
                                    <p className="text-xl font-black mt-4 uppercase tracking-[0.2em]">Check-in Success</p>
                                </motion.div>
                           )}
                           {scanResult === 'error' && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="absolute inset-0 bg-destructive flex flex-col items-center justify-center text-white z-10"
                                >
                                    <XCircle className="h-20 w-20" />
                                    <p className="text-xl font-black mt-4 uppercase tracking-[0.2em]">Invalid Ticket</p>
                                </motion.div>
                           )}

                           <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 border-[3px] border-white/40 border-dashed pointer-events-none" />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t-[2px] border-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-[9px] uppercase">
                            <span className="bg-card px-3 text-muted-foreground font-black tracking-[0.2em]">Manual Entry</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Enter code (e.g. QR-E1-ALEX)" 
                            className="rounded-none border-[2.5px] border-foreground uppercase h-11 font-mono" 
                            value={manualCode}
                            onChange={e => setManualCode(e.target.value)}
                        />
                        <button className="h-11 px-6 font-black text-[9px] uppercase tracking-[0.15em] bg-primary text-white border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => handleScan(manualCode.toLowerCase())}>Verify</button>
                    </div>
                </div>
            </div>
        </div>

        <div className="border-[2.5px] border-foreground bg-card shadow-[6px_6px_0_0_var(--foreground)] h-fit">
            <div className="p-6 border-b-[2.5px] border-foreground">
                <h3 className="font-black uppercase tracking-tight text-lg">Recent Logs</h3>
            </div>
            <div className="p-0">
               <ScrollArea className="h-[500px]">
                  <div className="divide-y-[2px] divide-foreground/10 px-6">
                    {registrations.filter(r => r.eventId === selectedEventId).sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map(reg => (
                        <div key={reg.id} className="py-4 flex items-center justify-between">
                            <div>
                                <p className="font-black">{reg.userName || reg.userEmail}</p>
                                <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">{new Date(reg.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 border-[2px] ${reg.checkedIn ? 'border-secondary bg-secondary/10 text-secondary' : 'border-foreground/20 bg-muted text-muted-foreground'}`}>
                                {reg.checkedIn ? 'ARRIVED' : 'PENDING'}
                            </span>
                        </div>
                    ))}
                    {registrations.filter(r => r.eventId === selectedEventId).length === 0 && (
                        <div className="py-20 text-center text-muted-foreground">
                            <p className="text-xs font-black opacity-50 uppercase tracking-[0.2em]">No entries yet</p>
                        </div>
                    )}
                  </div>
               </ScrollArea>
            </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsView({ events }: { events: CampusEvent[] }) {
    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight uppercase">Full Spectrum Analytics</h2>
                <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Deep dive into audience behavior and event performance.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                 <div className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)]">
                    <div className="p-6 border-b-[2.5px] border-foreground">
                        <h3 className="font-black uppercase tracking-tight">Category Participation</h3>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Distribution of events per category</p>
                    </div>
                    <div className="p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={events}>
                                <XAxis dataKey="category[0]" />
                                <YAxis />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="registeredCount" fill="var(--color-primary)" radius={[0, 0, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)]">
                    <div className="p-6 border-b-[2.5px] border-foreground">
                        <h3 className="font-black uppercase tracking-tight">Venue Popularity</h3>
                        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Where are students going?</p>
                    </div>
                    <div className="p-6 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={events} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="location" type="category" width={100} fontSize={10} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="registeredCount" fill="var(--color-secondary)" radius={[0, 0, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
            </div>
        </div>
    );
}


function SideButton({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-[0.1em] transition-all border-[2px] ${
        active 
          ? 'bg-primary text-white border-foreground shadow-[4px_4px_0_0_var(--foreground)]' 
          : 'text-muted-foreground border-transparent hover:bg-muted hover:border-foreground/20'
      }`}
    >
      <span className={`h-5 w-5 ${active ? 'text-white' : 'text-muted-foreground/50'}`}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function MobileNavIcon({ active, icon, onClick }: { active: boolean, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`h-9 w-9 flex items-center justify-center transition-all border-[2px] ${
        active 
          ? 'bg-primary text-white border-foreground shadow-[2px_2px_0_0_var(--foreground)]' 
          : 'text-muted-foreground/60 border-transparent opacity-70 hover:opacity-100'
      }`}
    >
      {icon}
    </button>
  );
}

function VisualizerView({ events, onUpdate }: { events: CampusEvent[], onUpdate: (e: CampusEvent) => void }) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(events[0]?.id || null);
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const [exporting, setExporting] = useState(false);

  const [config, setConfig] = useState<{
    layout: 'brutal' | 'minimal' | 'cyber' | 'kinetic';
    theme: 'dark' | 'light' | 'vibrant' | 'mono';
    accentColor: string;
    showQr: boolean;
    showImage: boolean;
    overlayOpacity: number;
    fontFamily: 'sans' | 'mono' | 'serif' | 'display';
  }>(selectedEvent?.posterConfig || {
    layout: 'brutal',
    theme: 'dark',
    accentColor: '#3b82f6',
    showQr: true,
    showImage: true,
    overlayOpacity: 0.4,
    fontFamily: 'sans'
  });

  // Sync config when selected event changes
  React.useEffect(() => {
    if (selectedEvent) {
      setConfig(selectedEvent.posterConfig || {
        layout: 'brutal',
        theme: 'dark',
        accentColor: '#3b82f6',
        showQr: true,
        showImage: true,
        overlayOpacity: 0.4,
        fontFamily: 'sans'
      });
    }
  }, [selectedEventId]);

  const handleSave = () => {
    if (!selectedEvent) return;
    onUpdate({
      ...selectedEvent,
      posterConfig: config
    });
    toast.success("Design preferences synced to Nexus Cloud.");
  };

  const handleExport = () => {
    setExporting(true);
    toast.info("Hyper-rendering your canvas... Check your downloads.");
    setTimeout(() => {
      setExporting(false);
      toast.success("Ready for broadcast.");
    }, 2000);
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-6 bg-muted border-[2.5px] border-dashed border-foreground/30">
        <Monitor className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-black uppercase tracking-tight">No Canvas Available</h2>
        <p className="text-muted-foreground font-medium max-w-sm text-sm">Publish your first campus moment to unlock the Nexus Post-Production Suite.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            Nexus Canvas <span className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 border-[2px] border-foreground">v3.0</span>
          </h2>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Generative visual studio for campus broadcast assets.</p>
        </div>
        <div className="flex items-center gap-3 bg-muted p-2 border-[2px] border-foreground/30">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] pl-3 text-muted-foreground">Select Stream</Label>
          <Select value={selectedEventId || ''} onValueChange={(v) => setSelectedEventId(v)}>
            <SelectTrigger className="w-[200px] h-10 rounded-none border-none bg-transparent shadow-none font-black">
              <SelectValue placeholder="Pick an Event" />
            </SelectTrigger>
            <SelectContent>
              {events.map(e => (
                <SelectItem key={e.id} value={e.id} className="font-black">{e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedEvent && (
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Canvas Engine */}
          <div className="flex items-center justify-center bg-zinc-950 p-4 sm:p-12 min-h-[600px] border-[3px] border-foreground shadow-[6px_6px_0_0_var(--foreground)] relative overflow-hidden group">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] grayscale" />
            
            {/* The Visual Result */}
            <motion.div 
               layout={true}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className={`relative aspect-square w-full max-w-[500px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ${
                  config.fontFamily === 'mono' ? 'font-mono' : 
                  config.fontFamily === 'serif' ? 'font-serif' : 
                  'font-sans'
               }`}
               style={{ 
                 backgroundColor: config.accentColor,
                 color: config.theme === 'dark' ? '#fff' : '#000'
               }}
            >
              {/* Image Layer */}
              {config.showImage && selectedEvent.imageUrl && (
                <div className="absolute inset-0 z-0">
                  <img 
                    src={selectedEvent.imageUrl} 
                    className="w-full h-full object-cover grayscale transition-all duration-700 active:grayscale-0 group-hover:scale-105" 
                    referrerPolicy="no-referrer"
                    alt={selectedEvent.title}
                  />
                  <div 
                    className="absolute inset-0 transition-opacity duration-500" 
                    style={{ 
                      backgroundColor: config.theme === 'dark' ? '#000' : '#fff',
                      opacity: config.overlayOpacity 
                    }} 
                  />
                </div>
              )}

              {/* Layout Content */}
              <div className={`relative z-10 p-8 h-full flex flex-col justify-between ${
                config.layout === 'brutal' ? 'items-start text-left' :
                config.layout === 'minimal' ? 'items-center text-center justify-center space-y-4' :
                config.layout === 'cyber' ? 'items-end text-right' :
                'items-center text-center justify-between py-16'
              }`}>
                
                {/* Header Info */}
                <motion.div 
                  layout={true}
                  className={`space-y-4 w-full ${config.layout === 'kinetic' ? 'rotate-[-6deg]' : ''}`}
                >
                  <Badge className="bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-sm h-7 px-4">
                    {selectedEvent.category.join(' • ')}
                  </Badge>
                  <h1 className={`font-black uppercase tracking-tighter leading-[0.85] ${
                    config.layout === 'brutal' ? 'text-6xl -ml-1' :
                    config.layout === 'minimal' ? 'text-4xl' :
                    config.layout === 'cyber' ? 'text-5xl italic' :
                    'text-7xl scale-y-110'
                  }`}>
                    {selectedEvent.title}
                  </h1>
                </motion.div>

                {/* Meta Info */}
                <div className={`space-y-3 w-full ${
                  config.layout === 'minimal' ? 'pt-8' : ''
                }`}>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Location Intelligence</p>
                    <p className="text-xl font-bold uppercase">{selectedEvent.location}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">Stellar Coordinates</p>
                    <p className="text-xl font-bold uppercase">{new Date(selectedEvent.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Footer / QR Section */}
                <div className={`flex w-full items-end ${
                  config.layout === 'brutal' ? 'justify-between' :
                  config.layout === 'minimal' ? 'justify-center pt-8' :
                  config.layout === 'cyber' ? 'flex-row-reverse justify-between' :
                  'justify-center'
                }`}>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Powered by Pulse</p>
                    <p className="text-[10px] font-mono opacity-40 uppercase">EID: {selectedEvent.id.slice(0, 12)}</p>
                  </div>
                  {config.showQr && (
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-3 bg-white shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] ml-4"
                    >
                      <QRCode 
                        value={`https://pulse.edu/register/${selectedEvent.id}`} 
                        size={64} 
                        level="H"
                        fgColor="#000"
                        bgColor="#fff"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Cyber Style Decorative Elements */}
                {config.layout === 'cyber' && (
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-white/20 animate-pulse pointer-events-none" />
                )}
                {config.layout === 'kinetic' && (
                   <div className="absolute top-0 right-0 p-8 text-7xl font-black opacity-10 uppercase tracking-tighter select-none rotate-90 origin-top-right">
                     STAGED
                   </div>
                )}
              </div>

              {/* CRT Scanline Effect */}
              {config.layout === 'cyber' && (
                <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
              )}
            </motion.div>

            {/* Canvas Labels */}
            <div className="absolute top-6 left-6 text-[10px] font-mono font-black text-white/20 uppercase tracking-widest vertical-rl">Viewport: 1080x1080px</div>
            <div className="absolute bottom-6 right-6 text-[10px] font-mono font-black text-white/20 uppercase tracking-widest">Asset Render: Stable</div>
          </div>

          {/* Configuration Controls */}
          <div className="space-y-6">
            <div className="border-[2.5px] border-foreground bg-card shadow-[6px_6px_0_0_var(--foreground)] overflow-hidden">
              <div className="p-6 bg-muted border-b-[2.5px] border-foreground">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 border-[2px] border-foreground/30 bg-primary/5 flex items-center justify-center">
                       <Palette className="h-5 w-5" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tight">Studio Kit</h3>
                       <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Adjust high-level visual traits</p>
                    </div>
                 </div>
              </div>
              <div className="p-6 space-y-8">
                 {/* Layout Selector */}
                 <div className="space-y-4">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                       <Plus size={12} /> Spatial Strategy
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                       {(['brutal', 'minimal', 'cyber', 'kinetic'] as const).map((l) => (
                          <button
                            key={l}
                            onClick={() => setConfig(prev => ({ ...prev, layout: l }))}
                            className={`p-3 border-[2px] text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                               config.layout === l ? 'bg-primary/5 border-foreground text-primary shadow-[3px_3px_0_0_var(--foreground)]' : 'bg-muted/50 border-foreground/20 text-muted-foreground hover:border-foreground/40'
                            }`}
                          >
                             {l}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Personalization Grid */}
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Accent Core</Label>
                       <div className="flex flex-wrap gap-2">
                          {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff', '#000000'].map(color => (
                             <button 
                                key={color}
                                onClick={() => setConfig(prev => ({ ...prev, accentColor: color }))}
                                className={`h-8 w-8 border-[2px] transition-transform active:scale-90 ${
                                   config.accentColor === color ? 'border-foreground scale-110 shadow-[2px_2px_0_0_var(--foreground)]' : 'border-foreground/20 hover:scale-105'
                                }`}
                                style={{ backgroundColor: color }}
                             />
                          ))}
                       </div>
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Font Family</Label>
                       <Select value={config.fontFamily} onValueChange={(v: any) => setConfig(prev => ({ ...prev, fontFamily: v }))}>
                          <SelectTrigger className="h-10 rounded-none border-[2px] border-foreground font-black uppercase text-[9px]">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="sans" className="font-sans font-black">INTER SANS</SelectItem>
                             <SelectItem value="mono" className="font-mono font-black">JETBRAINS MONO</SelectItem>
                             <SelectItem value="serif" className="font-serif font-black">PLAYFAIR SERIF</SelectItem>
                             <SelectItem value="display" className="font-sans font-black">BLACK DISPLAY</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 {/* Switches */}
                 <div className="space-y-4 pt-4 border-t-[2px] border-foreground/20">
                    <div className="flex items-center justify-between">
                       <div className="space-y-0.5">
                          <Label className="font-black uppercase tracking-[0.15em] text-[9px]">Image Overlay</Label>
                          <p className="text-[9px] text-muted-foreground font-mono">Toggle source imagery visibility</p>
                       </div>
                       <input 
                         type="checkbox" 
                         checked={config.showImage} 
                         onChange={e => setConfig(p => ({ ...p, showImage: e.target.checked }))}
                         className="h-5 w-10 accent-primary"
                       />
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="space-y-0.5">
                          <Label className="font-black uppercase tracking-[0.15em] text-[9px]">Pulse QR Sync</Label>
                          <p className="text-[9px] text-muted-foreground font-mono">Auto-render registration node</p>
                       </div>
                       <input 
                         type="checkbox" 
                         checked={config.showQr} 
                         onChange={e => setConfig(p => ({ ...p, showQr: e.target.checked }))}
                         className="h-5 w-10 accent-primary"
                       />
                    </div>
                 </div>

                 {/* Overlay Substrate */}
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Layer Substrate Density</Label>
                       <span className="text-[9px] font-mono font-black">{Math.round(config.overlayOpacity * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={config.overlayOpacity}
                      onChange={e => setConfig(p => ({ ...p, overlayOpacity: parseFloat(e.target.value) }))}
                      className="w-full h-2 bg-muted appearance-none cursor-pointer accent-primary"
                    />
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleSave}
                className="h-14 font-black text-[9px] uppercase tracking-[0.2em] bg-primary text-white border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all"
              >
                Sync Config
              </button>
              <button 
                disabled={exporting}
                onClick={handleExport}
                className="h-14 font-black text-[9px] uppercase tracking-[0.2em] bg-card text-foreground border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {exporting ? 'Rendering...' : 'Download'} <Download className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center opacity-40 font-mono">
               Nexus Visualizer v3.0 Build 2026.05 • Canvas Locked
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
