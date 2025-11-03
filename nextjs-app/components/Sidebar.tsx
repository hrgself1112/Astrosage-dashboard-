'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  navigationItems: NavigationItem[];
}

export function Sidebar({ isOpen, onToggle, currentPage, onNavigate, navigationItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (page: string) => {
    onNavigate(page);
    router.push(`/${page === 'documents' ? '' : page}`);
  };

  return (
    <aside
      className={cn(
        'bg-m3-surface flex flex-col justify-between transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div>
        <div className={cn('flex items-center h-16', isOpen ? 'pl-4' : 'justify-center')}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface-variant"
          >
            <svg
              className={cn('w-6 h-6 transition-transform duration-200', !isOpen && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>

        {/* Navigation */}
        <nav className={cn('flex flex-col px-2 py-4 gap-2', isOpen ? 'px-3' : 'items-center')}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                size={isOpen ? 'default' : 'icon'}
                onClick={() => handleNavigation(item.id)}
                className={cn(
                  'w-full justify-start gap-3',
                  !isOpen && 'w-12 h-12 justify-center'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-m3-on-secondary')} />
                {isOpen && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
                {item.badge && isOpen && (
                  <span className="ml-auto bg-m3-error text-m3-on-error text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className={cn('p-4 border-t border-m3-outline-variant', isOpen ? 'px-3' : 'items-center')}>
        <div className={cn('flex items-center gap-3', !isOpen && 'flex-col')}>
          <div className={cn('relative', !isOpen && 'w-10 h-10')}>
            <div className="w-8 h-8 bg-m3-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-m3-on-primary">
                {(isOpen ? 'U' : 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-m3-surface rounded-full"></div>
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-m3-on-surface truncate">
                {userProfile?.displayName || 'Admin User'}
              </p>
              <p className="text-xs text-m3-on-surface-variant truncate">
                {userProfile?.email || 'admin@astrosage.com'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}