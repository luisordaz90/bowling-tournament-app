// lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface League {
  id: string;
  name: string;
  description?: string;
  leagueType?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

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
  status?: string;
  auth0UserId?: string;
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

export interface PlayerDashboard {
  player: Player;
  currentTeams: Array<{
    id: string;
    name: string;
    captainName: string;
    tournamentName: string;
    tournamentId: string;
    tournamentStatus: string;
    role: string;
    joinedDate: string;
  }>;
  overallStatistics: {
    tournamentsPlayed: string;
    totalGames: string;
    totalPins: string;
    overallAverage: string;
    careerHighGame: string;
    careerHighSeries: string;
    totalMatches: string;
  };
  recentTournamentStats: Array<{
    tournamentId: string;
    tournamentName: string;
    tournamentStatus: string;
    gamesPlayed: number;
    totalPins: number;
    currentAverage: number;
    highestGame: number;
    highestSeries: number;
    matchesPlayed: number;
  }>;
  recentScores: Array<{
    id: string;
    matchId: string;
    playerId: string;
    teamId: string;
    game1Score: number;
    game2Score: number;
    game3Score: number;
    totalScore: number;
    finalScore: number;
    handicapApplied: number;
    matchDate: string;
    homeTeamName: string;
    awayTeamName: string;
    tournamentName: string;
  }>;
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

// ── API Client ────────────────────────────────────────────────────────────────

class ApiClient {
  private tokenCache: { token: string; expires: number } | null = null;

  private async getAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expires > now) {
      return this.tokenCache.token;
    }

    try {
      const res = await fetch('/api/auth/token');
      if (!res.ok) return null;
      const { accessToken } = await res.json();
      if (!accessToken) return null;
      // Cache for 50 minutes (tokens expire in 60 min)
      this.tokenCache = { token: accessToken, expires: now + 50 * 60 * 1000 };
      return accessToken;
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        // Token expired or invalid — clear cache and redirect to login
        this.tokenCache = null;
        window.location.href = '/auth/login';
        return new Promise(() => {}); // never resolves — page is redirecting
      }
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ── Leagues ─────────────────────────────────────────────────────────────

  leagues = {
    getAll: () =>
      this.request<League[]>('/leagues'),

    getById: (id: string) =>
      this.request<League>(`/leagues/${id}`),
  };

  // ── Tournaments (CRUD only) ──────────────────────────────────────────────

  tournaments = {
    getAll: (leagueId?: string) =>
      this.request<Tournament[]>(leagueId ? `/tournaments?leagueId=${leagueId}` : '/tournaments'),

    getById: (id: string) =>
      this.request<Tournament>(`/tournaments/${id}`),

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
  };

  // ── Teams (CRUD + tournament roster ops) ────────────────────────────────

  teams = {
    getAll: () =>
      this.request<Team[]>('/teams'),

    getById: (id: string) =>
      this.request<Team>(`/teams/${id}`),

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

    /** @deprecated Use api.registrations.registerTeam() */
    registerInTournament: (tournamentId: string, data: { teamId: string; seedNumber?: number }) =>
      this.registrations.registerTeam({ tournamentId, ...data }),

    /** @deprecated Use api.registrations.unregisterTeam() */
    removeFromTournament: (tournamentId: string, teamId: string) =>
      this.registrations.unregisterTeam(teamId, tournamentId),

    /** @deprecated Use api.registrations.getTeams() */
    getTournamentTeams: (tournamentId: string) =>
      this.registrations.getTeams(tournamentId),

    /** @deprecated Use api.registrations.registerPlayer() */
    addPlayer: (tournamentId: string, teamId: string, data: { playerId: string; role?: string }) =>
      this.registrations.registerPlayer({ tournamentId, teamId, ...data }),

    /** @deprecated Use api.registrations.removePlayer() */
    removePlayer: (tournamentId: string, teamId: string, playerId: string) =>
      this.registrations.removePlayer(playerId, tournamentId, teamId),

    /** @deprecated Use api.registrations.getPlayers() */
    getPlayers: (tournamentId: string, teamId: string) =>
      this.registrations.getPlayers(tournamentId, teamId),
  };

  // ── Players (CRUD + dashboard) ───────────────────────────────────────────

