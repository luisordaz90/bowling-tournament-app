// components/rbac/EnhancedProtectedRoute.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/';
import { useRBAC } from '@/contexts/RBACContext';
import { UserRole, Permission } from '@/lib/rbac';

interface EnhancedProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
  resource?: string; // For resource-specific checks (e.g., "tournament:123")
  showUnauthorized?: boolean;
}

/**
 * Enhanced route protection component with role and permission checking
 * 
 * @example
 * <EnhancedProtectedRoute requiredRoles={[UserRole.TOURNAMENT_DIRECTOR]}>
 *   <CreateTournamentPage />
 * </EnhancedProtectedRoute>
 * 
 * @example
 * <EnhancedProtectedRoute 
 *   requiredRoles={[UserRole.LEAGUE_MANAGER]} 
 *   resource="tournament:123"
 *   redirectTo="/tournaments"
 * >
 *   <EditTournamentPage />
 * </EnhancedProtectedRoute>
 */
export function EnhancedProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAll = false,
  redirectTo = '/tournaments',
  fallback = null,
  resource,
  showUnauthorized = true
}: EnhancedProtectedRouteProps) {
  const { user, isLoading: authLoading } = useUser();
  const rbac = useRBAC();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/api/auth/login');
    }
  }, [user, authLoading, router]);

  // Show loading while checking authentication
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

  // Not authenticated
  if (!user) {
    return null; // Will redirect via useEffect above
  }

  // No role/permission requirements - just show the content
  if (requiredRoles.length === 0 && requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  // Check role requirements
  const hasRoleAccess = requiredRoles.length === 0 || (
    requireAll 
      ? requiredRoles.every(role => rbac.hasRole(role))
      : requiredRoles.some(role => rbac.hasRole(role))
  );

  // Check permission requirements  
  const hasPermissionAccess = requiredPermissions.length === 0 || (
    requireAll
      ? requiredPermissions.every(permission => rbac.hasPermission(permission))
      : requiredPermissions.some(permission => rbac.hasPermission(permission))
  );

  const hasAccess = hasRoleAccess && hasPermissionAccess;

  // Handle unauthorized access
  if (!hasAccess) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-auto p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg 
                  className="h-8 w-8 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">Access Denied</h2>
              <p className="mt-2 text-gray-600">
                You don't have permission to access this page.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => router.push(redirectTo)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go Back
                </button>
                <p className="text-xs text-gray-500">
                  Required roles: {requiredRoles.join(', ') || 'None'}
                  {requiredPermissions.length > 0 && (
                    <><br />Required permissions: {requiredPermissions.join(', ')}</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Redirect to specified route
    router.push(redirectTo);
    return null;
  }

  // TODO: Add resource-specific access checks here
  // This would require backend API calls to check resource ownership/assignment
  if (resource) {
    // For now, just log that we need to implement this
    console.log(`TODO: Check resource access for ${resource}`);
  }

  // User has access, render the protected content
  return <>{children}</>;
}

/**
 * Quick route guards for common scenarios
 */
export const RouteGuards = {
  AdminOnly: ({ children }: { children: ReactNode }) => (
    <EnhancedProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR]}>
      {children}
    </EnhancedProtectedRoute>
  ),

  ManagerOnly: ({ children }: { children: ReactNode }) => (
    <EnhancedProtectedRoute 
      requiredRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]}
    >
      {children}
    </EnhancedProtectedRoute>
  ),

  TournamentDirectorOnly: ({ children }: { children: ReactNode }) => (
    <EnhancedProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR]}>
      {children}
    </EnhancedProtectedRoute>
  ),

  TeamCaptainOrAbove: ({ children }: { children: ReactNode }) => (
    <EnhancedProtectedRoute 
      requiredRoles={[
        UserRole.SUPER_ADMIN, 
        UserRole.TOURNAMENT_DIRECTOR, 
        UserRole.LEAGUE_MANAGER, 
        UserRole.TEAM_CAPTAIN
      ]}
    >
      {children}
    </EnhancedProtectedRoute>
  )
};