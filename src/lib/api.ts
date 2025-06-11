// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
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

export interface Standing {
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

export interface Statistics {
  totalTeams: number;
  totalPlayers: number;
  totalGames: number;
  highestGame: number;
  highestSeries: number;
  averageScore: number;
  sessionsCompleted: number;
  totalSessions: number;
  totalMatches: number;
  completedMatches: number;
  scheduledMatches: number;
}

export interface PlayerStatistic {
  playerId: string;
  playerName: string;
  teamId: string;
  tournamentId: string;
  gamesPlayed: number;
  totalPins: number;
  currentAverage: number;
  highestGame: number;
  highestSeries: number;
  matchesPlayed: number;
}

export interface PlayerTournamentStatistic {
  playerId: string;
  tournamentId: string;
  gamesPlayed: number;
  totalPins: number;
  currentAverage: number;
  highestGame: number;
  highestSeries: number;
  matchesPlayed: number;
}

export interface TeamStatistic {
  teamId: string;
  teamName: string;
  tournamentId: string;
  totalMatchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  totalTeamScore: number;
  teamAverage: number;
  rankPosition: number | null;
}

export interface TeamTournamentStatistic {
  teamId: string;
  tournamentId: string;
  totalMatchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  totalTeamScore: number;
  teamAverage: number;
  rankPosition: number | null;
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

export interface TournamentTeam {
  id: string;
  tournamentId: string;
  teamId: string;
  seedNumber?: number;
  totalTournamentScore: number;
  gamesPlayedInTournament: number;
  sessionsPlayedInTournament: number;
  registrationDate: string;
  status: string;
  teamDetails?: Team;
}

export interface TeamPlayer {
  id: string;
  teamId: string;
  playerId: string;
  tournamentId: string;
  role: 'captain' | 'regular' | 'substitute';
  isActive: boolean;
  joinedDate: string;
  leftDate?: string;
  playerDetails?: Player;
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

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  memory: object;
  data: {
    tournaments: number;
    teams: number;
    players: number;
    matches: number;
    leagueSessions: number;
  };
}

// API Functions
export const tournamentApi = {
  getAll: () => apiClient.get<Tournament[]>('/tournaments'),
  getById: (id: string) => apiClient.get<Tournament>(`/tournaments/${id}`),
  create: (data: Partial<Tournament>) => apiClient.post<Tournament>('/tournaments', data),
  update: (id: string, data: Partial<Tournament>) => apiClient.put<Tournament>(`/tournaments/${id}`, data),
  delete: (id: string) => apiClient.delete(`/tournaments/${id}`),
  getStandings: (id: string) => apiClient.get<Standing[]>(`/tournaments/${id}/standings`),
  getStatistics: (id: string) => apiClient.get<Statistics>(`/tournaments/${id}/statistics`),
  getTeams: (id: string) => apiClient.get<TournamentTeam[]>(`/tournaments/${id}/teams`),
  registerTeam: (tournamentId: string, data: { teamId: string; seedNumber?: number }) => 
    apiClient.post<TournamentTeam>(`/tournaments/${tournamentId}/teams`, data),
  getMatches: (id: string) => apiClient.get<Match[]>(`/tournaments/${id}/matches`),
  createMatch: (tournamentId: string, data: Partial<Match>) => 
    apiClient.post<Match>(`/tournaments/${tournamentId}/matches`, data),
  getSessions: (id: string) => apiClient.get<LeagueSession[]>(`/tournaments/${id}/sessions`),
  createSession: (tournamentId: string, data: {
    sessionNumber: number;
    sessionName?: string;
    sessionDate: string;
    notes?: string;
  }) => apiClient.post<LeagueSession>(`/tournaments/${tournamentId}/sessions`, data),
};

export const teamApi = {
  getAll: () => apiClient.get<Team[]>('/teams'),
  getById: (id: string) => apiClient.get<Team>(`/teams/${id}`),
  create: (data: Partial<Team>) => apiClient.post<Team>('/teams', data),
  update: (id: string, data: Partial<Team>) => apiClient.put<Team>(`/teams/${id}`, data),
  delete: (id: string) => apiClient.delete(`/teams/${id}`),
};

export const playerApi = {
  getAll: () => apiClient.get<Player[]>('/players'),
  getById: (id: string) => apiClient.get<Player>(`/players/${id}`),
  create: (data: Partial<Player>) => apiClient.post<Player>('/players', data),
  update: (id: string, data: Partial<Player>) => apiClient.put<Player>(`/players/${id}`, data),
  delete: (id: string) => apiClient.delete(`/players/${id}`),
};

export const matchApi = {
  getByTournament: (tournamentId: string) => apiClient.get<Match[]>(`/tournaments/${tournamentId}/matches`),
  getById: (id: string) => apiClient.get<Match>(`/matches/${id}`),
  create: (tournamentId: string, data: Partial<Match>) => 
    apiClient.post<Match>(`/tournaments/${tournamentId}/matches`, data),
  updateStatus: (id: string, status: string) => 
    apiClient.put<Match>(`/matches/${id}/status`, { status }),
};

export const playerStatisticsApi = {
  // Get all player statistics for a tournament
  getByTournament: (tournamentId: string) => 
    apiClient.get<PlayerStatistic[]>(`/tournaments/${tournamentId}/player-statistics`),
  
  // Get specific player statistics for a tournament
  getPlayerInTournament: (tournamentId: string, playerId: string) => 
    apiClient.get<PlayerTournamentStatistic>(`/tournaments/${tournamentId}/players/${playerId}/statistics`),
  
  // Update player statistics
  updatePlayerStats: (playerId: string, tournamentId: string, data: Partial<PlayerTournamentStatistic>) => 
    apiClient.put<PlayerTournamentStatistic>(`/player-statistics/${playerId}/${tournamentId}`, data),
  
  // Get player statistics via Next.js API route (for client-side calls)
  getViaNextApi: (tournamentId: string, playerId?: string) => {
    const params = new URLSearchParams({ tournamentId });
    if (playerId) params.append('playerId', playerId);
    return fetch(`/api/player-statistics?${params.toString()}`).then(res => res.json());
  },
  
  // Update player statistics via Next.js API route
  updateViaNextApi: (playerId: string, tournamentId: string, data: Partial<PlayerTournamentStatistic>) => {
    const params = new URLSearchParams({ playerId, tournamentId });
    return fetch(`/api/player-statistics?${params.toString()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json());
  },
};

export const teamStatisticsApi = {
  // Get all team statistics for a tournament
  getByTournament: (tournamentId: string) => 
    apiClient.get<TeamStatistic[]>(`/tournaments/${tournamentId}/team-statistics`),
  
  // Get specific team statistics for a tournament
  getTeamInTournament: (tournamentId: string, teamId: string) => 
    apiClient.get<TeamTournamentStatistic>(`/tournaments/${tournamentId}/teams/${teamId}/statistics`),
  
  // Update team statistics
  updateTeamStats: (teamId: string, tournamentId: string, data: Partial<TeamTournamentStatistic>) => 
    apiClient.put<TeamTournamentStatistic>(`/team-statistics/${teamId}/${tournamentId}`, data),
  
  // Get team statistics via Next.js API route (for client-side calls)
  getViaNextApi: (tournamentId: string, teamId?: string) => {
    const params = new URLSearchParams({ tournamentId });
    if (teamId) params.append('teamId', teamId);
    return fetch(`/api/team-statistics?${params.toString()}`).then(res => res.json());
  },
  
  // Update team statistics via Next.js API route
  updateViaNextApi: (teamId: string, tournamentId: string, data: Partial<TeamTournamentStatistic>) => {
    const params = new URLSearchParams({ teamId, tournamentId });
    return fetch(`/api/team-statistics?${params.toString()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json());
  },
};

export const teamPlayersApi = {
  // Get players for a team in a tournament
  getByTeamAndTournament: (tournamentId: string, teamId: string) => 
    apiClient.get<TeamPlayer[]>(`/tournaments/${tournamentId}/teams/${teamId}/players`),
  
  // Assign player to team in tournament
  assignPlayer: (tournamentId: string, teamId: string, data: {
    playerId: string;
    role?: 'captain' | 'regular' | 'substitute';
  }) => apiClient.post<TeamPlayer>(`/tournaments/${tournamentId}/teams/${teamId}/players`, data),
};

export const matchScoresApi = {
  // Player match scores
  getPlayerScores: (matchId: string) => 
    apiClient.get<PlayerMatchScore[]>(`/matches/${matchId}/player-scores`),
  
  recordPlayerScore: (matchId: string, data: {
    teamId: string;
    playerId: string;
    game1Score: number;
    game2Score: number;
    game3Score: number;
    handicapApplied?: number;
  }) => apiClient.post<PlayerMatchScore>(`/matches/${matchId}/player-scores`, data),
  
  // Team match scores
  getTeamScores: (matchId: string) => 
    apiClient.get<TeamMatchScore[]>(`/matches/${matchId}/team-scores`),
  
  recordTeamScore: (matchId: string, data: { teamId: string }) => 
    apiClient.post<TeamMatchScore>(`/matches/${matchId}/team-scores`, data),
};

export const sessionsApi = {
  // League sessions
  getByTournament: (tournamentId: string) => 
    apiClient.get<LeagueSession[]>(`/tournaments/${tournamentId}/sessions`),
  
  create: (tournamentId: string, data: {
    sessionNumber: number;
    sessionName?: string;
    sessionDate: string;
    notes?: string;
  }) => apiClient.post<LeagueSession>(`/tournaments/${tournamentId}/sessions`, data),
  
  updateStatus: (sessionId: string, status: 'scheduled' | 'active' | 'completed' | 'cancelled') => 
    apiClient.put<LeagueSession>(`/sessions/${sessionId}/status`, { status }),
};

// Health check
export const healthApi = {
  check: () => apiClient.get<HealthStatus>('/health'),
}