import React from 'react';
import { Bars3Icon } from './icons/Bars3Icon';
import { Squares2X2Icon } from './icons/Squares2X2Icon';
import { CheckIcon } from './icons/CheckIcon';

interface ViewToggleProps {
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  const isListActive = viewMode === 'list';

  return (
    <div className="flex items-center bg-m3-surface rounded-full border border-m3-outline text-m3-on-surface-variant">
      <button
        onClick={() => setViewMode('list')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-full transition-colors ${
          isListActive ? 'bg-m3-secondary-container text-m3-on-secondary-container' : 'hover:bg-m3-surface-variant'
        }`}
        aria-pressed={isListActive}
        title="List view"
      >
        {isListActive && <CheckIcon className="w-5 h-5" />}
        <Bars3Icon className="w-5 h-5" />
      </button>
      <div className="w-px h-5 bg-m3-outline"></div>
      <button
        onClick={() => setViewMode('grid')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-r-full transition-colors ${
          !isListActive ? 'bg-m3-secondary-container text-m3-on-secondary-container' : 'hover:bg-m3-surface-variant'
        }`}
         aria-pressed={!isListActive}
         title="Grid view"
      >
        {!isListActive && <CheckIcon className="w-5 h-5" />}
        <Squares2X2Icon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ViewToggle;