import React from 'react';
import { PlusIcon } from './components/icons/PlusIcon';

interface CreateDocumentCardProps {
  onClick: () => void;
}

const CreateDocumentCard: React.FC<CreateDocumentCardProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-m3-surface rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-m3-surface-container-high transition-colors border-2 border-dashed border-m3-surface-variant hover:border-m3-primary">
      <div className="bg-m3-primary-container text-m3-on-primary-container rounded-2xl p-4 mb-4">
        <PlusIcon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-medium text-m3-on-surface">Create New Document</h3>
      <p className="text-m3-on-surface-variant mt-2 max-w-xs text-sm">
        Start writing your next document or update an existing draft
      </p>
    </div>
  );
};

export default CreateDocumentCard;