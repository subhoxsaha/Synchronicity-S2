import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Briefcase, ChevronRight, Clock, Users, ExternalLink, Megaphone, Heart, MessageCircle, Share2, Bookmark, ShieldCheck, SendHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { useAppContext } from '../contexts/AppContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EventComment, UserRole, PostType } from '../types';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface AnnouncementCardProps {
  post: any;
}

interface RecruitmentCardProps {
  post: any;
}

export function PostDetails({ post, children }: { post: any, children?: React.ReactNode }) {
  const { toggleBookmark, toggleLike, currentUser, addComment, users, toggleFollow } = useAppContext();
  const [comments, setComments] = useState<EventComment[]>([]);
  const [commentText, setCommentText] = useState('');
  
  const isBookmarked = currentUser?.bookmarkedEvents?.includes(post.id);
  const isLiked = post.likes?.includes(currentUser?.id || '');

  const organizer = users.find(u => u.email === post.organizerEmail || u.id === post.organizerId);
  const isOrgVerified = organizer?.isApproved && organizer?.role !== UserRole.STUDENT;

  const displayName = post.organizationName || post.organizerName || post.organizerId || 'Unknown';
  const displayLogo = post.organizationLogo || organizer?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  useEffect(() => {
    const q = query(
      collection(db, 'comments'), 
      where('eventId', '==', post.id),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => doc.data() as EventComment));
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/share/${post.id}`;
    const shareData = {
      title: post.title,
      text: post.description,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard', {
          className: 'font-mono uppercase tracking-widest text-[10px]'
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] sm:h-[85vh] bg-background">
      <div className="relative p-5 sm:p-8 shrink-0 border-b-[3px] border-foreground bg-accent/5">
         <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex gap-1.5 sm:gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(post.id);
              }}
              className={`h-9 w-9 sm:h-11 sm:w-11 flex items-center justify-center border-[2px] sm:border-[2.5px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] sm:shadow-[3px_3px_0_0_var(--foreground)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                isLiked ? 'bg-red-500 text-white' : 'bg-background text-foreground hover:bg-red-50'
              }`}
            >
              <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(post.id);
              }}
              className={`h-9 w-9 sm:h-11 sm:w-11 flex items-center justify-center border-[2px] sm:border-[2.5px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] sm:shadow-[3px_3px_0_0_var(--foreground)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                isBookmarked ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-brutal-yellow/30'
              }`}
            >
              <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="h-9 w-9 sm:h-11 sm:w-11 flex items-center justify-center bg-background text-foreground border-[2px] sm:border-[2.5px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] sm:shadow-[3px_3px_0_0_var(--foreground)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-brutal-blue/30"
            >
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
         </div>

         <div className="space-y-3 sm:space-y-4 pt-10 sm:pt-0 max-w-3xl">
           <DialogTitle className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-foreground uppercase pr-24">
             {post.title}
           </DialogTitle>
           {post.type === PostType.ANNOUNCEMENT && post.priority && (
              <Badge variant={post.priority === 'high' ? 'pink' : 'default'} className="text-[10px]">
                {post.priority === 'high' ? (
                  <><AlertCircle className="h-3 w-3 mr-1 animate-pulse" /> URGENT</>
                ) : (
                  <><Megaphone className="h-3 w-3 mr-1" /> ANNOUNCEMENT</>
                )}
              </Badge>
           )}
           {post.type === PostType.RECRUITMENT && (
              <Badge variant="blue" className="text-[10px]">
                 <Briefcase className="h-3 w-3 mr-1" /> RECRUITMENT
              </Badge>
           )}
         </div>
      </div>
      
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Left Side: Post Info */}
        <div className="flex-1 p-5 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto no-scrollbar border-b sm:border-b-0 sm:border-r-[3px] border-foreground">
            
            {/* Custom info injected based on post type */}
            {children}

            {/* Organizer card */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border-[2.5px] border-foreground bg-card shadow-[3px_3px_0_0_var(--foreground)]">
                  <Avatar className="h-12 w-12 border-[2px] border-foreground">
                      <AvatarImage src={displayLogo} />
                      <AvatarFallback className="font-black">{(displayName)[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                      <div className="flex items-center gap-2">
                         <p className="text-[11px] font-black uppercase tracking-widest text-primary">
                           {post.organizationName ? 'Organization' : organizer?.role === UserRole.PLATFORM_ADMIN ? 'System Administrator' : 'Campus Node'}
                         </p>
                         {isOrgVerified && (
                           <ShieldCheck className="h-3 w-3 text-blue-500" />
                         )}
                      </div>
                      <p className="text-sm font-bold text-foreground">{displayName}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{post.organizerEmail}</p>
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
                  <ReactMarkdown>{post.description || ''}</ReactMarkdown>
                </div>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map((tag: string) => (
                   <span key={tag} className="text-[10px] font-bold text-foreground px-2 py-1 bg-brutal-yellow/30 border-[2px] border-foreground">#{tag}</span>
                ))}
              </div>
            )}
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
                                <AvatarFallback className="text-[10px] font-bold">{(comment.userName || '?')[0]}</AvatarFallback>
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

export function AnnouncementCard({ post }: AnnouncementCardProps) {
  const { toggleLike } = useAppContext();
  const isUrgent = post.tags?.includes('urgent');
  const priority = post.priority || (isUrgent ? 'high' : 'medium');
  
  const priorityAccent = {
    high: 'bg-red-500',
    medium: 'bg-brutal-yellow',
    low: 'bg-muted',
  };

  const priorityBorder = {
    high: 'border-red-500',
    medium: 'border-foreground',
    low: 'border-foreground',
  };

  const isLiked = post.likes?.includes(post.organizerId || '');

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/share/${post.id}`;
    // same share logic
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard', {
        className: 'font-mono uppercase tracking-widest text-[10px]'
    });
  };

  return (
    <Dialog>
      <DialogTrigger render={
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full cursor-pointer"
        />
      }>
          <Card className={`overflow-hidden border-[2.5px] ${priorityBorder[priority as keyof typeof priorityBorder] || 'border-foreground'} bg-card shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-all group h-full flex flex-col`}>
            <CardContent className="p-0 flex flex-col h-full">
              {/* Top accent bar */}
              <div className={`h-2 w-full ${priorityAccent[priority as keyof typeof priorityAccent] || priorityAccent.medium}`} />
              
              <div className="p-5 space-y-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={priority === 'high' ? 'pink' : 'default'} className="text-[8px]">
                        {priority === 'high' ? (
                          <><AlertCircle className="h-3 w-3 mr-1 animate-pulse" /> URGENT</>
                        ) : (
                          <><Megaphone className="h-3 w-3 mr-1" /> ANNOUNCEMENT</>
                        )}
                      </Badge>
                      <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-widest tabular-nums">
                        {new Date(post.date || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold leading-tight line-clamp-2 tracking-tight uppercase group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-medium">{post.description}</p>
                  </div>
                  
                  {/* Icon block */}
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center shrink-0 border-[2px] sm:border-[2.5px] border-foreground ${priority === 'high' ? 'bg-red-500/20' : 'bg-brutal-yellow/30'}`}>
                    <Megaphone className={`h-5 w-5 sm:h-6 sm:w-6 ${priority === 'high' ? 'text-red-500' : 'text-foreground'}`} />
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-[9px] font-bold text-foreground px-2 py-0.5 bg-brutal-yellow/20 border-[1.5px] border-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t-[2px] border-foreground/20 mt-auto">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border-[2px] border-foreground">
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-black uppercase">
                        {(post.organizationName || post.organizerName || post.organizerId || 'O')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate max-w-[120px]">
                      {post.organizationName || post.organizerName || post.organizerId || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }} className={`h-7 w-7 flex items-center justify-center border-[1.5px] border-foreground/20 transition-all active:scale-90 ${isLiked ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} strokeWidth={2.5} />
                    </button>
                    <button onClick={handleShare} className="h-7 w-7 flex items-center justify-center border-[1.5px] border-foreground/20 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90">
                      <Share2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)]">
         <PostDetails post={post} />
      </DialogContent>
    </Dialog>
  );
}

