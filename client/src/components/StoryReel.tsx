import React from 'react';
import { motion } from 'motion/react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { CampusEvent } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '../contexts/AppContext';

interface StoryReelProps {
  events: CampusEvent[];
}

export function StoryReel({ events }: StoryReelProps) {
  const { users } = useAppContext();
  
  // Find users who have posts
  const usersWithPosts = users.filter(user => 
    events.some(event => event.organizerId === user.id || event.organizerEmail === user.email)
  );

  // If not enough users, just use some mock stories or first few users
  const displayStories = usersWithPosts.length > 0 ? usersWithPosts : users.slice(0, 8);

  if (displayStories.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground/30">
        <p className="text-[10px] font-black uppercase tracking-widest">No organizations to display</p>
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-1">
        {displayStories.map((user, idx) => {
          const hasPost = events.some(e => e.organizerId === user.id || e.organizerEmail === user.email);
          
          return (
            <CarouselItem key={user.id} className="pl-4 basis-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col items-center gap-2 cursor-pointer group relative"
              >
                <div className={`p-1 border-[2.5px] border-foreground bg-background transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                  hasPost 
                    ? 'shadow-[3px_3px_0_0_var(--primary)] hover:shadow-[5px_5px_0_0_var(--primary)]' 
                    : 'shadow-[3px_3px_0_0_var(--foreground)] hover:shadow-[5px_5px_0_0_var(--foreground)]'
                }`}>
                  <Avatar className="h-14 w-14 md:h-16 md:w-16 rounded-none">
                    <AvatarImage src={user.avatar} className="object-cover" />
                    <AvatarFallback className="font-black text-xs bg-card text-foreground uppercase tracking-widest">{(user.name || '?')[0]}</AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Notification dot — brutalist square */}
                {hasPost && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 h-4 w-4 bg-brutal-yellow border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)]" 
                  />
                )}
                
                <span className="text-[10px] font-black text-foreground max-w-[70px] truncate uppercase tracking-widest text-center">
                  {user.name.split(' ')[0]}
                </span>
              </motion.div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
