// lib/rbac.ts
// Aligned with bowling-tourney-service RBAC model.
// Three roles: superadmin, league_admin, player.
// Roles come from JWT claim: https://bowling-tournament-api.com/roles

import { useUser } from '@auth0/nextjs-auth0';

export enum UserRole {
  SUPER_ADMIN = 'superadmin',
  LEAGUE_ADMIN = 'league_admin',
  PLAYER = 'player',
}

export interface UserClaims {
  sub: string;
  email?: string;
  name?: string;
  roles: UserRole[];
  primaryRole: UserRole;
}

export function extractUserClaims(user: any): UserClaims | null {
  if (!user) return null;

  try {
    // Roles are injected into session.user.roles by beforeSessionSaved hook
    const roles: UserRole[] = user.roles || [];
    const primaryRole = roles.includes(UserRole.SUPER_ADMIN)
      ? UserRole.SUPER_ADMIN
      : roles.includes(UserRole.LEAGUE_ADMIN)
        ? UserRole.LEAGUE_ADMIN
        : UserRole.PLAYER;

    return {
      sub: user.sub,
      email: user.email,
      name: user.name,
      roles: roles.length > 0 ? roles : [UserRole.PLAYER],
      primaryRole,
    };
  } catch (error) {
    console.error('Error extracting user claims:', error);
    return null;
  }
}

export function hasRole(claims: UserClaims | null, role: UserRole): boolean {
  if (!claims) return false;
  return claims.roles.includes(role);
}

export function hasAnyRole(claims: UserClaims | null, roles: UserRole[]): boolean {
  if (!claims) return false;
  return roles.some(role => claims.roles.includes(role));
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Admin',
    [UserRole.LEAGUE_ADMIN]: 'League Admin',
    [UserRole.PLAYER]: 'Player',
  };
  return roleNames[role] || role;
}

export function useUserClaims(): {
  claims: UserClaims | null;
  isLoading: boolean;
  error: Error | null | undefined;
} {
  const { user, isLoading, error } = useUser();
  const claims = extractUserClaims(user);
  return { claims, isLoading, error };
}

// Pre-built RBAC checks aligned with service permissions
export const RBAC = {
  // Admin checks
  isAdmin: (claims: UserClaims | null) =>
    hasRole(claims, UserRole.SUPER_ADMIN),

  isAdminOrLeagueAdmin: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),

  // Tournament/league management — superadmin + league_admin
  canCreateTournament: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),

  canEditTournament: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),

  canDeleteTournament: (claims: UserClaims | null) =>
    hasRole(claims, UserRole.SUPER_ADMIN),

  // Team management — superadmin + league_admin for CRUD
  canCreateTeam: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),

  canEditTeam: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),

  // Player management — superadmin + league_admin
  canCreatePlayer: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),

  // Session/schedule management — superadmin + league_admin
  canManageSessions: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),

  // Match management — superadmin + league_admin
  canManageMatches: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),

  // Scoring — all authenticated users
  canSubmitScores: (claims: UserClaims | null) =>
    claims !== null,

  canUpdateScores: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),

  // Statistics — admin for writes, all for reads
  canUpdateStatistics: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),

  // User management — superadmin only
  canManageUsers: (claims: UserClaims | null) =>
    hasRole(claims, UserRole.SUPER_ADMIN),

  // General write access
  canWriteData: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]),
};