export function RecruitmentCard({ post }: RecruitmentCardProps) {
  const daysLeft = post.deadline 
    ? Math.max(0, Math.ceil((new Date(post.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
    
  const isClosing = daysLeft !== null && daysLeft <= 3;

  return (
    <Dialog>
      <DialogTrigger render={
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full cursor-pointer"
        />
      }>
          <Card className="overflow-hidden border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-all group h-full flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              {/* Header */}
              <div className="bg-brutal-blue/20 p-5 border-b-[2.5px] border-foreground relative overflow-hidden">
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex items-center justify-center border-[2.5px] border-foreground bg-brutal-blue/30 shadow-[2px_2px_0_0_var(--foreground)]">
                      <Briefcase className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                      <Badge variant="blue" className="text-[8px] mb-1.5">
                        RECRUITMENT
                      </Badge>
                      <h3 className="text-lg font-extrabold leading-tight tracking-tight uppercase group-hover:text-primary transition-colors">{post.title}</h3>
                    </div>
                  </div>
                  {isClosing && (
                    <Badge variant="pink" className="text-[8px] animate-pulse shrink-0">
                      <Clock className="h-3 w-3 mr-1" /> CLOSING
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="p-5 space-y-4 flex-1 flex flex-col">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border-[2px] border-foreground bg-muted/20">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Role</p>
                    <p className="text-xs font-bold text-foreground line-clamp-1">{post.role || post.roles?.[0] || 'Core Member'}</p>
                  </div>
                  <div className={`p-3 border-[2px] border-foreground ${isClosing ? 'bg-red-500/10' : 'bg-brutal-green/20'}`}>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Deadline</p>
                    <p className={`text-xs font-bold ${isClosing ? 'text-red-500' : 'text-foreground'}`}>
                      {daysLeft !== null ? (daysLeft === 0 ? 'Today' : `In ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`) : 'Open'}
                    </p>
                  </div>
                </div>

                {/* Eligibility */}
                {post.eligibility && (
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Eligibility</p>
                    <p className="text-[11px] text-foreground/80 line-clamp-2">{post.eligibility}</p>
                  </div>
                )}

                {/* Description */}
                {post.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{post.description}</p>
                )}

                {/* Organizer */}
                <div className="flex items-center gap-2 pt-2 border-t-[2px] border-foreground/20">
                  <Avatar className="h-5 w-5 border-[1.5px] border-foreground">
                    <AvatarFallback className="text-[7px] bg-brutal-blue/20 text-foreground font-black uppercase">
                      {(post.organizationName || post.organizerName || post.organizerId || 'O')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                    {post.organizationName || post.organizerName || post.organizerId || 'Unknown'}
                  </span>
                </div>

                {/* CTA */}
                <Button 
                  className="w-full h-11 text-[10px] font-black uppercase tracking-widest mt-auto group/btn"
                  variant="default"
                >
                  Apply Now 
                  <ChevronRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)]">
         <PostDetails post={post}>
             <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 py-6 border-b-[2.5px] border-foreground mb-6">
                <div className="flex items-center gap-3 p-3 border-[2px] border-foreground bg-brutal-yellow/20">
                    <Briefcase className="h-5 w-5 text-foreground" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Roles</p>
                      <p className="text-xs font-bold text-foreground">{post.roles?.join(', ') || post.role || 'Core Member'}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-3 p-3 border-[2px] border-foreground ${isClosing ? 'bg-red-500/10' : 'bg-brutal-green/20'}`}>
                    <Clock className="h-5 w-5 text-foreground" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Deadline</p>
                      <p className={`text-xs font-bold ${isClosing ? 'text-red-500' : 'text-foreground'}`}>
                          {daysLeft !== null ? (daysLeft === 0 ? 'Today' : `In ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`) : 'Open'}
                      </p>
                    </div>
                </div>
                {post.eligibility && (
                    <div className="col-span-1 xs:col-span-2 flex items-center gap-3 p-3 border-[2px] border-foreground bg-accent/10">
                        <Users className="h-5 w-5 text-foreground" />
                        <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Eligibility</p>
                        <p className="text-xs font-bold text-foreground">{post.eligibility}</p>
                        </div>
                    </div>
                )}
             </div>
             
             {post.applicationUrl && (
                <div className="pt-2 mb-6">
                    <Button 
                        onClick={() => window.open(post.applicationUrl, '_blank')}
                        className="w-full h-14 bg-brutal-blue text-white border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] text-sm font-black uppercase tracking-widest transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                    >
                        Application Form <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                </div>
             )}
         </PostDetails>
      </DialogContent>
    </Dialog>
  );
}

export function GenericPostCard({ post }: { post: any }) {
  const { toggleLike } = useAppContext();
  const isLiked = post.likes?.includes(post.organizerId || '');

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/share/${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard', {
        className: 'font-mono uppercase tracking-widest text-[10px]'
    });
  };

  return (
    <Dialog>
      <DialogTrigger render={
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full cursor-pointer"
        />
      }>
          <Card className={`overflow-hidden border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-all group h-full flex flex-col`}>
            {post.imageUrl && (
              <div className="w-full h-32 overflow-hidden border-b-[2.5px] border-foreground bg-accent/10 relative">
                 <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={post.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            )}
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-5 space-y-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-background text-[8px]">
                        {post.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-widest tabular-nums">
                        {new Date(post.date || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold leading-tight line-clamp-2 tracking-tight uppercase group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-medium">{post.description}</p>
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="text-[9px] font-bold text-foreground px-2 py-0.5 bg-accent/30 border-[1.5px] border-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t-[2px] border-foreground/20 mt-auto">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border-[2px] border-foreground">
                      <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-black uppercase">
                        {(post.organizationName || post.organizerName || post.organizerId || 'O')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate max-w-[120px]">
                      {post.organizationName || post.organizerName || post.organizerId || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }} className={`h-7 w-7 flex items-center justify-center border-[1.5px] border-foreground/20 transition-all active:scale-90 ${isLiked ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} strokeWidth={2.5} />
                    </button>
                    <button onClick={handleShare} className="h-7 w-7 flex items-center justify-center border-[1.5px] border-foreground/20 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90">
                      <Share2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)]">
         <PostDetails post={post} />
      </DialogContent>
    </Dialog>
  );
}
