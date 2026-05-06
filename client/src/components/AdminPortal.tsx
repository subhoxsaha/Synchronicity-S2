import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Users, Calendar, AlertTriangle, CheckCircle2, TrendingUp, Flag, Trash2, Ban } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

import { Logo } from './Logo';

export default function AdminPortal() {
  const { events, registrations, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState('center');

  const totalUsers = 1240; // Simulated total students
  const activeStudentOrgCount = 42;

  // Pie chart data for categories
  const categoryData = Object.entries(
    events.reduce((acc, e) => {
      e.category.forEach(cat => acc[cat] = (acc[cat] || 0) + 1);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#4F46E5', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border bg-card hidden lg:flex flex-col p-8 space-y-10">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-black px-3">System Administrator</Badge>
          <Logo className="h-8" />
        </div>

        <nav className="space-y-4 grow">
          <AdminNavItem active={activeTab === 'center'} label="Command Center" icon={<ShieldAlert />} onClick={() => setActiveTab('center')} />
          <AdminNavItem active={activeTab === 'clubs'} label="Organization Review" icon={<Users />} onClick={() => setActiveTab('clubs')} />
          <AdminNavItem active={activeTab === 'venues'} label="Venue Oversight" icon={<Calendar />} onClick={() => setActiveTab('venues')} />
          <AdminNavItem active={activeTab === 'conflicts'} label="Conflict Alerts" icon={<AlertTriangle />} badge="3" onClick={() => setActiveTab('conflicts')} />
        </nav>

        <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-3xl border border-border/50">
           <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>A</AvatarFallback>
           </Avatar>
           <div className="overflow-hidden">
              <p className="text-sm font-black truncate">{currentUser?.name}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Dean of Student Affairs</p>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-5 bg-background/60 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
           <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                 <ShieldAlert className="h-4 w-4 text-primary" />
              </div>
              <h1 className="font-heading font-black text-sm uppercase tracking-wider">Dean Office</h1>
           </div>
           <div className="flex bg-accent/40 p-1 rounded-xl border border-border/40">
              <MobileNavIcon active={activeTab === 'center'} icon={<ShieldAlert size={18} />} onClick={() => setActiveTab('center')} />
              <MobileNavIcon active={activeTab === 'clubs'} icon={<Users size={18} />} onClick={() => setActiveTab('clubs')} />
              <MobileNavIcon active={activeTab === 'venues'} icon={<Calendar size={18} />} onClick={() => setActiveTab('venues')} />
           </div>
        </header>

        <ScrollArea className="flex-1">
           <div className="max-w-6xl mx-auto space-y-10 pb-20 p-6 lg:p-10">
              {activeTab === 'center' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-4xl font-black tracking-tighter">Global Command Center</h2>
                        <p className="text-muted-foreground font-medium text-lg">System-wide monitoring for Spring Semester 2026.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        <MetricCard label="Campus Engagement" value="84%" sub="+5% vs target" />
                        <MetricCard label="Active Tickets" value={registrations.length} sub="Real-time count" />
                        <MetricCard label="Registered Students" value={totalUsers} sub="Total population" />
                        <MetricCard label="Club Capacity" value="92%" sub="Operating normally" />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-card border border-border/50">
                           <CardHeader className="p-8 pb-0">
                              <CardTitle className="font-heading text-xl">Engagement Velocity</CardTitle>
                              <CardDescription>Daily interaction metrics across the campus pulse ecosystem</CardDescription>
                           </CardHeader>
                           <CardContent className="h-[350px] p-8">
                              <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={[
                                    { name: 'Mon', val: 400 },
                                    { name: 'Tue', val: 300 },
                                    { name: 'Wed', val: 600 },
                                    { name: 'Thu', val: 800 },
                                    { name: 'Fri', val: 1200 },
                                    { name: 'Sat', val: 900 },
                                    { name: 'Sun', val: 550 },
                                 ]}>
                                    <defs>
                                       <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                       </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} fontStyle="bold" />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="val" stroke="var(--color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                                 </AreaChart>
                              </ResponsiveContainer>
                           </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-card border border-border/50">
                            <CardHeader className="p-8">
                                <CardTitle className="font-heading">Category Mix</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                           <h3 className="text-2xl font-black tracking-tight">Active Conflicts</h3>
                           <Badge variant="destructive" className="animate-pulse">Urgent Attention</Badge>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                           <ConflictCard 
                                type="Resource Overlap" 
                                title="2 Hackathons Scheduled" 
                                desc="Engineering Hall B is double booked for Friday evening."
                                severity="high"
                           />
                           <ConflictCard 
                                type="Target Split" 
                                title="CS Job Fair vs Robotics Workshop" 
                                desc="80% audience overlap detected for same-time events."
                                severity="medium"
                           />
                           <ConflictCard 
                                type="Capacity Alert" 
                                title="Spring Fest Waitlist > 200" 
                                desc="Alternative venue suggestion: Outdoor Stadium."
                                severity="low"
                           />
                        </div>
                    </section>
                </div>
              )}

              {activeTab === 'clubs' && (
                <div className="space-y-8">
                    <h2 className="text-3xl font-black">Student Organizations</h2>
                    <div className="grid gap-4">
                        {[
                            { name: 'Coding Club', owner: 'Sarah Organizer', status: 'Approved', activeEvents: 5 },
                            { name: 'Music Society', owner: 'John Melodic', status: 'Approved', activeEvents: 3 },
                            { name: 'Sports Enthusiasts', owner: 'Coach Mike', status: 'Pending Review', activeEvents: 0 },
                            { name: 'Gamer Central', owner: 'Pro Player', status: 'Restricted', activeEvents: 1 },
                        ].map((org, i) => (
                            <Card key={i} className="rounded-2xl border-none p-6 shadow-md bg-accent/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary">{org.name[0]}</div>
                                        <div>
                                            <h4 className="font-bold">{org.name}</h4>
                                            <p className="text-xs text-muted-foreground">Admin: {org.owner}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className={org.status === 'Approved' ? 'bg-secondary/10 text-secondary border-none' : ''}>{org.status}</Badge>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><Ban className="h-4 w-4 text-orange-500" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
              )}
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

function AdminNavItem({ active, label, icon, onClick, badge }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void, badge?: string }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-4 py-3 text-sm font-bold transition-all duration-300 outline-none
      ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300
      ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-accent/50 group-hover:bg-accent'}`}>
        {icon}
      </div>
      <span>{label}</span>
      {badge && (
        <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-black text-white shadow-xl">
          {badge}
        </span>
      )}
      {active && (
        <motion.div
           layoutId="menu-blob"
           className="absolute -right-8 h-8 w-1 rounded-l-full bg-primary"
        />
      )}
    </button>
  );
}

function MetricCard({ label, value, sub }: { label: string, value: string | number, sub: string }) {
  return (
    <Card className="rounded-[2rem] border-none bg-card shadow-xl border border-border/50">
      <CardContent className="p-8 space-y-4">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
        <p className="text-xs font-bold text-secondary uppercase tracking-wider">{sub}</p>
      </CardContent>
    </Card>
  );
}

function ConflictCard({ type, title, desc, severity }: { type: string, title: string, desc: string, severity: 'high' | 'medium' | 'low' }) {
  const sevColor = severity === 'high' ? 'bg-destructive/20 text-destructive' : severity === 'medium' ? 'bg-orange-500/20 text-orange-500' : 'bg-secondary/20 text-secondary';
  
  return (
    <Card className="rounded-[2rem] border-none bg-accent/20 p-8 space-y-4 flex flex-col border border-border/50">
      <div className="flex justify-between items-start">
        <Badge className={`border-none font-black text-[10px] px-2 ${sevColor}`}>{type}</Badge>
        <TrendingUp className="h-4 w-4 text-muted-foreground/30" />
      </div>
      <div className="grow space-y-2">
        <h4 className="font-bold leading-tight">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <Button variant="ghost" size="sm" className="w-fit h-8 rounded-full font-bold text-[10px] uppercase gap-2 hover:bg-white/50">
        Resolve <Flag className="h-3 w-3" />
      </Button>
    </Card>
  );
}

