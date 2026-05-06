/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Toaster } from '@/components/ui/sonner';
import { UserRole } from './types';
import StudentPortal from './components/StudentPortal';
import OrganizerPortal from './components/OrganizerPortal';
import AdminPortal from './components/AdminPortal';
import RoleSwitcher from './components/RoleSwitcher';
import { LoadingScreen } from './components/LoadingScreen';
import { LandingPage } from './components/LandingPage';

function AppContent() {
  const { currentUser } = useAppContext();
  const [appState, setAppState] = useState<'loading' | 'landing' | 'ready'>('loading');

  useEffect(() => {
    // Initial preloader
    const timer = setTimeout(() => {
      setAppState('landing');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setAppState('ready');
  };

  if (appState === 'loading') return <LoadingScreen />;
  if (appState === 'landing') return <LandingPage onEnter={handleEnter} />;
  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {currentUser.role === UserRole.STUDENT && <StudentPortal />}
      {currentUser.role === UserRole.ORGANIZER && <OrganizerPortal />}
      {currentUser.role === UserRole.ADMIN && <AdminPortal />}
      
      <RoleSwitcher />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
