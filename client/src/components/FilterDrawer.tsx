import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POST_TYPES = ['Event', 'Announcement', 'Recruitment', 'Gallery', 'Resource'] as const;
const DEPARTMENTS = ['Any Department', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Business Admin'] as const;

interface FilterDrawerProps {
  onApply: (filters: { types: string[], department: string, freeOnly: boolean, hasRsvp: boolean }) => void;
}

export function FilterDrawer({ onApply }: FilterDrawerProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [department, setDepartment] = useState('Any Department');
  const [freeOnly, setFreeOnly] = useState(false);
  const [hasRsvp, setHasRsvp] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const handleApply = () => {
    onApply({
      types: selectedTypes,
      department,
      freeOnly,
      hasRsvp
    });
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button 
            variant="outline" 
            className="h-10 w-10 p-0 sm:w-auto sm:px-4 md:h-12 md:px-5 rounded-none border-[2.5px] border-foreground bg-brutal-yellow hover:bg-brutal-yellow/90 shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all relative shrink-0 uppercase font-black tracking-widest flex items-center justify-center"
          />
        }
      >
        <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Filters</span>
        {activeCount > 0 && (
          <span className="absolute -top-2 -right-2 h-6 w-6 bg-foreground text-background text-[10px] font-black rounded-none flex items-center justify-center border-[2px] border-background z-10">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] rounded-none border-l-[3px] border-foreground bg-background p-0 overflow-y-auto">
        <div className="p-4 sm:p-5 h-full flex flex-col">
          <SheetHeader className="pb-3 sm:pb-4 border-b-[3px] border-foreground mb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Filters</SheetTitle>
              {activeCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetAll}
                  className="rounded-none border-[2px] border-foreground text-[10px] font-black uppercase tracking-widest hover:bg-destructive hover:text-destructive-foreground shadow-[2px_2px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all h-8"
                >
                  <RotateCcw className="h-3 w-3 sm:mr-1.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
              )}
            </div>
          </SheetHeader>
          
          <div className="flex-1 space-y-5">
            {/* Post Type Multi-select */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Post Type</h4>
              <div className="flex flex-wrap gap-2">
                {POST_TYPES.map(type => {
                  const isActive = selectedTypes.includes(type);
                  return (
                    <button
                      key={type} 
                      onClick={() => toggleType(type)}
                      className={`px-3 py-2 border-[2.5px] border-foreground uppercase tracking-widest text-[10px] font-black transition-all ${
                        isActive 
                          ? 'bg-brutal-blue text-foreground shadow-[3px_3px_0_0_var(--foreground)] translate-x-[-2px] translate-y-[-2px]'
                          : 'bg-background text-foreground hover:bg-muted shadow-[2px_2px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Department</h4>
              <div className="relative">
                <select 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-background border-[2.5px] border-foreground rounded-none h-12 px-4 text-xs font-black outline-none focus:ring-0 focus:border-foreground uppercase tracking-widest appearance-none cursor-pointer shadow-[4px_4px_0_0_var(--foreground)]"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} className="bg-background font-bold">{dept}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-foreground"></div>
                </div>
              </div>
            </div>
            
            {/* Toggle Switches */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Options</h4>
              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={() => setFreeOnly(!freeOnly)}
                  className={`w-full border-[2.5px] border-foreground p-3 flex items-center justify-between cursor-pointer transition-all ${
                    freeOnly 
                      ? 'bg-brutal-green shadow-[4px_4px_0_0_var(--foreground)] translate-x-[-2px] translate-y-[-2px]' 
                      : 'bg-background hover:bg-muted shadow-[2px_2px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">Free Only</span>
                  <div className={`w-5 h-5 border-[2px] border-foreground flex items-center justify-center bg-background`}>
                    {freeOnly && <Check className="h-4 w-4 text-foreground" strokeWidth={4} />}
                  </div>
                </button>
                <button 
                  onClick={() => setHasRsvp(!hasRsvp)}
                  className={`w-full border-[2.5px] border-foreground p-3 flex items-center justify-between cursor-pointer transition-all ${
                    hasRsvp 
                      ? 'bg-brutal-pink shadow-[4px_4px_0_0_var(--foreground)] translate-x-[-2px] translate-y-[-2px]' 
                      : 'bg-background hover:bg-muted shadow-[2px_2px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">Has RSVP</span>
                  <div className={`w-5 h-5 border-[2px] border-foreground flex items-center justify-center bg-background`}>
                    {hasRsvp && <Check className="h-4 w-4 text-foreground" strokeWidth={4} />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-4 border-t-[3px] border-foreground mt-auto">
            <Button 
              onClick={handleApply}
              className="w-full h-12 rounded-none border-[3px] border-foreground bg-brutal-yellow hover:bg-brutal-yellow/90 text-foreground text-sm font-black uppercase tracking-widest shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              Apply Filters {activeCount > 0 && `(${activeCount})`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

