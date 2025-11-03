'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { CreateDocumentCard } from '@/components/CreateDocumentCard';
import { DocumentGrid } from '@/components/DocumentGrid';
import { DocumentFilters } from '@/components/DocumentFilters';
import { ViewToggle } from '@/components/ViewToggle';
import { UserCircleIcon, DocumentTextIcon, PhotoIcon, UsersIcon, ShieldIcon, SearchIcon } from 'lucide-react';

type PageType = 'documents' | 'panelists' | 'background-remover' | 'admin' | 'search';

export function Dashboard() {
  const { user, userProfile, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('documents');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const navigationItems = [
    {
      id: 'documents',
      label: 'Documents',
      icon: DocumentTextIcon,
    },
    {
      id: 'panelists',
      label: 'Panelists',
      icon: UsersIcon,
    },
    {
      id: 'background-remover',
      label: 'Background Remover',
      icon: PhotoIcon,
    },
    ...(isAdmin ? [{
      id: 'admin',
      label: 'Admin',
      icon: ShieldIcon,
    }] : []),
    {
      id: 'search',
      label: 'Search',
      icon: SearchIcon,
    },
  ];

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleSignOut = async () => {
    // Sign out is handled in the AuthContext
    window.location.href = '/auth';
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'documents':
        return (
          <>
            <div className="mb-8">
              <CreateDocumentCard onCreateNew={() => {}} />
            </div>

            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <h1 className="text-3xl font-bold text-m3-on-surface">Documents</h1>
              <div className="flex items-center gap-4">
                <DocumentFilters
                  onSearchChange={setSearchTerm}
                  onStatusChange={setStatusFilter}
                  searchTerm={searchTerm}
                  statusFilter={statusFilter}
                />
                <ViewToggle
                  viewMode={viewMode}
                  onToggle={setViewMode}
                />
              </div>
            </div>

            <DocumentGrid
              viewMode={viewMode}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
            />
          </>
        );

      case 'panelists':
        return (
          <div>
            <h1 className="text-3xl font-bold text-m3-on-surface mb-8">Panelists</h1>
            <div className="bg-m3-surface-container rounded-lg p-8 text-center">
              <UsersIcon className="w-16 h-16 text-m3-on-surface-variant mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-m3-on-surface mb-2">Panelists Management</h2>
              <p className="text-m3-on-surface-variant">
                Manage panelist profiles and permissions.
              </p>
              <Button className="mt-4">
                Add Panelist
              </Button>
            </div>
          </div>
        );

      case 'background-remover':
        return (
          <div>
            <h1 className="text-3xl font-bold text-m3-on-surface mb-8">Background Remover</h1>
            <div className="bg-m3-surface-container rounded-lg p-8 text-center">
              <PhotoIcon className="w-16 h-16 text-m3-on-surface-variant mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-m3-on-surface mb-2">AI Background Removal</h2>
              <p className="text-m3-on-surface-variant mb-4">
                Remove backgrounds from multiple images using AI.
              </p>
              <Button className="mt-4">
                Start Removing Backgrounds
              </Button>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div>
            <h1 className="text-3xl font-bold text-m3-on-surface mb-8">Admin Panel</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-m3-surface-container rounded-lg p-6">
                <h3 className="text-lg font-semibold text-m3-on-surface mb-2">User Management</h3>
                <p className="text-m3-on-surface-variant">Manage users and permissions</p>
              </div>
              <div className="bg-m3-surface-container rounded-lg p-6">
                <h3 className="text-lg font-semibold text-m3-on-surface mb-2">Audit Logs</h3>
                <p className="text-m3-on-surface-variant">View system activity</p>
              </div>
              <div className="bg-m3-surface-container rounded-lg p-6">
                <h3 className="text-lg font-semibold text-m3-on-surface mb-2">System Settings</h3>
                <p className="text-m3-on-surface-variant">Configure system options</p>
              </div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div>
            <h1 className="text-3xl font-bold text-m3-on-surface mb-8">Search</h1>
            <div className="bg-m3-surface-container rounded-lg p-8 text-center">
              <SearchIcon className="w-16 h-16 text-m3-on-surface-variant mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-m3-on-surface mb-2">Search</h2>
              <p className="text-m3-on-surface-variant">
                Search across all your documents and content.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-m3-surface">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentPage={currentPage}
        onNavigate={handleNavigation}
        navigationItems={navigationItems}
      />

      <div className="flex-1 flex flex-col h-screen">
        <Header
          user={user}
          userProfile={userProfile}
          onSignOut={handleSignOut}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}