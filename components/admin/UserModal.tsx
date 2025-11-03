import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '../icons';
import { db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from '@firebase/firestore';
import type { User, UserRole, UserStatus, RolePermissions } from '../../types';

interface UserModalProps {
  user: User | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSave: (user: User) => void;
}

const defaultPermissions: RolePermissions = {
  canManageUsers: false,
  canManageDocuments: false,
  canManagePanelists: false,
  canViewAuditLogs: false,
  canManageSystem: false
};

const getPermissionsForRole = (role: UserRole): RolePermissions => {
  switch (role) {
    case 'admin':
      return {
        canManageUsers: true,
        canManageDocuments: true,
        canManagePanelists: true,
        canViewAuditLogs: true,
        canManageSystem: true
      };
    case 'editor':
      return {
        canManageUsers: false,
        canManageDocuments: true,
        canManagePanelists: true,
        canViewAuditLogs: false,
        canManageSystem: false
      };
    case 'viewer':
      return {
        canManageUsers: false,
        canManageDocuments: false,
        canManagePanelists: false,
        canViewAuditLogs: false,
        canManageSystem: false
      };
    default:
      return defaultPermissions;
  }
};

const UserModal: React.FC<UserModalProps> = ({ user, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'viewer' as UserRole,
    status: 'active' as UserStatus,
    permissions: defaultPermissions
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email,
        role: user.role,
        status: user.status,
        permissions: user.permissions || defaultPermissions
      });
    }
  }, [user, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (role: UserRole) => {
    const newPermissions = getPermissionsForRole(role);
    setFormData(prev => ({
      ...prev,
      role,
      permissions: newPermissions
    }));
  };

  const handlePermissionChange = (permission: keyof RolePermissions, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();

      if (mode === 'create') {
        // For new users, we would normally send an invitation
        // For now, we'll create a basic user record
        const newUser: User = {
          id: `temp_${Date.now()}`, // This would normally be the Firebase Auth UID
          email: formData.email,
          displayName: formData.displayName || undefined,
          role: formData.role,
          status: formData.status,
          createdAt: now,
          lastActiveAt: now,
          permissions: formData.permissions
        };

        // In a real implementation, this would involve Firebase Auth
        // For now, we'll just save to Firestore
        const userRef = doc(db, 'users', newUser.id);
        await setDoc(userRef, {
          ...newUser,
          createdAt: serverTimestamp(),
          lastActiveAt: serverTimestamp()
        });

        onSave(newUser);
      } else {
        // Update existing user
        if (!user) throw new Error('User not found');

        const updatedUser: User = {
          ...user,
          displayName: formData.displayName || undefined,
          role: formData.role,
          status: formData.status,
          permissions: formData.permissions,
          lastActiveAt: now
        };

        const userRef = doc(db, 'users', user.id);
        await setDoc(userRef, {
          ...updatedUser,
          lastActiveAt: serverTimestamp()
        }, { merge: true });

        onSave(updatedUser);
      }
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-m3-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-m3-outline-variant">
          <h2 className="text-xl font-semibold text-m3-on-surface">
            {mode === 'create' ? 'Create New User' : 'Edit User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-m3-surface-variant text-m3-on-surface-variant transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-m3-error-container text-m3-error rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-m3-on-surface mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-m3-on-surface mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-primary"
                    placeholder="Enter display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-m3-on-surface mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-primary"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Role and Status */}
            <div>
              <h3 className="text-lg font-medium text-m3-on-surface mb-4">Role & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-m3-on-surface mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
                  >
                    <option value="viewer">Viewer - Read-only access</option>
                    <option value="editor">Editor - Can edit content</option>
                    <option value="admin">Admin - Full access</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-m3-on-surface mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as UserStatus)}
                    className="w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-lg font-medium text-m3-on-surface mb-4">Permissions</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canManageUsers}
                    onChange={(e) => handlePermissionChange('canManageUsers', e.target.checked)}
                    className="mr-3 h-4 w-4 text-m3-primary focus:ring-m3-primary border-m3-outline rounded"
                  />
                  <div>
                    <div className="font-medium text-m3-on-surface">Manage Users</div>
                    <div className="text-sm text-m3-on-surface-variant">Create, edit, and delete user accounts</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canManageDocuments}
                    onChange={(e) => handlePermissionChange('canManageDocuments', e.target.checked)}
                    className="mr-3 h-4 w-4 text-m3-primary focus:ring-m3-primary border-m3-outline rounded"
                  />
                  <div>
                    <div className="font-medium text-m3-on-surface">Manage Documents</div>
                    <div className="text-sm text-m3-on-surface-variant">Create, edit, and delete documents</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canManagePanelists}
                    onChange={(e) => handlePermissionChange('canManagePanelists', e.target.checked)}
                    className="mr-3 h-4 w-4 text-m3-primary focus:ring-m3-primary border-m3-outline rounded"
                  />
                  <div>
                    <div className="font-medium text-m3-on-surface">Manage Panelists</div>
                    <div className="text-sm text-m3-on-surface-variant">Manage panelist profiles and data</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canViewAuditLogs}
                    onChange={(e) => handlePermissionChange('canViewAuditLogs', e.target.checked)}
                    className="mr-3 h-4 w-4 text-m3-primary focus:ring-m3-primary border-m3-outline rounded"
                  />
                  <div>
                    <div className="font-medium text-m3-on-surface">View Audit Logs</div>
                    <div className="text-sm text-m3-on-surface-variant">Access system activity logs</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canManageSystem}
                    onChange={(e) => handlePermissionChange('canManageSystem', e.target.checked)}
                    className="mr-3 h-4 w-4 text-m3-primary focus:ring-m3-primary border-m3-outline rounded"
                  />
                  <div>
                    <div className="font-medium text-m3-on-surface">System Management</div>
                    <div className="text-sm text-m3-on-surface-variant">Access system configuration and settings</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-m3-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-m3-outline rounded-lg text-m3-on-surface hover:bg-m3-surface-variant transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-m3-primary text-m3-on-primary rounded-lg hover:bg-m3-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { UserModal };