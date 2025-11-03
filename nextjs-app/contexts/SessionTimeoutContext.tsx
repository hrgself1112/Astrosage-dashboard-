'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { signOut as firebaseSignOut } from '@firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { SessionTimeoutWarning } from '@/components/SessionTimeoutWarning';

interface SessionTimeoutContextType {
  resetTimer: () => void;
  extendSession: () => void;
  showWarning: boolean;
  remainingTime: number;
  isWarningModalOpen: boolean;
  setIsWarningModalOpen: (open: boolean) => void;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

interface SessionTimeoutProviderProps {
  children: ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: (remainingMinutes: number) => void;
}

export function SessionTimeoutProvider({
  children,
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
  onWarning
}: SessionTimeoutProviderProps) {
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  const resetTimer = useCallback(() => {
    setLastActivity(new Date());
    setShowWarning(false);
    setRemainingTime(0);
    setIsWarningModalOpen(false);
  }, []);

  const extendSession = useCallback(() => {
    resetTimer();
    toast.success('Session extended');
  }, [resetTimer]);

  const signOutUser = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      onTimeout?.();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [onTimeout]);

  // Track user activity
  useEffect(() => {
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
      'keyup'
    ];

    const handleActivity = () => {
      setLastActivity(new Date());
      if (showWarning) {
        setShowWarning(false);
        setRemainingTime(0);
        setIsWarningModalOpen(false);
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [showWarning]);

  // Check session timeout
  useEffect(() => {
    const checkSession = setInterval(() => {
      const now = new Date();
      const inactiveTime = (now.getTime() - lastActivity.getTime()) / 1000 / 60; // in minutes

      if (inactiveTime >= timeoutMinutes) {
        // Session has timed out
        signOutUser();
        clearInterval(checkSession);
        return;
      }

      if (inactiveTime >= timeoutMinutes - warningMinutes && !showWarning) {
        // Show warning
        setShowWarning(true);
        setRemainingTime(timeoutMinutes - inactiveTime);
        setIsWarningModalOpen(true);
        onWarning?.(Math.ceil(timeoutMinutes - inactiveTime));
      }

      if (showWarning) {
        const newRemainingTime = timeoutMinutes - inactiveTime;
        setRemainingTime(Math.max(0, newRemainingTime));

        if (newRemainingTime <= 0) {
          signOutUser();
          clearInterval(checkSession);
        }
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(checkSession);
    };
  }, [
    lastActivity,
    timeoutMinutes,
    warningMinutes,
    showWarning,
    remainingTime,
    signOutUser,
    onWarning
  ]);

  const value: SessionTimeoutContextType = {
    resetTimer,
    extendSession,
    showWarning,
    remainingTime,
    isWarningModalOpen,
    setIsWarningModalOpen,
  };

  return (
    <SessionTimeoutContext.Provider value={value}>
      {children}
      <SessionTimeoutWarning
        isOpen={isWarningModalOpen}
        remainingMinutes={remainingTime}
        onExtendSession={extendSession}
        onSignOut={signOutUser}
      />
    </SessionTimeoutContext.Provider>
  );
}

export function useSessionTimeout() {
  const context = useContext(SessionTimeoutContext);
  if (context === undefined) {
    throw new Error('useSessionTimeout must be used within a SessionTimeoutProvider');
  }
  return context;
}