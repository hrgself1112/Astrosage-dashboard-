
import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { TuneVariantIcon } from './icons/TuneVariantIcon';
// FIX: Changed firebase/auth to @firebase/auth to fix module resolution errors.
import type { User } from '@firebase/auth';

interface HeaderProps {
    user: User | null;
    onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-m3-surface flex-shrink-0 flex justify-between items-center h-[73px] px-4 md:px-6 border-b border-m3-outline/20">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <MagnifyingGlassIcon className="h-6 w-6 text-m3-on-surface-variant" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            className="block w-full rounded-full border-0 bg-m3-surface-container-high py-3.5 pl-12 pr-12 text-m3-on-surface placeholder:text-m3-on-surface-variant focus:ring-2 focus:ring-inset focus:ring-m3-primary transition-shadow"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <button className="p-2 text-m3-on-surface-variant rounded-full hover:bg-m3-surface-variant">
                <TuneVariantIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center pl-4">
         <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="ml-2">
                <div className="w-10 h-10 rounded-full bg-m3-tertiary flex items-center justify-center text-m3-on-tertiary font-medium text-lg uppercase">
                    {user?.email?.charAt(0) || 'U'}
                </div>
            </button>
            {isMenuOpen && (
                 <div className="absolute right-0 mt-2 w-56 bg-m3-surface-container rounded-2xl shadow-2xl py-2 z-10 border border-m3-outline/20">
                    <div className="px-4 py-2 border-b border-m3-outline/20">
                        <p className="text-sm font-medium text-m3-on-surface-variant">Signed in as</p>
                        <p className="text-sm text-m3-on-surface font-semibold truncate">{user?.email}</p>
                    </div>
                    <button onClick={onSignOut} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-m3-error hover:bg-m3-error/10 font-medium">
                        <span>Sign Out</span>
                    </button>
                 </div>
            )}
         </div>
      </div>
    </header>
  );
};

export default Header;
