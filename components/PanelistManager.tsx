import React, { useState, useEffect } from 'react';
import type { Panelist } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface PanelistManagerProps {
  panelists: Panelist[];
  onAdd: (panelist: Omit<Panelist, 'id'> & { password?: string }) => Promise<void>;
  onUpdate: (panelist: Panelist) => void;
  onDelete: (id: string) => void;
  onSendPasswordReset: (email: string) => Promise<void>;
}

const PanelistModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (panelist: Omit<Panelist, 'id'> & { password?: string }) => Promise<void>;
  onUpdate: (panelist: Panelist) => void;
  onSendPasswordReset: (email: string) => Promise<void>;
  panelist: Panelist | null;
}> = ({ isOpen, onClose, onAdd, onUpdate, onSendPasswordReset, panelist }) => {
  const isAddMode = !panelist;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [details, setDetails] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resetFeedback, setResetFeedback] = useState('');
  
  useEffect(() => {
    setResetFeedback('');
    setIsSendingReset(false);
    setIsSaving(false);

    if (panelist) {
      setEmail(panelist.email);
      setDetails(JSON.stringify(panelist.details || {}, null, 2));
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
      setDetails('{}');
    }
  }, [panelist, isOpen]);

  if (!isOpen) return null;
  
  const handleSave = async () => {
    let parsedDetails = {};
    try {
      parsedDetails = JSON.parse(details);
    } catch (e) {
      alert("Invalid JSON format in details.");
      return;
    }

    setIsSaving(true);
    if (isAddMode) {
      if (!email || !password) {
        alert('Email and password are required.');
        setIsSaving(false);
        return;
      }
      try {
        await onAdd({ email, password, details: parsedDetails });
        onClose();
      } catch (error) {
        // Error is alerted in App.tsx
      }
    } else {
      onUpdate({
        id: panelist?.id,
        email: email, // Email is read-only here
        details: parsedDetails
      });
      onClose();
    }
    setIsSaving(false);
  };
  
  const handlePasswordReset = async () => {
    setIsSendingReset(true);
    setResetFeedback('');
    await onSendPasswordReset(email);
    setResetFeedback('A password reset link has been sent.');
    setIsSendingReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-m3-surface-container rounded-3xl w-full max-w-2xl shadow-2xl m-4 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-m3-outline/20 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-medium text-m3-on-surface">{isAddMode ? 'Add New Panelist' : 'Edit Panelist Profile'}</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-m3-surface-variant">
            <XMarkIcon className="w-6 h-6 text-m3-on-surface-variant" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          
          <h3 className="text-lg font-medium text-m3-on-surface">{isAddMode ? 'Account Credentials' : 'Profile Details'}</h3>
          
          <div>
            <label className="block text-sm font-medium text-m3-on-surface-variant mb-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              readOnly={!isAddMode} 
              className={`w-full rounded-lg border border-m3-outline py-2 px-3 text-m3-on-surface focus:border-m3-primary focus:ring-1 focus:ring-m3-primary ${!isAddMode ? 'bg-m3-surface cursor-not-allowed text-m3-on-surface-variant' : 'bg-transparent'}`} 
            />
          </div>

          {isAddMode && (
             <div>
                <label className="block text-sm font-medium text-m3-on-surface-variant mb-1">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full rounded-lg border border-m3-outline bg-transparent py-2 px-3 text-m3-on-surface focus:border-m3-primary focus:ring-1 focus:ring-m3-primary"
                />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-m3-on-surface-variant mb-1">Profile Details (JSON)</label>
            <textarea
              rows={12}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-lg border border-m3-outline bg-transparent py-2 px-3 text-m3-on-surface focus:border-m3-primary focus:ring-1 focus:ring-m3-primary font-mono text-sm"
              placeholder='{ "Tamil": { ... } }'
            />
          </div>
          
          {!isAddMode && (
            <div className="mt-2 pt-6 border-t border-m3-outline/20">
                <h3 className="text-lg font-medium text-m3-on-surface mb-4">Account Management</h3>
                <div>
                   <label className="block text-sm font-medium text-m3-on-surface-variant mb-1">Password</label>
                   <button 
                      onClick={handlePasswordReset} 
                      disabled={isSendingReset}
                      className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full border border-m3-outline text-m3-on-surface-variant hover:bg-m3-surface-variant disabled:opacity-50"
                   >
                      {isSendingReset && <SpinnerIcon className="w-4 h-4 mr-2"/>}
                      Send Password Reset Email
                   </button>
                   {resetFeedback && <p className="text-sm text-green-600 mt-2">{resetFeedback}</p>}
                   <p className="text-xs text-m3-on-surface-variant mt-2">
                      A secure link to reset the password will be sent to the panelist's email address.
                   </p>
                </div>
            </div>
          )}
        </div>
        <div className="p-4 flex justify-end gap-4 border-t border-m3-outline/20 bg-m3-surface-container-high rounded-b-3xl flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-sm font-medium rounded-full text-m3-primary hover:bg-m3-primary-container">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center px-6 py-2 text-sm font-medium rounded-full bg-m3-primary text-m3-on-primary hover:opacity-90 disabled:opacity-50">
            {isSaving && <SpinnerIcon className="w-4 h-4 mr-2" />}
            {isAddMode ? 'Add Panelist' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PanelistManager: React.FC<PanelistManagerProps> = ({ panelists, onAdd, onUpdate, onDelete, onSendPasswordReset }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPanelist, setSelectedPanelist] = useState<Panelist | null>(null);

  const handleEdit = (panelist: Panelist) => {
    setSelectedPanelist(panelist);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedPanelist(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if(window.confirm("Are you sure you want to delete this panelist's profile data? This does not delete their login account.")) {
        onDelete(id);
    }
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-m3-on-surface">Manage Panelists</h1>
          <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-m3-primary text-m3-on-primary hover:opacity-90 transition-opacity">
            <PlusIcon className="w-5 h-5"/>
            Add Panelist
          </button>
        </div>

        <div className="bg-m3-surface rounded-2xl shadow-sm border border-m3-outline/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-m3-surface-container-high">
                <tr>
                  <th className="p-4 text-sm font-medium text-m3-on-surface-variant">Email</th>
                  <th className="p-4 text-sm font-medium text-m3-on-surface-variant">Profile Languages</th>
                  <th className="p-4 text-sm font-medium text-m3-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-m3-outline/20">
                {panelists.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-m3-on-surface-variant">No panelists found.</td>
                  </tr>
                ) : (
                  panelists.map((panelist) => (
                    <tr key={panelist.id}>
                      <td className="p-4 text-m3-on-surface font-medium">{panelist.email}</td>
                      <td className="p-4 text-m3-on-surface-variant text-sm">
                        {panelist.details ? Object.keys(panelist.details).join(', ') : 'No details'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button onClick={() => handleEdit(panelist)} className="p-2 rounded-full hover:bg-m3-surface-variant text-m3-on-surface-variant" title="Edit Profile">
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(panelist.id!)} className="p-2 rounded-full hover:bg-m3-error/10 text-m3-error" title="Delete Profile Data">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <PanelistModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onSendPasswordReset={onSendPasswordReset}
          panelist={selectedPanelist}
        />
      )}
    </main>
  );
};

export default PanelistManager;