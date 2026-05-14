import React from 'react';
import {
  Calendar as CalendarIcon, Clock, Users, MapPin, Link2,
  Briefcase, DollarSign, Trophy, Search, Package,
  Rocket, FileText, BarChart3, Image, Phone, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampusEvent, PostType } from '../../types';

interface PostDetailInfoProps {
  event: CampusEvent;
  isRegistered?: boolean;
  onRegister?: (id: string) => void;
  compact?: boolean;
  hideExtra?: boolean;
  hideCTA?: boolean;
}

function InfoBox({ icon: Icon, label, value, bg, compact }: { icon: any; label: string; value: string; bg: string; compact?: boolean }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2.5 p-2.5 sm:p-3' : 'gap-3 p-3'} border-[2px] border-foreground ${bg}`}>
      <Icon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-foreground shrink-0`} strokeWidth={2.5} />
      <div className="min-w-0">
        <p className={`${compact ? 'text-[8px]' : 'text-[9px]'} font-black uppercase tracking-widest text-muted-foreground`}>{label}</p>
        <p className={`${compact ? 'text-[10px] sm:text-xs' : 'text-xs'} font-bold text-foreground truncate`}>{value}</p>
      </div>
    </div>
  );
}

export function PostDetailInfo({ event, isRegistered, onRegister, compact, hideExtra, hideCTA }: PostDetailInfoProps) {
  const ev = event as any;
  const eventDate = event.date ? new Date(event.date) : null;
  const isValidDate = eventDate && !isNaN(eventDate.getTime());
  const formattedDate = isValidDate ? eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD';
  const formattedTime = isValidDate ? eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';

  const type = event.type as PostType;

  // ── Type-specific info grids ──
  const renderInfoGrid = () => {
    switch (type) {
      case PostType.EVENT:
        return (
          <>
            <InfoBox icon={CalendarIcon} label="Date" value={formattedDate} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={Clock} label="Time" value={formattedTime || 'TBD'} bg="bg-brutal-blue/20" compact={compact} />
            <InfoBox icon={Users} label="Attendees" value={`${event.registeredCount || 0} Registered`} bg="bg-brutal-pink/20" compact={compact} />
          </>
        );
      case PostType.WEBINAR:
        return (
          <>
            <InfoBox icon={CalendarIcon} label="Date" value={formattedDate} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={Clock} label="Time" value={formattedTime || 'TBD'} bg="bg-brutal-blue/20" compact={compact} />
            <InfoBox icon={Link2} label="Platform" value={ev.platform || 'Online'} bg="bg-brutal-pink/20" compact={compact} />
          </>
        );
      case PostType.RECRUITMENT:
        return (
          <>
            <InfoBox icon={Users} label="Roles" value={Array.isArray(ev.roles) ? ev.roles.join(', ') : ev.roles || 'Open'} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={CalendarIcon} label="Deadline" value={ev.deadline ? new Date(ev.deadline).toLocaleDateString() : 'Rolling'} bg="bg-brutal-blue/20" compact={compact} />
            <InfoBox icon={Briefcase} label="Eligibility" value={ev.eligibility || 'All welcome'} bg="bg-brutal-pink/20" compact={compact} />
          </>
        );
      case PostType.ANNOUNCEMENT:
        return (
          <InfoBox icon={CalendarIcon} label="Priority" value={(ev.priority || 'medium').toUpperCase()} bg={ev.priority === 'high' ? 'bg-red-100' : 'bg-brutal-yellow/20'} compact={compact} />
        );
      case PostType.POLL:
        return (
          <>
            <InfoBox icon={BarChart3} label="Questions" value={`${ev.questions?.length || ev.pollQuestions?.length || 0}`} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={CalendarIcon} label="Deadline" value={ev.responseDeadline || ev.pollDeadline || 'No deadline'} bg="bg-brutal-blue/20" compact={compact} />
            <InfoBox icon={Users} label="Responses" value={ev.isAnonymous ? 'Anonymous' : 'Named'} bg="bg-brutal-pink/20" compact={compact} />
          </>
        );
      case PostType.RESOURCE:
        return (
          <>
            <InfoBox icon={FileText} label="Type" value={(ev.resourceType || 'resource').replace(/_/g, ' ').toUpperCase()} bg="bg-brutal-yellow/20" compact={compact} />
            {ev.resourceUrl && <InfoBox icon={Link2} label="Link" value="Open Resource" bg="bg-brutal-blue/20" compact={compact} />}
          </>
        );
      case PostType.LOST_FOUND:
        return (
          <>
            <InfoBox icon={Search} label="Status" value={(ev.itemType || 'lost') === 'lost' ? '🔍 LOST' : '📦 FOUND'} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={MapPin} label="Location" value={ev.lastSeenLocation || ev.currentLocation || 'Unknown'} bg="bg-brutal-blue/20" compact={compact} />
            <InfoBox icon={Package} label="Item" value={ev.itemDescription || 'See description'} bg="bg-brutal-pink/20" compact={compact} />
            <InfoBox icon={Phone} label="Contact via" value={(ev.contactMethod || 'in_app').replace('_', ' ').toUpperCase()} bg="bg-brutal-yellow/20" compact={compact} />
            {ev.contactInfo && <InfoBox icon={Link2} label="Contact Details" value={ev.contactInfo} bg="bg-brutal-blue/20" compact={compact} />}
          </>
        );
      case PostType.BUY_SELL:
        return (
          <>
            <InfoBox icon={DollarSign} label="Price" value={ev.isFree ? 'FREE' : ev.price ? `₹${ev.price}` : 'Negotiable'} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={Package} label="Condition" value={(ev.condition || 'good').replace('_', ' ').toUpperCase()} bg="bg-brutal-blue/20" compact={compact} />
            <InfoBox icon={Users} label="Type" value={(ev.listingType || 'sell').toUpperCase()} bg="bg-brutal-pink/20" compact={compact} />
            <InfoBox icon={Phone} label="Contact via" value={(ev.contactMethod || 'in_app').replace('_', ' ').toUpperCase()} bg="bg-brutal-yellow/20" compact={compact} />
            {ev.contactInfo && <InfoBox icon={Link2} label="Contact Details" value={ev.contactInfo} bg="bg-brutal-blue/20" compact={compact} />}
          </>
        );
      case PostType.JOB:
        return (
          <>
            <InfoBox icon={Briefcase} label="Role" value={ev.roleTitle || 'Open Role'} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={Building2} label="Company" value={ev.companyOrOrg || 'Unknown'} bg="bg-brutal-blue/20" compact={compact} />
            <InfoBox icon={Briefcase} label="Job Type" value={(ev.jobType || 'opportunity').replace(/_/g, ' ').toUpperCase()} bg="bg-brutal-pink/20" compact={compact} />
            <InfoBox icon={DollarSign} label="Compensation" value={ev.compensation || 'Not specified'} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={Users} label="Eligibility" value={ev.eligibility || 'Open'} bg="bg-brutal-blue/20" compact={compact} />
            <InfoBox icon={CalendarIcon} label="Deadline" value={ev.applicationDeadline ? new Date(ev.applicationDeadline).toLocaleDateString() : 'Rolling'} bg="bg-brutal-pink/20" compact={compact} />
          </>
        );
      case PostType.CHALLENGE:
        return (
          <>
            <InfoBox icon={Trophy} label="Prize" value={ev.prize || 'Recognition'} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={CalendarIcon} label="Start" value={ev.challengeStartDate || ev.startDate || 'TBA'} bg="bg-brutal-blue/20" compact={compact} />
            <InfoBox icon={CalendarIcon} label="End" value={ev.challengeEndDate || ev.endDate || 'TBA'} bg="bg-brutal-pink/20" compact={compact} />
            <InfoBox icon={Link2} label="Submission" value={(ev.submissionMethod || 'in_app').replace('_', ' ').toUpperCase()} bg="bg-brutal-yellow/20" compact={compact} />
          </>
        );
      case PostType.PROJECT:
        return (
          <>
            <InfoBox icon={Rocket} label="Type" value={(ev.projectType || 'project').replace(/_/g, ' ').toUpperCase()} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={BarChart3} label="Status" value={(ev.currentStatus || 'idea').replace(/_/g, ' ').toUpperCase()} bg="bg-brutal-blue/20" compact={compact} />
            <InfoBox icon={Users} label="Roles" value={Array.isArray(ev.rolesNeeded) ? ev.rolesNeeded.join(', ') : ev.rolesNeeded || 'Contributors'} bg="bg-brutal-pink/20" compact={compact} />
            <InfoBox icon={Users} label="Team" value={`${ev.currentTeamSize || 1} members`} bg="bg-brutal-yellow/20" compact={compact} />
            <InfoBox icon={Clock} label="Commitment" value={ev.commitment || 'Flexible'} bg="bg-brutal-blue/20" compact={compact} />
          </>
        );
      case PostType.GALLERY:
        return (
          <InfoBox icon={Image} label="Photos" value={`${ev.galleryImages?.length || ev.images?.length || 0} images`} bg="bg-brutal-yellow/20" compact={compact} />
        );
      case PostType.TIMETABLE:
        return (
          <InfoBox icon={CalendarIcon} label="Type" value={(ev.scheduleType || 'schedule').replace(/_/g, ' ').toUpperCase()} bg="bg-brutal-yellow/20" compact={compact} />
        );
      default:
        return (
          <InfoBox icon={CalendarIcon} label="Posted" value={formattedDate} bg="bg-brutal-yellow/20" compact={compact} />
        );
    }
  };

  // ── Type-specific CTA ──
  const renderCTA = () => {
    switch (type) {
      case PostType.EVENT:
      case PostType.WEBINAR:
        return (
          <Button onClick={() => !isRegistered && onRegister && onRegister(event.id)} disabled={isRegistered}
            className={`w-full h-14 text-sm font-black uppercase tracking-widest transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ${isRegistered ? 'bg-muted text-muted-foreground cursor-default border-[2.5px] border-foreground' : 'bg-primary text-primary-foreground border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)]'}`}
          >{isRegistered ? '✓ REGISTERED' : type === PostType.WEBINAR ? 'JOIN WEBINAR' : 'RSVP NOW'}</Button>
        );
      case PostType.RECRUITMENT:
        return (
          <Button onClick={() => ev.applicationUrl && window.open(ev.applicationUrl, '_blank')}
            className="w-full h-14 text-sm font-black uppercase tracking-widest bg-primary text-primary-foreground border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >APPLY NOW →</Button>
        );
      case PostType.JOB:
        return (
          <Button onClick={() => ev.applicationLink && window.open(ev.applicationLink, '_blank')}
            className="w-full h-14 text-sm font-black uppercase tracking-widest bg-primary text-primary-foreground border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >APPLY NOW →</Button>
        );
      case PostType.RESOURCE:
        return ev.resourceUrl ? (
          <Button onClick={() => window.open(ev.resourceUrl, '_blank')}
            className="w-full h-14 text-sm font-black uppercase tracking-widest bg-primary text-primary-foreground border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)]"
          >OPEN RESOURCE →</Button>
        ) : null;
      case PostType.BUY_SELL:
      case PostType.LOST_FOUND:
        return (
          <Button onClick={() => { /* Handle contact logic if in_app */ }}
            className="w-full h-14 text-sm font-black uppercase tracking-widest bg-primary text-primary-foreground border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)]"
          >CONTACT POSTER</Button>
        );
      case PostType.CHALLENGE:
        return (
          <Button onClick={() => ev.submissionUrl && window.open(ev.submissionUrl, '_blank')}
            className="w-full h-14 text-sm font-black uppercase tracking-widest bg-primary text-primary-foreground border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)]"
          >PARTICIPATE →</Button>
        );
      case PostType.PROJECT:
        return (
          <Button onClick={() => !isRegistered && onRegister && onRegister(event.id)} disabled={isRegistered}
            className={`w-full h-14 text-sm font-black uppercase tracking-widest ${isRegistered ? 'bg-muted text-muted-foreground cursor-default border-[2.5px] border-foreground' : 'bg-primary text-primary-foreground border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)]'}`}
          >{isRegistered ? '✓ JOINED' : 'JOIN PROJECT'}</Button>
        );
      default:
        return null;
    }
  };

  // ── Type-specific extra content (gallery, challenge instructions, etc.) ──
  const renderExtraContent = () => {
    if (type === PostType.POLL) {
      const qs = ev.questions || ev.pollQuestions;
      if (qs?.length) {
        return (
          <div className="space-y-2 mt-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3">POLL QUESTIONS</h4>
            <div className="space-y-3">
              {qs.map((q: any, i: number) => (
                <div key={i} className="border-[2px] border-foreground p-3 space-y-2 bg-card shadow-[2px_2px_0_0_var(--foreground)]">
                  <p className="text-xs font-black uppercase leading-tight">{q.question}</p>
                  <div className="space-y-1 pt-1">
                    {q.options?.map((opt: string, oi: number) => (
                      <button key={oi} className="w-full text-left px-3 py-2 text-xs font-bold border-[1.5px] border-foreground/40 bg-background hover:bg-brutal-yellow/20 hover:border-foreground transition-all">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    const imgs = ev.galleryImages || ev.images;
    if (type === PostType.GALLERY && imgs?.length) {
      return (
        <div className="space-y-2 mt-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">GALLERY</h4>
          <div className="grid grid-cols-2 gap-2">
            {imgs.map((img: any, i: number) => (
              <div key={i} className="border-[2px] border-foreground overflow-hidden aspect-square shadow-[2px_2px_0_0_var(--foreground)]">
                <img src={img.url || img} alt={img.caption || ''} className="h-full w-full object-cover" />
                {img.caption && <p className="text-[9px] font-bold p-1 bg-background border-t-[2px] border-foreground truncate">{img.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (type === PostType.CHALLENGE && ev.instructions) {
      return (
        <div className="space-y-2 mt-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">HOW TO PARTICIPATE</h4>
          <div className="p-3 border-[2px] border-foreground bg-brutal-yellow/10 text-xs font-medium leading-relaxed shadow-[2px_2px_0_0_var(--foreground)]">{ev.instructions}</div>
        </div>
      );
    }
    if (type === PostType.PROJECT && ev.howToJoin) {
      return (
        <div className="space-y-2 mt-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">HOW TO JOIN</h4>
          <div className="p-3 border-[2px] border-foreground bg-brutal-blue/10 text-xs font-medium leading-relaxed shadow-[2px_2px_0_0_var(--foreground)]">{ev.howToJoin}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Info grid */}
      <div className={`grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 ${compact ? 'gap-2' : 'gap-3 py-6 border-y-[2.5px] border-foreground'}`}>
        {renderInfoGrid()}
      </div>

      {/* Extra content */}
      {!hideExtra && renderExtraContent()}

      {/* CTA */}
      {!hideCTA && (
        <div className="pt-6 border-t-[2.5px] border-foreground mt-4">
          {renderCTA()}
        </div>
      )}
    </>
  );
}
