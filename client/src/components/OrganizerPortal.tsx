import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, PlusCircle, ScanLine, BarChart3, Users, Clock, MapPin, Upload, Sparkles, CheckCircle2, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { EventCategory, CampusEvent } from '../types';
import { generateEventDescription, generateEventTags } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

import { Logo } from './Logo';

export default function OrganizerPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { events, currentUser, registrations, addEvent, checkInUser } = useAppContext();

  const myEvents = events.filter(e => e.organizerEmail === currentUser?.email);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop only for now, but used as a top bar on small screens */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col p-6 space-y-8">
        <Logo className="h-8" />
        
        <nav className="space-y-2 grow">
          <SideButton active={activeTab === 'dashboard'} icon={<LayoutDashboard />} label="Dashboard" onClick={() => setActiveTab('dashboard')} />
          <SideButton active={activeTab === 'create'} icon={<PlusCircle />} label="Create Event" onClick={() => setActiveTab('create')} />
          <SideButton active={activeTab === 'scanner'} icon={<ScanLine />} label="Live Scanner" onClick={() => setActiveTab('scanner')} />
          <SideButton active={activeTab === 'analytics'} icon={<BarChart3 />} label="Analytics" onClick={() => setActiveTab('analytics')} />
        </nav>

        <div className="p-4 bg-accent/30 rounded-2xl border border-border/50">
          <p className="text-xs font-bold text-muted-foreground mb-2">Logged in as</p>
          <p className="text-sm font-bold truncate">{currentUser?.name}</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-5 bg-background/60 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
           <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                 <Logo className="h-4" showText={false} />
              </div>
              <h1 className="font-heading font-black text-sm uppercase tracking-wider">Organizer</h1>
           </div>
           <div className="flex bg-accent/40 p-1 rounded-xl border border-border/40">
              <MobileNavIcon active={activeTab === 'dashboard'} icon={<LayoutDashboard size={18} />} onClick={() => setActiveTab('dashboard')} />
              <MobileNavIcon active={activeTab === 'create'} icon={<PlusCircle size={18} />} onClick={() => setActiveTab('create')} />
              <MobileNavIcon active={activeTab === 'scanner'} icon={<ScanLine size={18} />} onClick={() => setActiveTab('scanner')} />
              <MobileNavIcon active={activeTab === 'analytics'} icon={<BarChart3 size={18} />} onClick={() => setActiveTab('analytics')} />
           </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-6 max-w-5xl mx-auto space-y-10 pb-24 lg:p-10">
            {activeTab === 'dashboard' && <DashboardView events={myEvents} registrations={registrations} />}
            {activeTab === 'create' && <EventBuilder onAdd={addEvent} />}
            {activeTab === 'scanner' && <ScannerView events={myEvents} onCheckIn={checkInUser} registrations={registrations} />}
            {activeTab === 'analytics' && <AnalyticsView events={myEvents} />}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

function MobileNavIcon({ active, icon, onClick }: { active: boolean, icon: React.ReactNode, onClick: () => void }) {
  return (
    <Button 
      size="icon" 
      variant="ghost" 
      onClick={onClick} 
      className={`h-9 w-9 rounded-lg transition-all ${active ? 'bg-background shadow-sm text-primary scale-100 ring-1 ring-border/50' : 'text-muted-foreground/60 scale-95 opacity-70'}`}
    >
      {icon}
    </Button>
  );
}

function SideButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      onClick={onClick}
      className={`w-full justify-start gap-3 rounded-xl h-11 ${active ? 'shadow-lg shadow-primary/20' : ''}`}
    >
      {icon}
      <span className="font-bold">{label}</span>
      {active && <motion.div layoutId="side-dot" className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
    </Button>
  );
}

