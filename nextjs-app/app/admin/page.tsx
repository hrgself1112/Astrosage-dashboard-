'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminPanel } from '@/components/admin/AdminPanel';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminPanel />
    </ProtectedRoute>
  );
}