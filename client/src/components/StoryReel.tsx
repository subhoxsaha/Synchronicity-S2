import React from 'react';
import { motion } from 'motion/react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { CampusEvent } from '../types';

interface StoryReelProps {
  events: CampusEvent[];
}

export function StoryReel({ events }: StoryReelProps) {
  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-3">
        {events.slice(0, 6).map((event, idx) => (
          <CarouselItem key={event.id} className="pl-3 basis-1/3 sm:basis-1/4 md:basis-1/5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-[1.5rem] border-2 border-background shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-pointer ring-2 ring-primary/5 hover:ring-primary/20 transition-all"
            >
              <img
                src={`${event.imageUrl}?q=80&w=400`}
                alt={event.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
              
              <div className="absolute top-2 left-2">
                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
              </div>

              <div className="absolute bottom-3 left-3 right-3 space-y-1">
                <div className="text-[9px] font-black uppercase tracking-widest text-primary/90">
                  {event.category[0]}
                </div>
                <div className="text-[10px] font-bold text-white line-clamp-2 leading-tight">
                  {event.title}
                </div>
              </div>
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
