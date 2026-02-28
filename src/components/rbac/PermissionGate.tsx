// components/rbac/PermissionGate.tsx
'use client';

import { ReactNode } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { UserRole, Permission } from '@/lib/rbac';

interface PermissionGateProps {
  children: ReactNode;
  roles?: UserRole[];
  permissions?: Permission[];
  requireAll?: boolean; // If true, user must have ALL roles/permissions. If false, user needs ANY
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * Component that conditionally renders children based on user roles/permissions
 * 
 * @example
 * <PermissionGate roles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR]}>
 *   <CreateTournamentButton />
 * </PermissionGate>
 * 
 * @example
 * <PermissionGate 
 *   permissions={[Permission.EDIT_TOURNAMENT]} 
 *   fallback={<div>You don't have permission to edit tournaments</div>}
 * >
 *   <EditTournamentForm />
 * </PermissionGate>
 */
export function PermissionGate({ 
  children, 
  roles = [], 
  permissions = [],
  requireAll = false,
  fallback = null,
  showFallback = false 
}: PermissionGateProps) {
  const rbac = useRBAC();

  // If still loading, don't show anything
  if (rbac.isLoading) {
    return null;
  }

  // Check role-based access
  const hasRoleAccess = roles.length === 0 || (
    requireAll 
      ? roles.every(role => rbac.hasRole(role))
      : roles.some(role => rbac.hasRole(role))
  );

  // Check permission-based access
  const hasPermissionAccess = permissions.length === 0 || (
    requireAll
      ? permissions.every(permission => rbac.hasPermission(permission))
      : permissions.some(permission => rbac.hasPermission(permission))
  );

  // User must satisfy both role and permission requirements
  const hasAccess = hasRoleAccess && hasPermissionAccess;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback if specified and showFallback is true
  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  return null;
}

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * Simplified component for role-only checks
 */
export function RoleGuard({ children, allowedRoles, fallback, showFallback }: RoleGuardProps) {
  return (
    <PermissionGate 
      roles={allowedRoles} 
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </PermissionGate>
  );
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * Component that only shows content to admins
 */
export function AdminOnly({ children, fallback, showFallback }: AdminOnlyProps) {
  return (
    <RoleGuard 
      allowedRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR]}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGuard>
  );
}

interface ManagerOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * Component that only shows content to managers and above
 */
export function ManagerOnly({ children, fallback, showFallback }: ManagerOnlyProps) {
  return (
    <RoleGuard 
      allowedRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]}
      fallback={fallback}
      showFallback={showFallback}
    >
      {children}
    </RoleGuard>
  );
}