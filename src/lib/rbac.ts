// lib/rbac.ts
import { useUser } from '@auth0/nextjs-auth0';

// Role definitions
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TOURNAMENT_DIRECTOR = 'tournament_director',
  LEAGUE_MANAGER = 'league_manager',
  TEAM_CAPTAIN = 'team_captain',
  SCOREKEEPER = 'scorekeeper',
  PLAYER = 'player',
  VIEWER = 'viewer'
}

// Permission definitions following action:resource pattern
export enum Permission {
  // Tournament permissions
  CREATE_TOURNAMENT = 'create:tournament',
  EDIT_TOURNAMENT = 'edit:tournament',
  DELETE_TOURNAMENT = 'delete:tournament',
  VIEW_TOURNAMENT = 'view:tournament',
  
  // Team permissions
  CREATE_TEAM = 'create:team',
  EDIT_TEAM = 'edit:team',
  DELETE_TEAM = 'delete:team',
  VIEW_TEAM = 'view:team',
  
  // Match permissions
  MANAGE_MATCHES = 'manage:matches',
  SCORE_MATCHES = 'score:matches',
  VIEW_MATCHES = 'view:matches',
  
  // Session permissions
  MANAGE_SESSIONS = 'manage:sessions',
  VIEW_SESSIONS = 'view:sessions',
  
  // Player permissions
  MANAGE_PLAYERS = 'manage:players',
  EDIT_PLAYER_PROFILE = 'edit:player_profile',
  VIEW_PLAYERS = 'view:players',
  
  // Statistics permissions
  VIEW_STATISTICS = 'view:statistics',
  EDIT_STATISTICS = 'edit:statistics',
  VIEW_DETAILED_STATISTICS = 'view:detailed_statistics',
  
  // Admin permissions
  MANAGE_USERS = 'manage:users',
  SYSTEM_SETTINGS = 'system:settings'
}

// Custom claims namespace for our app
const CLAIMS_NAMESPACE = 'https://bowling-app.com';

// Interface for user claims from JWT token
export interface UserClaims {
  sub: string;
  email?: string;
  name?: string;
  roles: UserRole[];
  permissions: Permission[];
  userType: UserRole; // Primary role for display
}

/**
 * Extracts and parses user roles and permissions from Auth0 user object
 */
export function extractUserClaims(user: any): UserClaims | null {
  if (!user) return null;

  try {
    // Extract custom claims from Auth0 user object
    const roles = user[`${CLAIMS_NAMESPACE}/roles`] || [];
    const permissions = user[`${CLAIMS_NAMESPACE}/permissions`] || [];
    const userType = user[`${CLAIMS_NAMESPACE}/user_type`] || roles[0] || UserRole.VIEWER;

    return {
      sub: user.sub,
      email: user.email,
      name: user.name,
      roles: Array.isArray(roles) ? roles : [],
      permissions: Array.isArray(permissions) ? permissions : [],
      userType
    };
  } catch (error) {
    console.error('Error extracting user claims:', error);
    return null;
  }
}

/**
 * Checks if user has a specific role
 */
export function hasRole(userClaims: UserClaims | null, role: UserRole): boolean {
  if (!userClaims) return false;
  return userClaims.roles.includes(role);
}

/**
 * Checks if user has any of the specified roles
 */
export function hasAnyRole(userClaims: UserClaims | null, roles: UserRole[]): boolean {
  if (!userClaims) return false;
  return roles.some(role => userClaims.roles.includes(role));
}

/**
 * Checks if user has a specific permission
 */
export function hasPermission(userClaims: UserClaims | null, permission: Permission): boolean {
  if (!userClaims) return false;
  return userClaims.permissions.includes(permission);
}

/**
 * Checks if user has any of the specified permissions
 */
export function hasAnyPermission(userClaims: UserClaims | null, permissions: Permission[]): boolean {
  if (!userClaims) return false;
  return permissions.some(permission => userClaims.permissions.includes(permission));
}

/**
 * Checks if user has all specified permissions
 */
export function hasAllPermissions(userClaims: UserClaims | null, permissions: Permission[]): boolean {
  if (!userClaims) return false;
  return permissions.every(permission => userClaims.permissions.includes(permission));
}

/**
 * Gets the display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Admin',
    [UserRole.TOURNAMENT_DIRECTOR]: 'Tournament Director',
    [UserRole.LEAGUE_MANAGER]: 'League Manager',
    [UserRole.TEAM_CAPTAIN]: 'Team Captain',
    [UserRole.SCOREKEEPER]: 'Scorekeeper',
    [UserRole.PLAYER]: 'Player',
    [UserRole.VIEWER]: 'Viewer'
  };
  
  return roleNames[role] || role;
}

/**
 * Gets role hierarchy level (lower number = higher authority)
 */
export function getRoleLevel(role: UserRole): number {
  const roleLevels: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 0,
    [UserRole.TOURNAMENT_DIRECTOR]: 1,
    [UserRole.LEAGUE_MANAGER]: 2,
    [UserRole.TEAM_CAPTAIN]: 3,
    [UserRole.SCOREKEEPER]: 4,
    [UserRole.PLAYER]: 5,
    [UserRole.VIEWER]: 6
  };
  
  return roleLevels[role] ?? 999;
}

/**
 * Checks if user has sufficient role level (equal or higher authority)
 */
export function hasMinimumRoleLevel(userClaims: UserClaims | null, minimumRole: UserRole): boolean {
  if (!userClaims) return false;
  
  const userLevel = Math.min(...userClaims.roles.map(getRoleLevel));
  const requiredLevel = getRoleLevel(minimumRole);
  
  return userLevel <= requiredLevel;
}

/**
 * Hook for getting user claims in React components
 */
export function useUserClaims(): {
  claims: UserClaims | null;
  isLoading: boolean;
  error: Error | undefined;
} {
  const { user, isLoading, error } = useUser();
  const claims = extractUserClaims(user);
  
  return { claims, isLoading, error };
}

/**
 * Role-based access control helper functions for common checks
 */
export const RBAC = {
  // Tournament management
  canCreateTournament: (claims: UserClaims | null) => 
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR]),
    
  canEditTournament: (claims: UserClaims | null) => 
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]),
    
  canDeleteTournament: (claims: UserClaims | null) => 
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR]),
  
  // Team management  
  canCreateTeam: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.TEAM_CAPTAIN]),
    
  canEditTeam: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER, UserRole.TEAM_CAPTAIN]),
  
  // Match management
  canManageMatches: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER, UserRole.SCOREKEEPER]),
    
  canScoreMatches: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER, UserRole.SCOREKEEPER, UserRole.TEAM_CAPTAIN]),
  
  // Session management
  canManageSessions: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]),
  
  // Statistics
  canViewDetailedStatistics: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]),
  
  // Admin functions
  canManageUsers: (claims: UserClaims | null) =>
    hasRole(claims, UserRole.SUPER_ADMIN),
    
  canAccessSystemSettings: (claims: UserClaims | null) =>
    hasRole(claims, UserRole.SUPER_ADMIN),
    
  // General access levels
  isAdmin: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR]),
    
  isManager: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]),
    
  canWriteData: (claims: UserClaims | null) =>
    hasAnyRole(claims, [UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER, UserRole.TEAM_CAPTAIN, UserRole.SCOREKEEPER])
};