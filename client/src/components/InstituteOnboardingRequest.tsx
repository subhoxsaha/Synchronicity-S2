import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building, Search, Send, Clock, CheckCircle, XCircle, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '../contexts/AppContext';
import { toast } from 'sonner';

interface CollegeEntry {
  name: string;
  state: string;
  district: string;
  city: string;
}

export function InstituteOnboardingRequest() {
  const { currentUser, submitInstituteRequest, instituteRequests } = useAppContext();

  // Form state
  const [instituteName, setInstituteName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // College autocomplete
  const [colleges, setColleges] = useState<CollegeEntry[]>([]);
  const [searchResults, setSearchResults] = useState<CollegeEntry[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // My existing requests
  const myRequests = instituteRequests.filter(r => r.requesterId === currentUser?.id);

  // Load colleges.json lazily on first focus
  const loadColleges = useCallback(async () => {
    if (colleges.length > 0) return;
    setIsLoadingColleges(true);
    try {
      const res = await fetch('/colleges.json');
      const data = await res.json();
      const parsed: CollegeEntry[] = data.map((entry: any) => ({
        name: entry[0] || '',
        state: entry[1] || '',
        district: entry[2] || '',
        city: entry[3] || '',
      }));
      setColleges(parsed);
    } catch (err) {
      console.error('Failed to load colleges data:', err);
    } finally {
      setIsLoadingColleges(false);
    }
  }, [colleges.length]);

  // Debounced search
  useEffect(() => {
    if (!instituteName || instituteName.length < 3 || colleges.length === 0) {
      setSearchResults([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      const query = instituteName.toLowerCase();
      const results = colleges
        .filter(c => c.name.toLowerCase().includes(query))
        .slice(0, 15);
      setSearchResults(results);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [instituteName, colleges]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCollege = (college: CollegeEntry) => {
    setInstituteName(college.name);
    setState(college.state);
    setDistrict(college.district);
    setCity(college.city);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instituteName.trim() || !reason.trim()) {
      toast.error('Please fill in institute name and reason.');
      return;
    }
    setIsSubmitting(true);
    try {
      await submitInstituteRequest({
        instituteName: instituteName.trim(),
        state: state.trim(),
        district: district.trim(),
        city: city.trim(),
        reason: reason.trim(),
      });
      // Reset form
      setInstituteName('');
      setState('');
      setDistrict('');
      setCity('');
      setReason('');
    } catch {
      // error already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-amber-500/10 text-amber-600 border-amber-500/30', label: 'PENDING REVIEW' },
    approved: { icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', label: 'APPROVED' },
    rejected: { icon: XCircle, color: 'bg-red-500/10 text-red-600 border-red-500/30', label: 'REJECTED' },
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 bg-primary/10 border-[3px] border-primary rounded-xl mb-4 mx-auto">
          <Building className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter">Request Institute Onboarding</h2>
        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-1">
          Submit a request to bring your institute onto the platform
        </p>
      </motion.div>

      {/* My Existing Requests */}
      {myRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Requests</h3>
          {myRequests.map((req) => {
            const config = statusConfig[req.status];
            const StatusIcon = config.icon;
            return (
              <div
                key={req.id}
                className="bg-card border-[2.5px] border-foreground p-4 shadow-[4px_4px_0_0_var(--foreground)] flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm uppercase tracking-tight truncate">{req.instituteName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {req.state && `${req.state}`}{req.district && ` · ${req.district}`}
                  </p>
                  {req.status === 'rejected' && req.reviewNote && (
                    <p className="text-xs text-red-500 mt-1 italic">"{req.reviewNote}"</p>
                  )}
                </div>
                <Badge className={`${config.color} border rounded-none text-[10px] font-black uppercase tracking-widest px-2 py-1 shrink-0`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Request Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border-[3px] border-foreground p-6 shadow-[8px_8px_0_0_var(--foreground)] space-y-5"
      >
        <h3 className="text-lg font-black uppercase tracking-tighter">New Request</h3>

        {/* Institute Name with Autocomplete */}
        <div className="space-y-2 relative" ref={dropdownRef}>
          <label className="text-xs font-black uppercase tracking-widest">Institute Name *</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              required
              value={instituteName}
              onChange={(e) => {
                setInstituteName(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                loadColleges();
                setShowDropdown(true);
              }}
              placeholder="Start typing to search 43,000+ colleges..."
              className="pl-10 h-12 rounded-none border-[3px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] focus:shadow-[5px_5px_0_0_var(--primary)] transition-shadow"
            />
          </div>
          <AnimatePresence>
            {showDropdown && (searchResults.length > 0 || isLoadingColleges) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-50 w-full top-full mt-1 bg-card border-[3px] border-foreground shadow-[5px_5px_0_0_var(--foreground)] max-h-[240px] overflow-y-auto"
              >
                {isLoadingColleges ? (
                  <div className="p-4 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading colleges database...
                  </div>
                ) : (
                  searchResults.map((college, idx) => (
                    <div
                      key={idx}
                      className="p-3 hover:bg-accent cursor-pointer border-b border-foreground/10 last:border-0 transition-colors"
                      onMouseDown={() => selectCollege(college)}
                    >
                      <p className="font-bold text-sm truncate">{college.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {college.state} · {college.district} · {college.city}
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Select from the database or type a custom name
          </p>
        </div>

        {/* Location fields (auto-filled or manual) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">State</label>
            <Input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Maharashtra"
              className="h-10 rounded-none border-[3px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] focus:shadow-[5px_5px_0_0_var(--primary)] transition-shadow"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">District</label>
            <Input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Pune"
              className="h-10 rounded-none border-[3px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] focus:shadow-[5px_5px_0_0_var(--primary)] transition-shadow"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">City</label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Pune"
              className="h-10 rounded-none border-[3px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] focus:shadow-[5px_5px_0_0_var(--primary)] transition-shadow"
            />
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest">Why should we onboard this institute? *</label>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Tell us why you want this institute on the platform, your role there, etc."
            className="w-full rounded-none border-[3px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] bg-background px-4 py-3 text-sm focus:outline-none focus:shadow-[5px_5px_0_0_var(--primary)] resize-none transition-shadow"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white rounded-none border-[3px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] hover:-translate-y-[2px] font-black uppercase tracking-widest h-14 transition-all active:translate-y-[2px] active:shadow-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </motion.form>
    </div>
  );
}
