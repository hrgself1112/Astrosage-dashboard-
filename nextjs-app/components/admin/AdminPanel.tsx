'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UsersIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon,
  UserPlusIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserManager } from './UserManager';
import { RoleManager } from './RoleManager';
import { AuditLogs } from './AuditLogs';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const router = useRouter();

  const tabs = [
    {
      id: 'users',
      label: 'User Management',
      icon: UsersIcon,
      description: 'Manage users, roles, and permissions'
    },
    {
      id: 'roles',
      label: 'Role Management',
      icon: ShieldCheckIcon,
      description: 'Configure role-based access control'
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: ClipboardDocumentListIcon,
      description: 'View system activity and audit trail'
    },
  ];

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-m3-surface">
      {/* Header */}
      <div className="bg-m3-surface-container border-b border-m3-outline-variant">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-m3-on-surface-variant hover:text-m3-on-surface"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-m3-on-surface">Admin Panel</h1>
                <p className="text-sm text-m3-on-surface-variant">
                  System administration and management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-m3-surface-variant p-1 rounded-lg">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="users" className="h-full">
            <UserManager />
          </TabsContent>
          <TabsContent value="roles" className="h-full">
            <RoleManager />
          </TabsContent>
          <TabsContent value="audit" className="h-full">
            <AuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}