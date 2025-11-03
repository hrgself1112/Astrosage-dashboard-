'use client';

import { FunnelIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DocumentFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  searchTerm: string;
  statusFilter: string;
}

export function DocumentFilters({
  onSearchChange,
  onStatusChange,
  searchTerm,
  statusFilter
}: DocumentFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-m3-on-surface-variant" />
        </div>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
      >
        <option value="all">All Status</option>
        <option value="READY TO PUBLISH">Ready to Publish</option>
        <option value="DRAFT">Draft</option>
      </select>
    </div>
  );
}