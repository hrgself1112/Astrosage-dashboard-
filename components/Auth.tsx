
import React, { useState } from 'react';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { auth, db } from '../firebase';
// FIX: Changed firebase/auth to @firebase/auth to fix module resolution errors.
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@firebase/auth';
// FIX: Changed firebase/firestore to @firebase/firestore to fix module resolution errors.
import { doc, setDoc } from '@firebase/firestore';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSigningIn = mode === 'signin';

  const handleAuthAction = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (isSigningIn) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (!userCredential.user) {
          throw new Error('User creation failed.');
        }
        // Create a corresponding document in the 'panelists' collection
        await setDoc(doc(db, "panelists", userCredential.user.uid), {
          email: userCredential.user.email,
          details: {}, // Initialize with empty details
        });
      }
      // onAuthStateChanged in App.tsx will handle the redirect
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuthAction();
  };
  
  const toggleMode = () => {
    setMode(isSigningIn ? 'signup' : 'signin');
    setError('');
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-m3-surface p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <div className="inline-block p-4 bg-m3-primary-container text-m3-on-primary-container rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a14.994 14.994 0 0 1-3.75 0m.375-12.067a6.01 6.01 0 0 1-1.5-.189m1.5.189a6.01 6.01 0 0 0-1.5-.189m3.75 7.478a12.06 12.06 0 0 0 4.5 0m-4.5-2.311a14.994 14.994 0 0 0 3.75 0M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-m3-on-surface mt-4">{isSigningIn ? 'Welcome Back' : 'Create an Account'}</h1>
            <p className="text-m3-on-surface-variant mt-2">{isSigningIn ? 'Sign in to continue to your dashboard.' : 'Enter your details to get started.'}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-m3-surface-container p-8 rounded-3xl shadow-lg border border-m3-outline/20 flex flex-col gap-6">
          {error && <p className="text-m3-error text-sm bg-m3-error/10 p-3 rounded-lg">{error}</p>}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <EnvelopeIcon className="h-5 w-5 text-m3-on-surface-variant" />
            </div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-lg border border-m3-outline bg-m3-surface-container py-3 pl-11 pr-4 text-m3-on-surface placeholder:text-m3-on-surface-variant focus:border-m3-primary focus:ring-1 focus:ring-m3-primary transition"
            />
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <LockClosedIcon className="h-5 w-5 text-m3-on-surface-variant" />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-lg border border-m3-outline bg-m3-surface-container py-3 pl-11 pr-4 text-m3-on-surface placeholder:text-m3-on-surface-variant focus:border-m3-primary focus:ring-1 focus:ring-m3-primary transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-m3-primary text-m3-on-primary font-medium py-3 rounded-full hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isSigningIn ? 'Sign In' : 'Create Account')}
          </button>
          
          <p className="text-center text-sm text-m3-on-surface-variant">
            {isSigningIn ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-m3-primary hover:underline ml-1"
            >
              {isSigningIn ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
