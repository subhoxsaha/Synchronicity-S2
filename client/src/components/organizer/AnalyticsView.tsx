import React, { useState, useMemo } from 'react';
import { CampusEvent } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, LineChart, Line, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { TrendingUp, Target, Award, Activity, PieChart as PieIcon, MapPin } from 'lucide-react';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
const ttStyle: React.CSSProperties = { borderRadius: '0', border: '2.5px solid var(--foreground)', boxShadow: '4px 4px 0 0 var(--foreground)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' };

function ChartCard({ title, sub, icon, children }: { title: string; sub: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden">
      <div className="p-5 border-b-[2.5px] border-foreground flex items-center justify-between">
        <div>
          <h3 className="font-black uppercase tracking-tight text-sm">{title}</h3>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">{sub}</p>
        </div>
        <div className="h-9 w-9 border-[2px] border-foreground/20 bg-primary/5 flex items-center justify-center">{icon}</div>
      </div>
      <div className="p-5 h-[300px]">{children}</div>
    </div>
  );
}

export function AnalyticsView({ events }: { events: CampusEvent[] }) {
  const [period, setPeriod] = useState<'all' | 'recent'>('all');
  const filtered = period === 'recent' ? events.slice(-5) : events;

  // Category distribution
  const catData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(e => e.category?.forEach(c => { map[c] = (map[c] || 0) + 1; }));
    return Object.entries(map).map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }));
  }, [filtered]);

  // Post type breakdown
  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(e => { const t = (e as any).type || 'event'; map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).map(([name, value], i) => ({ name, value, fill: COLORS[i % COLORS.length] }));
  }, [filtered]);

  // Venue popularity
  const venueData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(e => { if (e.location) map[e.location] = (map[e.location] || 0) + (e.registeredCount || 0); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, value }));
  }, [filtered]);

  // Engagement per event (line)
  const engLine = useMemo(() => {
    return filtered.map(e => ({
      name: e.title.length > 10 ? e.title.slice(0, 10) + '…' : e.title,
      likes: e.likes?.length || 0,
      comments: e.commentCount || 0,
      registrations: e.registeredCount || 0,
    }));
  }, [filtered]);

  // Top performers
  const topPerf = useMemo(() => {
    return [...filtered].sort((a, b) => ((b.likes?.length || 0) + (b.commentCount || 0)) - ((a.likes?.length || 0) + (a.commentCount || 0))).slice(0, 5);
  }, [filtered]);

  // Fill rate radial
  const fillData = useMemo(() => {
    return filtered.slice(0, 5).map((e, i) => ({
      name: e.title.length > 12 ? e.title.slice(0, 12) + '…' : e.title,
      fill: COLORS[i % COLORS.length],
      value: e.capacity > 0 ? Math.round((e.registeredCount / e.capacity) * 100) : 0,
    }));
  }, [filtered]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Full Spectrum Analytics</h2>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Deep dive into audience behavior and event performance.</p>
        </div>
        <div className="flex gap-0 border-[2.5px] border-foreground">
          {(['all', 'recent'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all border-r-[2px] border-foreground last:border-r-0 ${period === p ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
              {p === 'all' ? 'All Time' : 'Recent 5'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { l: 'Avg. Fill Rate', v: `${filtered.length ? Math.round(filtered.reduce((a, e) => a + (e.capacity > 0 ? (e.registeredCount / e.capacity) * 100 : 0), 0) / filtered.length) : 0}%` },
          { l: 'Total Likes', v: filtered.reduce((a, e) => a + (e.likes?.length || 0), 0) },
          { l: 'Total Comments', v: filtered.reduce((a, e) => a + (e.commentCount || 0), 0) },
          { l: 'Unique Venues', v: new Set(filtered.map(e => e.location)).size },
        ].map(s => (
          <div key={s.l} className="border-[2.5px] border-foreground bg-card p-4 shadow-[3px_3px_0_0_var(--foreground)]">
            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">{s.l}</p>
            <p className="text-2xl font-black font-mono tracking-tighter mt-1">{s.v}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Distribution - Horizontal Bar */}
        <ChartCard title="Category Distribution" sub="Events per category" icon={<Target className="h-4 w-4 text-primary" />}>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={catData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                <XAxis type="number" tick={{ fontSize: 9, fontWeight: 900 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 9, fontWeight: 900 }} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="value" strokeWidth={2} stroke="var(--foreground)">
                  {catData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>

        {/* Post Type Pie */}
        <ChartCard title="Post Type Breakdown" sub="Distribution by type" icon={<PieIcon className="h-4 w-4 text-secondary" />}>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" strokeWidth={2.5} stroke="var(--foreground)" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {typeData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={ttStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>

        {/* Engagement Line Chart */}
        <ChartCard title="Engagement Curves" sub="Likes, comments & registrations" icon={<Activity className="h-4 w-4 text-orange-500" />}>
          {engLine.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <LineChart data={engLine}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 900 }} />
                <YAxis tick={{ fontSize: 9, fontWeight: 900 }} width={30} />
                <Tooltip contentStyle={ttStyle} />
                <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' }} />
                <Line type="monotone" dataKey="likes" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, stroke: 'var(--foreground)' }} />
                <Line type="monotone" dataKey="comments" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, stroke: 'var(--foreground)' }} />
                <Line type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, stroke: 'var(--foreground)' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>

        {/* Venue Popularity */}
        <ChartCard title="Venue Popularity" sub="Where students are going" icon={<MapPin className="h-4 w-4 text-rose-500" />}>
          {venueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={venueData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                <XAxis type="number" tick={{ fontSize: 9, fontWeight: 900 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9, fontWeight: 900 }} />
                <Tooltip contentStyle={ttStyle} />
                <Bar dataKey="value" fill="var(--color-secondary)" strokeWidth={2} stroke="var(--foreground)" />
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </ChartCard>
      </div>

      {/* Top Performers */}
      <div className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden">
        <div className="p-5 border-b-[2.5px] border-foreground flex items-center gap-3">
          <Award className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-black uppercase tracking-tight text-sm">Top Performers</h3>
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Highest engagement events</p>
          </div>
        </div>
        <div className="divide-y-[2px] divide-foreground/10">
          {topPerf.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs font-black uppercase tracking-widest opacity-40">No data</div>
          ) : topPerf.map((ev, i) => (
            <div key={ev.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
              <div className="h-10 w-10 border-[2.5px] border-foreground bg-primary/5 flex items-center justify-center font-black text-lg text-primary">
                {i + 1}
              </div>
              <div className="h-10 w-10 overflow-hidden border-[2px] border-foreground/20 flex-shrink-0">
                <img src={ev.imageUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm truncate">{ev.title}</h4>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[8px] font-black uppercase tracking-[0.15em] text-primary">{ev.likes?.length || 0} likes</span>
                  <span className="text-[8px] font-black uppercase tracking-[0.15em] text-secondary">{ev.commentCount || 0} comments</span>
                  <span className="text-[8px] font-black uppercase tracking-[0.15em] text-muted-foreground">{ev.registeredCount || 0} reg</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black font-mono">{(ev.likes?.length || 0) + (ev.commentCount || 0)}</p>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-black uppercase tracking-widest opacity-40">No data available</div>;
}
