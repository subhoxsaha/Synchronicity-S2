import React, { useState } from 'react';
import { UserRole } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RoleSwitcher() {
  const { setRole, currentUser } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 flex flex-col gap-2 rounded-2xl bg-card p-2 shadow-2xl border border-border"
          >
            <Button
              variant={currentUser?.role === UserRole.STUDENT ? "default" : "ghost"}
              size="sm"
              onClick={() => { setRole(UserRole.STUDENT); setIsOpen(false); }}
              className="justify-start gap-2 rounded-xl"
            >
              <Users className="h-4 w-4" />
              Student View
            </Button>
            <Button
              variant={currentUser?.role === UserRole.ORGANIZER ? "default" : "ghost"}
              size="sm"
              onClick={() => { setRole(UserRole.ORGANIZER); setIsOpen(false); }}
              className="justify-start gap-2 rounded-xl"
            >
              <Briefcase className="h-4 w-4" />
              Organizer View
            </Button>
            <Button
              variant={currentUser?.role === UserRole.ADMIN ? "default" : "ghost"}
              size="sm"
              onClick={() => { setRole(UserRole.ADMIN); setIsOpen(false); }}
              className="justify-start gap-2 rounded-xl"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin View
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full border-2 border-primary/20 bg-background/80 backdrop-blur-md shadow-xl"
      >
        <Users className="h-6 w-6 text-primary" />
      </Button>
    </div>
  );
}
