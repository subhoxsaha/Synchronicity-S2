import React from 'react';
import { Link2, FileText } from 'lucide-react';

const RESOURCE_TYPES = [
  { value: 'study_material', label: 'Study Material' },
  { value: 'recording', label: 'Recording' },
  { value: 'tool', label: 'Tool / Software' },
  { value: 'template', label: 'Template' },
  { value: 'reading_list', label: 'Reading List' },
  { value: 'job_listing', label: 'Job Listing' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'official_notice', label: 'Official Notice' },
];

interface ResourceFieldsProps {
  resourceType: string;
  onTypeChange: (v: string) => void;
  url: string;
  onUrlChange: (v: string) => void;
}

export function ResourceFields({ resourceType, onTypeChange, url, onUrlChange }: ResourceFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <FileText className="h-5 w-5 text-primary shrink-0" />
        <select
          className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full"
          value={resourceType} onChange={e => onTypeChange(e.target.value)}
        >
          {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Link2 className="h-5 w-5 text-primary shrink-0" />
        <input type="url" placeholder="Resource URL (https://...)" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={url} onChange={e => onUrlChange(e.target.value)} />
      </div>
    </div>
  );
}
