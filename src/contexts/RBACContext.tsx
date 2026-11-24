// contexts/RBACContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useUserClaims, UserClaims, UserRole, RBAC } from '@/lib/rbac';

interface RBACContextType {
  claims: UserClaims | null;
  isLoading: boolean;
  error: Error | null | undefined;

  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;

  // Pre-computed checks
  canCreateTournament: boolean;
  canEditTournament: boolean;
  canDeleteTournament: boolean;
  canCreateTeam: boolean;
  canEditTeam: boolean;
  canCreatePlayer: boolean;
  canManageMatches: boolean;
  canSubmitScores: boolean;
  canUpdateScores: boolean;
  canManageSessions: boolean;
  canUpdateStatistics: boolean;
  canManageUsers: boolean;
  isAdmin: boolean;
  isAdminOrLeagueAdmin: boolean;
  canWriteData: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: ReactNode }) {
  const { claims, isLoading, error } = useUserClaims();

  const hasRole = (role: UserRole) => {
    if (!claims) return false;
    return claims.roles.includes(role);
  };

  const hasAnyRole = (roles: UserRole[]) => {
    if (!claims) return false;
    return roles.some(role => claims.roles.includes(role));
  };

  const contextValue: RBACContextType = {
    claims,
    isLoading,
    error,
    hasRole,
    hasAnyRole,

    canCreateTournament: RBAC.canCreateTournament(claims),
    canEditTournament: RBAC.canEditTournament(claims),
    canDeleteTournament: RBAC.canDeleteTournament(claims),
    canCreateTeam: RBAC.canCreateTeam(claims),
    canEditTeam: RBAC.canEditTeam(claims),
    canCreatePlayer: RBAC.canCreatePlayer(claims),
    canManageMatches: RBAC.canManageMatches(claims),
    canSubmitScores: RBAC.canSubmitScores(claims),
    canUpdateScores: RBAC.canUpdateScores(claims),
    canManageSessions: RBAC.canManageSessions(claims),
    canUpdateStatistics: RBAC.canUpdateStatistics(claims),
    canManageUsers: RBAC.canManageUsers(claims),
    isAdmin: RBAC.isAdmin(claims),
    isAdminOrLeagueAdmin: RBAC.isAdminOrLeagueAdmin(claims),
    canWriteData: RBAC.canWriteData(claims),
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
