import React from 'react';
import { Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventCategory } from '../../types';
import { toast } from 'sonner';
import { StepProps, BUILDER_POST_TYPES } from './types';
export function StepBasics({ form, setForm }: StepProps) {
  const handleAI = () => {
    if (!form.title) { toast.error("Enter a title first!"); return; }
    const desc = `Join us for ${form.title}! An exciting campus event bringing students together for an unforgettable experience. Don't miss out on this opportunity to connect, learn, and grow with your peers.`;
    const tags = form.title.toLowerCase().split(' ').filter(w => w.length > 3);
    setForm(p => ({ ...p, description: desc, tags: [...new Set([...p.tags, ...tags])] }));
    toast.success("Description generated!");
  };

  const toggleCategory = (cat: EventCategory) => {
    setForm(prev => {
      const has = prev.category.includes(cat);
      const next = has ? prev.category.filter(c => c !== cat) : [...prev.category, cat];
      return { ...prev, category: next.length > 0 ? next : prev.category };
    });
  };

  return (
    <div className="space-y-6">
      {/* Post Type */}
      <div className="space-y-2">
        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Post Type *</Label>
        <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
          <SelectTrigger className="rounded-none border-[2.5px] border-foreground h-12 font-bold uppercase text-xs tracking-widest">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {BUILDER_POST_TYPES.map(pt => (
              <SelectItem key={pt.value} value={pt.value}>
                <span className="flex items-center gap-2">
                  <span>{pt.icon}</span>
                  {pt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Post Title *</Label>
        <Input
          placeholder="e.g., Hackathon 2026 Kickoff"
          className="rounded-none border-[2.5px] border-foreground text-foreground h-12 font-bold"
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
        />
        {form.title.length > 0 && form.title.length < 3 && (
          <p className="text-[10px] text-destructive font-bold">Title must be at least 3 characters</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description *</Label>
          <button
            type="button"
            onClick={handleAI}
            className="h-8 px-4 text-[9px] font-black uppercase tracking-[0.15em] border-[2px] border-primary text-primary bg-primary/5 hover:bg-primary/10 flex items-center gap-2 active:translate-y-[1px] transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Generate
          </button>
        </div>
        <Textarea
          className="min-h-[120px] resize-none text-foreground rounded-none border-[2.5px] border-foreground font-medium"
          placeholder="Describe your event..."
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Categories * (select multiple)</Label>
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 border-[2px] border-foreground/20 min-h-[48px] items-center">
          {Object.values(EventCategory).map(cat => {
            const sel = form.category.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] transition-all border-[2px] ${
                  sel
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

      {/* Format & Difficulty row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Format</Label>
          <div className="flex border-[2.5px] border-foreground">
            {(['in-person', 'virtual', 'hybrid'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setForm(p => ({ ...p, format: f }))}
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-[0.1em] transition-all ${
                  form.format === f
                    ? 'bg-foreground text-background'
                    : 'bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Difficulty (optional)</Label>
          <Select value={form.difficulty} onValueChange={v => setForm(p => ({ ...p, difficulty: v as any }))}>
            <SelectTrigger className="rounded-none border-[2.5px] border-foreground h-12">
              <SelectValue placeholder="Any level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
