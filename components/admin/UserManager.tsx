import React, { useState, useEffect } from 'react';
import { PlusIcon } from '../icons/PlusIcon';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import { FunnelIcon } from '../icons/FunnelIcon';
import { EllipsisVerticalIcon } from '../icons/EllipsisHorizontalIcon';
import { UserModal } from './UserModal';
import Pagination from '../Pagination';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy, limit } from '@firebase/firestore';
import type { User, UserRole, UserStatus, UserFilters } from '../../types';

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'lastActiveAt',
    sortOrder: 'desc'
  });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('lastActiveAt', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchLower) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchLower))
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowUserModal(true);
  };

  const handleUserSaved = (updatedUser: User) => {
    if (modalMode === 'create') {
      setUsers([...users, updatedUser]);
    } else {
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleToggleUserStatus = async (user: User) => {
    const newStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { status: newStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.displayName || user.email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const userRef = doc(db, 'users', user.id);
      await deleteDoc(userRef);
      setUsers(users.filter(u => u.id !== user.id));
      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // Bulk operations
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkRoleChange = async (newRole: UserRole) => {
    if (selectedUsers.length === 0) {
      alert('Please select users to update');
      return;
    }

    if (!window.confirm(`Are you sure you want to change the role of ${selectedUsers.length} user(s) to ${newRole}?`)) {
      return;
    }

    try {
      const updatePromises = selectedUsers.map(userId => {
        const userRef = doc(db, 'users', userId);
        return updateDoc(userRef, {
          role: newRole,
          lastActiveAt: new Date().toISOString()
        });
      });

      await Promise.all(updatePromises);

      setUsers(users.map(user =>
        selectedUsers.includes(user.id)
          ? { ...user, role: newRole }
          : user
      ));

      setSelectedUsers([]);
      alert(`Successfully updated role for ${selectedUsers.length} user(s)`);
    } catch (error) {
      console.error('Error updating user roles:', error);
      alert('Failed to update user roles');
    }
  };

  const handleBulkStatusChange = async (newStatus: UserStatus) => {
    if (selectedUsers.length === 0) {
      alert('Please select users to update');
      return;
    }

    if (!window.confirm(`Are you sure you want to change the status of ${selectedUsers.length} user(s) to ${newStatus}?`)) {
      return;
    }

    try {
      const updatePromises = selectedUsers.map(userId => {
        const userRef = doc(db, 'users', userId);
        return updateDoc(userRef, {
          status: newStatus,
          lastActiveAt: new Date().toISOString()
        });
      });

      await Promise.all(updatePromises);

      setUsers(users.map(user =>
        selectedUsers.includes(user.id)
          ? { ...user, status: newStatus }
          : user
      ));

      setSelectedUsers([]);
      alert(`Successfully updated status for ${selectedUsers.length} user(s)`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = selectedUsers.map(userId => {
        const userRef = doc(db, 'users', userId);
        return deleteDoc(userRef);
      });

      await Promise.all(deletePromises);

      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      alert(`Successfully deleted ${selectedUsers.length} user(s)`);
    } catch (error) {
      console.error('Error deleting users:', error);
      alert('Failed to delete users');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m3-primary mx-auto mb-4"></div>
          <p className="text-m3-on-surface-variant">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-m3-outline-variant">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-m3-on-surface">User Management</h2>
            <p className="text-sm text-m3-on-surface-variant">Manage system users and their permissions</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 px-4 py-2 bg-m3-primary text-m3-on-primary rounded-full hover:bg-m3-primary-container transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-m3-on-surface-variant" />
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-primary"
              />
            </div>
          </div>

          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value as UserRole | 'all' })}
            className="px-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as UserStatus | 'all' })}
            className="px-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters({ ...filters, sortBy: sortBy as any, sortOrder: sortOrder as 'asc' | 'desc' });
            }}
            className="px-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
          >
            <option value="lastActiveAt-desc">Last Active (Newest)</option>
            <option value="lastActiveAt-asc">Last Active (Oldest)</option>
            <option value="createdAt-desc">Created (Newest)</option>
            <option value="createdAt-asc">Created (Oldest)</option>
            <option value="email-asc">Email (A-Z)</option>
            <option value="email-desc">Email (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="px-6 py-3 bg-m3-primary-container border-b border-m3-outline-variant">
          <div className="flex items-center justify-between">
            <div className="text-sm text-m3-on-primary-container">
              {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-3">
              <select
                onChange={(e) => e.target.value && handleBulkRoleChange(e.target.value as UserRole)}
                className="px-3 py-1 text-sm border border-m3-outline rounded bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
              >
                <option value="">Change Role</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>

              <select
                onChange={(e) => e.target.value && handleBulkStatusChange(e.target.value as UserStatus)}
                className="px-3 py-1 text-sm border border-m3-outline rounded bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
              >
                <option value="">Change Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>

              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1 text-sm border border-m3-outline rounded text-m3-on-surface hover:bg-m3-surface-variant transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-m3-surface-variant sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAllUsers}
                  className="h-4 w-4 text-m3-primary focus:ring-m3-primary border-m3-outline rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-m3-surface divide-y divide-m3-outline-variant">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-m3-surface-variant transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="h-4 w-4 text-m3-primary focus:ring-m3-primary border-m3-outline rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-m3-primary-container flex items-center justify-center">
                      <span className="text-sm font-medium text-m3-on-primary-container">
                        {(user.displayName || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-m3-on-surface">
                        {user.displayName || 'Unknown User'}
                      </div>
                      <div className="text-sm text-m3-on-surface-variant">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-m3-on-surface-variant">
                  {new Date(user.lastActiveAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-m3-on-surface-variant">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-m3-primary hover:text-m3-primary-container transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleUserStatus(user)}
                      className={`${
                        user.status === 'active'
                          ? 'text-yellow-600 hover:text-yellow-800'
                          : 'text-green-600 hover:text-green-800'
                      } transition-colors`}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-m3-on-surface-variant">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          onClose={() => setShowUserModal(false)}
          onSave={handleUserSaved}
        />
      )}
    </div>
  );
};

export default UserManager;