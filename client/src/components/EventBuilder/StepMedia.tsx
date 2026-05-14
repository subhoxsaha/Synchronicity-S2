import React, { useState, useRef } from 'react';
import { Upload, X, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { uploadEventBanner, uploadEventLogo, validateImageFile } from '../../services/cloudinaryService';
import { StepProps } from './types';

function ChipInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput('');
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          className="rounded-none border-[2px] border-foreground/50 h-10 flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} className="h-10 w-10 border-[2px] border-foreground bg-muted flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border-[2px] border-primary/30 text-[9px] font-black uppercase tracking-wider">
              {item}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageUploadZone({ label, currentUrl, onUpload, aspect }: { label: string; currentUrl: string; onUpload: (url: string) => void; aspect?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [urlInput, setUrlInput] = useState('');

  const handleFile = async (file: File) => {
    const v = validateImageFile(file, 5);
    if (!v.valid) { toast.error(v.error); return; }
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadEventBanner(file, `temp-${Date.now()}`, setProgress);
      onUpload(url);
      toast.success(`${label} uploaded!`);
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</Label>
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-[2.5px] border-dashed border-foreground/30 hover:border-foreground/60 cursor-pointer transition-all ${aspect || 'aspect-[16/7]'} flex items-center justify-center overflow-hidden bg-muted/30 group`}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {currentUrl ? (
          <>
            <img src={currentUrl} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-8 w-8 text-white" />
            </div>
          </>
        ) : uploading ? (
          <div className="text-center space-y-3 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <Progress value={progress} className="w-40 mx-auto" />
            <p className="text-[9px] font-mono text-muted-foreground uppercase">{progress}%</p>
          </div>
        ) : (
          <div className="text-center space-y-2 p-4">
            <ImageIcon className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Drop image or click to upload</p>
            <p className="text-[9px] font-mono text-muted-foreground/50">JPG, PNG, WebP — max 5MB</p>
          </div>
        )}
      </div>
      {/* URL fallback */}
      <div className="flex gap-2">
        <Input
          placeholder="or paste image URL..."
          className="rounded-none border-[2px] border-foreground/20 h-8 text-xs flex-1"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (urlInput) { onUpload(urlInput); setUrlInput(''); } } }}
        />
        {urlInput && (
          <button type="button" onClick={() => { onUpload(urlInput); setUrlInput(''); }}
            className="h-8 px-3 text-[9px] font-black uppercase border-[2px] border-foreground bg-card hover:bg-muted transition-all">
            Set
          </button>
        )}
      </div>
    </div>
  );
}

export function StepMedia({ form, setForm }: StepProps) {
  return (
    <div className="space-y-8">
      {/* Banner */}
      {form.type !== 'gallery' && (
        <ImageUploadZone
          label={form.type === 'event' ? "Event Banner *" : "Banner Image *"}
          currentUrl={form.assets.bannerUrl}
          onUpload={url => setForm(p => ({ ...p, imageUrl: url, assets: { ...p.assets, bannerUrl: url } }))}
        />
      )}

      {/* Logo */}
      <ImageUploadZone
        label={form.type === 'event' ? "Event Logo (optional)" : "Logo (optional)"}
        currentUrl={form.assets.logoUrl}
        onUpload={url => setForm(p => ({ ...p, assets: { ...p.assets, logoUrl: url } }))}
        aspect="aspect-square max-w-[160px]"
      />

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tags</Label>
        <ChipInput value={form.tags} onChange={tags => setForm(p => ({ ...p, tags }))} placeholder="Add tag and press Enter" />
      </div>

      {/* Highlights */}
      <div className="space-y-2">
        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Highlights / Key Features</Label>
        <ChipInput value={form.highlights} onChange={highlights => setForm(p => ({ ...p, highlights }))} placeholder="e.g., Free swag, Networking session" />
      </div>

      {/* Sponsors */}
      <div className="space-y-2">
        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sponsors (optional)</Label>
        <ChipInput value={form.sponsors} onChange={sponsors => setForm(p => ({ ...p, sponsors }))} placeholder="Sponsor name" />
      </div>
    </div>
  );
}
