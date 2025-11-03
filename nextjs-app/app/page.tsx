import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from '@firebase/auth';
import Dashboard from '@/components/Dashboard';

// This is a Server Component that checks authentication
export default async function HomePage() {
  // Server-side authentication check
  const user = await new Promise((resolve) => {
    if (typeof window === 'undefined') {
      // Server-side: can't check auth, redirect to auth page
      resolve(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });

    // Cleanup after 5 seconds to prevent hanging
    setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 5000);
  });

  // If no user, redirect to auth
  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-m3-surface">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m3-primary"></div>
        </div>
      }>
        <Dashboard />
      </Suspense>
    </div>
  );
}