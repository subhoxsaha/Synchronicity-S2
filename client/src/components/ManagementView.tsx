import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import { Button } from '@/components/ui/button';
import OrganizerPortal from './OrganizerPortal';
import AdminPortal from './AdminPortal';

export function ManagementView() {
  const { currentUser } = useAppContext();

  if (currentUser?.role === UserRole.ADMIN) {
    return <AdminPortal />;
  }

  if (currentUser?.role === UserRole.ORGANIZER) {
    return <OrganizerPortal />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
        <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse" />
            <ShieldAlert className="h-20 w-20 text-primary relative z-10 mx-auto" strokeWidth={1} />
        </div>
        <div className="space-y-2">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Access Restricted</h3>
            <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">Security Clearance Required for Console Access</p>
        </div>
        <Button variant="outline" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest border-white/10 hover:bg-white/5">
            Return to Node
        </Button>
    </div>
  );
}
