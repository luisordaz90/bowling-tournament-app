// hooks/usePermissions.ts
'use client';

import { useMemo } from 'react';
import { useRBAC } from '@/contexts/RBACContext';

export function usePermissions() {
  const rbac = useRBAC();

  return useMemo(() => ({
    ...rbac,

    navigation: {
      showAdminMenu: rbac.isAdmin,
      showTournamentManagement: rbac.canEditTournament,
      showTeamManagement: rbac.canEditTeam,
      showMatchManagement: rbac.canManageMatches,
      showStatistics: true,
    },

    pages: {
      canAccessTournamentCreate: rbac.canCreateTournament,
      canAccessTournamentEdit: rbac.canEditTournament,
      canAccessTeamCreate: rbac.canCreateTeam,
      canAccessTeamEdit: rbac.canEditTeam,
      canAccessSessionManagement: rbac.canManageSessions,
      canAccessMatchScoring: rbac.canSubmitScores,
      canAccessUserManagement: rbac.canManageUsers,
    },

    components: {
      showCreateButtons: rbac.canWriteData,
      showEditButtons: rbac.canWriteData,
      showDeleteButtons: rbac.isAdmin,
      showScoreInputs: rbac.canSubmitScores,
      showSessionControls: rbac.canManageSessions,
      showTournamentControls: rbac.canEditTournament,
      showTeamControls: rbac.canEditTeam,
    },
  }), [rbac]);
}
