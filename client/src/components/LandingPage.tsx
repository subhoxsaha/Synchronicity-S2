import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { Particles } from './Particles';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Users, Zap, Shield } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Dynamic Particle Background */}
      <Particles />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <nav className="container relative mx-auto flex items-center justify-between px-6 py-6">
        <Logo className="h-10" />
        <Button variant="ghost" className="font-bold rounded-full">Sign In</Button>
      </nav>

      <main className="container relative mx-auto px-6 pt-20 pb-32">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary mb-6">
              <Zap className="h-3 w-3" />
              The Next Evolution of Campus Life
            </span>
            <h1 className="font-heading text-4xl font-black tracking-tighter sm:text-7xl lg:text-8xl">
              Connect. Explore.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-secondary transition-all hover:brightness-110">
                Liven your Campus.
              </span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-muted-foreground/80 sm:text-xl font-medium">
              Campus Pulse is the real-time ecosystem where students, creators, and organizers converge to build the future of campus culture.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 flex flex-col items-center gap-6 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={onEnter}
              className="h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95 group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg font-bold border-2 hover:bg-accent/50 transition-all">
              Watch Pulse Demo
            </Button>
          </motion.div>

          {/* Stats/Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 sm:mt-32 grid grid-cols-2 gap-6 md:grid-cols-4 w-full max-w-4xl"
          >
            {[
              { icon: Users, label: "Students", count: "12k+" },
              { icon: Globe, label: "Communities", count: "150+" },
              { icon: Zap, label: "Monthly Events", count: "400+" },
              { icon: Shield, label: "Verified Data", count: "100%" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-accent/5 transition-colors hover:bg-accent/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/50 animate-pulse-subtle">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xl sm:text-2xl font-black">{item.count}</div>
                <div className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      <footer className="container mx-auto mt-20 border-t border-border px-6 py-12 text-center text-sm text-muted-foreground">
        <Logo className="h-6 mb-4 opacity-50 justify-center" showText={false} />
        <p>© 2026 Campus Pulse. All rights reserved.</p>
      </footer>
    </div>
  );
}
