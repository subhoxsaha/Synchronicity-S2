import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowRight, Globe, Users, Zap, Shield, Sparkles, LayoutDashboard, Calendar, Search, MapPin, Bell, MessageSquare, Star, ChevronRight, Map as MapIcon, UserPlus, Clock, TrendingUp } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const { login, currentUser } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = () => {
    if (currentUser) { onEnter(); return; }
    login(UserRole.STUDENT).then(() => onEnter());
  };

  const handleOrganizerLogin = () => {
    if (currentUser) {
      if (currentUser.role === UserRole.ORGANIZER && !currentUser.isApproved)
        toast.info("Your organizer account is pending approval.");
      onEnter();
    } else {
      login(UserRole.ORGANIZER).then(() => onEnter());
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-foreground text-background border-b-[3px] border-foreground">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
              <div className="h-8 w-8 bg-primary border-2 border-background flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
              <span className="text-lg font-heading font-extrabold tracking-tight">CAMPUS<span className="text-primary">PULSE</span></span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-bold text-background/60">
              <a href="#features" className="text-primary border-b-2 border-primary pb-0.5">DISCOVERY</a>
              <a href="#trending" className="hover:text-primary transition-colors">SOCIAL</a>
              <a href="#management" className="hover:text-primary transition-colors">MAP</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex h-9 w-9 items-center justify-center border-2 border-background/30 hover:bg-background/10 transition-colors">
              <Bell className="h-4 w-4 text-background/60" />
            </button>
            <button onClick={handleGoogleLogin} className="h-9 px-4 bg-primary text-foreground border-2 border-background font-bold text-xs hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_0_var(--background)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-[transform,box-shadow] duration-100">
              LOGIN
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-10 lg:pt-20 pb-16 lg:pb-28">
        {/* Floating event toast — brutalist style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.3 }}
          className="hidden lg:flex absolute top-28 right-[6%] items-center gap-3 bg-accent border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] px-4 py-3 z-30"
        >
          <div className="h-9 w-9 bg-foreground flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-xs font-bold font-mono uppercase">Jazz Night</p>
            <p className="text-[10px] text-foreground/60 font-mono">Central Quad • 7PM</p>
          </div>
          <Badge variant="destructive" className="ml-2">LAST 5!</Badge>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Hero text */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="pt-4 lg:pt-8">
            <div className="inline-flex items-center gap-2 bg-brutal-green border-[2px] border-foreground shadow-[2px_2px_0_0_var(--foreground)] px-4 py-1.5 text-xs font-bold font-mono uppercase text-foreground mb-8">
              <span className="h-2 w-2 bg-foreground animate-pulse" />
              Campus Map 2.0 is LIVE
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-heading font-extrabold tracking-tight leading-[1.05] mb-6">
              Your Campus,{' '}
              <span className="bg-primary text-primary-foreground px-2 -rotate-1 inline-block">Reimagined</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-10">
              Discover local events, connect with friends in real-time, and navigate your university experience with the pulse of the student body at your fingertips.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Button onClick={handleGoogleLogin} size="lg" className="font-heading text-base">
                Get Started <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
              <Button variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})} size="lg" className="font-heading text-base gap-2">
                <MapIcon className="h-5 w-5" /> Explore Map
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-1">
                {[
                  { l: 'A', bg: 'bg-brutal-pink' },
                  { l: 'B', bg: 'bg-brutal-blue' },
                  { l: 'C', bg: 'bg-brutal-yellow' }
                ].map(({l, bg}) => (
                  <div key={l} className={`h-9 w-9 border-[2.5px] border-foreground ${bg} flex items-center justify-center text-foreground text-[10px] font-bold font-mono`}>{l}</div>
                ))}
                <div className="h-9 w-9 border-[2.5px] border-foreground bg-foreground flex items-center justify-center text-background text-[9px] font-bold font-mono">+2k</div>
              </div>
              <span className="text-sm text-muted-foreground">Join <strong className="text-foreground font-bold">2,000+</strong> students active today</span>
            </div>
          </motion.div>

          {/* Right: Login card */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="relative">
            {/* Friends indicator */}
            <div className="hidden lg:flex absolute -bottom-6 right-0 items-center gap-2 bg-brutal-cyan border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] px-3 py-2 z-20">
              <MapPin className="h-3.5 w-3.5 text-foreground" />
              <span className="text-xs text-foreground font-bold font-mono">3 friends @ Library</span>
            </div>

            <div className="bg-card border-[2.5px] border-foreground shadow-[6px_6px_0_0_var(--foreground)] p-8 lg:p-10 max-w-md mx-auto lg:ml-auto">
              <h2 className="text-xl font-heading font-extrabold mb-1">Welcome back</h2>
              <p className="text-sm text-muted-foreground mb-6">Access your campus ecosystem</p>

              <button onClick={handleGoogleLogin} className="w-full h-12 bg-background hover:bg-muted border-[2.5px] border-foreground shadow-[3px_3px_0_0_var(--foreground)] flex items-center justify-center gap-3 font-bold text-sm transition-[transform,box-shadow] duration-100 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--foreground)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none mb-5">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-[2px] bg-foreground/20" />
                <span className="text-xs text-muted-foreground font-mono font-bold uppercase">OR</span>
                <div className="flex-1 h-[2px] bg-foreground/20" />
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Student Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@university.edu" className="w-full h-11 bg-background border-[2.5px] border-foreground px-4 text-sm outline-none focus:shadow-[4px_4px_0_0_var(--foreground)] transition-[box-shadow] duration-100" />
                </div>
                <div>
                  <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-11 bg-background border-[2.5px] border-foreground px-4 text-sm outline-none focus:shadow-[4px_4px_0_0_var(--foreground)] transition-[box-shadow] duration-100" />
                </div>
              </div>

              <Button onClick={handleGoogleLogin} className="w-full h-12 font-heading text-base">
                Login
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4">New here? <button onClick={handleGoogleLogin} className="text-primary font-bold hover:underline underline-offset-2">Create an account</button></p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="border-t-[2.5px] border-foreground bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="text-center mb-16">
            <Badge variant="default" className="mb-4 text-xs px-3 py-1">FEATURES</Badge>
            <h2 className="text-3xl lg:text-4xl font-heading font-extrabold tracking-tight mb-4">Built for Student Life</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need to make the most of your college years, unified in one bold experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Sparkles className="h-7 w-7" />, bg: 'bg-brutal-yellow', title: 'Smart Recommendations', desc: 'Our AI understands your interests and schedule to suggest events and study groups that actually matter to you.' },
              { icon: <MapIcon className="h-7 w-7" />, bg: 'bg-brutal-blue text-white', title: 'Interactive Map', desc: 'Never get lost again. Find your classes, see live heatmaps of active campus zones, and locate friends in real-time.' },
              { icon: <Users className="h-7 w-7" />, bg: 'bg-brutal-pink text-white', title: 'Social Circles', desc: 'Create private or public hubs for your dorm, major, or clubs. Coordinate meetups and share experiences seamlessly.' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.3 }}
                className="bg-card border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] p-8 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-[transform,box-shadow] duration-100 group">
                <div className={`h-14 w-14 border-[2.5px] border-foreground ${f.bg} flex items-center justify-center mb-6 shadow-[2px_2px_0_0_var(--foreground)]`}>{f.icon}</div>
                <h3 className="text-lg font-heading font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section id="trending" className="border-t-[2.5px] border-foreground">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-heading font-extrabold tracking-tight mb-2">Trending Now</h2>
              <p className="text-muted-foreground">What's buzzing on campus right now</p>
            </div>
            <button className="hidden sm:flex items-center gap-2 text-primary font-bold text-sm hover:underline underline-offset-2">
              View All Activity <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Featured Event Card */}
            <div className="md:row-span-2 border-[2.5px] border-foreground shadow-[6px_6px_0_0_var(--foreground)] overflow-hidden relative group cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_var(--foreground)] transition-[transform,box-shadow] duration-100" onClick={handleGoogleLogin}>
              <div className="h-full min-h-[420px] bg-primary flex flex-col justify-end">
                <div className="p-8 w-full border-t-[2.5px] border-foreground bg-card">
                  <Badge variant="default" className="mb-4">POPULAR CHOICE</Badge>
                  <h3 className="text-2xl font-heading font-extrabold mb-2">Tech Summit 2024</h3>
                  <p className="text-muted-foreground text-sm mb-4 font-mono">Engineering Hall • Starts in 2 hours</p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {['T','S','R'].map(l => <div key={l} className="h-7 w-7 border-[2px] border-foreground bg-accent flex items-center justify-center text-foreground text-[9px] font-bold font-mono">{l}</div>)}
                    </div>
                    <span className="text-muted-foreground text-xs font-bold font-mono">150+ GOING</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Campus Hubs Card */}
            <div className="border-[2.5px] border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)] p-6 flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_var(--foreground)] transition-[transform,box-shadow] duration-100 cursor-pointer" onClick={handleGoogleLogin}>
              <div>
                <h3 className="text-lg font-heading font-bold mb-1">Campus Hubs</h3>
                <p className="text-sm text-muted-foreground mb-4">The Student Union is currently the busiest spot.</p>
              </div>
              <Button variant="outline" className="text-sm font-bold w-fit">Open Map</Button>
            </div>

            {/* Quick cards */}
            <div className="border-[2.5px] border-foreground bg-brutal-purple text-white shadow-[4px_4px_0_0_var(--foreground)] p-6 flex flex-col items-center text-center hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_var(--foreground)] transition-[transform,box-shadow] duration-100 cursor-pointer" onClick={handleGoogleLogin}>
              <div className="h-12 w-12 border-[2.5px] border-white/50 bg-white/20 flex items-center justify-center mb-4"><Sparkles className="h-6 w-6 text-white" /></div>
              <h4 className="font-heading font-bold mb-1">Art Collective</h4>
              <p className="text-xs text-white/70 mb-3 font-mono">12 NEW MEMBERS TODAY</p>
              <Button size="sm" variant="accent" className="text-xs font-bold">Join</Button>
            </div>

            <div className="border-[2.5px] border-foreground bg-brutal-green shadow-[4px_4px_0_0_var(--foreground)] p-6 flex flex-col items-center text-center hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_var(--foreground)] transition-[transform,box-shadow] duration-100 cursor-pointer" onClick={handleGoogleLogin}>
              <div className="h-12 w-12 border-[2.5px] border-foreground bg-foreground flex items-center justify-center mb-4"><TrendingUp className="h-6 w-6 text-brutal-green" /></div>
              <h4 className="font-heading font-bold mb-1">Flash Sale: Main Cafe</h4>
              <p className="text-xs text-foreground/70 font-mono">50% OFF • NEXT 30 MINS</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MANAGEMENT ── */}
      <section id="management" className="border-t-[2.5px] border-foreground bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] p-10 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-[transform,box-shadow] duration-100">
              <div className="h-14 w-14 border-[2.5px] border-foreground bg-brutal-blue flex items-center justify-center mb-6 shadow-[2px_2px_0_0_var(--foreground)]"><LayoutDashboard className="h-7 w-7 text-white" /></div>
              <h3 className="text-xl font-heading font-extrabold mb-3">Organizer Portal</h3>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">Manage event lifecycles, moderate attendees, and analyze engagement with deep-dive metrics.</p>
              <Button variant="secondary" onClick={handleOrganizerLogin}>Access Organizer View</Button>
            </div>
            <div className="bg-card border-[2.5px] border-foreground shadow-[4px_4px_0_0_var(--foreground)] p-10 relative hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--foreground)] transition-[transform,box-shadow] duration-100">
              <Badge variant="destructive" className="absolute top-6 right-6">RESTRICTED</Badge>
              <div className="h-14 w-14 border-[2.5px] border-foreground bg-destructive flex items-center justify-center mb-6 shadow-[2px_2px_0_0_var(--foreground)]"><Shield className="h-7 w-7 text-white" /></div>
              <h3 className="text-xl font-heading font-extrabold mb-3">System Administration</h3>
              <p className="text-muted-foreground text-sm mb-8 leading-relaxed">Global oversight, security configuration, and user role moderation. Only accessible via admin tokens.</p>
              <Button onClick={() => login(UserRole.ADMIN).then(onEnter)} className="bg-foreground text-background hover:bg-foreground/90">Enter Admin Console</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t-[2.5px] border-foreground bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary border-2 border-background flex items-center justify-center"><Sparkles className="h-3 w-3 text-background" /></div>
            <span className="font-heading font-extrabold text-sm">CAMPUSPULSE</span>
          </div>
          <div className="flex gap-8 text-xs text-background/60 font-mono font-bold uppercase">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
            <a href="#" className="hover:text-primary transition-colors">Safety</a>
          </div>
          <p className="text-xs text-background/40 font-mono">© 2026 CAMPUSPULSE</p>
        </div>
      </footer>
    </div>
  );
}
