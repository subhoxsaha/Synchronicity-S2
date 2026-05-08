import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Share2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CampusEvent, EventComment, UserRole } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface EventCardProps {
  event: CampusEvent;
  isRegistered: boolean;
  onRegister: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  key?: React.Key;
}

/* ─────────── EVENT DETAILS (Full-screen dialog) ─────────── */

export function EventDetails({ event, isRegistered, onRegister }: { event: CampusEvent; isRegistered: boolean; onRegister: (id: string) => void }) {
  const { toggleBookmark, toggleLike, currentUser, addComment, toggleFollow, users } = useAppContext();
  const [comments, setComments] = useState<EventComment[]>([]);
  const [commentText, setCommentText] = useState('');
  
  const isBookmarked = currentUser?.bookmarkedEvents?.includes(event.id);
  const isLiked = event.likes?.includes(currentUser?.id || '');

  const organizer = users.find(u => u.email === event.organizerEmail || u.id === event.organizerId);
  const isOrgVerified = organizer?.isApproved && organizer?.role !== UserRole.STUDENT;
  
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = eventDate.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  useEffect(() => {
    const q = query(
      collection(db, 'comments'), 
      where('eventId', '==', event.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => doc.data() as EventComment));
    });
    return () => unsubscribe();
  }, [event.id]);

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(event.id, commentText);
    setCommentText('');
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
          description: 'Share it with your colleagues.',
          className: 'font-mono uppercase tracking-widest text-[10px]'
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] sm:h-[85vh] bg-background">
      {/* Banner Image */}
      <div className="relative aspect-square sm:aspect-[16/10] shrink-0 border-b-[3px] border-foreground">
         <img src={`${event.assets?.bannerUrl || event.imageUrl}?q=80&w=1200`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
         
         {/* Action buttons - brutalist style */}
         <div className="absolute top-4 right-4 z-30 flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(event.id);
              }}
              className={`h-11 w-11 flex items-center justify-center border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
                isLiked ? 'bg-red-500 text-white' : 'bg-background text-foreground hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(event.id);
              }}
              className={`h-11 w-11 flex items-center justify-center border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
                isBookmarked ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-brutal-yellow/30'
              }`}
            >
              <Bookmark className="h-5 w-5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="h-11 w-11 flex items-center justify-center bg-background text-foreground border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none hover:bg-brutal-blue/30"
            >
              <Share2 className="h-5 w-5" />
            </motion.button>
         </div>
      </div>
      
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Left Side: Post Info */}
        <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto no-scrollbar border-b sm:border-b-0 sm:border-r-[3px] border-foreground">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <DialogTitle className="font-heading text-2xl font-extrabold tracking-tight leading-tight text-foreground uppercase">
                    {event.title}
                  </DialogTitle>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest">{event.location}</span>
                    </div>
                    {event.organizerEmail && (
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        Node Auth: {event.organizerEmail}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant="pink" className="text-[10px] font-black uppercase px-3 py-1">
                      {event.category?.[0]}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 text-[9px] font-black uppercase tracking-widest"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.coordinates.lat},${event.coordinates.lng}`, '_blank')}
                  >
                    Get Directions
                  </Button>
                </div>
              </div>

              {/* Info grid — brutalist boxes */}
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 py-6 border-y-[2.5px] border-foreground">
                <div className="flex items-center gap-3 p-3 border-[2px] border-foreground bg-brutal-yellow/20">
                    <CalendarIcon className="h-5 w-5 text-foreground" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
                      <p className="text-xs font-bold text-foreground">{formattedDate}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 border-[2px] border-foreground bg-brutal-blue/20">
                    <Clock className="h-5 w-5 text-foreground" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Time</p>
                      <p className="text-xs font-bold text-foreground">{formattedTime}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 border-[2px] border-foreground bg-brutal-pink/20">
                    <Users className="h-5 w-5 text-foreground" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Attendees</p>
                      <p className="text-xs font-bold text-foreground">{event.registeredCount || 0} Registered</p>
                    </div>
                </div>
              </div>

              {/* Organizer card */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border-[2.5px] border-foreground bg-card shadow-[3px_3px_0_0_var(--foreground)]">
                    <Avatar className="h-12 w-12 border-[2px] border-foreground">
                        <AvatarImage src={organizer?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${event.organizerName}`} />
                        <AvatarFallback className="font-black">{event.organizerName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <p className="text-[11px] font-black uppercase tracking-widest text-primary">
                             {organizer?.role === UserRole.ADMIN ? 'System Administrator' : 'Campus Node'}
                           </p>
                           {isOrgVerified && (
                             <ShieldCheck className="h-3 w-3 text-blue-500" />
                           )}
                        </div>
                        <p className="text-sm font-bold text-foreground">{event.organizerName}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{event.organizerEmail}</p>
                    </div>
                    {currentUser?.id !== organizer?.id && organizer?.id && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="h-8 px-4 font-black uppercase tracking-widest text-[9px]"
                        onClick={() => toggleFollow?.(organizer.id)}
                      >
                        {currentUser?.following?.includes(organizer.id) ? 'Following' : 'Follow'}
                      </Button>
                    )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">BRIEFING</h4>
                  <div className="text-sm text-foreground/80 leading-relaxed font-medium markdown-body">
                    <ReactMarkdown>{event.description}</ReactMarkdown>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {event.tags?.map(tag => (
                   <span key={tag} className="text-[10px] font-bold text-foreground px-2 py-1 bg-brutal-yellow/30 border-[2px] border-foreground">#{tag}</span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t-[2.5px] border-foreground">
                <Button 
                    onClick={() => !isRegistered && onRegister(event.id)}
                    disabled={isRegistered}
                    className={`w-full h-14 text-sm font-black uppercase tracking-widest transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${
                    isRegistered 
                    ? 'bg-muted text-muted-foreground cursor-default border-[2.5px] border-foreground' 
                    : 'bg-primary text-primary-foreground border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)]'
                    }`}
                >
                    {isRegistered ? '✓ REGISTERED' : 'RSVP NOW'}
                </Button>
            </div>
        </div>

        {/* Right Side: Comments */}
        <div className="w-full sm:w-[350px] flex flex-col bg-background">
            <div className="p-4 border-b-[2.5px] border-foreground bg-brutal-yellow/10">
                <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Comments ({comments.length})</h4>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {comments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground/40">
                        <MessageCircle className="h-12 w-12 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">No comments yet</p>
                        <p className="text-[10px] mt-1">Be the first to say something!</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 p-3 border-[2px] border-foreground/20 bg-card">
                            <Avatar className="h-8 w-8 shrink-0 border-[2px] border-foreground">
                                <AvatarImage src={comment.userAvatar} />
                                <AvatarFallback className="text-[10px] font-bold">{comment.userName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-foreground uppercase">{comment.userName}</span>
                                    <span className="text-[9px] font-mono text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <p className="text-xs text-foreground/90 leading-tight">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t-[2.5px] border-foreground bg-card">
                <form onSubmit={handleComment} className="relative">
                    <input 
                        type="text" 
                        placeholder="Add a comment..."
                        className="w-full h-11 bg-background border-[2.5px] border-foreground pl-4 pr-12 text-xs font-medium outline-none focus:shadow-[3px_3px_0_0_var(--foreground)] transition-shadow placeholder:text-muted-foreground/40"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={!commentText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-primary disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
                    >
                        <SendHorizontal className="h-4 w-4" />
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── EVENT CARD (Feed card) ─────────── */

export function EventCard({ event, isRegistered, onRegister, className, size = 'sm' }: EventCardProps) {
  const { toggleLike, toggleBookmark, currentUser, toggleFollow, users } = useAppContext();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  const isLiked = event.likes?.includes(currentUser?.id || '');
  const isBookmarked = currentUser?.bookmarkedEvents?.includes(event.id);
  const likeCount = event.likes?.length || 0;

  const eventDate = new Date(event.date);
  const dateStr = eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const organizer = users.find(u => u.email === event.organizerEmail || u.id === event.organizerId);

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
    <Card className={`w-full h-full border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-all overflow-hidden group/card flex flex-col relative ${className || ''}`}>
      {/* Post Media */}
      <Dialog>
        <DialogTrigger nativeButton={false} render={
          <div className="relative flex-1 w-full min-h-[140px] cursor-pointer group overflow-hidden">
            <img 
              src={event.assets?.bannerUrl || event.imageUrl} 
              className="absolute inset-0 h-full w-full object-cover select-none transition-transform duration-300 group-hover:scale-105" 
              referrerPolicy="no-referrer"
              alt={event.title}
            />
            
            {/* Category badge — top left */}
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="blue" className="text-[8px] shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">
                {event.category?.[0] || 'EVENT'}
              </Badge>
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-foreground/80 p-3">
                <h3 className={`text-background font-extrabold uppercase tracking-tight line-clamp-2 leading-tight ${
                  size === 'xl' ? 'text-xl' : 
                  size === 'lg' ? 'text-lg' : 'text-sm'
                }`}>
                  {event.title}
                </h3>
                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-background/20">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span className="text-background/70 font-bold uppercase tracking-widest text-[8px]">
                          {event.location}
                        </span>
                    </div>
                    <span className="text-background/70 font-mono uppercase tracking-widest tabular-nums text-[8px]">
                      {dateStr}
                    </span>
                </div>
            </div>
          </div>
        } />
        <DialogContent className="w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)]">
          <EventDetails event={event} isRegistered={isRegistered} onRegister={onRegister} />
        </DialogContent>
      </Dialog>

      {/* Post Info */}
      <div className="p-4 space-y-3 border-t-[2.5px] border-foreground flex-none bg-card">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border-[2px] border-foreground">
                    <AvatarImage src={organizer?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${event.organizerName}`} />
                    <AvatarFallback className="text-[8px] font-black">{event.organizerName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                    <span className="font-black text-[9px] text-foreground tracking-tight uppercase leading-none truncate max-w-[80px]">
                        {event.organizerName}
                    </span>
                    {organizer?.role === UserRole.ADMIN && (
                        <ShieldCheck className="h-2.5 w-2.5 text-red-500" />
                    )}
                    {organizer?.role === UserRole.ORGANIZER && organizer?.isApproved && (
                        <ShieldCheck className="h-2.5 w-2.5 text-blue-500" />
                    )}
                </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-0.5">
                <button 
                    onClick={() => toggleLike(event.id)}
                    className={`h-7 w-7 flex items-center justify-center border-[1.5px] border-foreground/20 transition-all active:scale-90 ${isLiked ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                    <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} strokeWidth={2.5} />
                </button>
                <Dialog>
                    <DialogTrigger nativeButton={false} render={
                        <div role="button" className="h-7 w-7 flex items-center justify-center border-[1.5px] border-foreground/20 text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer active:scale-90">
                            <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </div>
                    } />
                    <DialogContent className="w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)]">
                        <EventDetails event={event} isRegistered={isRegistered} onRegister={onRegister} />
                    </DialogContent>
                </Dialog>
                <button 
                    onClick={() => toggleBookmark(event.id)}
                    className={`h-7 w-7 flex items-center justify-center border-[1.5px] border-foreground/20 transition-all active:scale-90 ${isBookmarked ? 'text-primary bg-primary/10 border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                    <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} strokeWidth={2.5} />
                </button>
                <button 
                    onClick={handleShare}
                    className="h-7 w-7 flex items-center justify-center border-[1.5px] border-foreground/20 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90"
                >
                    <Share2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
            </div>
        </div>

        <div className="space-y-2 relative">
            <div className="text-[11px] leading-snug font-medium text-foreground/90 markdown-body line-clamp-3">
              <span className="font-black mr-2 text-foreground uppercase tracking-tight inline-block">{event.organizerName}</span>
              <ReactMarkdown>{event.description}</ReactMarkdown>
            </div>
            <div className="flex items-center justify-between pt-2 border-t-[2px] border-foreground/10">
                <span className="text-[8px] font-black uppercase tracking-[0.15em] tabular-nums text-muted-foreground">{likeCount} likes</span>
                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-muted-foreground font-mono">{dateStr}</span>
            </div>
        </div>
      </div>
    </Card>
  );
}

// Helper Ticket icon for consistency
function Ticket({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M20 12h.01" />
      <path d="M4 12h.01" />
      <path d="M10 21v-3" />
      <path d="M10 6V3" />
      <path d="M14 21v-3" />
      <path d="M14 6V3" />
      <path d="M21 12v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3" />
    </svg>
  );
}
