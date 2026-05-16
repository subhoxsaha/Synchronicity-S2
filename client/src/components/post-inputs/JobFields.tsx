import React from 'react';
import { Briefcase, Building2, Calendar, Link2, DollarSign } from 'lucide-react';

const JOB_TYPES = [
  { value: 'internship', label: 'Internship' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'research', label: 'Research' },
  { value: 'competition', label: 'Competition' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'fellowship', label: 'Fellowship' },
];

interface JobFieldsProps {
  jobType: string;
  onJobTypeChange: (v: string) => void;
  companyOrOrg: string;
  onCompanyChange: (v: string) => void;
  roleTitle: string;
  onRoleTitleChange: (v: string) => void;
  compensation: string;
  onCompensationChange: (v: string) => void;
  applicationLink: string;
  onAppLinkChange: (v: string) => void;
  applicationDeadline: string;
  onDeadlineChange: (v: string) => void;
  eligibility: string;
  onEligibilityChange: (v: string) => void;
}

export function JobFields({ jobType, onJobTypeChange, companyOrOrg, onCompanyChange, roleTitle, onRoleTitleChange, compensation, onCompensationChange, applicationLink, onAppLinkChange, applicationDeadline, onDeadlineChange, eligibility, onEligibilityChange }: JobFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Briefcase className="h-5 w-5 text-primary shrink-0" />
        <select className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full" value={jobType} onChange={e => onJobTypeChange(e.target.value)}>
          {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Building2 className="h-5 w-5 text-primary shrink-0" />
        <input type="text" placeholder="Company / Organization" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={companyOrOrg} onChange={e => onCompanyChange(e.target.value)} />
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Briefcase className="h-4 w-4 text-primary shrink-0" />
        <input type="text" placeholder="Role Title" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={roleTitle} onChange={e => onRoleTitleChange(e.target.value)} />
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <DollarSign className="h-5 w-5 text-primary shrink-0" />
        <input type="text" placeholder="Compensation (e.g., ₹15k/month)" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={compensation} onChange={e => onCompensationChange(e.target.value)} />
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Link2 className="h-5 w-5 text-primary shrink-0" />
        <input type="url" placeholder="Application Link (https://...)" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={applicationLink} onChange={e => onAppLinkChange(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
          <Calendar className="h-5 w-5 text-primary shrink-0" />
          <input type="date" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={applicationDeadline} onChange={e => onDeadlineChange(e.target.value)} />
        </div>
        <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
          <input type="text" placeholder="Eligibility" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={eligibility} onChange={e => onEligibilityChange(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
