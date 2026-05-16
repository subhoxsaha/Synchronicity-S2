import React from 'react';
import { Users, DollarSign, Link, Mail, Utensils } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StepProps } from './types';

export function StepSettings({ form, setForm }: StepProps) {
  const isEvent = form.type === 'event';
  const isWebinar = form.type === 'webinar';
  const showCapacity = isEvent || isWebinar;
  const showTicketing = isEvent;
  const showTeam = isEvent || form.type === 'project' || form.type === 'challenge';
  const showRegistration = isEvent || isWebinar || form.type === 'challenge';
  const showFood = isEvent;

  return (
    <div className="space-y-8">
      {/* Capacity */}
      {showCapacity && (
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> Capacity *
          </Label>
          <Input
            type="number"
            min={1}
            max={10000}
            className="rounded-none border-[2.5px] border-foreground h-12 w-40 font-bold text-lg"
            value={form.capacity}
            onChange={e => setForm(p => ({ ...p, capacity: parseInt(e.target.value) || 1 }))}
          />
        </div>
      )}

      {/* Ticket Price & Team Size */}
      {(showTicketing || showTeam) && (
        <>
          {showTicketing && (
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5" /> Ticket Price (₹)
              </Label>
              <Input
                type="number"
                min={0}
                className="rounded-none border-[2.5px] border-foreground h-12 w-40 font-bold text-lg"
                value={form.ticketPrice}
                onChange={e => setForm(p => ({ ...p, ticketPrice: parseFloat(e.target.value) || 0 }))}
              />
              <p className="text-[9px] text-muted-foreground font-mono">Set to 0 for free events</p>
            </div>
          )}

          {showTeam && (
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Max Team Size</Label>
              <Input
                type="number"
                min={1}
                max={20}
                className="rounded-none border-[2.5px] border-foreground/50 h-12 w-40 font-bold"
                value={form.maxTeamSize}
                onChange={e => setForm(p => ({ ...p, maxTeamSize: parseInt(e.target.value) || 1 }))}
              />
              <p className="text-[9px] text-muted-foreground font-mono">1 = individual, 2+ = team event</p>
            </div>
          )}
        </>
      )}

      {/* Toggles */}
      {(showRegistration || showFood) && (
        <div className="space-y-4 p-4 bg-muted/30 border-[2px] border-foreground/20">
          {showRegistration && (
            <div className="flex items-center gap-3">
              <Checkbox
                checked={form.isRegistrationRequired}
                onCheckedChange={(v: boolean) => setForm(p => ({ ...p, isRegistrationRequired: v }))}
                className="border-[2px] border-foreground"
              />
              <Label className="text-xs font-bold uppercase tracking-wider cursor-pointer">Registration Required</Label>
            </div>
          )}
          {showFood && (
            <div className="flex items-center gap-3">
              <Checkbox
                checked={form.isFreeFood}
                onCheckedChange={(v: boolean) => setForm(p => ({ ...p, isFreeFood: v }))}
                className="border-[2px] border-foreground"
              />
              <Label className="text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2">
                <Utensils className="h-3.5 w-3.5" /> Free Food
              </Label>
            </div>
          )}
        </div>
      )}

      {/* Priority for announcements */}
      {form.type === 'announcement' && (
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Priority</Label>
          <div className="flex gap-4">
            {['low', 'medium', 'high'].map(p => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={form.priority === p}
                  onChange={e => setForm(prev => ({ ...prev, priority: e.target.value as 'low'|'medium'|'high' }))}
                  className="accent-foreground"
                />
                <span className="text-sm font-bold capitalize">{p}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Eligibility for recruitment */}
      {form.type === 'recruitment' && (
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Eligibility</Label>
          <Input
            placeholder="e.g. Current sophomores and juniors"
            className="rounded-none border-[2.5px] border-foreground/50 h-10"
            value={form.eligibility}
            onChange={e => setForm(p => ({ ...p, eligibility: e.target.value }))}
          />
        </div>
      )}

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {form.type === 'recruitment' ? (
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Link className="h-3.5 w-3.5" /> Application URL *
            </Label>
            <Input
              placeholder="https://..."
              className="rounded-none border-[2.5px] border-foreground/50 h-10"
              value={form.applicationUrl}
              onChange={e => setForm(p => ({ ...p, applicationUrl: e.target.value }))}
            />
          </div>
        ) : form.type === 'job' ? (
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Link className="h-3.5 w-3.5" /> Application Link *
            </Label>
            <Input
              placeholder="https://..."
              className="rounded-none border-[2.5px] border-foreground/50 h-10"
              value={form.applicationLink}
              onChange={e => setForm(p => ({ ...p, applicationLink: e.target.value }))}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Link className="h-3.5 w-3.5" /> External Link
            </Label>
            <Input
              placeholder="https://..."
              className="rounded-none border-[2.5px] border-foreground/50 h-10"
              value={form.externalLink}
              onChange={e => setForm(p => ({ ...p, externalLink: e.target.value }))}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" /> Contact Email
          </Label>
          <Input
            type="email"
            placeholder="organizer@campus.edu"
            className="rounded-none border-[2.5px] border-foreground/50 h-10"
            value={form.contactEmail}
            onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
          />
        </div>
      </div>

      {/* Preview summary */}
      <div className="p-4 bg-primary/5 border-[2.5px] border-primary/30 space-y-2">
        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Post Summary</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <span className="text-muted-foreground font-mono">Title</span>
          <span className="font-bold truncate">{form.title || '—'}</span>
          <span className="text-muted-foreground font-mono">Type</span>
          <span className="font-bold capitalize">{form.type}</span>
          
          {form.date && (
            <>
              <span className="text-muted-foreground font-mono">Date</span>
              <span className="font-bold">{new Date(form.date).toLocaleDateString()}</span>
            </>
          )}

          {form.location && form.type !== 'webinar' && form.type !== 'recruitment' && (
            <>
              <span className="text-muted-foreground font-mono">Location</span>
              <span className="font-bold truncate">{form.location}</span>
            </>
          )}

          {showCapacity && (
            <>
              <span className="text-muted-foreground font-mono">Capacity</span>
              <span className="font-bold">{form.capacity}</span>
            </>
          )}

          {showTicketing && (
            <>
              <span className="text-muted-foreground font-mono">Price</span>
              <span className="font-bold">{form.ticketPrice === 0 ? 'Free' : `₹${form.ticketPrice}`}</span>
            </>
          )}

          {form.category.length > 0 && (
            <>
              <span className="text-muted-foreground font-mono">Categories</span>
              <span className="font-bold truncate">{form.category.join(', ')}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
