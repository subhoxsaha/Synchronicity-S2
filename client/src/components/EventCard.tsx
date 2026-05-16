import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  ExternalLink, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  Bookmark, 
  Heart, 
  MessageCircle, 
  Send,
  MoreHorizontal,
  SendHorizontal,
  Share2,
  CalendarDays,
  ArrowRight,
  Megaphone,
  Briefcase,
  BarChart2,
  Trophy,
  Link as LinkIcon,
  Search,
  Globe,
  Image as ImageIcon,
  ShoppingCart,
  Rocket
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CampusEvent, EventComment, UserRole, PostType } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { PostDetailInfo } from './post-inputs/PostDetailInfo';

interface EventCardProps {
  event: CampusEvent;
  isRegistered: boolean;
  onRegister: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  key?: React.Key;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
}

/* ─────────── INLINE EXPANDED COMMENTS ─────────── */

function ExpandedComments({ eventId }: { eventId: string }) {
  const { addComment, currentUser } = useAppContext();
  const [comments, setComments] = useState<EventComment[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => d.data() as EventComment));
    });
    return () => unsub();
  }, [eventId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(eventId, text);
    setText('');
  };

  return (
    <div className="border-[2.5px] border-foreground bg-card mt-4 shadow-[4px_4px_0_0_var(--foreground)]">
      <div className="px-3 py-3 border-b-[2.5px] border-foreground bg-brutal-yellow/10">
        <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
          <MessageCircle className="h-4 w-4" /> Comments ({comments.length})
        </h4>
      </div>
      <div className="max-h-[240px] overflow-y-auto no-scrollbar p-3 space-y-3 bg-background/50">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground/40">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No comments yet</p>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex gap-3 p-3 border-[2px] border-foreground/20 bg-background shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]">
              <Avatar className="h-7 w-7 shrink-0 border-[2px] border-foreground">
                <AvatarImage src={c.userAvatar} />
                <AvatarFallback className="text-[9px] font-black">{(c.userName || '?')[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-foreground uppercase truncate">{c.userName}</span>
                  <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                    {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-foreground/90 leading-snug font-medium">{c.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="relative border-t-[2.5px] border-foreground">
        <input
          type="text"
          placeholder="Add a comment..."
          className="w-full h-12 bg-background pl-4 pr-12 text-[11px] sm:text-xs font-bold outline-none placeholder:text-muted-foreground/40 placeholder:font-medium focus:bg-accent/5 transition-colors"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-primary disabled:opacity-30 active:scale-90 hover:bg-primary/10 rounded-full transition-all"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

/* ─────────── EVENT CARD (Feed card) ─────────── */

export function EventCard({ event, isRegistered, onRegister, className, size = 'sm', isExpanded = false, onToggleExpand }: EventCardProps) {
  const navigate = useNavigate();
  const { toggleLike, toggleBookmark, currentUser, toggleFollow, users, organizations, followOrganization, unfollowOrganization } = useAppContext();
  
  const isLiked = event.likes?.includes(currentUser?.id || '');
  const isBookmarked = currentUser?.bookmarkedEvents?.includes(event.id);
  const likeCount = event.likes?.length || 0;

  const eventDate = event.date ? new Date(event.date) : null;
  const isValidDate = eventDate && !isNaN(eventDate.getTime());
  const dateStr = isValidDate ? eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'TBD';

  // Type-aware styling
  const postType = event.type as PostType | undefined;
  const isVirtual = postType === PostType.WEBINAR || (event as any).format === 'virtual';
  const locationDisplay = isVirtual ? 'Virtual' : (event.location || 'Location TBD');  
  const typeBadgeVariant = postType === PostType.ANNOUNCEMENT ? 'default' 
    : postType === PostType.RECRUITMENT || postType === PostType.JOB ? 'secondary'
    : postType === PostType.WEBINAR ? 'outline'
    : postType === PostType.POLL ? 'blue'
    : postType === PostType.CHALLENGE ? 'pink'
    : 'blue';

  const getTypeBadgeContent = () => {
    const iconClass = "h-3 w-3 shrink-0";
    const wrapper = (Icon: any, label: string) => (
      <div className="flex items-center gap-1 font-black">
        <Icon className={iconClass} strokeWidth={3} />
        <span className="mt-[1px]">{label}</span>
      </div>
    );

    switch (postType) {
      case PostType.ANNOUNCEMENT: return wrapper(Megaphone, 'ANNOUNCEMENT');
      case PostType.RECRUITMENT: return wrapper(Briefcase, 'HIRING');
      case PostType.JOB: return wrapper(Briefcase, 'OPPORTUNITY');
      case PostType.WEBINAR: return wrapper(Globe, 'WEBINAR');
      case PostType.POLL: return wrapper(BarChart2, 'POLL');
      case PostType.RESOURCE: return wrapper(LinkIcon, 'RESOURCE');
      case PostType.GALLERY: return wrapper(ImageIcon, 'GALLERY');
      case PostType.CHALLENGE: return wrapper(Trophy, 'CHALLENGE');
      case PostType.LOST_FOUND: return wrapper(Search, 'LOST & FOUND');
      case PostType.BUY_SELL: return wrapper(ShoppingCart, 'MARKETPLACE');
      case PostType.TIMETABLE: return wrapper(CalendarIcon, 'SCHEDULE');
      case PostType.PROJECT: return wrapper(Rocket, 'PROJECT');
      default: return wrapper(CalendarIcon, (event.category?.[0] || 'EVENT').toUpperCase());
    }
  };

  const badgeContent = getTypeBadgeContent();

  const getFallbackStyling = () => {
    const iconClass = "h-24 w-24 text-black/10 dark:text-white/10 -rotate-12";
    switch (postType) {
      case PostType.ANNOUNCEMENT: return { bg: 'bg-brutal-pink', icon: <Megaphone className={iconClass} /> };
      case PostType.RECRUITMENT:
      case PostType.JOB: return { bg: 'bg-brutal-blue', icon: <Briefcase className={iconClass} /> };
      case PostType.POLL: return { bg: 'bg-brutal-yellow', icon: <BarChart2 className={iconClass} /> };
      case PostType.CHALLENGE: return { bg: 'bg-brutal-green', icon: <Trophy className={iconClass} /> };
      case PostType.RESOURCE: return { bg: 'bg-primary', icon: <LinkIcon className={iconClass} /> };
      case PostType.WEBINAR: return { bg: 'bg-brutal-pink', icon: <Globe className={iconClass} /> };
      case PostType.LOST_FOUND: return { bg: 'bg-brutal-yellow', icon: <Search className={iconClass} /> };
      case PostType.PROJECT: return { bg: 'bg-brutal-green', icon: <Sparkles className={iconClass} /> };
      default: return { bg: 'bg-muted', icon: <CalendarDays className={iconClass} /> };
    }
  };

  const fallbackStyle = getFallbackStyling();
  const imageSrc = event.assets?.bannerUrl || event.imageUrl;

  const organizer = users.find(u => u.email === event.organizerEmail || u.id === event.organizerId);
  const org = event.organizationId ? organizations.find(o => o.id === event.organizationId) : null;

  const displayName = org?.name || event.organizationName || event.organizerName || 'Unknown';
  const displayLogo = org?.logo || event.organizationLogo || organizer?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  const isOrgVerified = org ? org.isVerified : (organizer?.isApproved && organizer?.role !== UserRole.STUDENT);

  const isFollowing = org 
    ? org.followerIds?.includes(currentUser?.id || '')
    : currentUser?.following?.includes(organizer?.id || '');

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (org) {
      isFollowing ? unfollowOrganization(org.id) : followOrganization(org.id);
    } else if (organizer?.id) {
      toggleFollow(organizer.id);
    }
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/share/${event.id}`;
    const shareData = {
      title: event.title,
      text: event.description,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard', {
          description: 'Ready for broadcast.',
          className: 'font-mono uppercase tracking-widest text-[10px]'
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <Card className={`w-full border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-all overflow-hidden group/card flex flex-col relative ${isExpanded ? 'shadow-[8px_8px_0_0_var(--foreground)]' : ''} ${className || ''}`}>
      
      {/* Post Media (Inline Toggle) */}
      <div 
        className={`relative w-full cursor-pointer group overflow-hidden ${isExpanded ? 'min-h-[260px] sm:min-h-[320px]' : 'flex-1 min-h-[180px] sm:min-h-[220px]'}`} 
        onClick={(e) => { e.stopPropagation(); onToggleExpand?.(event.id); }}
      >
        {imageSrc ? (
          <img 
            src={imageSrc} 
            className="absolute inset-0 h-full w-full object-cover select-none transition-transform duration-500 group-hover:scale-105" 
            referrerPolicy="no-referrer"
            alt={event.title}
          />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${fallbackStyle.bg} transition-transform duration-500 group-hover:scale-105`}>
            {fallbackStyle.icon}
          </div>
        )}
        
        {/* Type-aware badge — top left */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant={typeBadgeVariant as any} className="text-[9px] shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] py-1">
            {badgeContent}
          </Badge>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground via-foreground/90 to-transparent p-4 pt-12 transition-all">
            <h3 className={`text-background font-extrabold uppercase tracking-tight line-clamp-2 leading-tight ${
              isExpanded ? 'text-xl sm:text-2xl' :
              size === 'xl' ? 'text-xl' : 
              size === 'lg' ? 'text-lg' : 'text-base'
            }`}>
              {event.title}
            </h3>
            <div className="flex items-center justify-between mt-2 pt-2 border-t-[1.5px] border-background/20">
                <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
                    <span className="text-background/80 font-bold uppercase tracking-widest text-[9px]">
                      {locationDisplay}
                    </span>
                </div>
                <span className="text-background/80 font-mono uppercase tracking-widest tabular-nums text-[9px]">
                  {dateStr}
                </span>
            </div>
        </div>
      </div>

      {/* Post Info Header */}
      <div className="p-4 space-y-3 border-t-[2.5px] border-foreground flex-none bg-card relative z-20">
        <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/50 p-1 -m-1 rounded-sm transition-colors group/author"
              onClick={(e) => {
                e.stopPropagation();
                if (org) navigate(`/org/${org.id}`);
              }}
            >
                <Avatar className="h-8 w-8 border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] group-hover/author:shadow-none group-hover/author:translate-x-[2px] group-hover/author:translate-y-[2px] transition-all">
                    <AvatarImage src={displayLogo} />
                    <AvatarFallback className="text-[10px] font-black">{displayName?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <span className="font-black text-[10px] text-foreground tracking-tight uppercase leading-none truncate max-w-[120px] sm:max-w-[200px]">
                            {displayName}
                        </span>
                        {organizer?.role === UserRole.PLATFORM_ADMIN && (
                            <ShieldCheck className="h-3 w-3 text-red-500" strokeWidth={3} />
                        )}
                        {isOrgVerified && (
                            <ShieldCheck className="h-3 w-3 text-blue-500" strokeWidth={3} />
                        )}
                    </div>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                       {org ? 'Organization' : organizer?.role === UserRole.PLATFORM_ADMIN ? 'System' : 'Organizer'}
                    </span>
                </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1">
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(event.id); }}
                    className={`h-8 w-8 flex items-center justify-center border-[2px] border-foreground/20 transition-all active:scale-90 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] ${isLiked ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} strokeWidth={2.5} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleExpand?.(event.id); }}
                    className={`h-8 w-8 flex items-center justify-center border-[2px] transition-all active:scale-90 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] ${isExpanded ? 'border-primary/40 bg-primary/10 text-primary' : 'border-foreground/20 text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                    <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(event.id); }}
                    className={`h-8 w-8 flex items-center justify-center border-[2px] border-foreground/20 transition-all active:scale-90 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] ${isBookmarked ? 'text-primary bg-primary/10 border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} strokeWidth={2.5} />
                </button>
                <button 
                    onClick={handleShare}
                    className="h-8 w-8 hidden sm:flex items-center justify-center border-[2px] border-foreground/20 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90 shadow-[2px_2px_0_0_rgba(0,0,0,0.1)]"
                >
                    <Share2 className="h-4 w-4" strokeWidth={2.5} />
                </button>
            </div>
        </div>

        <div className="space-y-3 relative">
            <div className={`text-xs leading-relaxed font-medium text-foreground/90 markdown-body ${isExpanded ? '' : 'line-clamp-3'}`}>
              <span className="font-black mr-2 text-foreground uppercase tracking-tight inline-block">{displayName}</span>
              <ReactMarkdown>{event.description}</ReactMarkdown>
            </div>
            {!isExpanded && (
              <div className="flex items-center justify-between pt-3 border-t-[2px] border-foreground/10">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] tabular-nums text-muted-foreground">{likeCount} likes</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground font-mono">{dateStr}</span>
              </div>
            )}
        </div>
      </div>

      {/* ── INLINE EXPANDED DETAIL PANEL ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t-[2.5px] border-foreground"
          >
            <div className="p-4 sm:p-5 space-y-5 bg-accent/5">
              
              {/* Organizer card (Expanded) */}
              <div className="flex items-center gap-3 p-3 border-[2.5px] border-foreground bg-card shadow-[3px_3px_0_0_var(--foreground)]">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-[2.5px] border-foreground shrink-0">
                  <AvatarImage src={displayLogo} />
                  <AvatarFallback className="font-black text-xs">{(displayName)[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary truncate">
                      {org ? 'Organization' : organizer?.role === UserRole.PLATFORM_ADMIN ? 'Admin' : 'Organizer'}
                    </p>
                    {isOrgVerified && <ShieldCheck className="h-3 w-3 text-blue-500 shrink-0" />}
                  </div>
                  <p className="text-sm font-extrabold text-foreground truncate uppercase">{displayName}</p>
                </div>
                {currentUser?.id !== (org?.ownerId || organizer?.id) && (org || organizer?.id) && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="h-8 sm:h-9 px-3 sm:px-4 font-black uppercase tracking-widest text-[9px] shrink-0 border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    onClick={handleFollowClick}
                  >
                    {isFollowing ? '✓ Following' : 'Follow'}
                  </Button>
                )}
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-foreground px-2.5 py-1 bg-brutal-yellow/20 border-[2px] border-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comprehensive Info Grid & Rich Extra Content & CTA mapped from post-inputs */}
              <div className="mt-2">
                <PostDetailInfo event={event} isRegistered={isRegistered} onRegister={onRegister} compact />
              </div>

              {/* Additional Action Buttons for expanded state */}
              {event.coordinates?.lat && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full h-12 px-4 border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all bg-card hover:bg-accent/10"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.lat},${event.coordinates.lng}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    GET DIRECTIONS
                  </Button>
                </div>
              )}

              {/* Inline Comments */}
              <ExpandedComments eventId={event.id} />

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
