import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const POST_TYPES = ['Event', 'Announcement', 'Recruitment', 'Gallery', 'Resource'] as const;
const DEPARTMENTS = ['Any Department', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Business Admin'] as const;

export function FilterDrawer() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [department, setDepartment] = useState('Any Department');
  const [freeOnly, setFreeOnly] = useState(false);
  const [hasRsvp, setHasRsvp] = useState(false);

  const activeCount = selectedTypes.length + (department !== 'Any Department' ? 1 : 0) + (freeOnly ? 1 : 0) + (hasRsvp ? 1 : 0);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const resetAll = () => {
    setSelectedTypes([]);
    setDepartment('Any Department');
    setFreeOnly(false);
    setHasRsvp(false);
  };

  return (
    <Sheet>
      <SheetTrigger>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border-border/40 bg-card/50 hover:bg-card relative shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[75vh] rounded-t-[2rem] bg-background border-t border-border/40 backdrop-blur-3xl overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-border/20">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-black uppercase tracking-tight">Filters</SheetTitle>
            {activeCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetAll}
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Reset All
              </Button>
            )}
          </div>
        </SheetHeader>
        
        <div className="py-8 space-y-8">
          {/* Post Type Multi-select */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Post Type</h4>
            <div className="flex flex-wrap gap-2">
              {POST_TYPES.map(type => {
                const isActive = selectedTypes.includes(type);
                return (
                  <Badge 
                    key={type} 
                    variant="outline" 
                    onClick={() => toggleType(type)}
                    className={`px-4 py-2.5 rounded-xl cursor-pointer uppercase tracking-widest text-[10px] font-black transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                        : 'border-border/40 bg-card/30 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card/50'
                    }`}
                  >
                    {type}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Department Dropdown */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Department</h4>
            <select 
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-card/30 border border-border/40 rounded-2xl h-12 px-4 text-xs font-bold outline-none focus:border-primary/50 focus:bg-card/50 uppercase tracking-widest appearance-none cursor-pointer transition-all"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} className="bg-background">{dept}</option>
              ))}
            </select>
          </div>
          
          {/* Toggle Switches */}
          <div className="flex gap-4">
            <button 
              onClick={() => setFreeOnly(!freeOnly)}
              className={`flex-1 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 border ${
                freeOnly 
                  ? 'bg-primary/10 border-primary/30 shadow-inner' 
                  : 'bg-card/30 border-border/40 hover:bg-card/50'
              }`}
            >
              <span className={`text-xs font-black uppercase tracking-widest transition-colors ${freeOnly ? 'text-primary' : 'text-muted-foreground'}`}>Free Only</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${freeOnly ? 'bg-primary' : 'bg-border/60'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
                  freeOnly 
                    ? 'right-0.5 bg-primary-foreground shadow-lg' 
                    : 'left-0.5 bg-muted-foreground/40'
                }`} />
              </div>
            </button>
            <button 
              onClick={() => setHasRsvp(!hasRsvp)}
              className={`flex-1 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 border ${
                hasRsvp 
                  ? 'bg-secondary/10 border-secondary/30 shadow-inner' 
                  : 'bg-card/30 border-border/40 hover:bg-card/50'
              }`}
            >
              <span className={`text-xs font-black uppercase tracking-widest transition-colors ${hasRsvp ? 'text-secondary' : 'text-muted-foreground'}`}>Has RSVP</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${hasRsvp ? 'bg-secondary' : 'bg-border/60'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
                  hasRsvp 
                    ? 'right-0.5 bg-secondary-foreground shadow-lg' 
                    : 'left-0.5 bg-muted-foreground/40'
                }`} />
              </div>
            </button>
          </div>

          {/* Apply Button */}
          <Button className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 mt-4">
            Apply Filters {activeCount > 0 && `(${activeCount})`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
