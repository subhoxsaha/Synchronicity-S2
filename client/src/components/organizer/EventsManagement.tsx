import React, { useState } from 'react';
import { CampusEvent, Registration, EventStatus } from '../../types';
import { PlusCircle, Plus, Trash2, Edit2, ArrowRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';

interface Props {
  events: CampusEvent[];
  registrations: Registration[];
  onEdit: (e: CampusEvent) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export function EventsManagement({ events, registrations, onEdit, onCreate, onDelete }: Props) {
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  const filtered = filter === 'all' ? events : events.filter(e => {
    if (filter === 'approved') return e.status === EventStatus.APPROVED;
    if (filter === 'pending') return e.status === EventStatus.PENDING;
    if (filter === 'rejected') return e.status === EventStatus.REJECTED;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight uppercase">My Moments</h2>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Manage all your campus posts.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-0 border-[2.5px] border-foreground">
            {(['all', 'approved', 'pending', 'rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-[8px] font-black uppercase tracking-[0.15em] transition-all border-r-[2px] border-foreground last:border-r-0 ${filter === f ? 'bg-foreground text-background' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={onCreate} className="h-10 px-6 text-[9px] font-black uppercase tracking-[0.15em] bg-primary text-white border-[2px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all flex items-center">
            <Plus className="mr-2 h-4 w-4" /> New Post
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {filtered.length === 0 ? (
          <div className="border-[2.5px] border-dashed border-foreground/30 bg-muted/30 p-20 text-center">
            <div className="max-w-xs mx-auto space-y-4">
              <div className="h-20 w-20 border-[2.5px] border-foreground/20 flex items-center justify-center mx-auto"><PlusCircle className="h-10 w-10 text-muted-foreground/40" /></div>
              <h3 className="text-lg font-black tracking-tight uppercase">No Moments Found</h3>
              <p className="text-sm text-muted-foreground font-medium">
                {filter !== 'all' ? `No ${filter} posts. Try a different filter.` : 'Share your first campus moment.'}
              </p>
              <button onClick={onCreate} className="px-8 py-2 font-black uppercase text-[9px] tracking-[0.2em] bg-foreground text-background border-[2px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all">Start Posting</button>
            </div>
          </div>
        ) : filtered.map(event => (
          <div key={event.id} className="border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden group hover:shadow-[7px_7px_0_0_var(--foreground)] transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 h-48 md:h-auto relative overflow-hidden border-b-[2.5px] md:border-b-0 md:border-r-[2.5px] border-foreground">
                <img src={event.imageUrl} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="flex flex-wrap gap-1">
                    {event.category.slice(0, 2).map((cat, i) => (
                      <span key={i} className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/20 backdrop-blur-md text-white border-[1.5px] border-white/30">{cat}</span>
                    ))}
                    {event.category.length > 2 && <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/20 backdrop-blur-md text-white border-[1.5px] border-white/30">+{event.category.length - 2}</span>}
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{event.title}</h3>
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border-[1.5px] ${
                          event.status === EventStatus.APPROVED ? "bg-secondary/10 text-secondary border-secondary" :
                          event.status === EventStatus.REJECTED ? "bg-destructive/10 text-destructive border-destructive" :
                          "bg-primary/10 text-primary border-primary"
                        }`}>{event.status}</span>
                        <span className="text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 border-[1.5px] border-foreground/20 bg-muted">{(event as any).type || 'event'}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5 text-primary" />{new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-secondary" />{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">{event.description}</p>
                </div>
                <div className="flex items-center justify-between border-t-[2px] border-foreground/15 pt-6 mt-6">
                  <div className="flex items-center gap-8">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Capacity</p>
                      <p className="text-lg font-black font-mono">{event.registeredCount} <span className="text-xs text-muted-foreground opacity-40">/ {event.capacity}</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Attended</p>
                      <p className="text-lg font-black font-mono text-secondary">{event.checkedInCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="h-10 px-6 border-[2px] border-foreground font-black text-[9px] uppercase tracking-[0.15em] shadow-[3px_3px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => onEdit(event)}>Edit</button>
                    <button className="h-10 w-10 flex items-center justify-center border-[2px] border-destructive text-destructive hover:bg-destructive/10 transition-colors" onClick={() => { if (window.confirm('Delete this event?')) onDelete(event.id); }}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
