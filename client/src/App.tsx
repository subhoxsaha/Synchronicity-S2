/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Toaster } from '@/components/ui/sonner';
import StudentPortal from './components/StudentPortal';
import { LoadingScreen } from './components/LoadingScreen';
import { LandingPage } from './components/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StudentOnboarding } from './components/StudentOnboarding';
import { OrganizationProfile } from './components/OrganizationProfile';
import { UserRole } from './types';
import './services/clearData'; // Exposes window.__clearAll(), window.__clearEvents()

import { Button } from '@/components/ui/button';

function PublicHeader() {
  const { login } = useAppContext();
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-foreground border-b-[3px] border-background">
      <div className="flex items-center gap-2">
        <span className="text-sm font-extrabold tracking-tight text-background uppercase">Campus<span className="text-primary">Pulse</span></span>
      </div>
      <Button size="sm" onClick={() => login()} className="h-8 text-[10px] font-black uppercase bg-primary text-primary-foreground border-[2px] border-background shadow-[2px_2px_0_0_var(--primary)]">Log In / Sign Up</Button>
    </header>
  );
}

function AppContent() {
  const { currentUser, isInitializing } = useAppContext();

  if (isInitializing) return <LoadingScreen />;

  // Public routing for guests
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/org/:orgId" element={
          <div className="min-h-screen bg-background font-sans selection:bg-primary/20 flex flex-col">
            <PublicHeader />
            <div className="flex-1">
              <OrganizationProfile />
            </div>
            <Toaster position="top-center" richColors />
          </div>
        } />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

  // Show onboarding wizard for new students who haven't completed setup
  // Admins and ambassadors skip onboarding
  const needsOnboarding =
    !currentUser.onboardingComplete &&
    currentUser.role === UserRole.STUDENT &&
    !currentUser.major &&
    !currentUser.year;

  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
        <StudentOnboarding />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
          <StudentPortal />
          <Toaster position="top-center" richColors />
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
