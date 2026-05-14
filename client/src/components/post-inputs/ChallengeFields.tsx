import React from 'react';
import { Calendar, Trophy, FileText, Link2 } from 'lucide-react';

interface ChallengeFieldsProps {
  startDate: string;
  onStartChange: (v: string) => void;
  endDate: string;
  onEndChange: (v: string) => void;
  instructions: string;
  onInstructionsChange: (v: string) => void;
  prize: string;
  onPrizeChange: (v: string) => void;
  submissionMethod: string;
  onMethodChange: (v: string) => void;
  submissionUrl: string;
  onUrlChange: (v: string) => void;
}

export function ChallengeFields({ startDate, onStartChange, endDate, onEndChange, instructions, onInstructionsChange, prize, onPrizeChange, submissionMethod, onMethodChange, submissionUrl, onUrlChange }: ChallengeFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <div className="w-full">
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Start</span>
            <input type="date" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={startDate} onChange={e => onStartChange(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <div className="w-full">
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">End</span>
            <input type="date" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={endDate} onChange={e => onEndChange(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="bg-accent/10 rounded-2xl p-3 border border-border/20">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Instructions</span>
        </div>
        <textarea placeholder="How to participate..." className="bg-transparent border-none outline-none text-xs font-medium w-full min-h-[60px] resize-none" value={instructions} onChange={e => onInstructionsChange(e.target.value)} />
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Trophy className="h-5 w-5 text-primary shrink-0" />
        <input type="text" placeholder="Prize (optional)" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={prize} onChange={e => onPrizeChange(e.target.value)} />
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <select className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-1/2" value={submissionMethod} onChange={e => onMethodChange(e.target.value)}>
          <option value="in_app">In-App</option>
          <option value="link">External Link</option>
          <option value="promise">Honor System</option>
        </select>
        {submissionMethod === 'link' && (
          <input type="url" placeholder="Submission URL" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={submissionUrl} onChange={e => onUrlChange(e.target.value)} />
        )}
      </div>
    </div>
  );
}
