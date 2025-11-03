
import React, { useState, useEffect, useMemo } from 'react';
import type { Document, Panelist } from '../types';
// FIX: Changed firebase/auth to @firebase/auth to fix module resolution errors.
import type { User } from '@firebase/auth';
import { XMarkIcon } from './icons/XMarkIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';

interface ShareModalProps {
  document: Document;
  panelists: Panelist[];
  currentUser: User;
  onClose: () => void;
  onUpdateAccess: (newAccessList: string[]) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ document, panelists, currentUser, onClose, onUpdateAccess }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [accessList, setAccessList] = useState<string[]>(document.accessList || []);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleDone = () => {
    onUpdateAccess(accessList);
    handleClose();
  };

  const addPanelist = (panelistId: string) => {
    if (!accessList.includes(panelistId)) {
      setAccessList([...accessList, panelistId]);
    }
  };

  const removePanelist = (panelistId: string) => {
    // Prevent owner from being removed
    if (panelistId === document.ownerId) {
      return;
    }
    setAccessList(accessList.filter(id => id !== panelistId));
  };
  
  const peopleWithAccess = useMemo(() => {
    return accessList.map(userId => panelists.find(p => p.id === userId)).filter(Boolean) as Panelist[];
  }, [accessList, panelists]);
  
  const searchResults = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    return panelists.filter(p => 
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !accessList.includes(p.id!)
    );
  }, [searchTerm, panelists, accessList]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-m3-surface-container rounded-3xl w-full max-w-lg shadow-2xl text-m3-on-surface m-4 flex flex-col gap-6 transition-transform duration-200 max-h-[90vh] ${isVisible ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex justify-between items-start flex-shrink-0">
          <h2 className="text-2xl font-medium">Share "{document.title}"</h2>
          <button onClick={handleClose} className="p-2 -mt-2 -mr-2 rounded-full hover:bg-m3-surface-variant">
            <XMarkIcon className="w-6 h-6 text-m3-on-surface-variant" />
          </button>
        </div>
        
        <div className="relative px-6 flex-shrink-0">
            <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-m3-on-surface-variant" />
            </div>
            <input 
                type="text"
                placeholder="Add people by email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-m3-surface border border-m3-outline rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-m3-primary focus:border-m3-primary"
            />
        </div>
        
        <div className="overflow-y-auto px-6">
            {searchTerm ? (
                <ul className="flex flex-col gap-2">
                    {searchResults.length > 0 ? (
                        searchResults.map(panelist => (
                            <li key={panelist.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-m3-surface-variant">
                                <span className="text-sm font-medium">{panelist.email}</span>
                                <button onClick={() => addPanelist(panelist.id!)} className="px-3 py-1 text-xs font-medium rounded-full bg-m3-primary-container text-m3-on-primary-container hover:opacity-90">
                                    Add
                                </button>
                            </li>
                        ))
                    ) : (
                        <p className="text-sm text-center py-4 text-m3-on-surface-variant">No matching panelists found.</p>
                    )}
                </ul>
            ) : (
                <div>
                    <p className="text-sm font-medium mb-3">People with access</p>
                    <ul className="flex flex-col gap-2">
                        {peopleWithAccess.map(panelist => (
                            <li key={panelist.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-m3-surface-variant">
                                <span className="text-sm font-medium">{panelist.email}</span>
                                {panelist.id === document.ownerId ? (
                                    <span className="text-xs font-medium text-m3-on-surface-variant px-3">Owner</span>
                                ) : (
                                    <button onClick={() => removePanelist(panelist.id!)} className="px-3 py-1 text-xs font-medium rounded-full text-m3-error hover:bg-m3-error/10">
                                        Remove
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
        
        <div className="p-4 mt-auto flex justify-end items-center border-t border-m3-outline/20 bg-m3-surface-container-high rounded-b-3xl flex-shrink-0">
          <button 
            onClick={handleDone}
            className="px-6 py-2 text-sm font-medium rounded-full bg-m3-primary text-m3-on-primary hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
