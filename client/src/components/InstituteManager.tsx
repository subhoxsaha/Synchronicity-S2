import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building, Plus, Settings, User as UserIcon, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { useAppContext } from '../contexts/AppContext';
import { Institute } from '../types';
import { toast } from 'sonner';

export function InstituteManager() {
  const { institutes, createInstitute, updateInstitute, users } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    description: '',
    ambassadorEmail: ''
  });
  const [search, setSearch] = useState('');
  const [collegeResults, setCollegeResults] = useState<any[]>([]);
  const [isSearchingCollege, setIsSearchingCollege] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  React.useEffect(() => {
    if (!formData.name || formData.name.length < 3) {
      setCollegeResults([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setIsSearchingCollege(true);
      try {
        const res = await fetch('/api/colleges/search', {
          method: 'POST',
          headers: { 'Keyword': formData.name }
        });
        if (res.ok) {
          const data = await res.json();
          setCollegeResults(data);
        } else {
          // If we fail due to CORS or API error, just set empty array and user can use their own input
          setCollegeResults([]);
        }
      } catch (err) {
        console.error("College search failed:", err);
        setCollegeResults([]);
      } finally {
        setIsSearchingCollege(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.name]);

  const filteredInstitutes = institutes.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.shortName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Look up ambassador userId by email
      const ambassador = users.find(u => u.email.toLowerCase() === formData.ambassadorEmail.toLowerCase());
      if (!ambassador) {
        toast.error("User not found with that email. Please ask them to log in first.");
        return;
      }

      if (editingInstitute) {
        await updateInstitute(editingInstitute.id, {
          name: formData.name,
          shortName: formData.shortName,
          description: formData.description,
          ambassadorId: ambassador.id,
        });
      } else {
        await createInstitute({
          name: formData.name,
          shortName: formData.shortName,
          description: formData.description,
          ambassadorId: ambassador.id,
          status: 'active',
          settings: {
            requireApprovalForEvents: true,
            requireApprovalForAnnouncements: true,
            requireApprovalForRecruitment: true,
            requireApprovalByDefault: true,
            autoPublishOrgIds: [],
            autoPublishPostTypes: [],
            allowedPostTypes: [],
          }
        });
      }
      setIsDialogOpen(false);
      setEditingInstitute(null);
      setFormData({ name: '', shortName: '', description: '', ambassadorEmail: '' });
    } catch (e: any) {
      toast.error(e.message || "Failed to save institute");
    }
  };

  const openEdit = (institute: Institute) => {
    const ambassador = users.find(u => u.id === institute.ambassadorId);
    setFormData({
      name: institute.name,
      shortName: institute.shortName,
      description: institute.description,
      ambassadorEmail: ambassador?.email || ''
    });
    setEditingInstitute(institute);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Institute Network</h2>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Manage campus sub-entities & ambassadors</p>
        </div>
        <Button 
          onClick={() => {
            setEditingInstitute(null);
            setFormData({ name: '', shortName: '', description: '', ambassadorEmail: '' });
            setIsDialogOpen(true);
          }}
          className="bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest border-[2.5px] border-foreground rounded-none shadow-[4px_4px_0_0_var(--foreground)]"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Institute
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="SEARCH INSTITUTES..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 bg-card border-2 border-foreground rounded-none shadow-[4px_4px_0_0_var(--foreground)] font-black uppercase tracking-widest placeholder:opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstitutes.map(institute => {
          const ambassador = users.find(u => u.id === institute.ambassadorId);
          return (
            <motion.div 
              key={institute.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border-[3px] border-foreground p-6 shadow-[6px_6px_0_0_var(--foreground)] flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center text-primary">
                  <Building className="h-6 w-6" />
                </div>
                <Badge variant={institute.status === 'active' ? 'default' : 'secondary'} className="rounded-none font-black uppercase tracking-widest border-2 border-foreground">
                  {institute.status}
                </Badge>
              </div>
              
              <h3 className="text-xl font-black uppercase tracking-tight mb-1">{institute.name}</h3>
              <p className="text-sm font-bold text-primary mb-4">{institute.shortName}</p>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                {institute.description}
              </p>

              <div className="bg-accent/30 p-3 rounded-lg border-2 border-foreground/10 mb-6 flex items-center gap-3">
                <div className="h-8 w-8 bg-background border border-border rounded-full flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ambassador</p>
                  <p className="text-sm font-bold truncate">{ambassador?.name || 'Unassigned'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => openEdit(institute)}
                  variant="outline" 
                  className="flex-1 rounded-none border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)] font-black uppercase tracking-widest"
                >
                  <Settings className="h-4 w-4 mr-2" /> Edit
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-[3px] border-foreground rounded-none shadow-[12px_12px_0_0_var(--foreground)] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
              {editingInstitute ? 'Edit Institute' : 'New Institute'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2 relative">
              <label className="text-xs font-black uppercase tracking-widest">Institute Name</label>
              <Input 
                required 
                value={formData.name} 
                onChange={e => {
                  setFormData({...formData, name: e.target.value});
                  setShowDropdown(true);
                }} 
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="rounded-none border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)]" 
                placeholder="E.g. Faculty of Engineering" 
              />
              {showDropdown && (collegeResults.length > 0 || isSearchingCollege) && (
                <div className="absolute z-50 w-full top-full mt-1 bg-card border-2 border-foreground shadow-[4px_4px_0_0_var(--foreground)] max-h-[200px] overflow-y-auto">
                  {isSearchingCollege ? (
                    <div className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">Searching...</div>
                  ) : (
                    collegeResults.map((college, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 hover:bg-accent cursor-pointer border-b border-foreground/10 last:border-0"
                        onClick={() => {
                          setFormData({...formData, name: college[2]?.trim() || ''});
                          setShowDropdown(false);
                        }}
                      >
                        <p className="font-bold text-sm truncate">{college[2]}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{college[1]} - {college[4]}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Short Name / Acronym</label>
              <Input required value={formData.shortName} onChange={e => setFormData({...formData, shortName: e.target.value})} className="rounded-none border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)]" placeholder="E.g. FOE" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Description</label>
              <Input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="rounded-none border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)]" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Ambassador Email</label>
              <Input required type="email" value={formData.ambassadorEmail} onChange={e => setFormData({...formData, ambassadorEmail: e.target.value})} className="rounded-none border-2 border-foreground shadow-[2px_2px_0_0_var(--foreground)]" placeholder="User must be registered" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">This user will gain ambassador privileges</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-none border-2 border-foreground">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary text-primary-foreground rounded-none border-2 border-foreground shadow-[4px_4px_0_0_var(--foreground)] font-black uppercase tracking-widest">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
