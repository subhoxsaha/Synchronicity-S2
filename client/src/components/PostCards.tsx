import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Briefcase, ChevronRight, Clock, Users, ExternalLink, Megaphone, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AnnouncementPost, RecruitmentPost, PostType } from '../types';

interface AnnouncementCardProps {
  post: {
    id: string;
    title: string;
    description: string;
    tags?: string[];
    date?: string;
    organizerId?: string;
    priority?: 'low' | 'medium' | 'high';
    expiresAt?: string;
  };
}

interface RecruitmentCardProps {
  post: {
    id: string;
    title: string;
    description?: string;
    role?: string;
    roles?: string[];
    deadline?: string;
    date?: string;
    organizerId?: string;
    applicationUrl?: string;
    eligibility?: string;
  };
}

export function AnnouncementCard({ post }: AnnouncementCardProps) {
  const isUrgent = post.tags?.includes('urgent');
  const priority = (post as any).priority || (isUrgent ? 'high' : 'medium');
  
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card className={`overflow-hidden border-[2.5px] ${priorityBorder[priority as keyof typeof priorityBorder] || 'border-foreground'} bg-card shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-all group h-full`}>
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
                <h3 className="text-xl font-extrabold leading-tight line-clamp-2 tracking-tight uppercase group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-medium">{post.description}</p>
              </div>
              
              {/* Icon block */}
              <div className={`h-12 w-12 flex items-center justify-center shrink-0 border-[2.5px] border-foreground ${priority === 'high' ? 'bg-red-500/20' : 'bg-brutal-yellow/30'}`}>
                <Megaphone className={`h-6 w-6 ${priority === 'high' ? 'text-red-500' : 'text-foreground'}`} />
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(tag => (
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
                    {(post.organizerId || 'O')[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate max-w-[120px]">
                  {post.organizerId || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <button className="h-7 w-7 flex items-center justify-center border-[1.5px] border-foreground/20 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90">
                  <Heart className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
                <button className="h-7 w-7 flex items-center justify-center border-[1.5px] border-foreground/20 text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90">
                  <Share2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RecruitmentCard({ post }: RecruitmentCardProps) {
  const daysLeft = post.deadline 
    ? Math.max(0, Math.ceil((new Date(post.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
    
  const isClosing = daysLeft !== null && daysLeft <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
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
                  {(post.organizerId || 'O')[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                {post.organizerId || 'Unknown'}
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
    </motion.div>
  );
}
