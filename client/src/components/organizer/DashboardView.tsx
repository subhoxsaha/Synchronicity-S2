import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Plus, Zap, Edit2, Trash2, TrendingUp, Eye, Users } from 'lucide-react';
import { CampusEvent, Registration } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { MetricCard } from './MetricCard';

interface Props {
  events: CampusEvent[];
  registrations: Registration[];
  onEdit: (e: CampusEvent) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

const COLORS = ['var(--color-primary)', 'var(--color-secondary)', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
const ttStyle = { borderRadius: '0', border: '2.5px solid var(--foreground)', boxShadow: '4px 4px 0 0 var(--foreground)', fontSize: '11px', fontWeight: 900 };

export function DashboardView({ events, registrations, onEdit, onCreate, onDelete }: Props) {
  const totalLikes = events.reduce((a, e) => a + (e.likes?.length || 0), 0);
  const totalComments = events.reduce((a, e) => a + (e.commentCount || 0), 0);
  const totalReg = events.reduce((a, e) => a + (e.registeredCount || 0), 0);
  const totalCap = events.reduce((a, e) => a + (e.capacity || 0), 0);
  const fill = totalCap > 0 ? Math.round((totalReg / totalCap) * 100) : 0;

  const timeline = events.slice(-7).map(e => ({
    name: e.title.length > 12 ? e.title.slice(0, 12) + '…' : e.title,
    likes: e.likes?.length || 0,
    comments: e.commentCount || 0,
  }));

  const regData = events.map((e, i) => ({
    name: e.title.length > 10 ? e.title.slice(0, 10) + '…' : e.title,
    registered: e.registeredCount || 0,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tight uppercase">Creator Console</h2>
          <p className="text-muted-foreground font-medium text-sm">Social footprint & campus engagement.</p>
        </div>
        <button onClick={onCreate} className="h-10 px-6 text-[9px] font-black uppercase tracking-[0.15em] bg-primary text-white border-[2px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> New Post
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Total Moments" value={events.length} icon={<LayoutDashboard className="text-primary" />} trend="Live" />
        <MetricCard label="Total Reach" value={totalLikes + totalComments * 2} icon={<Eye className="text-blue-500" />} trend={`${totalLikes} Likes`} trendUp />
        <MetricCard label="Registrations" value={totalReg} icon={<Users className="text-secondary" />} trend={`${fill}% Fill`} trendUp={fill > 50} />
        <MetricCard label="Engagement" value={events.length ? `${Math.round(((totalLikes + totalComments) / Math.max(events.length, 1)) * 10) / 10}/post` : '0'} icon={<Zap className="text-orange-500 fill-orange-500/20" />} trend="Per Post" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)]">
          <div className="p-5 border-b-[2.5px] border-foreground flex items-center justify-between">
            <div>
              <h3 className="font-black uppercase tracking-tight text-base">Engagement Timeline</h3>
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Likes & comments per post</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="h-[280px] p-5">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 900 }} />
                  <YAxis tick={{ fontSize: 9, fontWeight: 900 }} width={30} />
                  <Tooltip contentStyle={ttStyle} />
                  <Area type="monotone" dataKey="likes" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#gL)" />
                  <Area type="monotone" dataKey="comments" stroke="var(--color-secondary)" strokeWidth={2.5} fill="url(#gC)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-black uppercase tracking-widest opacity-40">No data yet</div>}
          </div>
        </div>

        <div className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)]">
          <div className="p-5 border-b-[2.5px] border-foreground">
            <h3 className="font-black uppercase tracking-tight text-base">Registration Volume</h3>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Per event breakdown</p>
          </div>
          <div className="h-[280px] p-5">
            {regData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={regData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 900 }} />
                  <YAxis tick={{ fontSize: 9, fontWeight: 900 }} width={35} />
                  <Tooltip contentStyle={ttStyle} />
                  <Bar dataKey="registered" strokeWidth={2} stroke="var(--foreground)">
                    {regData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-black uppercase tracking-widest opacity-40">No data yet</div>}
          </div>
        </div>
      </div>

      <div className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden">
        <div className="p-5 bg-muted border-b-[2.5px] border-foreground flex items-center justify-between">
          <div>
            <h3 className="font-black uppercase tracking-tight text-base">Active Projects</h3>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Quick actions</p>
          </div>
          <span className="text-[9px] font-black font-mono text-muted-foreground bg-muted border-[2px] border-foreground/20 px-3 py-1">{events.length} TOTAL</span>
        </div>
        <div className="divide-y-[2px] divide-foreground/10">
          {events.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground opacity-50 font-black uppercase tracking-[0.2em] text-xs">No events published yet</div>
          ) : events.slice(0, 8).map(ev => (
            <div key={ev.id} className="flex items-center justify-between p-4 group hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden border-[2px] border-foreground/20"><img src={ev.imageUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" /></div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-sm leading-none mb-1 truncate">{ev.title}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border-[1.5px] border-foreground/30 bg-muted">{ev.status}</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 border-[1.5px] border-primary/30 bg-primary/5 text-primary">{ev.type || 'event'}</span>
                    <span className="text-[9px] font-mono font-bold text-muted-foreground">{ev.registeredCount}/{ev.capacity}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button className="h-8 w-8 flex items-center justify-center border-[2px] border-transparent opacity-0 group-hover:opacity-100 group-hover:border-foreground/30 hover:bg-foreground hover:text-background transition-all" onClick={() => onEdit(ev)}><Edit2 className="h-4 w-4" /></button>
                <button className="h-8 w-8 flex items-center justify-center border-[2px] border-transparent opacity-0 group-hover:opacity-100 group-hover:border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all" onClick={() => { if (window.confirm('Delete?')) onDelete(ev.id); }}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
