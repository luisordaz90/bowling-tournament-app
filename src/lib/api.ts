// lib/api.ts - Updated API library with new bowling service endpoints

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Enhanced interfaces based on the updated service
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxTeams: number;
  totalSessions: number;
  sessionType: string;
  sessionsCompleted: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  captainName: string;
  captainEmail: string;
  captainPhone?: string;
  status: 'active' | 'inactive' | 'withdrawn';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  handicap: number;
  averageScore: number;
  totalGamesPlayed: number;
  totalPins: number;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  sessionId?: string;
  sessionNumber?: number;
  weekNumber?: number;
  matchDate?: string;
  matchName?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  winnerTeamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeagueSession {
  id: string;
  tournamentId: string;
  sessionNumber: number;
  sessionName: string;
  sessionDate: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface PlayerMatchScore {
  id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  game1Score: number;
  game2Score: number;
  game3Score: number;
  totalScore: number;
  handicapApplied: number;
  finalScore: number;
  recordedAt: string;
}

export interface TeamMatchScore {
  id: string;
  matchId: string;
  teamId: string;
  totalTeamScore: number;
  totalHandicap: number;
  finalTeamScore: number;
  teamAverage: number;
  gamesPlayed: number;
  recordedAt: string;
}

export interface TournamentStanding {
  teamId: string;
  teamName: string;
  captainName: string;
  totalScore: number;
  gamesPlayed: number;
  averageScore: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winPercentage: number;
  seedNumber?: number;
  status: string;
  rank: number;
}

export interface ScheduleSummary {
  tournamentId: string;
  totalTeams: number;
  totalSessions: number;
  expectedSessions: number;
  hasCorrectSessions: boolean;
  matchStats: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    postponed: number;
  };
  expectedMatches: number;
  isCompleteRoundRobin: boolean;
  hasScheduleConflicts: boolean;
  overallValidation: {
    allTeamsPlayingPerSession: boolean;
    noTeamConflicts: boolean;
    completeRoundRobin: boolean;
  };
}

export interface RoundRobinPreview {
  tournamentId: string;
  totalTeams: number;
  hasOddTeams: boolean;
  sessionsRequired: number;
  sessionsAvailable: number;
  canFitInTournament: boolean;
  totalMatches: number;
  expectedMatches: number;
  matchesPerTeam: number;
  matchesPerSession: number;
  teamsPerSession: number;
  schedule: Array<{
    sessionNumber: number;
    matches: Array<{
      homeTeam: { id: string; name: string };
      awayTeam: { id: string; name: string };
    }>;
    byeTeam?: { id: string; name: string };
  }>;
  validationIssues: any[];
  isValidSchedule: boolean;
}

