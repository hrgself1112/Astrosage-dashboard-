import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import { signOut } from '@firebase/auth';

interface UseSessionTimeoutProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: (remainingMinutes: number) => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
  onWarning
}: UseSessionTimeoutProps = {}) => {
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
  }, [resetTimer]);

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      onTimeout?.();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [onTimeout]);

  useEffect(() => {
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      setLastActivity(new Date());
      if (showWarning) {
        setShowWarning(false);
        setRemainingTime(0);
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
        setRemainingTime(timeoutMinutes - inactiveTime);
        if (remainingTime <= 0) {
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

  return {
    resetTimer,
    extendSession,
    showWarning,
    remainingTime,
    isWarningModalOpen,
    setIsWarningModalOpen
  };
};

export default useSessionTimeout;