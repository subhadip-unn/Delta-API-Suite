'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TourContextType {
  showGlobalTour: boolean;
  setShowGlobalTour: (show: boolean) => void;
  hasSeenGlobalTour: boolean;
  setHasSeenGlobalTour: (seen: boolean) => void;
  currentMode: string;
  setCurrentMode: (mode: string) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [showGlobalTour, setShowGlobalTour] = useState(false);
  const [hasSeenGlobalTour, setHasSeenGlobalTour] = useState(false);
  const [currentMode, setCurrentMode] = useState('api-explorer');

  useEffect(() => {
    const tourSeen = localStorage.getItem('delta-global-tour-seen');
    setHasSeenGlobalTour(!!tourSeen);
  }, []);

  const handleSetHasSeenGlobalTour = (seen: boolean) => {
    setHasSeenGlobalTour(seen);
    if (seen) {
      localStorage.setItem('delta-global-tour-seen', 'true');
    } else {
      localStorage.removeItem('delta-global-tour-seen');
    }
  };

  return (
    <TourContext.Provider
      value={{
        showGlobalTour,
        setShowGlobalTour,
        hasSeenGlobalTour,
        setHasSeenGlobalTour: handleSetHasSeenGlobalTour,
        currentMode,
        setCurrentMode,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
