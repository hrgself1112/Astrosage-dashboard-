'use client';

import { Card } from '@/components/ui/card';
import { ShieldCheckIcon, UserIcon, EyeIcon, PencilIcon, CogIcon } from 'lucide-react';

export function RoleManager() {
  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access with user management, document control, and system administration.',
      icon: ShieldCheckIcon,
      color: 'bg-red-100 text-red-800',
      permissions: [
        'User Management',
        'Document Management',
        'Panelist Management',
        'System Configuration',
        'Audit Log Access'
      ]
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Can create and edit content, manage panelists, and view own activity logs.',
      icon: PencilIcon,
      color: 'bg-blue-100 text-blue-800',
      permissions: [
        'Document Management',
        'Panelist Management',
        'Basic Content Control'
      ]
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to shared content and personal profile.',
      icon: EyeIcon,
      color: 'bg-gray-100 text-gray-800',
      permissions: [
        'Content Viewing',
        'Profile Management'
      ]
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-m3-on-surface">Role Management</h2>
        <p className="text-m3-on-surface-variant">
          Configure role-based access control and permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full ${role.color} flex items-center justify-center`}>
                  <role.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-m3-on-surface">{role.name}</h3>
                  <p className="text-sm text-m3-on-surface-variant mt-1">
                    {role.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-m3-on-surface">Permissions:</h4>
                <ul className="space-y-2">
                  {role.permissions.map((permission, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-m3-on-surface">
                      <div className="w-2 h-2 bg-m3-success rounded-full"></div>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-m3-outline-variant">
                <div className="text-sm text-m3-on-surface-variant">
                  <strong>Users with this role:</strong> 0
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Role Statistics */}
      <Card className="mt-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-m3-on-surface mb-4">Role Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-m3-primary">0</div>
              <div className="text-sm text-m3-on-surface-variant">Administrators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-m3-secondary">0</div>
              <div className="text-sm text-m3-on-surface-variant">Editors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-m3-tertiary">0</div>
              <div className="text-sm text-m3-on-surface-variant">Viewers</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}