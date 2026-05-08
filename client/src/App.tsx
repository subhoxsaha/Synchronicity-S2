/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Toaster } from '@/components/ui/sonner';
import StudentPortal from './components/StudentPortal';
import { LoadingScreen } from './components/LoadingScreen';
import { LandingPage } from './components/LandingPage';

function AppContent() {
  const { currentUser, authLoading } = useAppContext();

  if (authLoading) return <LoadingScreen />;
  if (!currentUser) return <LandingPage onEnter={() => {}} />;

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <StudentPortal />
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
