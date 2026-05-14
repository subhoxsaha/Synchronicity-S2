import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Tag, 
  Calendar, 
  Sparkles,
  Loader2,
  SendHorizontal,
  Upload
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '../contexts/AppContext';
import { EventCategory, PostType } from '../types';
import { toast } from 'sonner';
import { uploadPostImage, validateImageFile } from '../services/cloudinaryService';
import { PollFields, ResourceFields, LostFoundFields, BuySellFields, JobFields, ChallengeFields, ProjectFields, GalleryFields } from './post-inputs';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const { createPost, currentUser, myOrganizations } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(myOrganizations[0]?.id || '');
  const selectedOrg = myOrganizations.find(o => o.id === selectedOrgId);
  const [formData, setFormData] = useState({
    type: PostType.EVENT as PostType,
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    category: [EventCategory.SOCIAL],
    tags: [] as string[],
    link: '',
    platform: 'Zoom',
    priority: 'medium' as 'low'|'medium'|'high',
    roles: '',
    deadline: new Date().toISOString().split('T')[0],
    eligibility: '',
    applicationUrl: '',
  });
  // Extended state for additional post types
  const [pollData, setPollData] = useState({ questions: [{ question: '', options: ['', ''] }], deadline: '', isAnonymous: false });
  const [resourceData, setResourceData] = useState({ resourceType: 'study_material', url: '' });
  const [lostFoundData, setLostFoundData] = useState({ itemType: 'lost' as 'lost'|'found', itemDescription: '', lastSeenLocation: '', contactMethod: 'in_app', contactInfo: '' });
  const [buySellData, setBuySellData] = useState({ listingType: 'sell' as 'sell'|'buy'|'exchange', price: '', isFree: false, condition: 'good', contactMethod: 'in_app', contactInfo: '' });
  const [jobData, setJobData] = useState({ jobType: 'internship', companyOrOrg: '', roleTitle: '', compensation: '', applicationLink: '', applicationDeadline: '', eligibility: '' });
  const [challengeData, setChallengeData] = useState({ startDate: '', endDate: '', instructions: '', prize: '', submissionMethod: 'in_app', submissionUrl: '' });
  const [projectData, setProjectData] = useState({ projectType: 'open_source', currentStatus: 'idea', rolesNeeded: '', commitment: '', howToJoin: '' });
  const [galleryData, setGalleryData] = useState({ images: [{ url: '', caption: '' }], linkedEventId: '' });
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, 5);
    if (!validation.valid) { toast.error(validation.error); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, imageUrl: 'pending-upload' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !formData.imageUrl) {
      toast.error("Please upload an image for your post");
      return;
    }
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (formData.type === PostType.EVENT && !formData.location.trim()) {
      toast.error("Location is required for events");
      return;
    }

    if (formData.type === PostType.WEBINAR && (!formData.link.trim() || !formData.link.startsWith('http'))) {
      toast.error("A valid URL link is required for webinars");
      return;
    }

    if (formData.type === PostType.RECRUITMENT) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.deadline < today) {
        toast.error("Deadline cannot be in the past");
        return;
      }
      if (!formData.roles.trim()) {
        toast.error("Please specify at least one role");
        return;
      }
      if (!formData.applicationUrl.trim() || !formData.applicationUrl.startsWith('http')) {
        toast.error("A valid application URL is required for recruitment");
        return;
      }
    }

    setLoading(true);
    try {
      let finalImageUrl = formData.imageUrl;
      // Upload image file if selected
      if (imageFile) {
        setImageUploading(true);
        try {
          finalImageUrl = await uploadPostImage(imageFile, formData.type, (p) => setImageProgress(p));
        } catch (err: any) {
          toast.error(`Image upload failed: ${err.message}`);
          setImageUploading(false);
          setLoading(false);
          return;
        }
        setImageUploading(false);
      }
      const submitData: any = {
        ...formData,
        imageUrl: finalImageUrl,
        organizerEmail: currentUser?.email || '',
        organizerName: currentUser?.name || 'Anonymous',
        organizerId: currentUser?.id,
        organizationId: selectedOrg?.id || '',
        organizationName: selectedOrg?.name || currentUser?.name || '',
        organizationLogo: selectedOrg?.logo || '',
        instituteId: selectedOrg?.instituteId || currentUser?.instituteId || '',
        status: 'pending',
        category: formData.category,
        capacity: 1000, 
        date: new Date(`${formData.date}T12:00:00`).toISOString(),
        coordinates: { lat: 37.7749, lng: -122.4194 }
      };
      
      if (formData.type === PostType.WEBINAR) {
          submitData.format = 'virtual';
          submitData.link = formData.link;
          submitData.platform = formData.platform;
      } else if (formData.type === PostType.RECRUITMENT) {
          submitData.roles = formData.roles.split(',').map(r => r.trim());
          submitData.deadline = new Date(`${formData.deadline}T23:59:59`).toISOString();
          submitData.applicationUrl = formData.applicationUrl;
          submitData.eligibility = formData.eligibility;
      } else if (formData.type === PostType.ANNOUNCEMENT) {
          submitData.priority = formData.priority;
      } else if (formData.type === PostType.POLL) {
          submitData.pollQuestions = pollData.questions;
          submitData.pollDeadline = pollData.deadline;
          submitData.isAnonymous = pollData.isAnonymous;
      } else if (formData.type === PostType.RESOURCE) {
          submitData.resourceType = resourceData.resourceType;
          submitData.resourceUrl = resourceData.url;
      } else if (formData.type === PostType.LOST_FOUND) {
          submitData.itemType = lostFoundData.itemType;
          submitData.itemDescription = lostFoundData.itemDescription;
          submitData.lastSeenLocation = lostFoundData.lastSeenLocation;
          submitData.contactMethod = lostFoundData.contactMethod;
          submitData.contactInfo = lostFoundData.contactInfo;
      } else if (formData.type === PostType.BUY_SELL) {
          submitData.listingType = buySellData.listingType;
          submitData.price = buySellData.isFree ? '0' : buySellData.price;
          submitData.isFree = buySellData.isFree;
          submitData.condition = buySellData.condition;
          submitData.contactMethod = buySellData.contactMethod;
          submitData.contactInfo = buySellData.contactInfo;
      } else if (formData.type === PostType.JOB) {
          submitData.jobType = jobData.jobType;
          submitData.company = jobData.companyOrOrg;
          submitData.roleTitle = jobData.roleTitle;
          submitData.compensation = jobData.compensation;
          submitData.applicationLink = jobData.applicationLink;
          submitData.applicationDeadline = jobData.applicationDeadline;
          submitData.eligibility = jobData.eligibility;
      } else if (formData.type === PostType.CHALLENGE) {
          submitData.challengeStartDate = challengeData.startDate;
          submitData.challengeEndDate = challengeData.endDate;
          submitData.instructions = challengeData.instructions;
          submitData.prize = challengeData.prize;
          submitData.submissionMethod = challengeData.submissionMethod;
          submitData.submissionUrl = challengeData.submissionUrl;
      } else if (formData.type === PostType.PROJECT) {
          submitData.projectType = projectData.projectType;
          submitData.projectStatus = projectData.currentStatus;
          submitData.rolesNeeded = projectData.rolesNeeded.split(',').map(r => r.trim());
          submitData.commitment = projectData.commitment;
          submitData.howToJoin = projectData.howToJoin;
      } else if (formData.type === PostType.GALLERY) {
          submitData.galleryImages = galleryData.images;
          submitData.linkedEventId = galleryData.linkedEventId;
      }

      await createPost(submitData);
      onOpenChange(false);
      setFormData({
        type: PostType.EVENT,
        title: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        imageUrl: '',
        category: [EventCategory.SOCIAL],
        tags: [],
        link: '',
        platform: 'Zoom',
        priority: 'medium',
        roles: '',
        deadline: new Date().toISOString().split('T')[0],
        eligibility: '',
        applicationUrl: '',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-background">
        <div className="flex flex-col h-[85vh] sm:h-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-accent/5">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <DialogTitle className="text-sm font-black uppercase tracking-widest text-foreground">New Post</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Org Selector */}
          {myOrganizations.length > 0 && (
            <div className="px-6 py-2 border-b border-border/20 bg-accent/5">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Posting as</label>
              <select
                value={selectedOrgId}
                onChange={e => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-bold bg-background border border-border/40 rounded-xl focus:outline-none"
              >
                {myOrganizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row h-full">
            {/* Image Preview Area */}
            <div className="w-full sm:w-1/2 aspect-square sm:aspect-auto bg-accent/10 relative flex items-center justify-center overflow-hidden group">
              {(imagePreview || formData.imageUrl) ? (
                <>
                  <img src={imagePreview || formData.imageUrl} className="h-full w-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                  {imageUploading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                      <div className="w-32 h-1.5 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all" style={{ width: `${imageProgress}%` }} />
                      </div>
                      <span className="text-white text-xs font-bold">{imageProgress}%</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-end">
                    <Button variant="secondary" size="sm" onClick={() => { setFormData({ ...formData, imageUrl: '' }); setImageFile(null); setImagePreview(''); }} className="rounded-full h-8 px-4 text-[10px] font-black uppercase">
                        Change Media
                    </Button>
                  </div>
                </>
              ) : (
                <div 
                  className="flex flex-col items-center gap-4 text-center px-8 cursor-pointer w-full h-full justify-center"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <div className="h-20 w-20 rounded-[2rem] bg-background shadow-xl flex items-center justify-center text-primary">
                    <Upload className="h-10 w-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black">Upload Image</h4>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Click to browse • Max 5MB</p>
                  </div>
                  <p className="text-[9px] text-muted-foreground italic max-w-[200px]">JPG, PNG, WebP, or GIF. Your image will be uploaded to Cloudinary CDN.</p>
                </div>
              )}
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </div>

            {/* Inputs Area */}
            <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[60vh] sm:max-h-none no-scrollbar">
              <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                 {Object.values(PostType).filter(t => t !== PostType.SYSTEM_NOTICE && t !== PostType.BROADCAST).map(t => (
                    <button
                        type="button"
                        key={t}
                        onClick={() => setFormData(prev => ({ ...prev, type: t as PostType }))}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${formData.type === t ? 'bg-primary text-primary-foreground shadow-md' : 'bg-accent/10 text-muted-foreground hover:bg-accent/20'}`}
                    >
                        {t}
                    </button>
                 ))}
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="The Title of your Post" 
                  className="w-full text-2xl font-black bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/30 px-0"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                
                <textarea 
                  placeholder="Capture the vibe... (caption)" 
                  className="w-full min-h-[120px] bg-accent/5 rounded-2xl p-4 text-sm font-medium outline-none border border-transparent focus:border-primary/20 transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-4">
                {(formData.type === PostType.EVENT || formData.type === PostType.WEBINAR) && (
                    <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
                        <Calendar className="h-5 w-5 text-primary shrink-0" />
                        <input 
                            type="date" 
                            className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                )}

                {formData.type === PostType.EVENT && (
                    <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Add location" 
                            className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>
                )}

                {formData.type === PostType.WEBINAR && (
                    <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                        <input 
                            type="url" 
                            placeholder="Webinar Link (Zoom, Meet)" 
                            className="bg-transparent border-none outline-none text-xs font-bold w-full"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        />
                    </div>
                )}

                {formData.type === PostType.ANNOUNCEMENT && (
                    <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
                        <select 
                            className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                )}

                {formData.type === PostType.RECRUITMENT && (
                    <>
                        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
                            <input type="text" placeholder="Roles (comma separated)" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={formData.roles} onChange={(e) => setFormData({ ...formData, roles: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
                            <input type="url" placeholder="Application URL (https://...)" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={formData.applicationUrl} onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
                            <Calendar className="h-5 w-5 text-primary shrink-0" />
                            <input type="date" title="Deadline" className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
                            <input type="text" placeholder="Eligibility" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={formData.eligibility} onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })} />
                        </div>
                    </>
                )}

                {formData.type === PostType.POLL && (
                  <PollFields questions={pollData.questions} onChange={q => setPollData(p => ({ ...p, questions: q }))} deadline={pollData.deadline} onDeadlineChange={d => setPollData(p => ({ ...p, deadline: d }))} isAnonymous={pollData.isAnonymous} onAnonChange={a => setPollData(p => ({ ...p, isAnonymous: a }))} />
                )}
                {formData.type === PostType.RESOURCE && (
                  <ResourceFields resourceType={resourceData.resourceType} onTypeChange={t => setResourceData(p => ({ ...p, resourceType: t }))} url={resourceData.url} onUrlChange={u => setResourceData(p => ({ ...p, url: u }))} />
                )}
                {formData.type === PostType.LOST_FOUND && (
                  <LostFoundFields itemType={lostFoundData.itemType} onItemTypeChange={t => setLostFoundData(p => ({ ...p, itemType: t }))} itemDescription={lostFoundData.itemDescription} onDescChange={d => setLostFoundData(p => ({ ...p, itemDescription: d }))} lastSeenLocation={lostFoundData.lastSeenLocation} onLocationChange={l => setLostFoundData(p => ({ ...p, lastSeenLocation: l }))} contactMethod={lostFoundData.contactMethod} onContactChange={c => setLostFoundData(p => ({ ...p, contactMethod: c }))} contactInfo={lostFoundData.contactInfo} onContactInfoChange={ci => setLostFoundData(p => ({ ...p, contactInfo: ci }))} />
                )}
                {formData.type === PostType.BUY_SELL && (
                  <BuySellFields listingType={buySellData.listingType} onListingTypeChange={t => setBuySellData(p => ({ ...p, listingType: t }))} price={buySellData.price} onPriceChange={pr => setBuySellData(p => ({ ...p, price: pr }))} isFree={buySellData.isFree} onFreeChange={f => setBuySellData(p => ({ ...p, isFree: f }))} condition={buySellData.condition} onConditionChange={c => setBuySellData(p => ({ ...p, condition: c }))} contactMethod={buySellData.contactMethod} onContactChange={cm => setBuySellData(p => ({ ...p, contactMethod: cm }))} contactInfo={buySellData.contactInfo} onContactInfoChange={ci => setBuySellData(p => ({ ...p, contactInfo: ci }))} />
                )}
                {formData.type === PostType.JOB && (
                  <JobFields jobType={jobData.jobType} onJobTypeChange={t => setJobData(p => ({ ...p, jobType: t }))} companyOrOrg={jobData.companyOrOrg} onCompanyChange={c => setJobData(p => ({ ...p, companyOrOrg: c }))} roleTitle={jobData.roleTitle} onRoleTitleChange={r => setJobData(p => ({ ...p, roleTitle: r }))} compensation={jobData.compensation} onCompensationChange={c => setJobData(p => ({ ...p, compensation: c }))} applicationLink={jobData.applicationLink} onAppLinkChange={l => setJobData(p => ({ ...p, applicationLink: l }))} applicationDeadline={jobData.applicationDeadline} onDeadlineChange={d => setJobData(p => ({ ...p, applicationDeadline: d }))} eligibility={jobData.eligibility} onEligibilityChange={e => setJobData(p => ({ ...p, eligibility: e }))} />
                )}
                {formData.type === PostType.CHALLENGE && (
                  <ChallengeFields startDate={challengeData.startDate} onStartChange={s => setChallengeData(p => ({ ...p, startDate: s }))} endDate={challengeData.endDate} onEndChange={e => setChallengeData(p => ({ ...p, endDate: e }))} instructions={challengeData.instructions} onInstructionsChange={i => setChallengeData(p => ({ ...p, instructions: i }))} prize={challengeData.prize} onPrizeChange={pr => setChallengeData(p => ({ ...p, prize: pr }))} submissionMethod={challengeData.submissionMethod} onMethodChange={m => setChallengeData(p => ({ ...p, submissionMethod: m }))} submissionUrl={challengeData.submissionUrl} onUrlChange={u => setChallengeData(p => ({ ...p, submissionUrl: u }))} />
                )}
                {formData.type === PostType.PROJECT && (
                  <ProjectFields projectType={projectData.projectType} onTypeChange={t => setProjectData(p => ({ ...p, projectType: t }))} currentStatus={projectData.currentStatus} onStatusChange={s => setProjectData(p => ({ ...p, currentStatus: s }))} rolesNeeded={projectData.rolesNeeded} onRolesChange={r => setProjectData(p => ({ ...p, rolesNeeded: r }))} commitment={projectData.commitment} onCommitmentChange={c => setProjectData(p => ({ ...p, commitment: c }))} howToJoin={projectData.howToJoin} onHowToJoinChange={h => setProjectData(p => ({ ...p, howToJoin: h }))} />
                )}
                {formData.type === PostType.GALLERY && (
                  <GalleryFields images={galleryData.images} onChange={imgs => setGalleryData(p => ({ ...p, images: imgs }))} linkedEventId={galleryData.linkedEventId} onLinkedEventChange={id => setGalleryData(p => ({ ...p, linkedEventId: id }))} />
                )}
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tags</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {formData.tags.map(t => (
                      <Badge key={t} variant="secondary" className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        #{t} 
                        <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== t) }))} />
                      </Badge>
                    ))}
                    <div className="relative group">
                        <input 
                            type="text"
                            placeholder="press enter to add tag"
                            className="bg-transparent border-b border-muted-foreground/20 outline-none text-xs font-bold placeholder:text-[10px]"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                    </div>
                 </div>
              </div>

              <div className="pt-4 sticky bottom-0 bg-background">
                <Button 
                    type="submit" 
                    disabled={loading || !formData.imageUrl || !formData.title} 
                    className="w-full h-14 rounded-2xl text-base font-black shadow-primary/20 shadow-xl"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <div className="flex items-center gap-2">
                            Share Post
                            <SendHorizontal className="h-4 w-4" />
                        </div>
                    )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
