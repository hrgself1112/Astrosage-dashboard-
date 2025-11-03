import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { doc, getDoc } from '@firebase/firestore';
import { db } from '../firebase';
import { type User } from '@firebase/auth';
import { SpinnerIcon } from './icons/SpinnerIcon';
import type { UserRole } from '../types';

interface AdminRouteGuardProps {
  user: User | null;
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ user, children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role as UserRole;

          if (role === 'admin') {
            setUserRole(role);
          } else {
            setError('Access denied: Admin privileges required');
          }
        } else {
          setError('User profile not found');
        }
      } catch (err) {
        console.error('Error checking user role:', err);
        setError('Failed to verify user permissions');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-m3-surface">
        <div className="text-center">
          <SpinnerIcon className="w-8 h-8 text-m3-primary mx-auto mb-4" />
          <p className="text-m3-on-surface">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-m3-surface">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-m3-error-container rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-m3-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-m3-on-surface mb-2">Access Denied</h2>
          <p className="text-m3-on-surface-variant mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-m3-primary text-m3-on-primary rounded-full hover:bg-m3-primary-container hover:text-m3-on-primary-container transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (userRole === 'admin') {
    return <>{children}</>;
  }

  return null;
};

export default AdminRouteGuard;