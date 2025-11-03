import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { FilterIcon } from './icons/FilterIcon';

interface DocumentFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const localDate = new Date(year, month, day);

  const monthName = localDate.toLocaleString('en-US', { month: 'long' });
  return `${day} ${monthName}, ${year}`;
};

const DocumentFilters: React.FC<DocumentFiltersProps> = ({ 
  onSearchChange, 
  onStatusChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange 
}) => {
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setIsDateFilterOpen(false);
      }
    };
    window.document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const displayRange = `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;

  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
      <div className="relative flex-grow max-w-xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-m3-on-surface-variant" />
        </div>
        <input
          type="text"
          placeholder="Search by title..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full rounded-lg border border-m3-outline bg-m3-surface py-2.5 pl-10 pr-4 text-m3-on-surface placeholder:text-m3-on-surface-variant focus:border-m3-primary focus:ring-1 focus:ring-m3-primary sm:text-sm transition"
        />
      </div>
      <div className="relative">
        <select
          onChange={(e) => onStatusChange(e.target.value)}
          className="block w-full appearance-none rounded-lg border border-m3-outline bg-m3-surface py-2.5 pl-4 pr-10 text-m3-on-surface focus:border-m3-primary focus:ring-1 focus:ring-m3-primary sm:text-sm transition"
        >
          <option value="All">All Statuses</option>
          <option value="READY TO PUBLISH">Ready to Publish</option>
          <option value="DRAFT">Draft</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDownIcon className="h-5 w-5 text-m3-on-surface-variant" />
        </div>
      </div>
      
      <div className="relative" ref={dateFilterRef}>
        <button
          onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
          className="flex items-center gap-2 w-full sm:w-auto rounded-lg border border-m3-outline bg-m3-surface py-2.5 px-4 text-m3-on-surface hover:bg-m3-surface-variant transition"
        >
          <FilterIcon className="h-5 w-5 text-m3-on-surface-variant" />
          <span className="text-sm truncate">Date: {displayRange}</span>
        </button>
        
        {isDateFilterOpen && (
          <div className="absolute top-full right-0 mt-2 z-10 bg-m3-surface-container rounded-2xl shadow-lg border border-m3-outline/20 p-4 w-max">
            <p className="text-sm font-medium text-m3-on-surface-variant mb-3 px-1">Select date range</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="block w-full rounded-lg border border-m3-outline bg-m3-surface py-2 px-3 text-m3-on-surface placeholder:text-m3-on-surface-variant focus:border-m3-primary focus:ring-1 focus:ring-m3-primary sm:text-sm transition"
                aria-label="Start date"
              />
              <span className="text-m3-on-surface-variant">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="block w-full rounded-lg border border-m3-outline bg-m3-surface py-2 px-3 text-m3-on-surface placeholder:text-m3-on-surface-variant focus:border-m3-primary focus:ring-1 focus:ring-m3-primary sm:text-sm transition"
                aria-label="End date"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentFilters;
