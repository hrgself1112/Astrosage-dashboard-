'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from '@firebase/auth';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from '@firebase/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Fetch user profile from Firestore
  const {
    data: userProfile,
    refetch: refreshProfile
  } = useQuery({
    queryKey: ['userProfile', user?.uid],
    queryFn: async () => {
      if (!user) return null;

      try {
        const response = await fetch(`/api/users/${user.uid}`);
        if (!response.ok) return null;

        return await response.json();
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAdmin = userProfile?.role === 'admin';

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);

      // Clear cache when user signs out
      if (!firebaseUser) {
        queryClient.clear();
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return signInWithEmailAndPassword(auth, email, password);
    },
    onSuccess: () => {
      toast.success('Signed in successfully');
    },
    onError: (error: any) => {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
    },
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return createUserWithEmailAndPassword(auth, email, password);
    },
    onSuccess: () => {
      toast.success('Account created successfully');
    },
    onError: (error: any) => {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      return firebaseSignOut(auth);
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success('Signed out successfully');
    },
    onError: (error: any) => {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      return sendPasswordResetEmail(auth, email);
    },
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error: any) => {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to send reset email');
    },
  });

  const signIn = async (email: string, password: string) => {
    return signInMutation.mutateAsync({ email, password });
  };

  const signUp = async (email: string, password: string) => {
    return signUpMutation.mutateAsync({ email, password });
  };

  const signOutUser = async () => {
    return signOutMutation.mutateAsync();
  };

  const resetPassword = async (email: string) => {
    return resetPasswordMutation.mutateAsync(email);
  };

  const value: AuthContextType = {
    user,
    userProfile: userProfile || null,
    isLoading: isLoading || signInMutation.isPending || signOutMutation.isPending,
    isAdmin: isAdmin || false,
    signIn,
    signUp,
    signOut: signOutUser,
    resetPassword,
    refreshProfile: () => refreshProfile(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallback
}: ProtectedRouteProps) {
  const { user, userProfile, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m3-primary"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-m3-on-surface mb-4">Authentication Required</h2>
          <p className="text-m3-on-surface-variant">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-m3-on-surface mb-4">Access Denied</h2>
          <p className="text-m3-on-surface-variant">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}