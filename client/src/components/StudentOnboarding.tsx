import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, ArrowRight, ArrowLeft, GraduationCap, BookOpen, Heart,
  MapPin, User as UserIcon, Search, Loader2, CheckCircle, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '../contexts/AppContext';
import { toast } from 'sonner';

// ─── CONSTANTS ───

const YEAR_OPTIONS = [
  { value: '1st Year', label: '1st Year', emoji: '🌱' },
  { value: '2nd Year', label: '2nd Year', emoji: '📚' },
  { value: '3rd Year', label: '3rd Year', emoji: '🔬' },
  { value: '4th Year', label: '4th Year', emoji: '🎓' },
  { value: '5th Year', label: '5th Year', emoji: '🏆' },
  { value: 'Postgraduate', label: 'Postgraduate', emoji: '🧪' },
  { value: 'PhD', label: 'PhD Scholar', emoji: '📖' },
  { value: 'Alumni', label: 'Alumni', emoji: '🎯' },
];

const MAJOR_OPTIONS = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Electronics & Communication', 'Information Technology',
  'Chemical Engineering', 'Biotechnology', 'Mathematics', 'Physics',
  'Chemistry', 'Biology', 'Commerce', 'Business Administration',
  'Economics', 'Psychology', 'English Literature', 'History',
  'Political Science', 'Sociology', 'Law', 'Medicine',
  'Architecture', 'Design', 'Pharmacy', 'Agriculture',
  'Fine Arts', 'Journalism', 'Education', 'Other'
];

