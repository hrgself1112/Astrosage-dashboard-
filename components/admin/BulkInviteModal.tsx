import React, { useState } from 'react';
import { XMarkIcon } from '../icons/XMarkIcon';
import { UserPlusIcon } from '../icons/UserPlusIcon';
import { InvitationService } from '../../services/invitationService';
import type { UserRole } from '../../types';

interface BulkInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteComplete: (results: any[]) => void;
}

interface Invitation {
  email: string;
  role: UserRole;
  displayName?: string;
}

const BulkInviteModal: React.FC<BulkInviteModalProps> = ({
  isOpen,
  onClose,
  onInviteComplete
}) => {
  const [invitations, setInvitations] = useState<Invitation[]>([
    { email: '', role: 'viewer', displayName: '' }
  ]);
  const [isInviting, setIsInviting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const addInvitation = () => {
    setInvitations([...invitations, { email: '', role: 'viewer', displayName: '' }]);
  };

  const removeInvitation = (index: number) => {
    setInvitations(invitations.filter((_, i) => i !== index));
  };

  const updateInvitation = (index: number, field: keyof Invitation, value: any) => {
    const updated = [...invitations];
    updated[index] = { ...updated[index], [field]: value };
    setInvitations(updated);
  };

  const handleBulkInvite = async () => {
    // Filter out empty invitations
    const validInvitations = invitations.filter(inv => inv.email.trim() !== '');

    if (validInvitations.length === 0) {
      alert('Please add at least one email address');
      return;
    }

    // Validate emails
    const invalidEmails = validInvitations.filter(inv => !InvitationService.validateEmail(inv.email));
    if (invalidEmails.length > 0) {
      alert(`Invalid email addresses: ${invalidEmails.map(inv => inv.email).join(', ')}`);
      return;
    }

    setIsInviting(true);
    try {
      const inviteResults = await InvitationService.bulkInviteUsers(validInvitations);
      setResults(inviteResults);
      onInviteComplete(inviteResults);
    } catch (error) {
      console.error('Bulk invitation failed:', error);
      alert('Failed to send invitations');
    } finally {
      setIsInviting(false);
    }
  };

  const resetForm = () => {
    setInvitations([{ email: '', role: 'viewer', displayName: '' }]);
    setResults([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-m3-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-m3-outline-variant">
          <div className="flex items-center gap-3">
            <UserPlusIcon className="w-6 h-6 text-m3-primary" />
            <h2 className="text-xl font-semibold text-m3-on-surface">Bulk Invite Users</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-m3-surface-variant text-m3-on-surface-variant transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {results.length === 0 ? (
            <>
              <div className="mb-6">
                <p className="text-m3-on-surface-variant">
                  Send invitations to multiple users at once. Each user will receive an email with instructions to set up their account.
                </p>
              </div>

              {/* Invitations List */}
              <div className="space-y-4 mb-6">
                {invitations.map((invitation, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-m3-on-surface mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={invitation.email}
                          onChange={(e) => updateInvitation(index, 'email', e.target.value)}
                          placeholder="user@example.com"
                          className="w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-m3-on-surface mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={invitation.displayName || ''}
                          onChange={(e) => updateInvitation(index, 'displayName', e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface placeholder-m3-on-surface-variant focus:outline-none focus:ring-2 focus:ring-m3-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-m3-on-surface mb-2">
                          Role
                        </label>
                        <select
                          value={invitation.role}
                          onChange={(e) => updateInvitation(index, 'role', e.target.value as UserRole)}
                          className="w-full px-3 py-2 border border-m3-outline rounded-lg bg-m3-surface text-m3-on-surface focus:outline-none focus:ring-2 focus:ring-m3-primary"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    {invitations.length > 1 && (
                      <button
                        onClick={() => removeInvitation(index)}
                        className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove invitation"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add More Button */}
              <button
                onClick={addInvitation}
                className="w-full py-2 border border-dashed border-m3-outline rounded-lg text-m3-primary hover:bg-m3-surface-variant transition-colors"
              >
                + Add Another Invitation
              </button>
            </>
          ) : (
            /* Results */
            <div>
              <h3 className="text-lg font-medium text-m3-on-surface mb-4">Invitation Results</h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1 rounded-full ${
                        result.success ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {result.success ? (
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-m3-on-surface">
                          {result.email}
                        </div>
                        <div className={`text-sm ${
                          result.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {result.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-m3-surface-variant rounded-lg">
                <p className="text-sm text-m3-on-surface-variant">
                  <strong>Summary:</strong> {results.filter(r => r.success).length} of {results.length} invitations sent successfully.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 p-6 border-t border-m3-outline-variant">
          {results.length === 0 ? (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-m3-outline rounded-lg text-m3-on-surface hover:bg-m3-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkInvite}
                disabled={isInviting || invitations.filter(inv => inv.email.trim()).length === 0}
                className="px-4 py-2 bg-m3-primary text-m3-on-primary rounded-lg hover:bg-m3-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInviting ? 'Sending Invitations...' : `Send ${invitations.filter(inv => inv.email.trim()).length} Invitation${invitations.filter(inv => inv.email.trim()).length !== 1 ? 's' : ''}`}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-m3-primary text-m3-on-primary rounded-lg hover:bg-m3-primary-container transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkInviteModal;