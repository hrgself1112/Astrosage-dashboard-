'use client';

import { GridIcon, ListIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onToggle: (mode: 'grid' | 'list') => void;
}

export function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  return (
    <div className="flex items-center border border-m3-outline rounded-lg bg-m3-surface">
      <Button
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onToggle('grid')}
        className="rounded-r-none border-r-0"
      >
        <GridIcon className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => onToggle('list')}
        className="rounded-l-none border-l-0"
      >
        <ListIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}