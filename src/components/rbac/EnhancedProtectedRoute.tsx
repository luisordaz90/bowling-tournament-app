// components/rbac/EnhancedProtectedRoute.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0';
import { useRBAC } from '@/contexts/RBACContext';
import { UserRole } from '@/lib/rbac';

interface EnhancedProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requireAll?: boolean;
  redirectTo?: string;
  showUnauthorized?: boolean;
}

export function EnhancedProtectedRoute({
  children,
  requiredRoles = [],
  requireAll = false,
  redirectTo = '/tournaments',
  showUnauthorized = true
}: EnhancedProtectedRouteProps) {
  const { user, isLoading: authLoading } = useUser();
  const rbac = useRBAC();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || rbac.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (requiredRoles.length === 0) return <>{children}</>;

  const hasAccess = requireAll
    ? requiredRoles.every(role => rbac.hasRole(role))
    : requiredRoles.some(role => rbac.hasRole(role));

  if (!hasAccess) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-auto p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
            <button
              onClick={() => router.push(redirectTo)}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    router.push(redirectTo);
    return null;
  }

  return <>{children}</>;
}
