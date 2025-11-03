'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  EyeOffIcon,
  UserPlusIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/types';

// Mock data - replace with actual API calls
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@astrosage.com',
    displayName: 'Admin User',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastActiveAt: '2024-01-15T10:30:00.000Z',
    permissions: {
      canManageUsers: true,
      canManageDocuments: true,
      canManagePanelists: true,
      canViewAuditLogs: true,
      canManageSystem: true,
    },
  },
  {
    id: '2',
    email: 'editor@astrosage.com',
    displayName: 'Editor User',
    role: 'editor',
    status: 'active',
    createdAt: '2024-01-02T00:00:00.000Z',
    lastActiveAt: '2024-01-14T15:45:00.000Z',
    permissions: {
      canManageUsers: false,
      canManageDocuments: true,
      canManagePanelists: true,
      canViewAuditLogs: false,
      canManageSystem: false,
    },
  },
  {
    id: '3',
    email: 'viewer@astrosage.com',
    displayName: 'Viewer User',
    role: 'viewer',
    status: 'inactive',
    createdAt: '2024-01-03T00:00:00.000Z',
    lastActiveAt: '2024-01-10T09:20:00.000Z',
    permissions: {
      canManageUsers: false,
      canManageDocuments: false,
      canManagePanelists: false,
      canViewAuditLogs: false,
      canManageSystem: false,
    },
  },
];

export function UserManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: users = mockUsers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // Replace with actual API call
      return new Promise<User[]>((resolve) => {
        setTimeout(() => resolve(mockUsers), 500);
      });
    },
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchTerm ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-m3-on-surface">User Management</h2>
          <p className="text-m3-on-surface-variant">
            Manage system users and their permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-m3-on-surface-variant" />
          </div>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <Card>
        {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m3-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-8 text-m3-error">
          Error loading users
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-m3-primary-container rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-m3-on-primary-container">
                        {(user.displayName || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-m3-on-surface">
                        {user.displayName || 'Unknown User'}
                      </div>
                      <div className="text-sm text-m3-on-surface-variant">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-m3-on-surface-variant">
                    {new Date(user.lastActiveAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-m3-on-surface-variant">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-m3-error">
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filteredUsers.length === 0 && !isLoading && !error && (
        <div className="text-center py-8">
          <p className="text-m3-on-surface-variant">No users found matching your criteria.</p>
        </div>
      )}
      </Card>
    </div>
  );
}