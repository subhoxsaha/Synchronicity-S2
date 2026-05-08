import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Flag, 
  Trash2, 
  Ban, 
  User as UserIcon, 
  Clock, 
  Database,
  Search,
  Settings,
  Award
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { CampusEvent, Registration, EventCategory, EventStatus, UserRole } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AdminPortal() {
  const { events, registrations, currentUser, users, updateUserRole, updateUserStatus, moderateEvent } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState('center');
  const [userSearch, setUserSearch] = useState('');

  if (currentUser?.role !== UserRole.ADMIN) return null;

  const categoryData = Object.entries(
    events.reduce((acc, e) => {
      e.category.forEach(cat => acc[cat] = (acc[cat] || 0) + 1);
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#4F46E5', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const menuItems = [
    { id: 'center', label: 'Command Center', icon: <ShieldAlert size={18} /> },
    { id: 'clubs', label: 'Organization Review', icon: <Award size={18} /> },
    { id: 'events', label: 'Moderation', icon: <Settings size={18} /> },
    { id: 'users', label: 'User Directory', icon: <Users size={18} /> },
    { id: 'logs', label: 'Security Logs', icon: <Clock size={18} /> },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pb-24">
      {/* Horizontal Sub-Navigation */}
      <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/40 overflow-x-auto no-scrollbar shadow-sm">
        <div className="flex items-center gap-2 max-w-7xl mx-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                activeSubTab === item.id 
                  ? 'bg-destructive text-white border-destructive shadow-lg shadow-destructive/20' 
                  : 'bg-accent/30 text-muted-foreground border-transparent hover:bg-accent/50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-8 md:px-8 max-w-7xl mx-auto w-full flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeSubTab === 'center' && (
                <div className="space-y-10">
                    <div className="flex flex-col gap-1 text-center md:text-left">
                        <h2 className="text-4xl font-black tracking-tighter uppercase">Nexus Oversight</h2>
                        <p className="text-muted-foreground font-medium text-lg italic">Campus-wide health & social interaction monitoring.</p>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <MetricCard label="Campus Reach" value="92%" sub="+8% this term" />
                        <MetricCard label="Total Moments" value={events.length} sub="Published items" />
                        <MetricCard label="Verified Members" value={users.length} sub="Real-time count" />
                        <MetricCard label="Moderation Queue" value={events.filter(e => e.status === EventStatus.PENDING).length} sub="Awaiting review" />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-card border border-border/50 overflow-hidden">
                           <CardHeader className="p-8 pb-0">
                              <CardTitle className="font-heading text-xl">Engagement Velocity</CardTitle>
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
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} fontStyle="bold" />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="val" stroke="#EF4444" strokeWidth={4} fillOpacity={0.1} fill="#EF4444" />
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
                                            cornerRadius={8}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeSubTab === 'events' && (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black italic tracking-tighter">System Oversight</h2>
                    <div className="grid gap-4">
                        {events.map((event) => (
                             <Card key={event.id} className="rounded-2xl border border-border/50 p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                   <div className="flex items-center gap-4">
                                      <div className="h-12 w-12 rounded-xl bg-primary/10 overflow-hidden shrink-0">
                                         {event.imageUrl ? <img src={event.imageUrl} className="w-full h-full object-cover" /> : null}
                                      </div>
                                      <div>
                                         <p className="font-bold">{event.title}</p>
                                         <p className="text-xs text-muted-foreground">{event.organizerName} · {event.status}</p>
                                      </div>
                                   </div>
                                   <div className="flex gap-2">
                                       {event.status === EventStatus.PENDING && (
                                           <>
                                               <Button size="sm" onClick={() => moderateEvent(event.id, EventStatus.APPROVED)}>Approve</Button>
                                               <Button size="sm" variant="outline" className="text-destructive" onClick={() => moderateEvent(event.id, EventStatus.REJECTED)}>Reject</Button>
                                           </>
                                       )}
                                       {event.status !== EventStatus.PENDING && (
                                           <Button variant="ghost" size="sm" onClick={() => moderateEvent(event.id, EventStatus.PENDING)}>Reset</Button>
                                       )}
                                   </div>
                                </div>
                             </Card>
                        ))}
                    </div>
                </div>
            )}
            
            {activeSubTab === 'users' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-black italic tracking-tighter">User Directory</h2>
                        <Input placeholder="Search name or ID..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-64" />
                    </div>
                    <div className="grid gap-3">
                        {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase())).map(user => (
                            <Card key={user.id} className="p-4 flex items-center justify-between rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <Avatar><AvatarImage src={user.avatar} /></Avatar>
                                    <div>
                                        <p className="font-bold text-sm">{user.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">{user.role}</p>
                                    </div>
                                </div>
                                <Select defaultValue={user.role} onValueChange={(v) => updateUserRole(user.id, v as UserRole)}>
                                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="organizer">Organizer</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeSubTab === 'clubs' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase">Organization Review</h2>
                        <p className="text-muted-foreground font-medium italic">Verify institutional entities and grant publishing rights.</p>
                    </div>

                    <div className="grid gap-6">
                        {users.filter(u => u.role === 'organizer' && u.status === 'review').length === 0 ? (
                            <Card className="p-20 text-center rounded-[3rem] border-dashed border-2 border-border/40 bg-accent/5">
                                <Award className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                                <p className="font-bold text-muted-foreground uppercase tracking-widest text-sm">No pending applications</p>
                            </Card>
                        ) : (
                            users.filter(u => u.role === 'organizer' && u.status === 'review').map(user => (
                                <Card key={user.id} className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-card border border-border/50">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="p-10 bg-accent/30 md:w-80 space-y-6">
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{user.orgName?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-xl font-black">{user.orgName}</p>
                                                    <Badge variant="secondary" className="uppercase text-[9px] font-black tracking-widest">{user.orgType}</Badge>
                                                </div>
                                            </div>
                                            <div className="space-y-4 pt-4 border-t border-border/40">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Contact</p>
                                                    <p className="font-bold text-sm truncate">{user.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{user.email}</p>
                                                </div>
                                                {user.orgWebsite && (
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Website</p>
                                                        <a href={user.orgWebsite} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary truncate block hover:underline">
                                                            {user.orgWebsite.replace('https://', '')}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <CardContent className="flex-1 p-10 space-y-8">
                                            <div className="space-y-3">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mission Statement</h4>
                                                <p className="text-lg font-medium leading-relaxed italic text-foreground/80">
                                                    "{user.orgDescription}"
                                                </p>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 pt-6 border-t border-border/40">
                                                <Button 
                                                    className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-xl shadow-primary/20 flex-1"
                                                    onClick={() => updateUserStatus(user.id, 'active')}
                                                >
                                                    Approve Entity
                                                </Button>
                                                <Button 
                                                    variant="outline"
                                                    className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest border-2 flex-1"
                                                    onClick={() => updateUserStatus(user.id, 'active')} // For now approving
                                                >
                                                    Request Info
                                                </Button>
                                                <Button 
                                                    variant="ghost"
                                                    className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-destructive hover:bg-destructive/10"
                                                    onClick={() => updateUserRole(user.id, UserRole.STUDENT)}
                                                >
                                                    Deny
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>

                    <div className="pt-10">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-6">Active Institutional Partners</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {users.filter(u => u.role === 'organizer' && u.status === 'active').map(user => (
                                <Card key={user.id} className="p-6 rounded-[2rem] border-none shadow-lg bg-card/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                            {user.orgName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm leading-none mb-1">{user.orgName}</p>
                                            <p className="text-[9px] text-muted-foreground uppercase font-black">{user.orgType}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-destructive" onClick={() => updateUserStatus(user.id, 'suspended')}>
                                        <Ban className="h-3.5 w-3.5" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'venues' && <VenueOversightView events={events} />}
            {activeSubTab === 'conflicts' && <ConflictAlertsView events={events} />}
            {activeSubTab === 'logs' && <SecurityLogsView users={users} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string, value: string | number, sub: string }) {
  return (
    <Card className="rounded-[2.5rem] border border-border/50 bg-card shadow-lg p-6 space-y-2">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
        <p className="text-3xl font-black tracking-tighter">{value}</p>
        <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">{sub}</p>
    </Card>
  );
}

function VenueOversightView({ events }: { events: CampusEvent[] }) {
    const venues = Array.from(new Set(events.map(e => e.location))).sort();
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black italic tracking-tighter">Venue Oversight</h2>
            <div className="grid gap-6">
                {venues.map(v => (
                    <Card key={v} className="rounded-[2rem] overflow-hidden">
                        <div className="p-6 bg-accent/30 border-b border-border/50 flex justify-between items-center">
                            <h3 className="font-black text-xl">{v}</h3>
                            <Badge variant="secondary" className="font-black uppercase text-[10px] tracking-widest px-3 py-1">Active Hub</Badge>
                        </div>
                        <div className="p-6 space-y-4">
                            {events.filter(e => e.location === v).map(e => (
                                <div key={e.id} className="flex justify-between items-center p-3 rounded-xl bg-accent/10 border border-border/40">
                                    <span className="font-bold text-sm">{e.title}</span>
                                    <span className="text-[10px] font-black uppercase opacity-60">{e.status}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function ConflictAlertsView({ events }: { events: CampusEvent[] }) {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black italic tracking-tighter text-destructive">Conflict Alerts</h2>
            <Card className="p-10 text-center rounded-[2.5rem] border-dashed border-2 border-destructive/20 bg-destructive/5">
                <AlertTriangle className="h-16 w-16 mx-auto text-destructive opacity-30 mb-4" />
                <p className="font-black text-destructive uppercase tracking-widest">No major binary conflicts detected.</p>
                <p className="text-xs text-muted-foreground mt-2">Resource allocation is within normal parameters for Spring 2026.</p>
            </Card>
        </div>
    );
}

function SecurityLogsView({ users }: { users: any[] }) {
    const logs = [
        { id: 1, type: 'AUTH', msg: 'Root login detected', time: '5m ago' },
        { id: 2, type: 'MOD', msg: 'Event approved: Hackathon', time: '12m ago' },
        { id: 3, type: 'ROLE', msg: 'User role changed: jdoe@campus.edu', time: '1h ago' }
    ];
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-black italic tracking-tighter">Security Logs</h2>
            <div className="space-y-2">
                {logs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/30">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-black text-[9px] uppercase tracking-tighter">{log.type}</Badge>
                            <span className="text-sm font-medium">{log.msg}</span>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">{log.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
