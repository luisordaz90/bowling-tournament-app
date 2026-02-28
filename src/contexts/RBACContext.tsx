// contexts/RBACContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUserClaims, UserClaims, UserRole, Permission, RBAC } from '@/lib/rbac';

interface RBACContextType {
  claims: UserClaims | null;
  isLoading: boolean;
  error: Error | undefined;
  
  // Convenience methods
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  
  // Common RBAC checks
  canCreateTournament: boolean;
  canEditTournament: boolean;
  canDeleteTournament: boolean;
  canCreateTeam: boolean;
  canEditTeam: boolean;
  canManageMatches: boolean;
  canScoreMatches: boolean;
  canManageSessions: boolean;
  canViewDetailedStatistics: boolean;
  canManageUsers: boolean;
  canAccessSystemSettings: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canWriteData: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

interface RBACProviderProps {
  children: ReactNode;
}

export function RBACProvider({ children }: RBACProviderProps) {
  const { claims, isLoading, error } = useUserClaims();

  // Helper functions that use current user claims
  const hasRole = (role: UserRole) => {
    if (!claims) return false;
    return claims.roles.includes(role);
  };

  const hasAnyRole = (roles: UserRole[]) => {
    if (!claims) return false;
    return roles.some(role => claims.roles.includes(role));
  };

  const hasPermission = (permission: Permission) => {
    if (!claims) return false;
    return claims.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]) => {
    if (!claims) return false;
    return permissions.some(permission => claims.permissions.includes(permission));
  };

  // Pre-computed common checks
  const contextValue: RBACContextType = {
    claims,
    isLoading,
    error,
    
    // Helper methods
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    
    // Pre-computed RBAC checks
    canCreateTournament: RBAC.canCreateTournament(claims),
    canEditTournament: RBAC.canEditTournament(claims),
    canDeleteTournament: RBAC.canDeleteTournament(claims),
    canCreateTeam: RBAC.canCreateTeam(claims),
    canEditTeam: RBAC.canEditTeam(claims),
    canManageMatches: RBAC.canManageMatches(claims),
    canScoreMatches: RBAC.canScoreMatches(claims),
    canManageSessions: RBAC.canManageSessions(claims),
    canViewDetailedStatistics: RBAC.canViewDetailedStatistics(claims),
    canManageUsers: RBAC.canManageUsers(claims),
    canAccessSystemSettings: RBAC.canAccessSystemSettings(claims),
    isAdmin: RBAC.isAdmin(claims),
    isManager: RBAC.isManager(claims),
    canWriteData: RBAC.canWriteData(claims)
  };

  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC(): RBACContextType {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
}