// API utility class
class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log("ENTRO AQUI");
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    console.log(response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Tournament API
  tournaments = {
    getAll: () => this.request<Tournament[]>('/tournaments'),
    
    getById: (id: string) => this.request<Tournament>(`/tournaments/${id}`),
    
    create: (data: Partial<Tournament>) => 
      this.request<Tournament>('/tournaments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: Partial<Tournament>) =>
      this.request<Tournament>(`/tournaments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      this.request<void>(`/tournaments/${id}`, { method: 'DELETE' }),

    // Team registration
    registerTeam: (tournamentId: string, data: { teamId: string; seedNumber?: number }) =>
      this.request<any>(`/tournaments/${tournamentId}/teams`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getRegisteredTeams: (tournamentId: string) =>
      this.request<any[]>(`/tournaments/${tournamentId}/teams`),

    // Player registration to teams
    registerPlayer: (tournamentId: string, teamId: string, data: { playerId: string; role?: string }) =>
      this.request<any>(`/tournaments/${tournamentId}/teams/${teamId}/players`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getTeamPlayers: (tournamentId: string, teamId: string) =>
      this.request<any[]>(`/tournaments/${tournamentId}/teams/${teamId}/players`),

    // Sessions
    createSession: (tournamentId: string, data: Partial<LeagueSession>) =>
      this.request<LeagueSession>(`/tournaments/${tournamentId}/sessions`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getSessions: (tournamentId: string) =>
      this.request<LeagueSession[]>(`/tournaments/${tournamentId}/sessions`),

    // Matches
    getMatches: (tournamentId: string) =>
      this.request<Match[]>(`/tournaments/${tournamentId}/matches`),

    createMatch: (tournamentId: string, data: Partial<Match>) =>
      this.request<Match>(`/tournaments/${tournamentId}/matches`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Schedule management
    getScheduleSummary: (tournamentId: string) =>
      this.request<ScheduleSummary>(`/tournaments/${tournamentId}/schedule/summary`),

    previewRoundRobin: (tournamentId: string) =>
      this.request<RoundRobinPreview>(`/tournaments/${tournamentId}/schedule/round-robin/preview`),

    generateRoundRobin: (tournamentId: string, options: {
      startDate?: string;
      daysBetweenSessions?: number;
      overrideTeamOrder?: string[];
      forceCreate?: boolean;
      sessionTimeSlots?: Array<{ hour?: number; minute?: number }>;
    }) =>
      this.request<any>(`/tournaments/${tournamentId}/schedule/round-robin`, {
        method: 'POST',
        body: JSON.stringify(options),
      }),

    clearSchedule: (tournamentId: string) =>
      this.request<{ message: string }>(`/tournaments/${tournamentId}/schedule`, {
        method: 'DELETE',
      }),

    validateSchedule: (tournamentId: string) =>
      this.request<any>(`/tournaments/${tournamentId}/schedule/validate`),

    getSessionMatches: (tournamentId: string, sessionNumber: number) =>
      this.request<any>(`/tournaments/${tournamentId}/sessions/${sessionNumber}/matches`),

    // Statistics
    getStandings: (tournamentId: string) =>
      this.request<TournamentStanding[]>(`/tournaments/${tournamentId}/standings`),

    getStatistics: (tournamentId: string) =>
      this.request<any>(`/tournaments/${tournamentId}/statistics`),

    getPlayerStatistics: (tournamentId: string, playerId: string) =>
      this.request<any>(`/tournaments/${tournamentId}/players/${playerId}/statistics`),

    getTeamStatistics: (tournamentId: string, teamId: string) =>
      this.request<any>(`/tournaments/${tournamentId}/teams/${teamId}/statistics`),

    getAllPlayerStatistics: (tournamentId: string) =>
      this.request<any[]>(`/tournaments/${tournamentId}/player-statistics`),

    getAllTeamStatistics: (tournamentId: string) =>
      this.request<any[]>(`/tournaments/${tournamentId}/team-statistics`),
  };

  // Teams API
  teams = {
    getAll: () => this.request<Team[]>('/teams'),
    
    getById: (id: string) => this.request<Team>(`/teams/${id}`),
    
    create: (data: Partial<Team>) =>
      this.request<Team>('/teams', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: Partial<Team>) =>
      this.request<Team>(`/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      this.request<void>(`/teams/${id}`, { method: 'DELETE' }),
  };

  // Players API
  players = {
    getAll: () => this.request<Player[]>('/players'),
    
    getById: (id: string) => this.request<Player>(`/players/${id}`),
    
    create: (data: Partial<Player>) =>
      this.request<Player>('/players', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      this.request<void>(`/players/${id}`, { method: 'DELETE' }),
  };

  // Matches API
  matches = {
    getById: (id: string) => this.request<Match>(`/matches/${id}`),
    
    updateStatus: (id: string, status: string) =>
      this.request<Match>(`/matches/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    // Player scores
    addPlayerScore: (matchId: string, data: {
      teamId: string;
      playerId: string;
      game1Score: number;
      game2Score: number;
      game3Score: number;
      handicapApplied?: number;
    }) =>
      this.request<PlayerMatchScore>(`/matches/${matchId}/player-scores`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getPlayerScores: (matchId: string) =>
      this.request<PlayerMatchScore[]>(`/matches/${matchId}/player-scores`),

    // Team scores
    calculateTeamScore: (matchId: string, teamId: string) =>
      this.request<TeamMatchScore>(`/matches/${matchId}/team-scores`, {
        method: 'POST',
        body: JSON.stringify({ teamId }),
      }),

    getTeamScores: (matchId: string) =>
      this.request<TeamMatchScore[]>(`/matches/${matchId}/team-scores`),
  };

  // Sessions API
  sessions = {
    updateStatus: (id: string, status: string) =>
      this.request<LeagueSession>(`/sessions/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  };

  // Statistics API
  playerStatistics = {
    update: (playerId: string, tournamentId: string, data: any) =>
      this.request<any>(`/player-statistics/${playerId}/${tournamentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  teamStatistics = {
    update: (teamId: string, tournamentId: string, data: any) =>
      this.request<any>(`/team-statistics/${teamId}/${tournamentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // Health check
  health = {
    check: () => this.request<{ status: string; timestamp: string; message: string }>('/health'),
  };
}

export const api = new ApiClient();

// Legacy exports for backward compatibility
export const tournamentApi = api.tournaments;
export const teamApi = api.teams;
export const playerApi = api.players;
export const matchApi = api.matches;
export const playerStatisticsApi = api.playerStatistics;
export const teamStatisticsApi = api.teamStatistics;