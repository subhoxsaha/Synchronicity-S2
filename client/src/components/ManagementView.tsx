import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, GraduationCap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import OrganizerPortal from './OrganizerPortal';
import { PlatformAdminPortal } from './PlatformAdminPortal';
import { AmbassadorPortal } from './AmbassadorPortal';
import { CreateOrganizationDialog } from './AccountSection';
import { InstituteOnboardingRequest } from './InstituteOnboardingRequest';

export function ManagementView() {
  const navigate = useNavigate();
  const { currentUser, myOrganizations, createOrganization } = useAppContext();
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isInstituteRequestOpen, setIsInstituteRequestOpen] = useState(false);

  if (currentUser?.role === UserRole.PLATFORM_ADMIN) {
    return <PlatformAdminPortal />;
  }

  if (currentUser?.role === UserRole.AMBASSADOR) {
    return <AmbassadorPortal />;
  }

  if (currentUser?.role === UserRole.ORGANIZER) {
    return <OrganizerPortal />;
  }

  // Student view — prompt to create an organization or request institute
  return (
    <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
        <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse" />
            <Building2 className="h-20 w-20 text-primary relative z-10 mx-auto" strokeWidth={1} />
        </div>
        <div className="space-y-2">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Launch Your Organization</h3>
            <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px]">Create and manage campus organizations</p>
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
            <Button className="rounded-none h-12 px-8 font-black uppercase tracking-widest border-[2.5px] border-foreground bg-card text-foreground hover:bg-muted shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => navigate('/')}>
                Return to Feed
            </Button>
            <Button className="rounded-none h-12 px-8 font-black uppercase tracking-widest border-[2.5px] border-foreground bg-primary text-white hover:bg-primary/90 shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => setIsCreateOrgOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create Organization
            </Button>
            <Button className="rounded-none h-12 px-8 font-black uppercase tracking-widest border-[2.5px] border-foreground bg-card text-foreground hover:bg-muted shadow-[4px_4px_0_0_var(--foreground)] active:translate-y-[2px] active:shadow-none transition-all" onClick={() => setIsInstituteRequestOpen(true)}>
                <GraduationCap className="h-4 w-4 mr-2" /> Request Institute
            </Button>
        </div>
        {myOrganizations.length > 0 && (
          <div className="mt-6 text-xs text-muted-foreground font-medium">
            You belong to {myOrganizations.length} organization{myOrganizations.length > 1 ? 's' : ''}. Check your account for status.
          </div>
        )}
        <CreateOrganizationDialog 
          open={isCreateOrgOpen} 
          onOpenChange={setIsCreateOrgOpen} 
          onSubmit={createOrganization} 
        />
        
        {/* Institute Onboarding Request Dialog */}
        <Dialog open={isInstituteRequestOpen} onOpenChange={setIsInstituteRequestOpen}>
          <DialogContent className="max-w-2xl p-0 border-[3px] border-foreground shadow-[8px_8px_0_0_var(--foreground)] bg-card overflow-hidden max-h-[85vh] overflow-y-auto">
            <DialogTitle className="sr-only">Request Institute Onboarding</DialogTitle>
            <div className="p-6">
              <InstituteOnboardingRequest />
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}
