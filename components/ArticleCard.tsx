
import React, { useState, useEffect, useRef } from 'react';
import type { Document, Panelist } from '../types';
// FIX: Changed firebase/auth to @firebase/auth to fix module resolution errors.
import type { User } from '@firebase/auth';
import { EllipsisHorizontalIcon } from './icons/EllipsisHorizontalIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CheckIcon } from './icons/CheckIcon';
import ShareModal from './ShareModal';


interface DocumentCardProps {
  document: Document;
  onUpdate: (id: string, updates: Partial<Document>) => void;
  onDelete: (id: string) => void;
  onEdit: (document: Document) => void;
  user: User | null;
  panelists: Panelist[];
  onUpdateAccess: (docId: string, accessList: string[]) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onUpdate, onDelete, onEdit, user, panelists, onUpdateAccess }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatusMenuOpen, setStatusMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [alignSubmenuLeft, setAlignSubmenuLeft] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const statusMenuTriggerRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setStatusMenuOpen(false);
      }
    };
    // FIX: Used window.document to avoid conflict with the 'document' prop.
    window.document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // FIX: Used window.document to avoid conflict with the 'document' prop.
      window.document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if submenu needs to be aligned to the left
  useEffect(() => {
    if (isStatusMenuOpen && statusMenuTriggerRef.current) {
        const rect = statusMenuTriggerRef.current.getBoundingClientRect();
        const submenuWidth = 192; // w-48 in tailwind
        const viewportWidth = window.innerWidth;

        if (rect.right + submenuWidth > viewportWidth) {
            setAlignSubmenuLeft(true);
        } else {
            setAlignSubmenuLeft(false);
        }
    }
  }, [isStatusMenuOpen]);

  const handleStatusUpdate = (newStatus: Document['status']) => {
    if (!document.id) return;
    onUpdate(document.id, { status: newStatus });
    setStatusMenuOpen(false);
    setIsMenuOpen(false);
  };
  
  const handleVisibilityUpdate = (newVisibility: Document['visibility']) => {
    if (!document.id) return;
    onUpdate(document.id, { visibility: newVisibility });
    setStatusMenuOpen(false);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    if (!document.id) return;
    onDelete(document.id);
    setIsMenuOpen(false);
  }

  const handleEdit = () => {
    onEdit(document);
    setIsMenuOpen(false);
  }

  const formatDate = (dateString: string) => {
    if (!dateString || !dateString.includes('-')) return dateString;
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div className="bg-m3-surface rounded-3xl shadow-sm p-6 flex flex-col hover:shadow-lg transition-shadow duration-300 border border-m3-outline/20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-medium text-lg text-m3-on-surface">{document.title}</h4>
            <p className="text-xs text-m3-on-surface-variant mt-1 font-mono">{document.id}</p>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full text-m3-on-surface-variant hover:bg-m3-surface-variant"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <EllipsisHorizontalIcon className="w-6 h-6" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-m3-surface-container rounded-2xl shadow-2xl py-2 z-10 border border-m3-outline/20">
                <button onClick={handleEdit} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-m3-on-surface-variant hover:bg-m3-surface-container-high">
                  <PencilSquareIcon className="w-5 h-5" />
                  <span>Edit</span>
                </button>
                <button onClick={() => { setIsShareModalOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-m3-on-surface-variant hover:bg-m3-surface-container-high">
                  <ShareIcon className="w-5 h-5" />
                  <span>Share</span>
                </button>
                <div 
                  ref={statusMenuTriggerRef}
                  className="relative"
                  onMouseEnter={() => setStatusMenuOpen(true)}
                  onMouseLeave={() => setStatusMenuOpen(false)}
                >
                  <button className="w-full flex justify-between items-center gap-3 px-4 py-2 text-sm text-m3-on-surface-variant hover:bg-m3-surface-container-high">
                    <div className="flex items-center gap-3">
                      <ArrowPathIcon className="w-5 h-5" />
                      <span>Change Status</span>
                    </div>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                   {isStatusMenuOpen && (
                     <div className={`absolute -top-2 w-48 bg-m3-surface-container rounded-2xl shadow-2xl py-2 z-20 border border-m3-outline/20 ${alignSubmenuLeft ? 'right-full mr-2' : 'left-full ml-2'}`}>
                        <p className="px-4 py-1 text-xs text-m3-on-surface-variant/70">Set Status</p>
                        <button onClick={() => handleStatusUpdate('READY TO PUBLISH')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-m3-on-surface-variant hover:bg-m3-surface-container-high">
                           {document.status === 'READY TO PUBLISH' ? <CheckIcon className="w-4 h-4 text-m3-primary" /> : <div className="w-4"/>} <span>Ready to Publish</span>
                        </button>
                        <button onClick={() => handleStatusUpdate('DRAFT')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-m3-on-surface-variant hover:bg-m3-surface-container-high">
                           {document.status === 'DRAFT' ? <CheckIcon className="w-4 h-4 text-m3-primary" /> : <div className="w-4"/>} <span>Draft</span>
                        </button>
                        <div className="my-1 h-px bg-m3-outline/20"></div>
                        <p className="px-4 py-1 text-xs text-m3-on-surface-variant/70">Set Visibility</p>
                         <button onClick={() => handleVisibilityUpdate('PUBLIC')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-m3-on-surface-variant hover:bg-m3-surface-container-high">
                           {document.visibility === 'PUBLIC' ? <CheckIcon className="w-4 h-4 text-m3-primary" /> : <div className="w-4"/>} <span>Public</span>
                        </button>
                         <button onClick={() => handleVisibilityUpdate('PRIVATE')} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-m3-on-surface-variant hover:bg-m3-surface-container-high">
                           {document.visibility === 'PRIVATE' ? <CheckIcon className="w-4 h-4 text-m3-primary" /> : <div className="w-4"/>} <span>Private</span>
                        </button>
                    </div>
                   )}
                </div>
                <div className="my-1 h-px bg-m3-outline/20"></div>
                <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-m3-error hover:bg-m3-error/10 font-medium">
                  <TrashIcon className="w-5 h-5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-m3-on-surface-variant text-sm mb-4 flex-grow min-h-[40px]">{document.snippet}</p>
        
        <div className="border-t border-m3-outline/20 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${document.status === 'DRAFT' ? 'bg-m3-secondary-container text-m3-on-secondary-container' : 'bg-green-100 text-green-800'}`}>
              {document.status}
            </span>
            <span className="text-xs font-medium bg-m3-surface-variant text-m3-on-surface-variant px-3 py-1 rounded-full">
              {document.visibility}
            </span>
          </div>
          <p className="text-xs text-m3-on-surface-variant">Last Updated: {formatDate(document.lastUpdated)}</p>
        </div>
      </div>
      {isShareModalOpen && user && document.id && (
        <ShareModal 
            document={document}
            panelists={panelists}
            currentUser={user}
            onClose={() => setIsShareModalOpen(false)}
            onUpdateAccess={(newAccessList) => onUpdateAccess(document.id!, newAccessList)}
        />
      )}
    </>
  );
};

export default DocumentCard;
