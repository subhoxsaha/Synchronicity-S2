import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, PlusCircle, ScanLine, BarChart3, Sparkles,
  ShieldCheck, ArrowRight, Plus, Globe, Hammer
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAppContext } from '../contexts/AppContext';
import { CampusEvent } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Modular sub-views
import { DashboardView, EventsManagement, AnalyticsView, ScannerView } from './organizer';
import EventBuilder from './EventBuilder';

export default function OrganizerPortal() {
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const { events, currentUser, registrations, addEvent, updateEvent, checkInUser, logout, deleteEvent, myOrganizations } = useAppContext();
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  // Auto-select first org
  React.useEffect(() => {
    if (!selectedOrgId && myOrganizations.length > 0) {
      setSelectedOrgId(myOrganizations[0].id);
    }
  }, [myOrganizations, selectedOrgId]);

  const selectedOrg = myOrganizations.find(o => o.id === selectedOrgId);

  // No approved orgs — show pending/empty state
  if (myOrganizations.length === 0) {
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
            <h1 className="text-3xl font-black tracking-tight uppercase mb-3">No Active Organizations</h1>
            <p className="text-muted-foreground leading-relaxed font-medium text-sm">
              Your organizations may be pending admin approval, or you haven't created one yet.
            </p>
            <div className="bg-muted border-[2px] border-foreground/20 p-4 mt-6">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tip</p>
              <p className="text-sm font-bold">Pending orgs are reviewed within 24-48 hours.</p>
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

  // Filter events by selected org or fallback to organizer email
  const myEvents = selectedOrgId
    ? events.filter(e => e.organizationId === selectedOrgId || (e.organizerEmail === currentUser?.email && !e.organizationId))
    : events.filter(e => e.organizerEmail === currentUser?.email);

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
    { id: 'create', label: 'Builder', icon: <Hammer size={18} /> },
    { id: 'scanner', label: 'Scanner', icon: <ScanLine size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pb-24">
      {/* Horizontal Sub-Navigation — Brutalist */}
      <div className="sticky top-[72px] z-40 bg-foreground px-4 py-0 border-b-[3px] border-foreground overflow-x-auto no-scrollbar">
        <div className="flex items-center max-w-5xl mx-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'create') {
                  setEditingEvent(null); // Reset editing state when clicking Builder
                }
                setActiveSubTab(item.id);
              }}
              className={`flex items-center gap-2 px-5 py-3 text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap border-r-[2px] border-foreground/20 last:border-r-0 ${
                activeSubTab === item.id
                  ? 'bg-primary text-white'
                  : 'bg-foreground text-background/60 hover:text-background hover:bg-foreground/80'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}

          {/* Org selector in nav */}
          {myOrganizations.length > 1 && (
            <div className="ml-auto pl-4">
              <select
                value={selectedOrgId}
                onChange={e => setSelectedOrgId(e.target.value)}
                className="h-8 px-3 text-[9px] font-black uppercase tracking-[0.1em] bg-foreground/80 text-background border-[1.5px] border-foreground/40 outline-none cursor-pointer"
              >
                {myOrganizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}
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
            {activeSubTab === 'dashboard' && (
              <DashboardView
                events={myEvents}
                registrations={registrations}
                onEdit={startEditing}
                onCreate={startCreating}
                onDelete={deleteEvent}
              />
            )}
            {activeSubTab === 'events' && (
              <EventsManagement
                events={myEvents}
                registrations={registrations}
                onEdit={startEditing}
                onCreate={startCreating}
                onDelete={deleteEvent}
              />
            )}
            {activeSubTab === 'create' && (
              <EventBuilder
                initialEvent={editingEvent}
                onAdd={(data: any) => {
                  if (editingEvent) {
                    const updatedEvent = { ...editingEvent, ...data, id: editingEvent.id };
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
            {activeSubTab === 'scanner' && (
              <ScannerView
                events={myEvents}
                onCheckIn={checkInUser}
                registrations={registrations}
              />
            )}
            {activeSubTab === 'analytics' && (
              <AnalyticsView events={myEvents} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// === Organization Onboarding (kept as separate export) ===

export function OrganizationOnboarding() {
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
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight uppercase">Basic Identity</h3>
                    <p className="text-muted-foreground text-sm font-medium italic">How should students recognize you?</p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Organization Official Name</Label>
                      <Input value={formData.orgName} onChange={e => setFormData(p => ({ ...p, orgName: e.target.value }))} placeholder="e.g., Computer Science Society" className="h-14 rounded-2xl text-lg font-bold border-2 focus-visible:ring-primary/20" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category Type</Label>
                      <Select onValueChange={v => setFormData(p => ({ ...p, orgType: v }))} defaultValue={formData.orgType}>
                        <SelectTrigger className="h-14 rounded-2xl text-lg font-bold border-2"><SelectValue placeholder="Select type" /></SelectTrigger>
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
                    <Button disabled={!isStep1Valid} onClick={() => setStep(2)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20">
                      Next Step <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight uppercase">Presence & Vision</h3>
                    <p className="text-muted-foreground text-sm font-medium italic">Describe what your organization brings to the campus.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mission Statement / Description</Label>
                      <Textarea value={formData.orgDescription} onChange={e => setFormData(p => ({ ...p, orgDescription: e.target.value }))} placeholder="What is your organization's purpose?" className="min-h-[160px] rounded-2xl text-lg font-medium border-2 focus-visible:ring-primary/20 p-6 leading-relaxed" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Website or Portfolio (Optional)</Label>
                      <Input value={formData.orgWebsite} onChange={e => setFormData(p => ({ ...p, orgWebsite: e.target.value }))} placeholder="https://yourgroup.com" className="h-14 rounded-2xl text-lg font-bold border-2 focus-visible:ring-primary/20" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button variant="ghost" onClick={() => setStep(1)} className="h-14 rounded-2xl font-black uppercase tracking-widest flex-1">Back</Button>
                    <Button disabled={!isStep2Valid} onClick={() => setStep(3)} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20 flex-[2]">
                      Final Review <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight uppercase">Confirm Application</h3>
                    <p className="text-muted-foreground text-sm font-medium italic">Check your details before submitting for official verification.</p>
                  </div>
                  <div className="p-8 bg-accent/20 rounded-[2rem] border border-border/40 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-2xl text-primary">{formData.orgName[0]}</div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity Name</p>
                        <p className="text-xl font-black">{formData.orgName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</p><p className="font-bold">{formData.orgType}</p></div>
                      <div><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Official Email</p><p className="font-bold truncate text-xs">{auth.currentUser?.email}</p></div>
                    </div>
                    <div className="border-t border-border/40 pt-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</p>
                      <p className="text-sm font-medium line-clamp-3 text-muted-foreground italic">{formData.orgDescription}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Button variant="ghost" onClick={() => setStep(2)} className="h-14 rounded-2xl font-black uppercase tracking-widest flex-1">Edit</Button>
                      <Button onClick={handleSubmit} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20 flex-[2] bg-primary text-primary-foreground">
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
