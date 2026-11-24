// components/rbac/PermissionGate.tsx
'use client';

import { ReactNode } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { UserRole } from '@/lib/rbac';

interface PermissionGateProps {
  children: ReactNode;
  roles?: UserRole[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export function PermissionGate({
  children,
  roles = [],
  requireAll = false,
  fallback = null,
  showFallback = false
}: PermissionGateProps) {
  const rbac = useRBAC();

  if (rbac.isLoading) return null;

  const hasAccess = roles.length === 0 || (
    requireAll
      ? roles.every(role => rbac.hasRole(role))
      : roles.some(role => rbac.hasRole(role))
  );

  if (hasAccess) return <>{children}</>;
  if (showFallback && fallback) return <>{fallback}</>;
  return null;
}

export function AdminOnly({ children, fallback, showFallback }: { children: ReactNode; fallback?: ReactNode; showFallback?: boolean }) {
  return (
    <PermissionGate roles={[UserRole.SUPER_ADMIN]} fallback={fallback} showFallback={showFallback}>
      {children}
    </PermissionGate>
  );
}

export function AdminOrLeagueAdmin({ children, fallback, showFallback }: { children: ReactNode; fallback?: ReactNode; showFallback?: boolean }) {
  return (
    <PermissionGate roles={[UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]} fallback={fallback} showFallback={showFallback}>
      {children}
    </PermissionGate>
  );
}
