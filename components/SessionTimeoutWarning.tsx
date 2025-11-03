import React from 'react';
import { ClockIcon } from './icons/ClockIcon';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  remainingMinutes: number;
  onExtendSession: () => void;
  onSignOut: () => void;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  isOpen,
  remainingMinutes,
  onExtendSession,
  onSignOut
}) => {
  if (!isOpen) return null;

  const formatTime = (minutes: number): string => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-m3-surface rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-full">
            <ClockIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-m3-on-surface">
            Session Timeout Warning
          </h2>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-m3-on-surface-variant mb-4">
            Your session will expire in{' '}
            <span className="font-semibold text-m3-on-surface">
              {formatTime(remainingMinutes)}
            </span>
            {' '}due to inactivity.
          </p>
          <p className="text-sm text-m3-on-surface-variant">
            For your security, you will be automatically logged out when the session expires.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-m3-surface-variant rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(0, (remainingMinutes / 5) * 100)}%`
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onSignOut}
            className="flex-1 px-4 py-2 border border-m3-outline rounded-lg text-m3-on-surface hover:bg-m3-surface-variant transition-colors"
          >
            Sign Out Now
          </button>
          <button
            onClick={onExtendSession}
            className="flex-1 px-4 py-2 bg-m3-primary text-m3-on-primary rounded-lg hover:bg-m3-primary-container transition-colors"
          >
            Extend Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;