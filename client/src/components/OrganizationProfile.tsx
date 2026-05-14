import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Building2, Users, Heart, ShieldCheck, Link as LinkIcon, 
  MapPin, Calendar, ArrowLeft, Mail, Sparkles, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '../contexts/AppContext';
import { EventCard } from './EventCard';
import { toast } from 'sonner';

export function OrganizationProfile() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [expandedCardId, setExpandedCardId] = React.useState<string | null>(null);
  const { organizations, events, currentUser, users, followOrganization, unfollowOrganization } = useAppContext();

  const org = organizations.find(o => o.id === orgId);
  
  // Find events authored by this organization
  const orgEvents = useMemo(() => {
    return events.filter(e => (e as any).organizationId === orgId);
  }, [events, orgId]);

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Building2 className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Organization Not Found</h2>
        <Button variant="outline" onClick={() => navigate(-1)} className="border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)]">
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  // Derive follower status
  const isFollowing = org.followerIds?.includes(currentUser?.id || '');
  
  // Find owner
  const ownerMember = org.members?.find(m => m.role === 'owner');
  const ownerUser = ownerMember ? users.find(u => u.id === ownerMember.userId) : null;

  return (
    <div className="max-w-[1200px] mx-auto w-full pb-20">
      {/* ── HEADER BANNERS ── */}
      <div className="relative h-48 sm:h-64 bg-foreground border-b-[3px] border-foreground overflow-hidden">
        {org.coverImage ? (
          <img src={org.coverImage} className="h-full w-full object-cover opacity-80" alt="Cover" />
        ) : (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:20px_20px]" />
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/')}
          className="absolute top-4 left-4 h-8 bg-background/90 backdrop-blur-sm border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] hover:bg-background z-10"
        >
          <ArrowLeft className="h-3 w-3 mr-1.5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Back</span>
        </Button>
      </div>

      <div className="px-4 sm:px-8 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end">
          <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-[4px] border-background shadow-[4px_4px_0_0_var(--foreground)] bg-background">
            <AvatarImage src={org.logo} />
            <AvatarFallback className="text-4xl font-black bg-muted">
              {org.name[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2 mb-2 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-widest">
                    {(org.type || org.entityType || 'Organization').replace(/_/g, ' ')}
                  </Badge>
                  {org.isVerified && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-200">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none break-words">
                  {org.name}
                </h1>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button 
                  onClick={() => {
                    if (!currentUser) {
                      toast.error("Please login to follow organizations");
                      return;
                    }
                    isFollowing ? unfollowOrganization(org.id) : followOrganization(org.id);
                  }}
                  className={`h-10 sm:h-12 px-6 border-[2.5px] border-foreground text-xs font-black uppercase tracking-widest transition-all ${
                    isFollowing 
                      ? 'bg-muted text-foreground shadow-none translate-x-[2px] translate-y-[2px]' 
                      : 'bg-primary text-primary-foreground shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                {org.joinPolicy !== 'invite_only' && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (!currentUser) {
                        toast.error("Please login to join organizations");
                        return;
                      }
                      // Implement join logic here or link to join flow
                      toast.info("Join functionality coming soon");
                    }}
                    className="h-10 sm:h-12 px-6 border-[2.5px] border-foreground text-xs font-black uppercase tracking-widest bg-background shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                  >
                    Join
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => {
                    const shareUrl = window.location.href;
                    navigator.clipboard.writeText(shareUrl).then(() => toast.success("Profile link copied!"));
                  }}
                  className="h-10 sm:h-12 w-10 sm:w-12 px-0 border-[2.5px] border-foreground bg-background shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── ORG DETAILS ── */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left Column: Info Sidebar */}
          <div className="space-y-6">
            <div className="border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] p-5 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b-[2px] border-foreground/10 pb-2">
                About Organization
              </h3>
              <p className="text-sm font-medium leading-relaxed">
                {org.description || 'No description provided.'}
              </p>
              
              <div className="space-y-3 pt-2">
                {org.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold hover:text-primary transition-colors">
                    <LinkIcon className="h-4 w-4" />
                    <span className="truncate">{(org.website).replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {org.email && (
                  <a href={`mailto:${org.email}`} className="flex items-center gap-2 text-xs font-bold hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{org.email}</span>
                  </a>
                )}
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Est. {new Date(org.createdAt).getFullYear()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-[2.5px] border-foreground bg-brutal-yellow/20 p-4 text-center">
                <p className="text-2xl font-black">{org.members?.length || 0}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Members</p>
              </div>
              <div className="border-[2.5px] border-foreground bg-brutal-pink/20 p-4 text-center">
                <p className="text-2xl font-black">{org.followerIds?.length || 0}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Followers</p>
              </div>
            </div>

            {ownerUser && (
              <div className="border-[2.5px] border-foreground bg-card p-4 space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Administered By</h3>
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/user/${ownerUser.id}`)}>
                  <Avatar className="h-10 w-10 border-[2px] border-foreground">
                    <AvatarImage src={ownerUser.avatar} />
                    <AvatarFallback className="font-bold text-xs">{ownerUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{ownerUser.name}</p>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Organization Owner</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Events Feed */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 py-2 border-b-[3px] border-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Organization Activities
            </h3>
            
            {orgEvents.length === 0 ? (
              <div className="border-[2.5px] border-dashed border-foreground/30 p-12 text-center space-y-2 bg-muted/20">
                <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No Activities Yet</p>
                <p className="text-[10px] text-muted-foreground/60 font-mono">This organization hasn't posted any events or opportunities.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {orgEvents.map(event => {
                  const isThisExpanded = expandedCardId === event.id;
                  return (
                    <EventCard 
                      key={event.id}
                      event={event}
                      isRegistered={false} // Would need to pull from context if we wanted accurate status here
                      onRegister={() => {}} 
                      isExpanded={isThisExpanded}
                      onToggleExpand={(id) => setExpandedCardId(prev => prev === id ? null : id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
