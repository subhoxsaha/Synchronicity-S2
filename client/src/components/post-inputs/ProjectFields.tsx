import React from 'react';
import { Rocket, Users, Clock, FileText } from 'lucide-react';

const PROJECT_TYPES = [
  { value: 'open_source', label: 'Open Source' },
  { value: 'research', label: 'Research' },
  { value: 'publication', label: 'Publication' },
  { value: 'media', label: 'Media' },
  { value: 'social', label: 'Social Impact' },
  { value: 'startup', label: 'Startup' },
];

const PROJECT_STATUS = [
  { value: 'idea', label: '💡 Idea' },
  { value: 'in_progress', label: '🔨 In Progress' },
  { value: 'active', label: '✅ Active' },
  { value: 'completed', label: '🏁 Completed' },
];

interface ProjectFieldsProps {
  projectType: string;
  onTypeChange: (v: string) => void;
  currentStatus: string;
  onStatusChange: (v: string) => void;
  rolesNeeded: string;
  onRolesChange: (v: string) => void;
  commitment: string;
  onCommitmentChange: (v: string) => void;
  howToJoin: string;
  onHowToJoinChange: (v: string) => void;
}

export function ProjectFields({ projectType, onTypeChange, currentStatus, onStatusChange, rolesNeeded, onRolesChange, commitment, onCommitmentChange, howToJoin, onHowToJoinChange }: ProjectFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
          <Rocket className="h-4 w-4 text-primary shrink-0" />
          <select className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full" value={projectType} onChange={e => onTypeChange(e.target.value)}>
            {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
          <select className="bg-transparent border-none outline-none text-xs font-bold w-full" value={currentStatus} onChange={e => onStatusChange(e.target.value)}>
            {PROJECT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Users className="h-5 w-5 text-primary shrink-0" />
        <input type="text" placeholder="Roles needed (comma separated)" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={rolesNeeded} onChange={e => onRolesChange(e.target.value)} />
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Clock className="h-5 w-5 text-primary shrink-0" />
        <input type="text" placeholder="Time commitment (e.g., 5 hrs/week)" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={commitment} onChange={e => onCommitmentChange(e.target.value)} />
      </div>
      <div className="bg-accent/10 rounded-2xl p-3 border border-border/20">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">How to Join</span>
        </div>
        <textarea placeholder="Instructions for interested contributors..." className="bg-transparent border-none outline-none text-xs font-medium w-full min-h-[50px] resize-none" value={howToJoin} onChange={e => onHowToJoinChange(e.target.value)} />
      </div>
    </div>
  );
}
