import React, { useState, useMemo, useEffect } from 'react';
import type { Author } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';

interface AuthorModalProps {
  authors: Author[];
  currentAuthorId: string | null;
  onSelect: (authorId: string) => void;
  onClose: () => void;
}

const AuthorModal: React.FC<AuthorModalProps> = ({ authors, currentAuthorId, onSelect, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const filteredAuthors = useMemo(() => {
    return authors.filter(author =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [authors, searchTerm]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-m3-surface-container rounded-3xl w-full max-w-md shadow-2xl text-m3-on-surface m-4 flex flex-col transition-transform duration-200 ${isVisible ? 'scale-100' : 'scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-m3-outline/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Select Author</h2>
            <button onClick={handleClose} className="p-2 -mr-2 rounded-full hover:bg-m3-surface-variant">
              <XMarkIcon className="w-6 h-6 text-m3-on-surface-variant" />
            </button>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-m3-on-surface-variant" />
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-m3-outline bg-transparent py-2 pl-10 pr-4 text-m3-on-surface focus:border-m3-primary focus:ring-1 focus:ring-m3-primary"
            />
          </div>
        </div>
        <div className="p-2 overflow-y-auto max-h-[60vh]">
          <ul className="flex flex-col gap-1 p-2">
            {filteredAuthors.map(author => (
              <li key={author.id}>
                <button
                  onClick={() => onSelect(author.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    currentAuthorId === author.id
                      ? 'bg-m3-primary-container text-m3-on-primary-container'
                      : 'hover:bg-m3-surface-variant'
                  }`}
                >
                  <img src={author.avatarUrl} alt={author.name} className="w-8 h-8 rounded-full" />
                  <span className="font-medium">{author.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 flex justify-end border-t border-m3-outline/20">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium rounded-full text-m3-primary hover:bg-m3-primary-container"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthorModal;