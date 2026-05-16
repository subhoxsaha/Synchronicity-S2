import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, Mail, Calendar, ShieldCheck, LogOut, ChevronRight, ExternalLink,
  Award, Zap, LayoutDashboard, Shield, Briefcase, Users, Clock, Grid, Bookmark,
  Settings, Heart, MessageCircle, Sparkles, Moon, Sun, Building2, Globe, Link2, GraduationCap,
  Pencil, BookOpen, CheckCircle, Loader2, X, Camera, Upload, ImageIcon
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { User, UserRole, CampusEvent, Organization, OrgJoinPolicy } from '../types';
import { OrganizationManager } from './OrganizationManager';
import { toast } from 'sonner';
import { useAppContext } from '../contexts/AppContext';
import { InstituteOnboardingRequest } from './InstituteOnboardingRequest';
import { uploadProfilePicture, uploadOrgLogo, validateImageFile } from '../services/cloudinaryService';

interface AccountSectionProps {
  user: User | null;
  logout: () => void;
  stats?: { label: string; value: string | number; icon: React.ReactNode }[];
}

export function AccountSection({ user, logout, stats }: AccountSectionProps) {
  const navigate = useNavigate();
  const { activeRole, setActiveRole, setRole, events, toggleFollow, currentUser, submitOnboarding, createOrganization, organizations, myOrganizations } = useAppContext();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'settings'>('posts');
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isInstituteRequestOpen, setIsInstituteRequestOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', major: '', year: '' });
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [managerOrg, setManagerOrg] = useState<Organization | null>(null);

  const openEditProfile = () => {
    if (!user) return;
    setEditForm({ name: user.name || '', bio: user.bio || '', major: user.major || '', year: user.year || '' });
    setEditInterests(user.interests || []);
    setAvatarFile(null);
    setAvatarPreview('');
    setAvatarProgress(0);
    setIsEditProfileOpen(true);
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, 2);
    if (!validation.valid) { toast.error(validation.error); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) { toast.error('Name is required'); return; }
    setIsSavingProfile(true);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile && user) {
        setAvatarUploading(true);
        try {
          avatarUrl = await uploadProfilePicture(avatarFile, user.id, (p) => setAvatarProgress(p));
        } catch (err: any) {
          toast.error(`Avatar upload failed: ${err.message}`);
          setAvatarUploading(false);
          setIsSavingProfile(false);
          return;
        }
        setAvatarUploading(false);
      }
      await submitOnboarding({
        name: editForm.name.trim(),
        bio: editForm.bio.trim(),
        major: editForm.major,
        year: editForm.year,
        interests: editInterests,
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      });
      toast.success('Profile updated!');
      setIsEditProfileOpen(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setIsSavingProfile(false); }
  };

  const INTEREST_OPTIONS = [
    { id: 'tech', label: 'Technology', emoji: '💻' }, { id: 'sports', label: 'Sports', emoji: '⚽' },
    { id: 'music', label: 'Music', emoji: '🎵' }, { id: 'art', label: 'Art & Design', emoji: '🎨' },
    { id: 'science', label: 'Science', emoji: '🔬' }, { id: 'literature', label: 'Literature', emoji: '📚' },
    { id: 'gaming', label: 'Gaming', emoji: '🎮' }, { id: 'photography', label: 'Photography', emoji: '📷' },
    { id: 'film', label: 'Film & Media', emoji: '🎬' }, { id: 'debate', label: 'Debate', emoji: '🗣️' },
    { id: 'entrepreneurship', label: 'Entrepreneurship', emoji: '🚀' }, { id: 'social', label: 'Social Impact', emoji: '🌍' },
    { id: 'fitness', label: 'Fitness', emoji: '💪' }, { id: 'cooking', label: 'Cooking', emoji: '🍳' },
    { id: 'travel', label: 'Travel', emoji: '✈️' }, { id: 'coding', label: 'Coding', emoji: '👨‍💻' },
    { id: 'robotics', label: 'Robotics', emoji: '🤖' }, { id: 'dance', label: 'Dance', emoji: '💃' },
    { id: 'theatre', label: 'Theatre', emoji: '🎭' }, { id: 'volunteering', label: 'Volunteering', emoji: '🤝' },
  ];
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    toast.success(`Theme switched to ${theme === 'light' ? 'dark' : 'light'} mode`);
  };
  
  if (!user) return null;

  const isOrganizerPending = user.role === UserRole.ORGANIZER && !user.isApproved;
  const isOrganizer = user.role === UserRole.ORGANIZER;
  const userPosts = events.filter(e => e.organizerEmail === user.email || e.organizerId === user.id);
  const bookmarkedPosts = events.filter(e => currentUser?.bookmarkedEvents?.includes(e.id));
  const isOwnProfile = currentUser?.id === user.id;
  const isFollowing = currentUser?.following?.includes(user.id);
  const userOrg = isOrganizer && isOwnProfile ? myOrganizations[0] : organizations.find(o => o.ownerId === user.id && o.status === 'approved');

  const roleConfigs = {
    [UserRole.STUDENT]: { label: 'Student', icon: <UserIcon className="h-3 w-3" />, bg: 'bg-primary text-white' },
    [UserRole.ORGANIZER]: { label: 'Organization', icon: <Building2 className="h-3 w-3" />, bg: 'bg-secondary text-white' },
    [UserRole.PLATFORM_ADMIN]: { label: 'Admin', icon: <Shield className="h-3 w-3" />, bg: 'bg-destructive text-white' },
  };
  const currentRoleConfig = roleConfigs[user.role];

  const handleLogout = () => {
    toast.loading("Ending session...", { duration: 1500 });
    setTimeout(logout, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-2">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-[2.5px] border-foreground bg-card p-6 md:p-8 shadow-[6px_6px_0_0_var(--foreground)]"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="shrink-0">
            <div className="h-28 w-28 md:h-36 md:w-36 border-[3px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] bg-muted overflow-hidden">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage src={user.avatar} className="rounded-none object-cover" />
                <AvatarFallback className="text-3xl font-black bg-primary/10 rounded-none">
                  {(user.name || '?')[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase">
                  {user.name}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] border-[2px] border-foreground ${currentRoleConfig.bg}`}>
                    {currentRoleConfig.icon}
                    {currentRoleConfig.label}
                  </span>
                  {user.isApproved && user.role !== UserRole.STUDENT && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white border-[2px] border-foreground">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  {isOrganizerPending && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-400 text-foreground border-[2px] border-foreground">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {isOrganizer && myOrganizations.length > 0 && (
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Manages {myOrganizations.length} Organization{myOrganizations.length !== 1 && 's'}
                </p>
              )}
            </div>

            <div className="flex justify-center md:justify-start gap-0 border-[2.5px] border-foreground w-fit mx-auto md:mx-0">
              <StatBlock label="Moments" value={userPosts.length} />
              <StatBlock label="Followers" value={user.followers?.length || 0} border />
              <StatBlock label="Following" value={user.following?.length || 0} border />
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2">
              {isOwnProfile ? (
                <>
                  <button onClick={openEditProfile} className="px-5 py-2 text-[9px] font-black uppercase tracking-[0.15em] border-[2.5px] border-foreground bg-card hover:bg-muted active:translate-y-[2px] active:shadow-none shadow-[3px_3px_0_0_var(--foreground)] transition-all flex items-center gap-1.5">
                    <Pencil className="h-3 w-3" /> Edit Profile
                  </button>
                  <button onClick={() => setActiveTab('settings')} className="p-2 border-[2.5px] border-foreground bg-card hover:bg-muted active:translate-y-[2px] active:shadow-none shadow-[3px_3px_0_0_var(--foreground)] transition-all">
                    <Settings className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`px-8 py-2 text-[9px] font-black uppercase tracking-[0.15em] border-[2.5px] border-foreground active:translate-y-[2px] active:shadow-none shadow-[3px_3px_0_0_var(--foreground)] transition-all ${
                    isFollowing ? 'bg-card hover:bg-muted text-foreground' : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {user.major && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-primary bg-primary/10 px-2 py-0.5 border border-primary/30">
                    <BookOpen className="h-3 w-3" /> {user.major}
                  </span>
                )}
                {user.year && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] text-foreground/70 bg-muted px-2 py-0.5 border border-foreground/10">
                    <GraduationCap className="h-3 w-3" /> {user.year}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground/70 max-w-md mx-auto md:mx-0">
                {user.bio || 'Sharing campus vibes ✨'}
              </p>
              {user.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start pt-1">
                  {user.interests.slice(0, 6).map(interest => {
                    const opt = INTEREST_OPTIONS.find(o => o.id === interest);
                    return (
                      <span key={interest} className="text-[9px] font-bold uppercase tracking-wider bg-accent/50 text-foreground/80 px-2 py-0.5 border border-foreground/10">
                        {opt ? `${opt.emoji} ${opt.label}` : interest}
                      </span>
                    );
                  })}
                  {user.interests.length > 6 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-1">+{user.interests.length - 6}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {isOwnProfile && myOrganizations.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">My Organizations</h2>
          </div>
          {myOrganizations.map(org => {
            const myRole = org.members?.find(m => m.userId === currentUser?.id)?.role;
            const canManage = myRole === 'owner' || myRole === 'admin';
            return (
              <div key={org.id} className="border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] overflow-hidden">
                <div className="bg-foreground text-background px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {org.logo ? (
                      <div className="h-6 w-6 border-[1.5px] border-background bg-background shrink-0">
                        <img src={org.logo} alt="logo" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <Building2 className="h-4 w-4 shrink-0" />
                    )}
                    <h3 className="text-xs font-black uppercase tracking-[0.1em]">{org.name}</h3>
                  </div>
                  <Badge variant="outline" className="bg-background text-foreground text-[8px] uppercase">{myRole}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x-[2px] divide-y-[2px] divide-foreground/10 border-b-[2px] border-foreground/10">
                  <OrgInfoCell label="Type" value={(org.type || org.entityType || 'N/A').replace(/_/g, ' ')} icon={<Briefcase className="h-3.5 w-3.5" />} />
                  <OrgInfoCell label="Members" value={String(org.members?.length || 0)} icon={<Users className="h-3.5 w-3.5" />} />
                  <OrgInfoCell label="Followers" value={String(org.followerIds?.length || 0)} icon={<Heart className="h-3.5 w-3.5" />} />
                  <OrgInfoCell label="Policy" value={org.joinPolicy === 'open' ? 'Open' : org.joinPolicy === 'approval_required' ? 'Approval' : 'Invite'} icon={<ShieldCheck className="h-3.5 w-3.5" />} />
                </div>
                <div className="p-3 bg-muted/30 flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest border-[2px] border-foreground bg-card hover:bg-muted" onClick={() => navigate(`/org/${org.id}`)}>
                    View Profile
                  </Button>
                  {canManage && (
                    <Button 
                      size="sm" 
                      onClick={() => setManagerOrg(org)}
                      className="h-8 text-[9px] font-black uppercase tracking-widest border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)]"
                    >
                      Manage Members
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </motion.section>
      )}

      {managerOrg && (
        <OrganizationManager 
          org={managerOrg} 
          open={!!managerOrg} 
          onOpenChange={(open) => !open && setManagerOrg(null)} 
        />
      )}

      <section className="space-y-6">
        <div className="flex border-[2.5px] border-foreground overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<Grid className="h-4 w-4" />} label="Posts" />
          {isOwnProfile && (
            <TabButton active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} icon={<Bookmark className="h-4 w-4" />} label="Saved" />
          )}
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="h-4 w-4" />} label="Settings" />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div key="posts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-2"
            >
              {userPosts.length === 0 ? (
                <div className="col-span-3 py-16 flex flex-col items-center border-[2px] border-dashed border-foreground/20">
                  <Grid className="h-10 w-10 mb-2 text-muted-foreground/30" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">No moments captured</p>
                </div>
              ) : (
                userPosts.map(post => <PostGridItem key={post.id} post={post} />)
              )}
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-2"
            >
              {bookmarkedPosts.length === 0 ? (
                <div className="col-span-3 py-16 flex flex-col items-center border-[2px] border-dashed border-foreground/20">
                  <Bookmark className="h-10 w-10 mb-2 text-muted-foreground/30" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">No saved moments</p>
                </div>
              ) : (
                bookmarkedPosts.map(post => <PostGridItem key={post.id} post={post} />)
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-3 max-w-lg mx-auto"
            >
              <AccountRow icon={<UserIcon className="h-5 w-5" />} title="Edit Profile"
                description={user.role === UserRole.STUDENT ? `${user.major || 'Student'} • ${user.year || 'N/A'}` : "Manage personal details"}
                onClick={openEditProfile} />
              <AccountRow icon={<ShieldCheck className="h-5 w-5" />} title="Privacy & Safety" description="MFA, visibility and app access" />
              <AccountRow icon={<Building2 className="h-5 w-5" />} title="Create Organization"
                description="Register a new club or org for Campus Pulse"
                onClick={() => setIsApplyOpen(true)} />
              <AccountRow icon={<GraduationCap className="h-5 w-5" />} title="Request Institute"
                description="Request your institute to be added to the platform"
                onClick={() => setIsInstituteRequestOpen(true)} />

              <div
                className="group flex items-center justify-between p-4 border-[2.5px] border-foreground bg-card hover:bg-muted shadow-[3px_3px_0_0_var(--foreground)] cursor-pointer transition-all active:translate-y-[2px] active:shadow-none"
                onClick={toggleTheme}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 border-[2px] border-foreground/30 flex items-center justify-center bg-muted">
                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </div>
                  <div className="text-left">
                    <h4 className="font-black text-xs uppercase tracking-wider">Theme</h4>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                      Switch to {theme === 'light' ? 'Dark' : 'Light'}
                    </p>
                  </div>
                </div>
                <div className="h-6 w-12 border-[2px] border-foreground bg-muted p-0.5 relative">
                  <motion.div animate={{ x: theme === 'dark' ? 22 : 0 }} className="h-full w-5 bg-primary" />
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-3.5 mt-6 text-[10px] font-black uppercase tracking-[0.2em] border-[2.5px] border-destructive bg-destructive text-white hover:bg-destructive/90 active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0_0_rgba(220,38,38,0.3)] transition-all"
              >
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <CreateOrganizationDialog 
        open={isApplyOpen} 
        onOpenChange={setIsApplyOpen} 
        onSubmit={createOrganization} 
      />

      <Dialog open={isInstituteRequestOpen} onOpenChange={setIsInstituteRequestOpen}>
        <DialogContent className="max-w-2xl p-0 border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)] bg-card overflow-hidden max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Request Institute Onboarding</DialogTitle>
          <div className="p-6">
            <InstituteOnboardingRequest />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-lg p-0 border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)] bg-card overflow-hidden">
          <div className="bg-foreground text-background px-6 py-4">
            <DialogTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <Pencil className="h-5 w-5" /> Edit Profile
            </DialogTitle>
            <p className="text-[9px] font-mono uppercase tracking-wider text-background/60 mt-1">Update your campus identity</p>
          </div>
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <div className="h-20 w-20 border-[3px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] bg-muted overflow-hidden">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={avatarPreview || user?.avatar} className="rounded-none object-cover" />
                    <AvatarFallback className="text-2xl font-black bg-primary/10 rounded-none">{(user?.name || '?')[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-background" />
                </div>
                {avatarUploading && (
                  <div className="absolute inset-0 bg-foreground/80 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-background animate-spin" />
                  </div>
                )}
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider">Profile Photo</p>
                <p className="text-[9px] text-muted-foreground">Click to upload • Max 2MB • JPG, PNG, WebP</p>
                {avatarFile && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-foreground/10 overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${avatarProgress}%` }} />
                    </div>
                    <span className="text-[8px] font-mono text-primary">{avatarFile.name.slice(0,15)}...</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider">Display Name *</label>
              <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="rounded-none border-[3px] border-foreground focus:shadow-[4px_4px_0_0_var(--primary)]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-wider">Bio</label>
                <span className="text-[9px] font-mono text-muted-foreground">{editForm.bio.length}/200</span>
              </div>
              <textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} maxLength={200} rows={3} placeholder="Tell us about yourself..." className="w-full rounded-none border-[3px] border-foreground bg-background px-3 py-2 text-sm focus:outline-none focus:shadow-[4px_4px_0_0_var(--foreground)] resize-none transition-shadow" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider">Major</label>
                <select value={editForm.major} onChange={e => setEditForm(p => ({ ...p, major: e.target.value }))} className="w-full px-3 py-2.5 border-[3px] border-foreground bg-background text-sm focus:outline-none focus:shadow-[4px_4px_0_0_var(--foreground)] rounded-none transition-shadow">
                  <option value="">Select...</option>
                  {['Computer Science','Electrical Engineering','Mechanical Engineering','Civil Engineering','Electronics & Communication','Information Technology','Chemical Engineering','Biotechnology','Mathematics','Physics','Chemistry','Biology','Commerce','Business Administration','Economics','Psychology','English Literature','History','Political Science','Sociology','Law','Medicine','Architecture','Design','Pharmacy','Agriculture','Fine Arts','Journalism','Education','Other'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider">Year</label>
                <select value={editForm.year} onChange={e => setEditForm(p => ({ ...p, year: e.target.value }))} className="w-full px-3 py-2.5 border-[3px] border-foreground bg-background text-sm focus:outline-none focus:shadow-[4px_4px_0_0_var(--foreground)] rounded-none transition-shadow">
                  <option value="">Select...</option>
                  {['1st Year','2nd Year','3rd Year','4th Year','5th Year','Postgraduate','PhD','Alumni'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider">Interests ({editInterests.length} selected)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                {INTEREST_OPTIONS.map(opt => {
                  const sel = editInterests.includes(opt.id);
                  return (
                    <button key={opt.id} type="button" onClick={() => setEditInterests(prev => sel ? prev.filter(i => i !== opt.id) : [...prev, opt.id])}
                      className={`flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border-[3px] transition-all ${sel ? 'border-primary bg-primary/10' : 'border-foreground/30 bg-card hover:bg-muted'}`}>
                      <span>{opt.emoji}</span> {opt.label}
                      {sel && <CheckCircle className="h-3 w-3 text-primary ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={isSavingProfile}
              className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] border-[2.5px] border-foreground bg-primary text-white hover:bg-primary/90 disabled:opacity-50 active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0_0_var(--foreground)] transition-all flex items-center justify-center gap-2">
              {isSavingProfile ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatBlock({ label, value, border }: { label: string; value: number; border?: boolean }) {
  return (
    <div className={`px-5 py-3 text-center ${border ? 'border-l-[2.5px] border-foreground' : ''}`}>
      <span className="text-lg font-black block">{value}</span>
      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function OrgInfoCell({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">{icon}
        <span className="text-[8px] font-black uppercase tracking-[0.15em]">{label}</span>
      </div>
      <p className="text-xs font-black text-foreground">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 transition-all text-[9px] font-black uppercase tracking-[0.15em] border-r-[2px] border-foreground/10 last:border-r-0 ${
        active ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-muted'
      }`}
    >
      {icon}<span className="hidden xs:inline">{label}</span>
    </button>
  );
}

const PostGridItem: React.FC<{ post: CampusEvent }> = ({ post }) => (
  <motion.div
    whileHover={{ scale: 0.98 }}
    className="group relative aspect-square bg-muted overflow-hidden cursor-pointer border-[2px] border-foreground/10 hover:border-foreground transition-colors"
  >
    <img src={post.imageUrl} className="h-full w-full object-cover transition-transform group-hover:scale-105" alt="Post" />
    <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white text-xs font-black">
      <div className="flex items-center gap-1"><Heart className="h-4 w-4 fill-white" />{post.likes?.length || 0}</div>
      <div className="flex items-center gap-1"><MessageCircle className="h-4 w-4 fill-white" />{post.commentCount || 0}</div>
    </div>
    {post.tags?.includes('featured') && (
      <div className="absolute top-1.5 right-1.5 bg-primary p-1"><Sparkles className="h-3 w-3 text-white" /></div>
    )}
  </motion.div>
);

function AccountRow({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="group flex items-center justify-between p-4 border-[2.5px] border-foreground bg-card hover:bg-muted shadow-[3px_3px_0_0_var(--foreground)] cursor-pointer transition-all active:translate-y-[2px] active:shadow-none"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 border-[2px] border-foreground/30 flex items-center justify-center bg-muted text-muted-foreground group-hover:text-primary transition-colors">
          {icon}
        </div>
        <div className="text-left">
          <h4 className="font-black text-xs uppercase tracking-wider">{title}</h4>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{description}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
    </motion.div>
  );
}

export function CreateOrganizationDialog({ open, onOpenChange, onSubmit }: { open: boolean, onOpenChange: (open: boolean) => void, onSubmit: (data: Partial<Organization>) => void }) {
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('club');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [orgLogo, setOrgLogo] = useState('');
  const [orgTags, setOrgTags] = useState('');
  const [joinPolicy, setJoinPolicy] = useState<OrgJoinPolicy>('open');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, 2);
    if (!validation.valid) { toast.error(validation.error); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const NAME_MAX = 50;
  const DESC_MAX = 500;
  const DESC_MIN = 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = orgName.trim();
    const trimmedDesc = orgDescription.trim();

    if (!trimmedName) { toast.error("Organization name is required"); return; }
    if (trimmedName.length < 3) { toast.error("Name must be at least 3 characters"); return; }
    if (trimmedName.length > NAME_MAX) { toast.error(`Name cannot exceed ${NAME_MAX} characters`); return; }
    if (!trimmedDesc) { toast.error("Description is required"); return; }
    if (trimmedDesc.length < DESC_MIN) { toast.error(`Description must be at least ${DESC_MIN} characters`); return; }
    if (trimmedDesc.length > DESC_MAX) { toast.error(`Description cannot exceed ${DESC_MAX} characters`); return; }
    if (orgWebsite.trim() && !/^https?:\/\/.+/i.test(orgWebsite.trim()) && !orgWebsite.trim().startsWith('www.')) {
      toast.error("Website must be a valid URL (e.g. https://...)"); return;
    }

    setIsSubmitting(true);
    try {
      let logoUrl = orgLogo.trim();
      // Upload logo file to Cloudinary if selected
      if (logoFile) {
        setLogoUploading(true);
        try {
          const tempId = `org-${Date.now()}`;
          logoUrl = await uploadOrgLogo(logoFile, tempId, (p) => setLogoProgress(p));
        } catch (err: any) {
          toast.error(`Logo upload failed: ${err.message}`);
          setLogoUploading(false);
          setIsSubmitting(false);
          return;
        }
        setLogoUploading(false);
      }
      const tags = orgTags.split(',').map(t => t.trim()).filter(Boolean);
      await onSubmit({
        name: trimmedName,
        type: orgType,
        website: orgWebsite.trim(),
        description: trimmedDesc,
        logo: logoUrl,
        joinPolicy,
        tags,
      });
      setOrgName(''); setOrgType('club'); setOrgWebsite(''); setOrgDescription('');
      setOrgLogo(''); setOrgTags(''); setJoinPolicy('open');
      setLogoFile(null); setLogoPreview(''); setLogoProgress(0);
      onOpenChange(false);
    } catch {
      // error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)] bg-card overflow-hidden">
        {/* Header */}
        <div className="bg-foreground text-background px-6 py-4">
          <DialogTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create Organization
          </DialogTitle>
          <p className="text-[9px] font-mono uppercase tracking-wider text-background/60 mt-1">
            Submitted for admin review • Usually approved within 24h
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider">Organization Name *</label>
              <span className={`text-[9px] font-mono tabular-nums ${orgName.length > NAME_MAX ? 'text-destructive' : 'text-muted-foreground'}`}>
                {orgName.length}/{NAME_MAX}
              </span>
            </div>
            <input 
              value={orgName} onChange={e => setOrgName(e.target.value)}
              maxLength={NAME_MAX + 5}
              placeholder="e.g. Computer Science Club"
              className="w-full px-3 py-2.5 border-[2px] border-foreground bg-background text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--foreground)] transition-shadow rounded-none"
            />
          </div>

          {/* Type + Join Policy Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider">Type</label>
              <select
                value={orgType} onChange={e => setOrgType(e.target.value)}
                className="w-full px-3 py-2.5 border-[2px] border-foreground bg-background text-sm focus:outline-none rounded-none"
              >
                <option value="club">Student Club</option>
                <option value="department">Department</option>
                <option value="council">Student Council</option>
                <option value="sports_team">Sports Team</option>
                <option value="media">Media / Publication</option>
                <option value="ngo">NGO / Social Cause</option>
                <option value="fraternity">Fraternity / Sorority</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider">Join Policy</label>
              <select
                value={joinPolicy} onChange={e => setJoinPolicy(e.target.value as OrgJoinPolicy)}
                className="w-full px-3 py-2.5 border-[2px] border-foreground bg-background text-sm focus:outline-none rounded-none"
              >
                <option value="open">Open — Anyone</option>
                <option value="approval_required">Approval Required</option>
                <option value="invite_only">Invite Only</option>
              </select>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider">Organization Logo <span className="text-muted-foreground">(optional)</span></label>
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="relative cursor-pointer border-[3px] border-dashed border-foreground/40 hover:border-foreground bg-muted/30 hover:bg-muted/50 transition-all p-4 flex items-center gap-4 group"
            >
              {(logoPreview || orgLogo) ? (
                <>
                  <div className="h-14 w-14 border-[2px] border-foreground overflow-hidden bg-muted shrink-0">
                    <img src={logoPreview || orgLogo} alt="Logo" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{logoFile?.name || 'Logo uploaded'}</p>
                    <p className="text-[9px] text-muted-foreground">Click to change</p>
                    {logoUploading && (
                      <div className="mt-1 h-1.5 bg-foreground/10 overflow-hidden w-full">
                        <div className="h-full bg-primary transition-all" style={{ width: `${logoProgress}%` }} />
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setLogoFile(null); setLogoPreview(''); setOrgLogo(''); }} className="p-1 hover:bg-foreground/10">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 border-[2px] border-foreground/20 flex items-center justify-center bg-background">
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Upload Logo</p>
                    <p className="text-[9px] text-muted-foreground">JPG, PNG, WebP • Max 2MB</p>
                  </div>
                </>
              )}
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider">Website / Social <span className="text-muted-foreground">(optional)</span></label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                value={orgWebsite} onChange={e => setOrgWebsite(e.target.value)}
                placeholder="https://instagram.com/csclub"
                className="w-full pl-9 pr-3 py-2.5 border-[2px] border-foreground bg-background text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--foreground)] transition-shadow rounded-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider">Tags <span className="text-muted-foreground">(comma-separated)</span></label>
            <input 
              value={orgTags} onChange={e => setOrgTags(e.target.value)}
              placeholder="e.g. tech, coding, hackathon"
              className="w-full px-3 py-2.5 border-[2px] border-foreground bg-background text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--foreground)] transition-shadow rounded-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider">Description *</label>
              <span className={`text-[9px] font-mono tabular-nums ${orgDescription.length > DESC_MAX ? 'text-destructive' : orgDescription.length < DESC_MIN && orgDescription.length > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {orgDescription.length}/{DESC_MAX}
              </span>
            </div>
            <textarea 
              value={orgDescription} onChange={e => setOrgDescription(e.target.value)}
              maxLength={DESC_MAX + 10}
              placeholder="What does your organization do? Why should students join?"
              className="w-full px-3 py-2.5 border-[2px] border-foreground bg-background text-sm focus:outline-none focus:shadow-[3px_3px_0_0_var(--foreground)] transition-shadow rounded-none min-h-[100px] resize-y"
            />
            {orgDescription.length > 0 && orgDescription.length < DESC_MIN && (
              <p className="text-[9px] font-bold text-amber-500">Minimum {DESC_MIN} characters required ({DESC_MIN - orgDescription.length} more)</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] border-[2.5px] border-foreground bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0_0_var(--foreground)] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Zap className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit for Review'
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

