import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import { FunnelIcon } from '../icons/FunnelIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, where, getDocs } from '@firebase/firestore';
import type { AuditLog, AuditLogFilters } from '../../types';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({
    action: '',
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    searchTerm: ''
  });

  const commonActions = [
    'user_login',
    'user_logout',
    'user_created',
    'user_updated',
    'user_deleted',
    'document_created',
    'document_updated',
    'document_deleted',
    'role_changed',
    'permission_modified',
    'system_config_changed',
    'failed_login_attempt'
  ];

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchAuditLogs = async () => {
    try {
      const logsRef = collection(db, 'auditLogs');
      const q = query(
        logsRef,
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const querySnapshot = await getDocs(q);
      const logsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AuditLog));
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Create sample data for demonstration
      const sampleLogs: AuditLog[] = [
        {
          id: '1',
          userId: 'user1',
          action: 'user_login',
          resource: 'authentication',
          details: { ip: '192.168.1.1', success: true },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          userId: 'user2',
          action: 'document_created',
          resource: 'doc123',
          details: { title: 'New Document', type: 'article' },
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setLogs(sampleLogs);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    // Action filter
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchLower) ||
        log.resource.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.details).toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(filtered);
  };

  const getActionColor = (action: string) => {
    if (action.includes('failed') || action.includes('delete')) {
      return 'text-red-600 bg-red-100';
    }
    if (action.includes('create')) {
      return 'text-green-600 bg-green-100';
    }
    if (action.includes('update') || action.includes('login')) {
      return 'text-blue-600 bg-blue-100';
    }
    return 'text-gray-600 bg-gray-100';
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'User ID', 'Action', 'Resource', 'IP Address', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.userId,
        log.action,
        log.resource,
        log.ipAddress || '',
        JSON.stringify(log.details).replace(/"/g, '""')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m3-primary mx-auto mb-4"></div>
          <p className="text-m3-on-surface-variant">Loading audit logs...</p>
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
            <h2 className="text-xl font-semibold text-m3-on-surface">Audit Logs</h2>
            <p className="text-sm text-m3-on-surface-variant">System activity and audit trail</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-m3-outline rounded-lg text-m3-on-surface hover:bg-m3-surface-variant transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-m3-on-surface-variant" />
              <input
                type="text"
                placeholder="Search logs..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-primary"
              />
            </div>
          </div>

          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
          >
            <option value="">All Actions</option>
            {commonActions.map(action => (
              <option key={action} value={action}>
                {formatAction(action)}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-m3-on-surface-variant" />
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })}
                className="pl-10 pr-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
              />
            </div>
            <span className="flex items-center text-m3-on-surface-variant">to</span>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-m3-on-surface-variant" />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })}
                className="pl-10 pr-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-m3-surface-variant sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-m3-on-surface-variant uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-m3-surface divide-y divide-m3-outline-variant">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-m3-surface-variant transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-m3-on-surface-variant">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                    {formatAction(log.action)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-m3-on-surface">
                  {log.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-m3-on-surface">
                  {log.resource}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-m3-on-surface-variant">
                  {log.ipAddress || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-m3-on-surface-variant">
                  <div className="max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-m3-on-surface-variant">No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-t border-m3-outline-variant bg-m3-surface-variant">
        <div className="flex items-center justify-between">
          <div className="text-sm text-m3-on-surface-variant">
            Showing {filteredLogs.length} of {logs.length} log entries
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">
              {filteredLogs.filter(log => log.action.includes('create')).length} Created
            </span>
            <span className="text-blue-600">
              {filteredLogs.filter(log => log.action.includes('update')).length} Updated
            </span>
            <span className="text-red-600">
              {filteredLogs.filter(log => log.action.includes('delete') || log.action.includes('failed')).length} Deleted/Failed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;