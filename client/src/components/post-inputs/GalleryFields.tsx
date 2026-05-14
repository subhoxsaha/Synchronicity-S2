import React from 'react';
import { Image, Plus, X, Link2 } from 'lucide-react';

interface GalleryFieldsProps {
  images: { url: string; caption?: string }[];
  onChange: (images: { url: string; caption?: string }[]) => void;
  linkedEventId: string;
  onLinkedEventChange: (v: string) => void;
}

export function GalleryFields({ images, onChange, linkedEventId, onLinkedEventChange }: GalleryFieldsProps) {
  const addImage = () => onChange([...images, { url: '', caption: '' }]);
  const removeImage = (i: number) => onChange(images.filter((_, idx) => idx !== i));
  const updateImage = (i: number, field: 'url' | 'caption', v: string) => {
    const copy = [...images];
    copy[i] = { ...copy[i], [field]: v };
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {images.map((img, i) => (
        <div key={i} className="bg-accent/10 rounded-2xl p-3 border border-border/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Image {i + 1}</span>
            {images.length > 1 && (
              <button type="button" onClick={() => removeImage(i)} className="text-red-500 hover:text-red-700"><X className="h-3.5 w-3.5" /></button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-primary shrink-0" />
            <input type="url" placeholder="Image URL" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={img.url} onChange={e => updateImage(i, 'url', e.target.value)} />
          </div>
          <input type="text" placeholder="Caption (optional)" className="bg-transparent border-none outline-none text-[11px] font-medium w-full pl-6" value={img.caption} onChange={e => updateImage(i, 'caption', e.target.value)} />
        </div>
      ))}
      <button type="button" onClick={addImage} className="w-full py-2 border border-dashed border-primary/40 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
        <Plus className="h-3 w-3 inline mr-1" /> Add Image
      </button>
      <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
        <Link2 className="h-5 w-5 text-primary shrink-0" />
        <input type="text" placeholder="Linked Event ID (optional)" className="bg-transparent border-none outline-none text-xs font-bold w-full" value={linkedEventId} onChange={e => onLinkedEventChange(e.target.value)} />
      </div>
    </div>
  );
}
