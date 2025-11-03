'use client';

import { useState } from 'react';
import { User as FirebaseUser } from '@firebase/auth';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

interface HeaderProps {
  user: FirebaseUser | null;
  userProfile: User | null;
  onSignOut: () => void;
  onSidebarToggle: () => void;
}

export function Header({ user, userProfile, onSignOut, onSidebarToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-m3-surface border-b border-m3-outline-variant px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="lg:hidden text-m3-on-surface-variant hover:text-m3-on-surface"
        >
          <Bars3Icon className="w-5 h-5" />
        </Button>

        {/* Search bar - Hidden for now */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full px-4 py-2 pl-10 bg-m3-surface-container border border-m3-outline rounded-lg text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-primary focus:border-transparent"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-m3-on-surface-variant" />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-m3-on-surface-variant hover:text-m3-on-surface"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-m3-on-surface-variant hover:text-m3-on-surface"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-m3-error rounded-full"></span>
          </Button>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-m3-on-surface">
                {userProfile?.displayName || 'Admin User'}
              </p>
              <p className="text-xs text-m3-on-surface-variant">
                {userProfile?.role || 'admin'}
              </p>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full bg-m3-primary-container text-m3-on-primary-container"
              >
                {userProfile?.displayName ? (
                  userProfile.displayName.charAt(0).toUpperCase()
                ) : (
                  user?.email?.charAt(0).toUpperCase() || 'A'
                )}
              </Button>
            </div>

            {/* Sign out button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className="text-m3-on-surface-variant hover:text-m3-error"
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications dropdown */}
      {showNotifications && (
        <div className="absolute right-6 top-full mt-2 w-80 bg-m3-surface border border-m3-outline rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-m3-outline-variant">
            <h3 className="font-medium text-m3-on-surface">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <div className="p-4 text-center text-m3-on-surface-variant">
              No new notifications
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// Search icon component
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}