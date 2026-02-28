// hooks/usePermissions.ts
'use client';

import { useMemo } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { UserRole, Permission } from '@/lib/rbac';

/**
 * Hook for checking multiple permissions at once
 */
export function usePermissions() {
  const rbac = useRBAC();

  return useMemo(() => ({
    // Direct access to RBAC context
    ...rbac,
    
    // Navigation permissions
    navigation: {
      showAdminMenu: rbac.isAdmin,
      showTournamentManagement: rbac.canEditTournament,
      showTeamManagement: rbac.canEditTeam,
      showMatchManagement: rbac.canManageMatches,
      showStatistics: true, // Everyone can view some level of statistics
      showDetailedStatistics: rbac.canViewDetailedStatistics,
    },
    
    // Page access permissions
    pages: {
      canAccessTournamentCreate: rbac.canCreateTournament,
      canAccessTournamentEdit: rbac.canEditTournament,
      canAccessTeamCreate: rbac.canCreateTeam,
      canAccessTeamEdit: rbac.canEditTeam,
      canAccessSessionManagement: rbac.canManageSessions,
      canAccessMatchScoring: rbac.canScoreMatches,
      canAccessUserManagement: rbac.canManageUsers,
      canAccessSystemSettings: rbac.canAccessSystemSettings,
    },
    
    // Component visibility permissions
    components: {
      showCreateButtons: rbac.canWriteData,
      showEditButtons: rbac.canWriteData,
      showDeleteButtons: rbac.isAdmin,
      showScoreInputs: rbac.canScoreMatches,
      showSessionControls: rbac.canManageSessions,
      showTournamentControls: rbac.canEditTournament,
      showTeamControls: rbac.canEditTeam,
    },
    
    // Data filtering permissions  
    data: {
      showAllTournaments: rbac.isAdmin,
      showOwnTournamentsOnly: rbac.hasRole(UserRole.TOURNAMENT_DIRECTOR) && !rbac.isAdmin,
      showAssignedTournamentsOnly: rbac.hasRole(UserRole.LEAGUE_MANAGER),
      showTeamTournamentsOnly: rbac.hasRole(UserRole.TEAM_CAPTAIN) || rbac.hasRole(UserRole.PLAYER),
      showAllTeams: rbac.isManager,
      showOwnTeamOnly: rbac.hasRole(UserRole.TEAM_CAPTAIN) || rbac.hasRole(UserRole.PLAYER),
      showAllStatistics: rbac.canViewDetailedStatistics,
      showPersonalStatisticsOnly: rbac.hasRole(UserRole.PLAYER),
    }
  }), [rbac]);
}

/**
 * Hook for route-specific permissions
 */
export function useRoutePermissions(route: string) {
  const permissions = usePermissions();
  
  return useMemo(() => {
    const routePermissions: Record<string, boolean> = {
      '/tournaments/new': permissions.pages.canAccessTournamentCreate,
      '/tournaments/[id]/edit': permissions.pages.canAccessTournamentEdit,
      '/teams/new': permissions.pages.canAccessTeamCreate,
      '/teams/[id]/edit': permissions.pages.canAccessTeamEdit,
      '/tournaments/[id]/sessions': permissions.pages.canAccessSessionManagement,
      '/matches/[id]/score': permissions.pages.canAccessMatchScoring,
      '/admin/users': permissions.pages.canAccessUserManagement,
      '/admin/settings': permissions.pages.canAccessSystemSettings,
    };
    
    return {
      canAccess: routePermissions[route] ?? true, // Default to true for unlisted routes
      shouldRedirect: routePermissions[route] === false,
      redirectTo: '/tournaments' // Default redirect location
    };
  }, [route, permissions]);
}

/**
 * Hook for tournament-specific permissions (requires resource ownership checks)
 */
export function useTournamentPermissions(tournamentId?: string) {
  const rbac = useRBAC();
  
  return useMemo(() => ({
    canView: true, // Everyone can view tournaments they have access to
    canEdit: rbac.canEditTournament, // Will need backend resource check
    canDelete: rbac.canDeleteTournament, // Will need ownership check
    canAddTeams: rbac.canEditTournament,
    canRemoveTeams: rbac.canEditTournament,
    canManageSessions: rbac.canManageSessions,
    canGenerateSchedule: rbac.canManageSessions,
    canViewDetailedStats: rbac.canViewDetailedStatistics,
    
    // These will need backend resource association checks
    needsOwnershipCheck: rbac.hasRole(UserRole.TOURNAMENT_DIRECTOR) && !rbac.hasRole(UserRole.SUPER_ADMIN),
    needsAssignmentCheck: rbac.hasRole(UserRole.LEAGUE_MANAGER),
    needsParticipationCheck: rbac.hasRole(UserRole.TEAM_CAPTAIN) || rbac.hasRole(UserRole.PLAYER),
  }), [rbac, tournamentId]);
}

/**
 * Hook for team-specific permissions
 */
export function useTeamPermissions(teamId?: string) {
  const rbac = useRBAC();
  
  return useMemo(() => ({
    canView: true, // Everyone can view teams they have access to
    canEdit: rbac.canEditTeam, // Will need ownership/membership check
    canDelete: rbac.isAdmin, // Only admins can delete teams
    canAddPlayers: rbac.canEditTeam,
    canRemovePlayers: rbac.canEditTeam,
    canViewRoster: true,
    
    // These will need backend resource association checks
    needsMembershipCheck: rbac.hasRole(UserRole.TEAM_CAPTAIN) || rbac.hasRole(UserRole.PLAYER),
    needsOwnershipCheck: rbac.hasRole(UserRole.TEAM_CAPTAIN),
  }), [rbac, teamId]);
}

/**
 * Hook for match-specific permissions
 */
export function useMatchPermissions(matchId?: string) {
  const rbac = useRBAC();
  
  return useMemo(() => ({
    canView: true, // Everyone can view matches
    canScore: rbac.canScoreMatches,
    canUpdateStatus: rbac.canManageMatches,
    canEdit: rbac.canManageMatches,
    
    // Team-specific scoring permissions (will need team membership check)
    canScoreAsTeamCaptain: rbac.hasRole(UserRole.TEAM_CAPTAIN),
  }), [rbac, matchId]);
}