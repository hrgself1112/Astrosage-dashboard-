'use client';

import { ClockIcon, ArrowRightOnRectangleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  remainingMinutes: number;
  onExtendSession: () => void;
  onSignOut: () => void;
}

export function SessionTimeoutWarning({
  isOpen,
  remainingMinutes,
  onExtendSession,
  onSignOut,
}: SessionTimeoutWarningProps) {
  const formatTime = (minutes: number): string => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
            </div>
            Session Timeout Warning
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <DialogDescription>
            Your session will expire in{' '}
            <span className="font-semibold text-m3-on-surface">
              {formatTime(remainingMinutes)}
            </span>
            {' '}due to inactivity.
          </DialogDescription>

          <div className="w-full bg-m3-surface-variant rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(0, (remainingMinutes / 5) * 100)}%`,
              }}
            />
          </div>

          <p className="text-sm text-m3-on-surface-variant">
            For your security, you will be automatically logged out when the session expires.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSignOut}
            className="flex-1"
          >
            Sign Out Now
          </Button>
          <Button
            onClick={onExtendSession}
            className="flex-1"
          >
            Extend Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}