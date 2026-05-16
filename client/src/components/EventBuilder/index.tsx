import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '../../contexts/AppContext';
import { CampusEvent, AnyPost } from '../../types';
import { toast } from 'sonner';
import { StepProps, EventFormData, DEFAULT_FORM, STEPS_FOR_TYPE } from './types';
import { StepBasics } from './StepBasics';
import { StepDetails } from './StepDetails';
import { StepMedia } from './StepMedia';
import { StepSettings } from './StepSettings';

interface Props {
  onAdd: (data: any) => void;
  initialEvent?: AnyPost | CampusEvent | null;
}

export default function EventBuilder({ onAdd, initialEvent }: Props) {
  const { currentUser, myOrganizations } = useAppContext();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(myOrganizations[0]?.id || '');
  const selectedOrg = myOrganizations.find(o => o.id === selectedOrgId);

  const [form, setForm] = useState<EventFormData>(() => {
    if (initialEvent) {
      const eventData = initialEvent as any;
      return {
        ...DEFAULT_FORM,
        type: eventData.type || 'event',
        title: eventData.title || '',
        description: eventData.description || '',
        category: Array.isArray(eventData.category) ? eventData.category : [],
        format: eventData.format || 'in-person',
        difficulty: eventData.difficulty || '',
        date: eventData.date || '',
        endDate: eventData.endDate || '',
        location: eventData.location || '',
        coordinates: eventData.coordinates || DEFAULT_FORM.coordinates,
        imageUrl: eventData.imageUrl || '',
        assets: eventData.assets || DEFAULT_FORM.assets,
        gallery: eventData.gallery || [],
        tags: eventData.tags || [],
        highlights: eventData.highlights || [],
        capacity: eventData.capacity || 100,
        ticketPrice: eventData.ticketPrice || 0,
        isFreeFood: eventData.isFreeFood || false,
        isRegistrationRequired: eventData.isRegistrationRequired ?? true,
        maxTeamSize: eventData.maxTeamSize || 1,
        externalLink: eventData.externalLink || '',
        contactEmail: eventData.contactEmail || currentUser?.email || '',
        sponsors: eventData.sponsors || [],
        // New post fields
        roles: Array.isArray(eventData.roles) ? eventData.roles.join(', ') : (eventData.roles || ''),
        deadline: eventData.deadline || '',
        applicationUrl: eventData.applicationUrl || '',
        eligibility: eventData.eligibility || '',
        priority: eventData.priority || 'medium',
        platform: eventData.platform || 'Zoom',
        link: eventData.link || '',
      };
    }
    return { ...DEFAULT_FORM, contactEmail: currentUser?.email || '' };
  });

  const validateStep = (s: number): string | null => {
    const config = STEPS_FOR_TYPE[form.type] || STEPS_FOR_TYPE['event'];
    const currentStepKey = config[s]?.key;

    if (currentStepKey === 'basics') {
      if (form.title.trim().length < 3) return 'Title must be 3+ characters';
      if (form.description.trim().length < 10) return 'Description must be 10+ characters';
      if (form.category.length === 0) return 'Select at least 1 category';
    }
    
    if (currentStepKey === 'details' || currentStepKey === 'venue') {
      const today = new Date().toISOString().split('T')[0];
      
      if (form.type === 'event' || form.type === 'webinar') {
        if (!form.date) return 'Start date is required';
        if (new Date(form.date) <= new Date()) return 'Start date must be in the future';
      }
      
      if (form.type === 'event' && form.format !== 'virtual' && !form.location.trim()) {
        return 'Location is required for in-person events';
      }
      
      if (form.type === 'webinar' && (!form.link.trim() || !form.link.startsWith('http'))) {
        return 'A valid URL link is required for webinars';
      }

      if (form.type === 'recruitment') {
        if (!form.deadline) return 'Deadline is required';
        if (form.deadline < today) return 'Deadline cannot be in the past';
        if (!form.roles.trim()) return 'Please specify at least one role';
      }
      
      if (form.type === 'poll' && !form.questions?.[0]?.question?.trim()) {
        return 'At least one poll question is required';
      }
    }

    if (currentStepKey === 'media') {
      if (form.type !== 'gallery' && !form.imageUrl && !form.assets.bannerUrl) {
        return 'Please provide a banner image for your post';
      }
      if (form.type === 'gallery' && (!form.images || form.images.length === 0)) {
        return 'Please upload at least one image to the gallery';
      }
    }

    if (currentStepKey === 'settings') {
      if (form.type === 'recruitment' && (!form.applicationUrl.trim() || !form.applicationUrl.startsWith('http'))) {
        return 'A valid application URL is required';
      }
      if (form.type === 'job' && (!form.applicationLink?.trim() || !form.applicationLink?.startsWith('http'))) {
        return 'A valid application link is required';
      }
      if (form.type === 'challenge' && (!form.instructions?.trim())) {
         return 'Instructions are required for challenges';
      }
      if (form.type === 'project' && (!form.howToJoin?.trim())) {
         return 'Instructions on how to join are required';
      }
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) { toast.error(err); return; }
    setStep(s => Math.min(s + 1, STEPS_FOR_TYPE[form.type]?.length - 1 || 3));
  };

  const back = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    const config = STEPS_FOR_TYPE[form.type] || STEPS_FOR_TYPE['event'];
    for (let i = 0; i < config.length; i++) {
       const err = validateStep(i);
       if (err) {
         setStep(i);
         toast.error(err);
         return;
       }
    }
    
    setSubmitting(true);
    try {
      if (!selectedOrgId || !selectedOrg) {
        toast.error('You must select an organization to publish under.');
        setSubmitting(false);
        return;
      }
      
      // Build base data structure common to ALL posts
      const submitData: any = {
        ...form,
        imageUrl: form.assets.bannerUrl || form.imageUrl,
        id: initialEvent?.id,
        organizerEmail: initialEvent?.organizerEmail || currentUser?.email || '',
        organizerId: initialEvent?.organizerId || currentUser?.id || '',
        organizerName: initialEvent?.organizerName || currentUser?.name || '',
        organizationId: selectedOrg?.id || '',
        organizationName: selectedOrg?.name || '',
        organizationLogo: selectedOrg?.logo || '',
        updatedAt: new Date().toISOString(),
      };
      
      // Type-specific data mutations before sending to db
      switch (form.type) {
        case 'webinar':
          submitData.format = 'virtual';
          submitData.link = form.link;
          submitData.platform = form.platform;
          break;
        case 'recruitment':
          submitData.roles = form.roles.split(',').map(r => r.trim()).filter(Boolean);
          if (form.deadline) submitData.deadline = new Date(`${form.deadline}T23:59:59`).toISOString();
          break;
        case 'poll':
          submitData.pollQuestions = form.questions;
          submitData.pollDeadline = form.responseDeadline;
          submitData.isAnonymous = form.isAnonymous;
          break;
        case 'gallery':
          submitData.galleryImages = form.images;
          submitData.galleryType = form.galleryType;
          break;
        // The other types simply pass their form fields directly into submitData,
        // which matches the AnyPost properties exactly thanks to EventFormData structure.
      }

      if (form.date) {
          submitData.date = form.date.includes('T') ? form.date : new Date(`${form.date}T12:00:00`).toISOString();
      }

      onAdd(submitData);
    } finally {
      setSubmitting(false);
    }
  };

  const stepsConfig = STEPS_FOR_TYPE[form.type] || STEPS_FOR_TYPE['event'];
  const pct = ((step + 1) / stepsConfig.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">
          {initialEvent ? 'Edit Event' : 'Event Builder'}
        </h2>
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
          Step {step + 1} of {stepsConfig.length} — {stepsConfig[step]?.label || 'Loading'}
        </p>
      </div>

      {/* Org Selector */}
      {myOrganizations.length === 0 ? (
        <div className="p-4 bg-amber-50 border-[2.5px] border-amber-400 text-amber-800">
          <p className="font-black text-xs uppercase tracking-wider">⚠ No organizations</p>
          <p className="text-[10px] font-medium mt-1">You need to be a member of an approved organization to publish events. Create or join one first.</p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Organization:</label>
          <select
            value={selectedOrgId}
            onChange={e => setSelectedOrgId(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs font-bold bg-card border-[2px] border-foreground/20 focus:outline-none"
          >
            {myOrganizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
        {stepsConfig.map((config, i) => (
          <button
            key={config.key}
            onClick={() => { if (i < step) setStep(i); }}
            className={`flex items-center gap-2 px-3 py-1.5 border-[2px] text-[9px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
              i === step
                ? 'bg-primary text-primary-foreground border-foreground shadow-[3px_3px_0_0_var(--foreground)]'
                : i < step
                ? 'bg-secondary/20 text-secondary border-secondary cursor-pointer'
                : 'bg-muted text-muted-foreground border-foreground/20'
            }`}
          >
            {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
            <span>{config.label}</span>
          </button>
        ))}
      </div>
      <Progress value={pct} />

      {/* Step Content */}
      <motion.div
        key={`${form.type}-${step}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {step === 0 && <StepBasics form={form} setForm={setForm} />}
        {step === 1 && <StepDetails form={form} setForm={setForm} />}
        {step === 2 && <StepMedia form={form} setForm={setForm} />}
        {step === 3 && <StepSettings form={form} setForm={setForm} />}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t-[2.5px] border-foreground">
        <Button
          variant="outline"
          onClick={back}
          disabled={step === 0}
          className="h-12 px-6 font-black uppercase tracking-widest text-xs"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        {step < stepsConfig.length - 1 ? (
          <Button onClick={next} className="h-12 px-8 font-black uppercase tracking-widest text-xs">
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-12 px-10 text-sm font-black uppercase tracking-[0.2em] bg-primary text-white border-[2.5px] border-foreground shadow-[5px_5px_0_0_var(--foreground)] active:translate-y-[3px] active:shadow-none transition-all hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialEvent ? 'Update Event' : 'Publish Event'}
          </button>
        )}
      </div>
    </div>
  );
}
