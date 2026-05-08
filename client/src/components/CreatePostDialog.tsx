import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Image as ImageIcon, 
  MapPin, 
  Tag, 
  Calendar, 
  Sparkles,
  Loader2,
  SendHorizontal
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '../contexts/AppContext';
import { EventCategory, EventStatus } from '../types';
import { toast } from 'sonner';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const { addEvent, currentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    category: [EventCategory.SOCIAL],
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error("Please provide an image URL for your post");
      return;
    }

    setLoading(true);
    try {
      await addEvent({
        ...formData,
        organizerEmail: currentUser?.email || '',
        organizerName: currentUser?.name || 'Anonymous',
        organizerId: currentUser?.id,
        category: formData.category,
        capacity: 1000, // Unlimited-ish scale for social posts
        date: new Date(`${formData.date}T12:00:00`).toISOString(),
        coordinates: { lat: 37.7749, lng: -122.4194 } // Default
      } as any);
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        imageUrl: '',
        category: [EventCategory.SOCIAL],
        tags: [],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-background">
        <div className="flex flex-col h-[85vh] sm:h-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-accent/5">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <DialogTitle className="text-sm font-black uppercase tracking-widest text-foreground">New Post</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row h-full">
            {/* Image Preview Area */}
            <div className="w-full sm:w-1/2 aspect-square sm:aspect-auto bg-accent/10 relative flex items-center justify-center overflow-hidden group">
              {formData.imageUrl ? (
                <>
                  <img src={formData.imageUrl} className="h-full w-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-end">
                    <Button variant="secondary" size="sm" onClick={() => setFormData({ ...formData, imageUrl: '' })} className="rounded-full h-8 px-4 text-[10px] font-black uppercase">
                        Change Media
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8">
                  <div className="h-20 w-20 rounded-[2rem] bg-background shadow-xl flex items-center justify-center text-primary animate-bounce">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black">Add some visuals</h4>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Post an image URL to share</p>
                  </div>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/your-image..."
                    className="w-full h-12 bg-background border border-border/40 rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  <p className="text-[9px] text-muted-foreground italic max-w-[200px]">Use Unsplash or any direct image link for your post cover.</p>
                </div>
              )}
            </div>

            {/* Inputs Area */}
            <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[60vh] sm:max-h-none no-scrollbar">
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="The Title of your Post" 
                  className="w-full text-2xl font-black bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/30 px-0"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                
                <textarea 
                  placeholder="Capture the vibe... (caption)" 
                  className="w-full min-h-[120px] bg-accent/5 rounded-2xl p-4 text-sm font-medium outline-none border border-transparent focus:border-primary/20 transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Add location" 
                        className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                </div>

                <div className="flex items-center gap-3 bg-accent/10 rounded-2xl p-3 border border-border/20">
                    <Calendar className="h-5 w-5 text-primary shrink-0" />
                    <input 
                        type="date" 
                        className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tags</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {formData.tags.map(t => (
                      <Badge key={t} variant="secondary" className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        #{t} 
                        <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== t) }))} />
                      </Badge>
                    ))}
                    <div className="relative group">
                        <input 
                            type="text"
                            placeholder="press enter to add tag"
                            className="bg-transparent border-b border-muted-foreground/20 outline-none text-xs font-bold placeholder:text-[10px]"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                    </div>
                 </div>
              </div>

              <div className="pt-4 sticky bottom-0 bg-background">
                <Button 
                    type="submit" 
                    disabled={loading || !formData.imageUrl || !formData.title} 
                    className="w-full h-14 rounded-2xl text-base font-black shadow-primary/20 shadow-xl"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <div className="flex items-center gap-2">
                            Share Post
                            <SendHorizontal className="h-4 w-4" />
                        </div>
                    )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
