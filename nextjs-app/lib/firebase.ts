import { initializeApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { getStorage } from '@firebase/storage';
import type { FirebaseConfig } from '@/types';

// Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Export the Firebase app instance
export { app as firebaseApp };

// Helper functions for Firebase operations
export class FirebaseService {
  static isConfigValid(): boolean {
    return !!(
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
    );
  }

  static getErrorMessage(error: any): string {
    if (error?.code === 'auth/user-not-found') {
      return 'User not found';
    }
    if (error?.code === 'auth/wrong-password') {
      return 'Invalid password';
    }
    if (error?.code === 'auth/email-already-in-use') {
      return 'Email already in use';
    }
    if (error?.code === 'auth/weak-password') {
      return 'Password is too weak';
    }
    if (error?.code === 'auth/invalid-email') {
      return 'Invalid email address';
    }
    if (error?.code === 'auth/too-many-requests') {
      return 'Too many requests. Please try again later.';
    }
    return error?.message || 'An unknown error occurred';
  }

  static async handleFirebaseError(error: any): Promise<never> {
    console.error('Firebase Error:', error);
    throw new Error(this.getErrorMessage(error));
  }
}

// Export utility functions
export const getFirebaseErrorMessage = FirebaseService.getErrorMessage.bind(FirebaseService);

// Server-side Firebase initialization check
export const isFirebaseInitialized = (): boolean => {
  return typeof window !== 'undefined' && FirebaseService.isConfigValid();
};

export default firebaseConfig;