const INTEREST_OPTIONS = [
  { id: 'tech', label: 'Technology', emoji: '💻' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'art', label: 'Art & Design', emoji: '🎨' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'literature', label: 'Literature', emoji: '📚' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'photography', label: 'Photography', emoji: '📷' },
  { id: 'film', label: 'Film & Media', emoji: '🎬' },
  { id: 'debate', label: 'Debate', emoji: '🗣️' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', emoji: '🚀' },
  { id: 'social', label: 'Social Impact', emoji: '🌍' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'coding', label: 'Coding', emoji: '👨‍💻' },
  { id: 'robotics', label: 'Robotics', emoji: '🤖' },
  { id: 'dance', label: 'Dance', emoji: '💃' },
  { id: 'theatre', label: 'Theatre', emoji: '🎭' },
  { id: 'volunteering', label: 'Volunteering', emoji: '🤝' },
];

interface CollegeEntry {
  name: string;
  state: string;
  district: string;
  city: string;
}

const TOTAL_STEPS = 5;

export function StudentOnboarding() {
  const { currentUser, submitOnboarding } = useAppContext();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [majorSearch, setMajorSearch] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [collegeName, setCollegeName] = useState('');
  const [collegeState, setCollegeState] = useState('');
  const [collegeDistrict, setCollegeDistrict] = useState('');
  const [collegeCity, setCollegeCity] = useState('');

  // College autocomplete
  const [colleges, setColleges] = useState<CollegeEntry[]>([]);
  const [collegeResults, setCollegeResults] = useState<CollegeEntry[]>([]);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadColleges = useCallback(async () => {
    if (colleges.length > 0) return;
    setIsLoadingColleges(true);
    try {
      const res = await fetch('/colleges.json');
      const data = await res.json();
      const parsed: CollegeEntry[] = data.map((entry: string[]) => ({
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

  // College search
  useEffect(() => {
    if (!collegeName || collegeName.length < 3 || colleges.length === 0) {
      setCollegeResults([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      const query = collegeName.toLowerCase();
      setCollegeResults(
        colleges.filter(c => c.name.toLowerCase().includes(query)).slice(0, 12)
      );
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [collegeName, colleges]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCollegeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleInterest = (id: string) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredMajors = majorSearch
    ? MAJOR_OPTIONS.filter(m => m.toLowerCase().includes(majorSearch.toLowerCase()))
    : MAJOR_OPTIONS;

  const canProceed = () => {
    switch (step) {
      case 0: return displayName.trim().length >= 2;
      case 1: return !!year;
      case 2: return !!major;
      case 3: return interests.length >= 2;
      case 4: return true; // college is optional
      default: return false;
    }
  };

  const handleFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitOnboarding({
        name: displayName.trim(),
        bio: bio.trim(),
        year,
        major,
        interests,
        // Store college info on user for reference
        ...(collegeName ? {
          instituteId: '', // Will be linked when/if their institute is onboarded
        } : {}),
      });
      toast.success("Welcome aboard! 🎉");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-50 bg-foreground text-background px-6 py-3 border-b-[3px] border-foreground">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary border-2 border-background flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-background" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest">CampusPulse</span>
          </div>
          <span className="text-[10px] font-mono text-background/50 uppercase tracking-widest">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="h-1 bg-foreground/10">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* ── STEP CONTENT ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {/* ═══ STEP 0: NAME & BIO ═══ */}
            {step === 0 && (
              <StepWrapper key="step0">
                <StepHeader
                  icon={<UserIcon className="h-8 w-8" />}
                  title="Let's get to know you"
                  subtitle="What should we call you on campus?"
                />
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest">Display Name *</label>
                    <Input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      autoFocus
                      className="h-14 text-lg rounded-none border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] font-bold focus:shadow-[5px_5px_0_0_var(--primary)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest">
                      Bio <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                      maxLength={200}
                      className="w-full rounded-none border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] bg-background px-4 py-3 text-sm focus:outline-none focus:shadow-[5px_5px_0_0_var(--primary)] resize-none transition-shadow"
                    />
                    <p className="text-[10px] text-muted-foreground text-right font-mono">{bio.length}/200</p>
                  </div>
                </div>
              </StepWrapper>
            )}

            {/* ═══ STEP 1: YEAR ═══ */}
            {step === 1 && (
              <StepWrapper key="step1">
                <StepHeader
                  icon={<GraduationCap className="h-8 w-8" />}
                  title="What year are you in?"
                  subtitle="This helps us tailor your feed"
                />
                <div className="grid grid-cols-2 gap-3">
                  {YEAR_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setYear(opt.value)}
                      className={`group flex items-center gap-4 p-5 border-[3px] transition-all active:translate-y-[2px] active:shadow-none ${
                        year === opt.value
                          ? 'border-primary bg-primary/10 shadow-[6px_6px_0_0_var(--primary)]'
                          : 'border-foreground bg-card hover:bg-muted shadow-[4px_4px_0_0_var(--foreground)] hover:shadow-[6px_6px_0_0_var(--foreground)] hover:-translate-y-[2px]'
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-sm font-black uppercase tracking-wider">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </StepWrapper>
            )}

            {/* ═══ STEP 2: MAJOR ═══ */}
            {step === 2 && (
              <StepWrapper key="step2">
                <StepHeader
                  icon={<BookOpen className="h-8 w-8" />}
                  title="What are you studying?"
                  subtitle="Select your major or field of study"
                />
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={majorSearch}
                      onChange={e => setMajorSearch(e.target.value)}
                      placeholder="Search majors..."
                      className="pl-11 h-12 rounded-none border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
                    {filteredMajors.map(m => (
                      <button
                        key={m}
                        onClick={() => setMajor(m)}
                        className={`px-3 py-3 text-xs font-bold uppercase tracking-wider border-[3px] transition-all text-left truncate active:translate-y-[2px] active:shadow-none ${
                          major === m
                            ? 'border-primary bg-primary text-white shadow-[4px_4px_0_0_var(--primary)]'
                            : 'border-foreground bg-card hover:bg-muted shadow-[3px_3px_0_0_var(--foreground)] hover:shadow-[5px_5px_0_0_var(--foreground)] hover:-translate-y-[2px]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </StepWrapper>
            )}

            {/* ═══ STEP 3: INTERESTS ═══ */}
            {step === 3 && (
              <StepWrapper key="step3">
                <StepHeader
                  icon={<Heart className="h-8 w-8" />}
                  title="What are you into?"
                  subtitle={`Pick at least 2 interests (${interests.length} selected)`}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {INTEREST_OPTIONS.map(opt => {
                    const isSelected = interests.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggleInterest(opt.id)}
                        className={`flex items-center gap-2 px-4 py-4 border-[3px] transition-all active:translate-y-[2px] active:shadow-none ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-[4px_4px_0_0_var(--primary)]'
                            : 'border-foreground/80 bg-card hover:bg-muted hover:border-foreground shadow-[3px_3px_0_0_var(--foreground)] hover:shadow-[5px_5px_0_0_var(--foreground)] hover:-translate-y-[2px]'
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className={`text-[11px] font-bold uppercase tracking-wider truncate ${isSelected ? 'text-white' : ''}`}>{opt.label}</span>
                        {isSelected && <CheckCircle className="h-4 w-4 text-white ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </StepWrapper>
            )}

            {/* ═══ STEP 4: COLLEGE (OPTIONAL) ═══ */}
            {step === 4 && (
              <StepWrapper key="step4">
                <StepHeader
                  icon={<Building2 className="h-8 w-8" />}
                  title="Which college are you from?"
                  subtitle="Optional — search from 43,000+ Indian colleges"
                />
                <div className="space-y-5">
                  <div className="space-y-2 relative" ref={dropdownRef}>
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={collegeName}
                        onChange={e => {
                          setCollegeName(e.target.value);
                          setShowCollegeDropdown(true);
                        }}
                        onFocus={() => {
                          loadColleges();
                          setShowCollegeDropdown(true);
                        }}
                        placeholder="Start typing your college name..."
                        className="pl-11 h-14 text-sm rounded-none border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)]"
                      />
                    </div>
                    <AnimatePresence>
                      {showCollegeDropdown && (collegeResults.length > 0 || isLoadingColleges) && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-50 w-full top-full mt-1 bg-card border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] max-h-[220px] overflow-y-auto"
                        >
                          {isLoadingColleges ? (
                            <div className="p-4 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                              <Loader2 className="h-3 w-3 animate-spin" /> Loading database...
                            </div>
                          ) : (
                            collegeResults.map((college, idx) => (
                              <div
                                key={idx}
                                className="p-3 hover:bg-accent cursor-pointer border-b border-foreground/10 last:border-0 transition-colors"
                                onMouseDown={() => {
                                  setCollegeName(college.name);
                                  setCollegeState(college.state);
                                  setCollegeDistrict(college.district);
                                  setCollegeCity(college.city);
                                  setShowCollegeDropdown(false);
                                }}
                              >
                                <p className="font-bold text-sm truncate">{college.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-2.5 w-2.5" />
                                  {college.state} · {college.district}
                                </p>
                              </div>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Auto-filled location */}
                  {collegeState && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-3 gap-2"
                    >
                      <div className="bg-accent/30 border border-foreground/10 p-2.5 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">State</p>
                        <p className="text-xs font-bold truncate">{collegeState}</p>
                      </div>
                      <div className="bg-accent/30 border border-foreground/10 p-2.5 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">District</p>
                        <p className="text-xs font-bold truncate">{collegeDistrict}</p>
                      </div>
                      <div className="bg-accent/30 border border-foreground/10 p-2.5 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">City</p>
                        <p className="text-xs font-bold truncate">{collegeCity}</p>
                      </div>
                    </motion.div>
                  )}

                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
                    You can skip this step and set your college later
                  </p>
                </div>
              </StepWrapper>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div className="sticky bottom-0 bg-background border-t-[3px] border-foreground px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          {step > 0 ? (
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              className="rounded-none border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] font-black uppercase tracking-widest px-6 h-12 active:translate-y-[2px] active:shadow-none transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS - 1 ? (
            <Button
              disabled={!canProceed()}
              onClick={() => setStep(s => s + 1)}
              className="rounded-none border-[2.5px] border-foreground bg-primary text-white shadow-[4px_4px_0_0_var(--foreground)] font-black uppercase tracking-widest px-8 h-12 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-40"
            >
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              disabled={isSubmitting}
              onClick={handleFinish}
              className="rounded-none border-[2.5px] border-foreground bg-primary text-white shadow-[4px_4px_0_0_var(--foreground)] font-black uppercase tracking-widest px-8 h-12 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Let's Go!</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="space-y-8"
    >
      {children}
    </motion.div>
  );
}

function StepHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center justify-center h-16 w-16 bg-primary/10 border-[3px] border-primary text-primary mx-auto">
        {icon}
      </div>
      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">{title}</h2>
      <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{subtitle}</p>
    </div>
  );
}
