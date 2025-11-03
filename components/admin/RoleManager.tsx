import React, { useState } from 'react';
import { InformationCircleIcon, ShieldCheckIcon, EyeIcon, PencilIcon, UserGroupIcon, CogIcon } from '../icons';
import type { UserRole, RolePermissions } from '../../types';

interface RoleDefinition {
  role: UserRole;
  name: string;
  description: string;
  icon: any;
  permissions: RolePermissions;
  color: string;
}

const RoleManager: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roleDefinitions: RoleDefinition[] = [
    {
      role: 'admin',
      name: 'Administrator',
      description: 'Full system access with user management and configuration capabilities',
      icon: ShieldCheckIcon,
      permissions: {
        canManageUsers: true,
        canManageDocuments: true,
        canManagePanelists: true,
        canViewAuditLogs: true,
        canManageSystem: true
      },
      color: 'red'
    },
    {
      role: 'editor',
      name: 'Editor',
      description: 'Can create and edit content, manage panelists, but no user management',
      icon: PencilIcon,
      permissions: {
        canManageUsers: false,
        canManageDocuments: true,
        canManagePanelists: true,
        canViewAuditLogs: false,
        canManageSystem: false
      },
      color: 'blue'
    },
    {
      role: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to shared content and personal profile',
      icon: EyeIcon,
      permissions: {
        canManageUsers: false,
        canManageDocuments: false,
        canManagePanelists: false,
        canViewAuditLogs: false,
        canManageSystem: false
      },
      color: 'gray'
    }
  ];

  const permissionLabels = {
    canManageUsers: {
      name: 'Manage Users',
      description: 'Create, edit, and delete user accounts',
      category: 'User Management'
    },
    canManageDocuments: {
      name: 'Manage Documents',
      description: 'Create, edit, and delete documents',
      category: 'Content Management'
    },
    canManagePanelists: {
      name: 'Manage Panelists',
      description: 'Manage panelist profiles and data',
      category: 'Content Management'
    },
    canViewAuditLogs: {
      name: 'View Audit Logs',
      description: 'Access system activity logs',
      category: 'Monitoring'
    },
    canManageSystem: {
      name: 'System Management',
      description: 'Access system configuration and settings',
      category: 'System Administration'
    }
  };

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colors = {
      red: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200'
      },
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200'
      },
      gray: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200'
      }
    };
    return colors[color as keyof typeof colors][type];
  };

  const groupedPermissions = Object.entries(permissionLabels).reduce((acc, [key, value]) => {
    if (!acc[value.category]) {
      acc[value.category] = [];
    }
    acc[value.category].push({ key, ...value });
    return acc;
  }, {} as Record<string, Array<{ key: keyof RolePermissions; name: string; description: string; category: string }>>);

  return (
    <div className="h-full flex">
      {/* Role Selection */}
      <div className="w-1/3 border-r border-m3-outline-variant p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold text-m3-on-surface mb-4">Roles</h2>
        <div className="space-y-3">
          {roleDefinitions.map((roleDef) => (
            <button
              key={roleDef.role}
              onClick={() => setSelectedRole(roleDef.role)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedRole === roleDef.role
                  ? 'border-m3-primary bg-m3-primary-container'
                  : 'border-m3-outline-variant hover:border-m3-primary hover:bg-m3-surface-variant'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getColorClasses(roleDef.color, 'bg')}`}>
                  <roleDef.icon className={`w-5 h-5 ${getColorClasses(roleDef.color, 'text')}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-m3-on-surface">{roleDef.name}</h3>
                  <p className="text-sm text-m3-on-surface-variant mt-1">{roleDef.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Role Information */}
        <div className="mt-6 p-4 bg-m3-surface-variant rounded-lg">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="w-5 h-5 text-m3-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-m3-on-surface">About Roles</h4>
              <p className="text-sm text-m3-on-surface-variant mt-1">
                Roles define what users can access and do within the system. Each role comes with a specific set of permissions that can be customized.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Details */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedRole ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              {(() => {
                const roleDef = roleDefinitions.find(r => r.role === selectedRole)!;
                return (
                  <>
                    <div className={`p-3 rounded-full ${getColorClasses(roleDef.color, 'bg')}`}>
                      <roleDef.icon className={`w-6 h-6 ${getColorClasses(roleDef.color, 'text')}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-m3-on-surface">{roleDef.name}</h2>
                      <p className="text-m3-on-surface-variant">{roleDef.description}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-m3-on-surface mb-3">{category}</h3>
                  <div className="space-y-3">
                    {permissions.map((permission) => {
                      const roleDef = roleDefinitions.find(r => r.role === selectedRole)!;
                      const hasPermission = roleDef.permissions[permission.key as keyof RolePermissions];

                      return (
                        <div
                          key={permission.key}
                          className={`p-4 rounded-lg border ${
                            hasPermission
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-1 rounded-full ${
                              hasPermission ? 'bg-green-100' : 'bg-gray-200'
                            }`}>
                              {hasPermission ? (
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                hasPermission ? 'text-green-800' : 'text-gray-600'
                              }`}>
                                {permission.name}
                              </h4>
                              <p className={`text-sm ${
                                hasPermission ? 'text-green-700' : 'text-gray-500'
                              }`}>
                                {permission.description}
                              </p>
                            </div>
                            <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                              hasPermission
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {hasPermission ? 'Granted' : 'Denied'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Role Statistics */}
            <div className="mt-8 p-4 bg-m3-surface-variant rounded-lg">
              <h3 className="font-medium text-m3-on-surface mb-3">Role Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-m3-primary">0</div>
                  <div className="text-sm text-m3-on-surface-variant">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-m3-on-surface-variant">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(roleDefinitions.find(r => r.role === selectedRole)!.permissions).filter(Boolean).length}
                  </div>
                  <div className="text-sm text-m3-on-surface-variant">Permissions</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <UserGroupIcon className="w-12 h-12 text-m3-on-surface-variant mx-auto mb-4" />
              <h3 className="text-lg font-medium text-m3-on-surface mb-2">Select a Role</h3>
              <p className="text-m3-on-surface-variant">
                Choose a role from the left to view its permissions and details.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManager;