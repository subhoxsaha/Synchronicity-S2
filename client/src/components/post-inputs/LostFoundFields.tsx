import React from 'react';
import { Search, MapPin, Phone } from 'lucide-react';

interface LostFoundFieldsProps {
  itemType: 'lost' | 'found';
  onItemTypeChange: (v: 'lost' | 'found') => void;
  itemDescription: string;
  onDescChange: (v: string) => void;
  lastSeenLocation: string;
  onLocationChange: (v: string) => void;
  contactMethod: string;
  onContactChange: (v: string) => void;
  contactInfo: string;
  onContactInfoChange: (v: string) => void;
}

export function LostFoundFields({ itemType, onItemTypeChange, itemDescription, onDescChange, lastSeenLocation, onLocationChange, contactMethod, onContactChange, contactInfo, onContactInfoChange }: LostFoundFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['lost', 'found'] as const).map(t => (
          <button key={t} type="button" onClick={() => onItemTypeChange(t)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${itemType === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-accent/10 text-muted-foreground border-border/20 hover:bg-accent/20'}`}
          >{t === 'lost' ? '🔍 Lost' : '📦 Found'}</button>
        ))}
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Search className="h-5 w-5 text-primary shrink-0" />
        <input type="text" placeholder="Describe the item..." className="bg-transparent border-none outline-none text-xs font-bold w-full" value={itemDescription} onChange={e => onDescChange(e.target.value)} />
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <MapPin className="h-5 w-5 text-primary shrink-0" />
        <input type="text" placeholder="Last seen / found location" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={lastSeenLocation} onChange={e => onLocationChange(e.target.value)} />
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Phone className="h-5 w-5 text-primary shrink-0" />
        <select className="bg-transparent border-none outline-none text-xs font-bold uppercase w-1/3" value={contactMethod} onChange={e => onContactChange(e.target.value)}>
          <option value="in_app">In-App</option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
        </select>
        <input type="text" placeholder="Contact info" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={contactInfo} onChange={e => onContactInfoChange(e.target.value)} />
      </div>
    </div>
  );
}
