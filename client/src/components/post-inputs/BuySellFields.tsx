import React from 'react';
import { DollarSign, Package, Phone } from 'lucide-react';

interface BuySellFieldsProps {
  listingType: 'sell' | 'buy' | 'exchange';
  onListingTypeChange: (v: 'sell' | 'buy' | 'exchange') => void;
  price: string;
  onPriceChange: (v: string) => void;
  isFree: boolean;
  onFreeChange: (v: boolean) => void;
  condition: string;
  onConditionChange: (v: string) => void;
  contactMethod: string;
  onContactChange: (v: string) => void;
  contactInfo: string;
  onContactInfoChange: (v: string) => void;
}

export function BuySellFields({ listingType, onListingTypeChange, price, onPriceChange, isFree, onFreeChange, condition, onConditionChange, contactMethod, onContactChange, contactInfo, onContactInfoChange }: BuySellFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['sell', 'buy', 'exchange'] as const).map(t => (
          <button key={t} type="button" onClick={() => onListingTypeChange(t)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${listingType === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-accent/10 text-muted-foreground border-border/20 hover:bg-accent/20'}`}
          >{t === 'sell' ? '💰 Sell' : t === 'buy' ? '🛒 Buy' : '🔄 Exchange'}</button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 bg-accent/10 rounded-2xl p-3 border border-border/20 cursor-pointer">
          <input type="checkbox" checked={isFree} onChange={e => onFreeChange(e.target.checked)} className="accent-primary" />
          <span className="text-xs font-bold">Free</span>
        </label>
        {!isFree && (
          <div className="flex-1 flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
            <DollarSign className="h-5 w-5 text-primary shrink-0" />
            <input type="number" placeholder="Price (₹)" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={price} onChange={e => onPriceChange(e.target.value)} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Package className="h-5 w-5 text-primary shrink-0" />
        <select className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full" value={condition} onChange={e => onConditionChange(e.target.value)}>
          <option value="new">New</option>
          <option value="like_new">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
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
