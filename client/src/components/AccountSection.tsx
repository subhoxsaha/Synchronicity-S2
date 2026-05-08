import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, Mail, Calendar, ShieldCheck, LogOut, ChevronRight, ExternalLink,
  Award, Zap, LayoutDashboard, Shield, Briefcase, Users, Clock, Grid, Bookmark,
  Settings, Heart, MessageCircle, Sparkles, Moon, Sun, Building2, Globe, Link2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, UserRole, CampusEvent } from '../types';
import { toast } from 'sonner';
import { useAppContext } from '../contexts/AppContext';

interface AccountSectionProps {
  user: User | null;
  logout: () => void;
  stats?: { label: string; value: string | number; icon: React.ReactNode }[];
}

export function AccountSection({ user, logout, stats }: AccountSectionProps) {
  const { activeRole, setActiveRole, setRole, events, toggleFollow, currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'settings'>('posts');
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

  const roleConfigs = {
    [UserRole.STUDENT]: { label: 'Student', icon: <UserIcon className="h-3 w-3" />, bg: 'bg-primary text-white' },
    [UserRole.ORGANIZER]: { label: 'Organization', icon: <Building2 className="h-3 w-3" />, bg: 'bg-secondary text-white' },
    [UserRole.ADMIN]: { label: 'Admin', icon: <Shield className="h-3 w-3" />, bg: 'bg-destructive text-white' },
  };
  const currentRoleConfig = roleConfigs[user.role];

  const handleLogout = () => {
    toast.loading("Ending session...", { duration: 1500 });
    setTimeout(logout, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-2">
      {/* ═══ PROFILE HEADER ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-[2.5px] border-foreground bg-card p-6 md:p-8 shadow-[6px_6px_0_0_var(--foreground)]"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="h-28 w-28 md:h-36 md:w-36 border-[3px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] bg-muted overflow-hidden">
              <Avatar className="h-full w-full rounded-none">
                <AvatarImage src={user.avatar} className="rounded-none object-cover" />
                <AvatarFallback className="text-3xl font-black bg-primary/10 rounded-none">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase">
                  {isOrganizer && user.orgName ? user.orgName : user.name}
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

              {isOrganizer && user.orgName && (
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  by {user.name} • {user.orgType || 'Organization'}
                </p>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex justify-center md:justify-start gap-0 border-[2.5px] border-foreground w-fit mx-auto md:mx-0">
              <StatBlock label="Moments" value={userPosts.length} />
              <StatBlock label="Followers" value={user.followers?.length || 0} border />
              <StatBlock label="Following" value={user.following?.length || 0} border />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center md:justify-start gap-2">
              {isOwnProfile ? (
                <>
                  <button className="px-5 py-2 text-[9px] font-black uppercase tracking-[0.15em] border-[2.5px] border-foreground bg-card hover:bg-muted active:translate-y-[2px] active:shadow-none shadow-[3px_3px_0_0_var(--foreground)] transition-all">
                    Edit Profile
                  </button>
                  <button className="p-2 border-[2.5px] border-foreground bg-card hover:bg-muted active:translate-y-[2px] active:shadow-none shadow-[3px_3px_0_0_var(--foreground)] transition-all">
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

            {/* Bio */}
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{user.major || 'Member'}</p>
              <p className="text-sm font-medium text-foreground/70 max-w-md mx-auto md:mx-0">
                {isOrganizer ? (user.orgDescription || user.bio || 'Organization on Campus Pulse') : (user.bio || "Sharing campus vibes ✨")}
              </p>
              {isOrganizer && user.orgWebsite && (
                <a href={user.orgWebsite} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1 text-[10px] font-mono text-primary hover:underline uppercase tracking-wider">
                  <Globe className="h-3 w-3" />
                  {user.orgWebsite.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ ORG INFO PANEL (Organizer Only) ═══ */}
      {isOrganizer && user.orgName && isOwnProfile && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)]"
        >
          <div className="bg-foreground text-background px-5 py-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Organization Details
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x-[2px] divide-y-[2px] divide-foreground/10">
            <OrgInfoCell label="Type" value={user.orgType || 'N/A'} icon={<Briefcase className="h-3.5 w-3.5" />} />
            <OrgInfoCell label="Status" value={user.isApproved ? 'Active' : 'Under Review'} icon={user.isApproved ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Clock className="h-3.5 w-3.5 text-amber-500" />} />
            <OrgInfoCell label="Events" value={String(userPosts.length)} icon={<Calendar className="h-3.5 w-3.5" />} />
            <OrgInfoCell label="Website" value={user.orgWebsite ? 'Linked' : 'N/A'} icon={<Link2 className="h-3.5 w-3.5" />} />
          </div>
        </motion.section>
      )}

      {/* ═══ CONTENT TABS ═══ */}
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
              <AccountRow icon={<UserIcon className="h-5 w-5" />} title="Profile Information"
                description={user.role === UserRole.STUDENT ? `${user.major || 'Student'} • ${user.year || 'N/A'}` : "Manage personal details"} />
              <AccountRow icon={<ShieldCheck className="h-5 w-5" />} title="Privacy & Safety" description="MFA, visibility and app access" />
              {user.role === UserRole.STUDENT && (
                <AccountRow icon={<Building2 className="h-5 w-5" />} title="Apply for Organization"
                  description="Register your club or org for Campus Pulse"
                  onClick={() => toast.info("Navigate to Organizer Portal to submit your application.")} />
              )}

              {/* Theme Toggle */}
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

              {/* Logout */}
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
    </div>
  );
}

/* ═══ Sub-Components ═══ */

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
