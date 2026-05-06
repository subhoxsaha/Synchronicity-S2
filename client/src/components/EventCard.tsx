import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar as CalendarIcon, Clock, Users, ExternalLink, ShieldCheck, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CampusEvent } from '../types';

interface EventCardProps {
  event: CampusEvent;
  isRegistered: boolean;
  onRegister: (id: string) => void;
  key?: React.Key;
}

export function EventCard({ event, isRegistered, onRegister }: EventCardProps) {
  const registrationProgress = (event.registeredCount / event.capacity) * 100;
  const isUrgent = registrationProgress > 80;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString(undefined, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = eventDate.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <Dialog>
      <DialogTrigger nativeButton={false} render={
        <Card className="overflow-hidden border-none bg-accent/20 transition-all hover:bg-accent/40 active:scale-[0.98] rounded-3xl group cursor-pointer border border-border/50">
          <CardContent className="p-0">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <img
                src={`${event.imageUrl}?q=80&w=800`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={event.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4 flex gap-2">
                {event.category.map((cat) => (
                  <Badge key={cat} className="bg-white/20 backdrop-blur-md text-white border-none text-[10px] font-bold">
                    {cat}
                  </Badge>
                ))}
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <MapPin className="h-3.5 w-3.5 text-secondary" />
                  {event.location}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-heading text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                {isRegistered && (
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none">
                    Registered
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formattedTime}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className={isUrgent ? "text-destructive flex items-center gap-1.5" : "text-muted-foreground"}>
                    {isUrgent && <div className="h-2 w-2 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                    {isUrgent ? "Selling Out Fast" : "Registration Status"}
                  </span>
                  <span className={isUrgent ? "text-destructive font-black" : ""}>{event.registeredCount} / {event.capacity}</span>
                </div>
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full blur-[2px] opacity-20 ${isUrgent ? "bg-destructive" : "bg-primary"}`} />
                  <Progress value={registrationProgress} className={`relative h-2 rounded-full overflow-hidden transition-all duration-500 bg-accent/30 ${isUrgent ? "bg-destructive/20" : ""}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      } />

      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="relative aspect-[16/10]">
           <img src={`${event.imageUrl}?q=80&w=800`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
           <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
           <div className="absolute top-6 left-6">
              <Badge className="bg-primary text-primary-foreground border-none font-bold px-3 py-1">
                Featured Event
              </Badge>
           </div>
        </div>
        
        <div className="px-8 pb-8 space-y-6 -mt-16 relative bg-background rounded-t-[2.5rem] overflow-y-auto max-h-[70vh]">
          <div className="pt-8 space-y-2">
            <div className="flex gap-2">
              {event.category.map(cat => (
                <Badge key={cat} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider">
                  {cat}
                </Badge>
              ))}
            </div>
            <DialogTitle className="font-heading text-3xl font-black tracking-tight leading-none pt-2">
              {event.title}
            </DialogTitle>
          </div>

          <DialogDescription className="text-base text-foreground/70 leading-relaxed font-medium">
            {event.description}
          </DialogDescription>

          {/* New Organizer Details Section */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/30 border border-border/50">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=Organizer`} />
              <AvatarFallback>ORG</AvatarFallback>
            </Avatar>
            <div className="grow">
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold text-foreground">Campus Activities Board</p>
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Official Organizer</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl text-primary font-bold">
              Follow
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-accent/20 border border-border/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date & Time</p>
                <p className="text-sm font-bold leading-tight">{formattedDate}</p>
                <p className="text-xs font-semibold text-muted-foreground">{formattedTime} onwards</p>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-accent/20 border border-border/30">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location</p>
                  <p className="text-sm font-bold leading-tight">{event.location}</p>
                  <p className="text-xs font-semibold text-muted-foreground">Main Campus, Student Plaza</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-bold uppercase tracking-widest border-2">
                <ExternalLink className="h-3 w-3 mr-1" />
                Map
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <Avatar key={i} className="h-10 w-10 border-4 border-background ring-2 ring-primary/5">
                    <AvatarImage src={`https://i.pravatar.cc/100?u=${i + event.id}`} />
                  </Avatar>
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[10px] font-bold border-4 border-background">
                  +12
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">Joining the party</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Includes 4 friends</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={() => !isRegistered && onRegister(event.id)}
              className={`w-full h-16 rounded-[1.5rem] text-lg font-bold shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isRegistered 
                ? 'bg-secondary text-secondary-foreground shadow-secondary/25' 
                : 'bg-primary text-primary-foreground shadow-primary/25'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {isRegistered ? (
                  <>
                    <Ticket className="h-5 w-5" />
                    View My Ticket
                  </>
                ) : (
                  <>
                    Register Now
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