  players = {
    getAll: () =>
      this.request<Player[]>('/players'),

    getById: (id: string) =>
      this.request<Player>(`/players/${id}`),

    /** @deprecated Use api.me.getDashboard() */
    getDashboard: (id: string) =>
      this.request<PlayerDashboard>(`/players/${id}/dashboard`),

    create: (data: Partial<Player>) =>
      this.request<Player>('/players', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<Player>) =>
      this.request<Player>(`/players/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      this.request<void>(`/players/${id}`, { method: 'DELETE' }),
  };

  // ── Matches (CRUD + status + scoring) ───────────────────────────────────

  matches = {
    /** Get all matches for a tournament. */
    getAll: (tournamentId: string) =>
      this.request<Match[]>(`/tournaments/${tournamentId}/matches`),

    getById: (id: string) =>
      this.request<Match>(`/matches/${id}`),

    create: (tournamentId: string, data: Partial<Match>) =>
      this.request<Match>(`/tournaments/${tournamentId}/matches`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: string) =>
      this.request<Match>(`/matches/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

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

    calculateTeamScore: (matchId: string, teamId: string) =>
      this.request<TeamMatchScore>(`/matches/${matchId}/team-scores`, {
        method: 'POST',
        body: JSON.stringify({ teamId }),
      }),

    getTeamScores: (matchId: string) =>
      this.request<TeamMatchScore[]>(`/matches/${matchId}/team-scores`),
  };

  // ── Sessions (CRUD + status + session matches) ───────────────────────────

  sessions = {
    /** List sessions for a tournament. */
    getAll: (tournamentId: string) =>
      this.request<LeagueSession[]>(`/tournaments/${tournamentId}/sessions`),

    /** Create a session within a tournament. */
    create: (tournamentId: string, data: Partial<LeagueSession>) =>
      this.request<LeagueSession>(`/tournaments/${tournamentId}/sessions`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateStatus: (id: string, status: string) =>
      this.request<LeagueSession>(`/sessions/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    /** Get matches for a specific session number within a tournament. */
    getMatches: (tournamentId: string, sessionNumber: number) =>
      this.request<any>(`/tournaments/${tournamentId}/sessions/${sessionNumber}/matches`),

    /** Submit scores for a player in a session (captain or admin). */
    submitScore: (tournamentId: string, sessionNumber: number, data: {
      playerId: string;
      teamId: string;
      scores: number[];
    }) =>
      this.request<any>(`/tournaments/${tournamentId}/sessions/${sessionNumber}/scores`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    /** Get all scores for a session. */
    getScores: (tournamentId: string, sessionNumber: number) =>
      this.request<any[]>(`/tournaments/${tournamentId}/sessions/${sessionNumber}/scores`),

    /** Update scores for a player in a session. */
    updateScore: (tournamentId: string, sessionNumber: number, playerId: string, data: {
      teamId: string;
      scores: number[];
    }) =>
      this.request<any>(`/tournaments/${tournamentId}/sessions/${sessionNumber}/scores/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    /** Delete scores for a player in a session. */
    deleteScore: (tournamentId: string, sessionNumber: number, playerId: string, teamId: string) =>
      this.request<any>(`/tournaments/${tournamentId}/sessions/${sessionNumber}/scores/${playerId}`, {
        method: 'DELETE',
        body: JSON.stringify({ teamId }),
      }),
  };

  // ── Schedule ─────────────────────────────────────────────────────────────

  schedule = {
    getSummary: (tournamentId: string) =>
      this.request<ScheduleSummary>(`/tournaments/${tournamentId}/schedule/summary`),

    preview: (tournamentId: string) =>
      this.request<RoundRobinPreview>(`/tournaments/${tournamentId}/schedule/round-robin/preview`),

    generate: (tournamentId: string, options: {
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

    validate: (tournamentId: string) =>
      this.request<any>(`/tournaments/${tournamentId}/schedule/validate`),

    clear: (tournamentId: string) =>
      this.request<{ message: string }>(`/tournaments/${tournamentId}/schedule`, {
        method: 'DELETE',
      }),
  };

  // ── Statistics ───────────────────────────────────────────────────────────

  statistics = {
    getStandings: (tournamentId: string) =>
      this.request<TournamentStanding[]>(`/tournaments/${tournamentId}/standings`),

    getTournamentStats: (tournamentId: string) =>
      this.request<any>(`/tournaments/${tournamentId}/statistics`),

    getPlayerStats: (tournamentId: string, playerId: string) =>
      this.request<any>(`/tournaments/${tournamentId}/players/${playerId}/statistics`),

    getTeamStats: (tournamentId: string, teamId: string) =>
      this.request<any>(`/tournaments/${tournamentId}/teams/${teamId}/statistics`),

    getAllPlayerStats: (tournamentId: string) =>
      this.request<any[]>(`/tournaments/${tournamentId}/player-statistics`),

    getAllTeamStats: (tournamentId: string) =>
      this.request<any[]>(`/tournaments/${tournamentId}/team-statistics`),

    updatePlayerStats: (playerId: string, tournamentId: string, data: any) =>
      this.request<any>(`/player-statistics/${playerId}/${tournamentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    updateTeamStats: (teamId: string, tournamentId: string, data: any) =>
      this.request<any>(`/team-statistics/${teamId}/${tournamentId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // ── Me (current user) ──────────────────────────────────────────────────

  me = {
    getTeams: () =>
      this.request<any[]>('/me/teams'),

    getLeagues: () =>
      this.request<any[]>('/me/leagues'),

    getDashboard: () =>
      this.request<PlayerDashboard>('/me/dashboard'),

    getStatistics: () =>
      this.request<any[]>('/me/statistics'),

    getLeagueHistory: () =>
      this.request<any[]>('/me/league-history'),
  };

  // ── Registrations (flat team/player enrollment) ───────────────────────

  registrations = {
    registerTeam: (data: { tournamentId: string; teamId: string; seedNumber?: number }) =>
      this.request<any>('/registrations/teams', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getTeams: (tournamentId: string) =>
      this.request<any[]>(`/registrations/teams?tournamentId=${tournamentId}`),

    unregisterTeam: (teamId: string, tournamentId: string) =>
      this.request<void>(`/registrations/teams/${teamId}?tournamentId=${tournamentId}`, {
        method: 'DELETE',
      }),

    registerPlayer: (data: { tournamentId: string; teamId: string; playerId: string; role?: string }) =>
      this.request<any>('/registrations/players', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getPlayers: (tournamentId: string, teamId: string) =>
      this.request<any[]>(`/registrations/players?tournamentId=${tournamentId}&teamId=${teamId}`),

    removePlayer: (playerId: string, tournamentId: string, teamId: string) =>
      this.request<{ message: string }>(
        `/registrations/players/${playerId}?tournamentId=${tournamentId}&teamId=${teamId}`,
        { method: 'DELETE' }
      ),
  };

  // ── Health ───────────────────────────────────────────────────────────────

  health = {
    check: () =>
      this.request<{ status: string; timestamp: string; message: string }>('/health'),
  };
}

export const api = new ApiClient();
