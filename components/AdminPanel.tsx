import React, { useState } from 'react';
import { UserIcon, ShieldCheckIcon, ClipboardDocumentListIcon, ArrowLeftIcon } from './icons';
import UserManager from './admin/UserManager';
import RoleManager from './admin/RoleManager';
import AuditLogs from './admin/AuditLogs';
import type { User as FirebaseUser } from '@firebase/auth';

interface AdminPanelProps {
  user: FirebaseUser;
  onBack: () => void;
}

type AdminTab = 'users' | 'roles' | 'audit';

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const tabs = [
    {
      id: 'users' as AdminTab,
      label: 'User Management',
      icon: UserIcon,
      description: 'Manage users, roles, and permissions'
    },
    {
      id: 'roles' as AdminTab,
      label: 'Role Management',
      icon: ShieldCheckIcon,
      description: 'Configure role-based access control'
    },
    {
      id: 'audit' as AdminTab,
      label: 'Audit Logs',
      icon: ClipboardDocumentListIcon,
      description: 'View system activity and audit trail'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-screen bg-m3-surface">
      {/* Header */}
      <div className="bg-m3-surface-container border-b border-m3-outline-variant">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-m3-surface-variant text-m3-on-surface-variant transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-m3-on-surface">Admin Panel</h1>
                <p className="text-sm text-m3-on-surface-variant">System administration and management</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-m3-on-surface-variant">
              <span>Logged in as:</span>
              <span className="font-medium text-m3-on-surface">{user.displayName || user.email}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-m3-surface-variant p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-m3-primary text-m3-on-primary shadow-sm'
                    : 'text-m3-on-surface-variant hover:text-m3-on-surface hover:bg-m3-surface'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'roles' && <RoleManager />}
        {activeTab === 'audit' && <AuditLogs />}
      </div>
    </div>
  );
};

export default AdminPanel;