function DashboardView({ events, registrations }: { events: CampusEvent[], registrations: any[] }) {
  const totalRegs = events.reduce((acc, e) => acc + e.registeredCount, 0);
  const totalCheckIns = events.reduce((acc, e) => acc + e.checkedInCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground font-medium">Real-time metrics for your campus initiatives.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <MetricCard label="Active Events" value={events.length} icon={<LayoutDashboard className="text-primary" />} trend="+2 this week" />
        <MetricCard label="Total Registrations" value={totalRegs} icon={<Users className="text-secondary" />} trend="+12% vs last week" />
        <MetricCard label="Attendance Rate" value={totalRegs ? `${Math.round((totalCheckIns / totalRegs) * 100)}%` : '0%'} icon={<BarChart3 className="text-orange-500" />} trend="Steady" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 bg-accent/10">
          <CardHeader>
            <CardTitle className="font-heading">Registration Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={events}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="title" hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="registeredCount" radius={[6, 6, 0, 0]}>
                  {events.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 bg-accent/10">
          <CardHeader>
            <CardTitle className="font-heading">Upcoming Headcounts</CardTitle>
            <CardDescription>Track registration progress for next events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="truncate max-w-[200px]">{event.title}</span>
                  <span>{Math.round((event.registeredCount/event.capacity)*100)}%</span>
                </div>
                <Progress value={(event.registeredCount/event.capacity)*100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, trend }: { label: string, value: string | number, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="rounded-[2rem] border-none bg-background shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/40 overflow-hidden relative group transition-all hover:shadow-primary/5 hover:translate-y-[-2px]">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        {React.cloneElement(icon as React.ReactElement, { size: 64 })}
      </div>
      <CardContent className="p-7 space-y-5">
        <div className="flex items-center justify-between relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center ring-1 ring-primary/10">
            {icon}
          </div>
          <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black uppercase tracking-widest px-2.5 py-1">
            {trend}
          </Badge>
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-4xl font-black tracking-tighter">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EventBuilder({ onAdd }: { onAdd: any }) {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAppContext();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    capacity: 50,
    category: [EventCategory.TECH],
    imageUrl: 'https://picsum.photos/seed/campus/1200/800',
    tags: [] as string[]
  });

  const handleAI = async () => {
    if (!formData.title) {
        toast.error("Enter a title first!");
        return;
    }
    setLoading(true);
    const desc = await generateEventDescription(formData.title, "Campus event");
    const tags = await generateEventTags(formData.title, desc);
    setFormData(prev => ({ ...prev, description: desc, tags }));
    setLoading(false);
    toast.success("AI Content Generated!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      organizerEmail: currentUser?.email || '',
      organizerName: currentUser?.name || '',
      registeredCount: 0,
      checkedInCount: 0,
    });
    setFormData({
      title: '',
      description: '',
      location: '',
      date: '',
      capacity: 50,
      category: [EventCategory.TECH],
      imageUrl: 'https://picsum.photos/seed/campus/1200/800',
      tags: []
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">Event Builder</h2>
          <p className="text-muted-foreground font-medium">Design your next big campus experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest">Event Title</Label>
            <Input 
              placeholder="e.g., Hackathon 2026 Kickoff" 
              className="rounded-xl"
              value={formData.title}
              onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-widest">Description</Label>
                <Button 
                    type="button" 
                    onClick={handleAI} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-primary font-bold gap-2 hover:bg-primary/10 rounded-full"
                    disabled={loading}
                >
                    <Sparkles className="h-4 w-4" />
                    {loading ? 'Thinking...' : 'AI Generate'}
            </Button>
          </div>
          <Textarea 
            className="min-h-[140px] resize-none"
            placeholder="Describe your event's vibe, what happens, and why students should care..."
            value={formData.description}
            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
            required
          />
        </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</Label>
                <Input 
                    type="datetime-local" 
                    className="rounded-xl" 
                    value={formData.date}
                    onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                    required
                />
             </div>
             <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location</Label>
                <Input 
                    placeholder="Venue Hall B" 
                    className="rounded-xl" 
                    value={formData.location}
                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    required
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Capacity</Label>
                    <Select onValueChange={(v: string) => setFormData(p => ({ ...p, capacity: parseInt(v) }))}>
                    <SelectTrigger className="rounded-xl">
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
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                <Select onValueChange={v => setFormData(p => ({ ...p, category: [v as EventCategory] }))}>
                    <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Tech" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(EventCategory).map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
          </div>

          <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/25">Publish Event</Button>
        </form>
      </div>

      <div className="hidden lg:block space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Live Preview</h3>
        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-accent/20 border border-border/50 w-[340px] sticky top-8">
            <div className="relative aspect-[4/5]">
               <img src={formData.imageUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
               <div className="absolute top-6 left-6 flex gap-2">
                  {formData.category.map(cat => <Badge key={cat} className="bg-white/20 backdrop-blur-md text-white border-none">{cat}</Badge>)}
               </div>
               <div className="absolute bottom-10 left-6 right-6 space-y-4 text-white">
                  <h2 className="text-3xl font-bold leading-tight">{formData.title || "Your Event Title"}</h2>
                  <div className="flex items-center gap-4 text-xs font-bold opacity-80 uppercase tracking-widest">
                     <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" />{formData.date ? new Date(formData.date).toLocaleDateString() : "Date"}</span>
                     <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{formData.location || "Location"}</span>
                  </div>
               </div>
            </div>
        </Card>
      </div>
    </div>
  );
}

function ScannerView({ events, onCheckIn, registrations }: { events: CampusEvent[], onCheckIn: any, registrations: any[] }) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);

  const handleScan = (code: string) => {
    if (!selectedEventId) {
        toast.error("Select an event first!");
        return;
    }
    // QR codes are formatted as qr-eventId-userId in our mock
    // For demo, we just look for a registration with matching qrCode
    const reg = registrations.find(r => r.qrCode === code && r.eventId === selectedEventId);
    if (reg) {
        const success = onCheckIn(selectedEventId, reg.userEmail);
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
        <h2 className="text-3xl font-black tracking-tight tracking-tight">Live Attendance Hub</h2>
        <p className="text-muted-foreground font-medium">Verify credentials and manage entry flows.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-none bg-card shadow-2xl border border-border/50 overflow-hidden">
            <CardHeader className="bg-accent/50 p-8">
                <CardTitle className="font-heading">Device Scanner</CardTitle>
                <CardDescription>Select an event to start checking in students.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest">Active Event</Label>
                    <Select onValueChange={setSelectedEventId}>
                        <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Select event to scan for" />
                        </SelectTrigger>
                        <SelectContent>
                            {events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative aspect-square rounded-3xl bg-black overflow-hidden flex flex-col items-center justify-center">
                    {!selectedEventId ? (
                        <div className="text-center space-y-2 p-12">
                            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-sm font-bold text-muted-foreground">Please select an event to activate the camera.</p>
                        </div>
                    ) : (
                        <div className="relative w-full h-full">
                           {/* Simulated Camera Viewfinder */}
                           <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                              <ScanLine className="h-32 w-32 text-primary opacity-20 animate-pulse" />
                           </div>
                           
                           {/* Success/Error Overlays */}
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

                           {/* Viewfinder Corners */}
                           <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none" />
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 border-2 border-white/40 border-dashed rounded-2xl pointer-events-none" />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground font-bold">Manual Entry</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Enter code (e.g. QR-E1-ALEX)" 
                            className="rounded-xl uppercase h-11" 
                            value={manualCode}
                            onChange={e => setManualCode(e.target.value)}
                        />
                        <Button className="rounded-xl h-11 px-6 font-bold" onClick={() => handleScan(manualCode.toLowerCase())}>Verify</Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none bg-card shadow-2xl border border-border/50 h-fit">
            <CardHeader className="p-8">
                <CardTitle className="font-heading">Recent Logs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <ScrollArea className="h-[500px]">
                  <div className="divide-y divide-border/50 px-8">
                    {registrations.filter(r => r.eventId === selectedEventId).sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map(reg => (
                        <div key={reg.id} className="py-4 flex items-center justify-between">
                            <div>
                                <p className="font-bold">{reg.userEmail}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{new Date(reg.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <Badge variant={reg.checkedIn ? "secondary" : "outline"} className={reg.checkedIn ? "bg-secondary/10 text-secondary border-none" : "border-muted"}>
                                {reg.checkedIn ? 'ARRIVED' : 'PENDING'}
                            </Badge>
                        </div>
                    ))}
                    {registrations.filter(r => r.eventId === selectedEventId).length === 0 && (
                        <div className="py-20 text-center text-muted-foreground">
                            <p className="text-sm font-bold opacity-50 uppercase tracking-widest">No entries yet</p>
                        </div>
                    )}
                  </div>
               </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsView({ events }: { events: CampusEvent[] }) {
    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight">Full Spectrum Analytics</h2>
                <p className="text-muted-foreground font-medium">Deep dive into audience behavior and event performance.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                 <Card className="rounded-3xl border-none shadow-xl border border-border/50">
                    <CardHeader>
                        <CardTitle className="font-heading">Category Participation</CardTitle>
                        <CardDescription>Distribution of events per category</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={events}>
                                <XAxis dataKey="category[0]" />
                                <YAxis />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="registeredCount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                 </Card>

                 <Card className="rounded-3xl border-none shadow-xl border border-border/50">
                    <CardHeader>
                        <CardTitle className="font-heading">Venue Popularity</CardTitle>
                        <CardDescription>Where are students going?</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={events} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="location" type="category" width={100} fontSize={10} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="registeredCount" fill="var(--color-secondary)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}
