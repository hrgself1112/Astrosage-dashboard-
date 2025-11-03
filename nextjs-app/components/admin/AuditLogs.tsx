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
  DownloadIcon,
  FilterIcon,
  CalendarIcon,
  SearchIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { AuditLog } from '@/types';

// Mock data - replace with actual API calls
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    action: 'user_login',
    resource: 'authentication',
    details: { ip: '192.168.1.1', success: true },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15T10:30:00.000Z',
  },
  {
    id: '2',
    userId: '1',
    action: 'document_created',
    resource: 'doc-123',
    details: { title: 'New Document', type: 'article' },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-01-15T09:45:00.000Z',
  },
  {
    id: '3',
    userId: '2',
    action: 'document_updated',
    resource: 'doc-456',
    details: { fields: ['title', 'content'] },
    ipAddress: '192.168.1.2',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    timestamp: '2024-01-15T08:30:00.000Z',
  },
];

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const {
    data: auditLogs = mockAuditLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      // Replace with actual API call
      return new Promise<AuditLog[]>((resolve) => {
        setTimeout(() => resolve(mockAuditLogs), 500);
      });
    },
  });

  const filteredLogs = auditLogs?.filter(log => {
    const matchesSearch = !searchTerm ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    const logDate = new Date(log.timestamp);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const matchesDate = logDate >= startDate && logDate <= endDate;
    return matchesSearch && matchesAction && matchesDate;
  }) || [];

  const getActionColor = (action: string) => {
    if (action.includes('failed') || action.includes('delete')) {
      return 'text-red-600';
    }
    if (action.includes('create')) {
      return 'text-green-600';
    }
    if (action.includes('update') || action.includes('login')) {
      return 'text-blue-600';
    }
    return 'text-gray-600';
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
        JSON.stringify(log.details).replace(/"/g, '""'),
      ]),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-m3-on-surface">Audit Logs</h2>
          <p className="text-m3-on-surface-variant">
            System activity and audit trail
          </p>
        </div>
        <Button onClick={exportToCSV}>
          <DownloadIcon className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-m3-on-surface-variant" />
              </div>
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
            >
              <option value="">All Actions</option>
              <option value="user_login">User Login</option>
              <option value="user_logout">User Logout</option>
              <option value="document_created">Document Created</option>
              <option value="document_updated">Document Updated</option>
              <option value="document_deleted">Document Deleted</option>
              <option value="role_changed">Role Changed</option>
            </select>

            <div className="flex gap-2">
              <div className="relative">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="pl-10"
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-m3-on-surface-variant" />
              </div>
              <div className="relative">
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="pl-10"
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-m3-on-surface-variant" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m3-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-8 text-m3-error">
          Error loading audit logs
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <span className="text-sm text-m3-on-surface-variant">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                    {formatAction(log.action)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-m3-on-surface">
                    {log.userId}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-m3-on-surface">
                    {log.resource}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-m3-on-surface-variant">
                    {log.ipAddress || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    <span className="text-sm text-m3-on-surface-variant">
                      {JSON.stringify(log.details)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filteredLogs.length === 0 && !isLoading && !error && (
        <div className="text-center py-8">
          <p className="text-m3-on-surface-variant">No audit logs found matching your criteria.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="px-6 py-4 bg-m3-surface-variant border-t border-m3-outline-variant">
        <div className="flex items-center justify-between text-sm text-m3-on-surface-variant">
          <span>Showing {filteredLogs.length} of {auditLogs?.length || 0} log entries</span>
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
      </Card>
    </div>
  );
}