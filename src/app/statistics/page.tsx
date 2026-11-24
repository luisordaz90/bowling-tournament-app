// app/statistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3, Trophy, Users, Target, TrendingUp, Medal, Star, Award, User,
  Crown, ChevronUp, ChevronDown, Activity
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import LeagueTournamentPicker from '../components/LeagueTournamentPicker';
import { api, Tournament } from '../../lib/api';

type PlayerSortField = 'playerName' | 'currentAverage' | 'highestGame' | 'highestSeries' | 'gamesPlayed' | 'totalPins';
type TeamSortField = 'teamName' | 'teamAverage' | 'matchesWon' | 'matchesLost' | 'totalMatchesPlayed' | 'totalTeamScore' | 'rankPosition';
type SortDirection = 'asc' | 'desc';

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'teams'>('overview');

  // Shared
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Per-tab data
  const [statistics, setStatistics] = useState<any | null>(null);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [teamStats, setTeamStats] = useState<any[]>([]);

  // Player sort
  const [playerSortField, setPlayerSortField] = useState<PlayerSortField>('currentAverage');
  const [playerSortDir, setPlayerSortDir] = useState<SortDirection>('desc');

  // Team sort
  const [teamSortField, setTeamSortField] = useState<TeamSortField>('rankPosition');
  const [teamSortDir, setTeamSortDir] = useState<SortDirection>('asc');

  const handleSelectionChange = (selection: { leagueId: string; tournamentId: string } | null) => {
    if (selection) {
      setSelectedTournament(selection.tournamentId);
      fetchAllData(selection.tournamentId);
    } else {
      setSelectedTournament('');
      setStatistics(null);
      setPlayerStats([]);
      setTeamStats([]);
      setLoading(false);
    }
  };

  const fetchAllData = async (tournamentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, playerData, teamData] = await Promise.all([
        api.statistics.getTournamentStats(tournamentId),
        api.statistics.getAllPlayerStats(tournamentId),
        api.statistics.getAllTeamStats(tournamentId),
      ]);
      setStatistics(statsData);
      setPlayerStats(playerData);
      setTeamStats(teamData);
    } catch (err) {
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  // ── Sort helpers ─────────────────────────────────────────────────────────────

  const handlePlayerSort = (field: PlayerSortField) => {
    if (playerSortField === field) {
      setPlayerSortDir(playerSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setPlayerSortField(field);
      setPlayerSortDir('desc');
    }
  };

  const handleTeamSort = (field: TeamSortField) => {
    if (teamSortField === field) {
      setTeamSortDir(teamSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setTeamSortField(field);
      setTeamSortDir(field === 'rankPosition' ? 'asc' : 'desc');
    }
  };

  const sortedPlayerStats = [...playerStats].sort((a, b) => {
    const aVal = a[playerSortField];
    const bVal = b[playerSortField];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return playerSortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return playerSortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
  });

  const sortedTeamStats = [...teamStats].sort((a, b) => {
    const aVal = a[teamSortField];
    const bVal = b[teamSortField];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return teamSortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return teamSortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
  });

  const PlayerSortIcon = ({ field }: { field: PlayerSortField }) => {
    if (playerSortField !== field) return null;
    return playerSortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const TeamSortIcon = ({ field }: { field: TeamSortField }) => {
    if (teamSortField !== field) return null;
    return teamSortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // ── Shared helpers ────────────────────────────────────────────────────────────

  const calculateProgress = (completed: number, total: number) =>
    total === 0 ? 0 : Math.round((completed / total) * 100);

  const getPerformanceColor = (average: number) => {
    if (average >= 200) return 'text-green-600';
    if (average >= 180) return 'text-blue-600';
    if (average >= 150) return 'text-purple-600';
    if (average >= 120) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getPlayerBadge = (average: number) => {
    if (average >= 200) return { text: 'Elite', cls: 'bg-green-100 text-green-800' };
    if (average >= 180) return { text: 'Expert', cls: 'bg-blue-100 text-blue-800' };
    if (average >= 150) return { text: 'Advanced', cls: 'bg-purple-100 text-purple-800' };
    if (average >= 120) return { text: 'Intermediate', cls: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Beginner', cls: 'bg-gray-100 text-gray-800' };
  };

  const getTeamBadge = (average: number) => {
    if (average >= 180) return { text: 'Elite', cls: 'bg-green-100 text-green-800' };
    if (average >= 160) return { text: 'Strong', cls: 'bg-blue-100 text-blue-800' };
    if (average >= 140) return { text: 'Competitive', cls: 'bg-purple-100 text-purple-800' };
    if (average >= 120) return { text: 'Developing', cls: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Building', cls: 'bg-gray-100 text-gray-800' };
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-orange-600" />;
    return null;
  };

  // ── Derived leaderboard data ──────────────────────────────────────────────────

  const playerLeaderboard = (() => {
    if (playerStats.length === 0) return null;
    const highestAvg = Math.max(...playerStats.map(p => p.currentAverage));
    const highestGame = Math.max(...playerStats.map(p => p.highestGame));
    const highestSeries = Math.max(...playerStats.map(p => p.highestSeries));
    const totalGames = playerStats.reduce((s, p) => s + p.gamesPlayed, 0);
    const totalPins = playerStats.reduce((s, p) => s + p.totalPins, 0);
    return {
      highestAvgPlayer: playerStats.find(p => p.currentAverage === highestAvg),
      highestGamePlayer: playerStats.find(p => p.highestGame === highestGame),
      highestSeriesPlayer: playerStats.find(p => p.highestSeries === highestSeries),
      overallAverage: totalGames > 0 ? Math.round(totalPins / totalGames) : 0,
      totalPlayers: playerStats.length,
    };
  })();

  const teamLeaderboard = (() => {
    if (teamStats.length === 0) return null;
    const topAvg = Math.max(...teamStats.map(t => t.teamAverage));
    const mostWins = Math.max(...teamStats.map(t => t.matchesWon));
    const totalMatches = teamStats.reduce((s, t) => s + t.totalMatchesPlayed, 0);
    const totalScore = teamStats.reduce((s, t) => s + t.totalTeamScore, 0);
    const winPcts = teamStats.map(t =>
      t.totalMatchesPlayed > 0 ? (t.matchesWon / t.totalMatchesPlayed) * 100 : 0
    );
    const avgWinPct = winPcts.reduce((s, p) => s + p, 0) / winPcts.length;
    const stdDev = Math.sqrt(winPcts.reduce((s, p) => s + Math.pow(p - avgWinPct, 2), 0) / winPcts.length);
    return {
      topTeam: teamStats.find(t => t.teamAverage === topAvg),
      winLeader: teamStats.find(t => t.matchesWon === mostWins),
      overallAverage: totalMatches > 0 ? Math.round(totalScore / totalMatches) : 0,
      totalTeams: teamStats.length,
      balance: stdDev < 15 ? 'Highly Competitive' : stdDev < 25 ? 'Competitive' : 'Wide Spread',
      stdDev: stdDev.toFixed(1),
    };
  })();

  // ── Tab renderers ─────────────────────────────────────────────────────────────

  const renderOverviewTab = () => {
    if (!statistics) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No statistics available</h3>
          <p className="mt-1 text-sm text-gray-500">Statistics will appear once matches are completed.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Participation</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalTeams}</p>
                <p className="text-xs text-gray-500">Teams • {statistics.totalPlayers} Players</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Tournament Analytics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{statistics.totalTeams}</div>
              <div className="text-sm text-gray-500">Participating Teams</div>
              <div className="text-xs text-gray-400 mt-1">
                {statistics.totalTeams > 1 ? 'Multi-team tournament' : 'Single team'}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{statistics.totalPlayers}</div>
              <div className="text-sm text-gray-500">Active Players</div>
              <div className="text-xs text-gray-400 mt-1">
                Avg {statistics.totalTeams > 0 ? Math.round(statistics.totalPlayers / statistics.totalTeams) : 0} per team
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {statistics.totalPlayers > 0 ? Math.round(statistics.totalGames / statistics.totalPlayers) : 0}
              </div>
              <div className="text-sm text-gray-500">Games per Player</div>
              <div className="text-xs text-gray-400 mt-1">
                Total: {statistics.totalGames.toLocaleString()} games
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        {statistics.totalGames > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Performance Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Scoring Distribution</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm text-gray-600">Above Average ({statistics.averageScore}+)</span>
                    <span className="text-sm font-medium text-green-600">
                      {statistics.averageScore > 0 ? Math.round((statistics.highestGame / statistics.averageScore) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span className="text-sm text-gray-600">Perfect Games (300)</span>
                    <span className="text-sm font-medium text-purple-600">
                      {statistics.highestGame === 300 ? '1+' : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm text-gray-600">High Series (250+)</span>
                    <span className="text-sm font-medium text-blue-600">
                      {statistics.highestSeries >= 250 ? '1+' : '0'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tournament Health</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="text-sm font-medium text-blue-600">
                      {calculateProgress(statistics.completedMatches, statistics.totalMatches)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm text-gray-600">Active Participation</span>
                    <span className="text-sm font-medium text-green-600">
                      {statistics.totalPlayers > 0 ? 'High' : 'Low'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm text-gray-600">Session Progress</span>
                    <span className="text-sm font-medium text-orange-600">
                      {calculateProgress(statistics.sessionsCompleted, statistics.totalSessions)}%
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Key Metrics</h4>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded">
                    <div className="text-lg font-bold text-gray-900">
                      {statistics.totalGames > 0
                        ? Math.round(((statistics.highestGame - statistics.averageScore) / statistics.averageScore) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-gray-500">Performance Spread</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded">
                    <div className="text-lg font-bold text-gray-900">
                      {statistics.totalMatches > 0
                        ? Math.round((statistics.completedMatches / statistics.totalMatches) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-gray-500">Match Completion</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded">
                    <div className="text-lg font-bold text-gray-900">
                      {statistics.totalSessions > 0
                        ? Math.round((statistics.sessionsCompleted / statistics.totalSessions) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-gray-500">Season Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Competition Overview + Achievement Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 text-amber-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Competition Overview</h3>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4">
                <div className="text-sm font-medium text-gray-900">Tournament Status</div>
                <div className="text-xs text-gray-500 mt-1">
                  {statistics.completedMatches === statistics.totalMatches && statistics.totalMatches > 0
                    ? 'Tournament Complete'
                    : statistics.completedMatches > 0
                    ? 'Tournament In Progress'
                    : 'Tournament Starting Soon'}
                </div>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <div className="text-sm font-medium text-gray-900">Match Activity</div>
                <div className="text-xs text-gray-500 mt-1">
                  {statistics.completedMatches} completed • {statistics.scheduledMatches} scheduled
                </div>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <div className="text-sm font-medium text-gray-900">Player Engagement</div>
                <div className="text-xs text-gray-500 mt-1">
                  {statistics.totalPlayers} active players across {statistics.totalTeams} teams
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-6">
              <Award className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Achievement Highlights</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Highest Single Game</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">{statistics.highestGame}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-center">
                  <Medal className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Highest Series Total</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{statistics.highestSeries}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">Tournament Average</span>
                </div>
                <span className="text-xl font-bold text-green-600">{statistics.averageScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Tournament Data</h3>
              <p className="text-sm text-gray-500">Export and manage tournament statistics</p>
            </div>
            <div className="flex space-x-3">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => {
                  const data = JSON.stringify(statistics, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `tournament-statistics-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Data
              </button>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                onClick={() => window.print()}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Print Report
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{statistics.totalGames}</div>
              <div className="text-sm text-gray-500">Total Games</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{statistics.totalTeams}</div>
              <div className="text-sm text-gray-500">Teams</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{statistics.totalPlayers}</div>
              <div className="text-sm text-gray-500">Players</div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {calculateProgress(statistics.completedMatches, statistics.totalMatches)}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayersTab = () => {
    if (playerStats.length === 0) {
      return (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No player statistics</h3>
          <p className="mt-1 text-sm text-gray-500">Statistics will appear once players have completed games.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Leaderboard highlights */}
        {playerLeaderboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Highest Average</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {playerLeaderboard.highestAvgPlayer?.currentAverage.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">{playerLeaderboard.highestAvgPlayer?.playerName}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Highest Game</p>
                  <p className="text-lg font-bold text-blue-600">
                    {playerLeaderboard.highestGamePlayer?.highestGame}
                  </p>
                  <p className="text-xs text-gray-500">{playerLeaderboard.highestGamePlayer?.playerName}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Medal className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Highest Series</p>
                  <p className="text-lg font-bold text-purple-600">
                    {playerLeaderboard.highestSeriesPlayer?.highestSeries}
                  </p>
                  <p className="text-xs text-gray-500">{playerLeaderboard.highestSeriesPlayer?.playerName}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Tournament Average</p>
                  <p className="text-lg font-bold text-green-600">{playerLeaderboard.overallAverage}</p>
                  <p className="text-xs text-gray-500">{playerLeaderboard.totalPlayers} players</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Player Performance Rankings</h3>
            <span className="text-sm text-gray-500">
              {playerStats.length} players
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  {([
                    { field: 'playerName', label: 'Player' },
                    { field: 'currentAverage', label: 'Average' },
                    { field: 'gamesPlayed', label: 'Games' },
                    { field: 'highestGame', label: 'High Game' },
                    { field: 'highestSeries', label: 'High Series' },
                    { field: 'totalPins', label: 'Total Pins' },
                  ] as { field: PlayerSortField; label: string }[]).map(({ field, label }) => (
                    <th
                      key={field}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handlePlayerSort(field)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{label}</span>
                        <PlayerSortIcon field={field} />
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPlayerStats.map((player, index) => {
                  const badge = getPlayerBadge(player.currentAverage);
                  const isTop = index < 3 && playerSortField === 'currentAverage' && playerSortDir === 'desc';
                  return (
                    <tr key={player.playerId} className={isTop ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                          {isTop && <Trophy className={`h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-600'}`} />}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{player.playerName}</div>
                            <div className="text-sm text-gray-500">{player.matchesPlayed} matches</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-lg font-semibold ${getPerformanceColor(player.currentAverage)}`}>
                          {player.currentAverage.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.gamesPlayed}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{player.highestGame}</span>
                        {player.highestGame >= 200 && <Star className="h-4 w-4 text-yellow-500 inline ml-1" />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{player.highestSeries}</span>
                        {player.highestSeries >= 600 && <Award className="h-4 w-4 text-purple-500 inline ml-1" />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.totalPins.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/players/${player.playerId}`} className="text-blue-600 hover:text-blue-900">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { level: 'Elite', min: 200, color: 'bg-green-500', textColor: 'text-green-600' },
              { level: 'Expert', min: 180, color: 'bg-blue-500', textColor: 'text-blue-600' },
              { level: 'Advanced', min: 150, color: 'bg-purple-500', textColor: 'text-purple-600' },
              { level: 'Intermediate', min: 120, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
              { level: 'Beginner', min: 0, color: 'bg-gray-500', textColor: 'text-gray-600' },
            ].map((category) => {
              const count = playerStats.filter(p =>
                category.level === 'Beginner' ? p.currentAverage < 120 : p.currentAverage >= category.min
              ).length;
              const pct = playerStats.length > 0 ? Math.round((count / playerStats.length) * 100) : 0;
              return (
                <div key={category.level} className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className={`w-16 h-16 ${category.color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">{count}</span>
                  </div>
                  <div className={`text-sm font-medium ${category.textColor}`}>{category.level}</div>
                  <div className="text-xs text-gray-500">{pct}% of players</div>
                  <div className="text-xs text-gray-400">{category.min > 0 ? `${category.min}+ avg` : 'Under 120'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTeamsTab = () => {
    if (teamStats.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No team statistics</h3>
          <p className="mt-1 text-sm text-gray-500">Statistics will appear once teams have completed matches.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Leaderboard highlights */}
        {teamLeaderboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Leading Team</p>
                  <p className="text-lg font-bold text-yellow-600">{teamLeaderboard.topTeam?.teamAverage.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">{teamLeaderboard.topTeam?.teamName}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Most Wins</p>
                  <p className="text-lg font-bold text-blue-600">{teamLeaderboard.winLeader?.matchesWon}</p>
                  <p className="text-xs text-gray-500">{teamLeaderboard.winLeader?.teamName}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Tournament Average</p>
                  <p className="text-lg font-bold text-green-600">{teamLeaderboard.overallAverage}</p>
                  <p className="text-xs text-gray-500">{teamLeaderboard.totalTeams} teams</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Competition Level</p>
                  <p className="text-lg font-bold text-purple-600">{teamLeaderboard.balance}</p>
                  <p className="text-xs text-gray-500">σ = {teamLeaderboard.stdDev}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Team Performance Rankings</h3>
            <span className="text-sm text-gray-500">{teamStats.length} teams</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {([
                    { field: 'rankPosition', label: 'Rank' },
                    { field: 'teamName', label: 'Team' },
                    { field: 'teamAverage', label: 'Team Average' },
                    { field: 'matchesWon', label: 'Record (W-L)' },
                    { field: 'totalTeamScore', label: 'Total Score' },
                  ] as { field: TeamSortField; label: string }[]).map(({ field, label }) => (
                    <th
                      key={field}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleTeamSort(field)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{label}</span>
                        <TeamSortIcon field={field} />
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTeamStats.map((team) => {
                  const badge = getTeamBadge(team.teamAverage);
                  const winPct = team.totalMatchesPlayed > 0
                    ? Math.round((team.matchesWon / team.totalMatchesPlayed) * 100)
                    : 0;
                  const isTop = team.rankPosition && team.rankPosition <= 3;
                  return (
                    <tr key={team.teamId} className={isTop ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-gray-900">#{team.rankPosition || 'N/A'}</span>
                          {team.rankPosition && getRankIcon(team.rankPosition)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                            <div className="text-sm text-gray-500">{team.totalMatchesPlayed} matches played</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-lg font-semibold ${getPerformanceColor(team.teamAverage)}`}>
                          {team.teamAverage.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{team.matchesWon}-{team.matchesLost}</div>
                        <div className="text-xs text-gray-500">{team.totalMatchesPlayed} games</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {team.totalTeamScore.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${winPct >= 70 ? 'bg-green-500' : winPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${winPct}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{winPct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/teams/${team.teamId}`} className="text-blue-600 hover:text-blue-900">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-4">
              {sortedTeamStats.slice(0, 5).map((team, index) => (
                <div key={team.teamId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{team.teamName}</p>
                      <p className="text-xs text-gray-500">{team.matchesWon}-{team.matchesLost} record</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${getPerformanceColor(team.teamAverage)}`}>
                      {team.teamAverage.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">average</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Distribution</h3>
            <div className="space-y-4">
              {[
                { level: 'Elite', min: 180, color: 'bg-green-500', textColor: 'text-green-600' },
                { level: 'Strong', min: 160, color: 'bg-blue-500', textColor: 'text-blue-600' },
                { level: 'Competitive', min: 140, color: 'bg-purple-500', textColor: 'text-purple-600' },
                { level: 'Developing', min: 120, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
                { level: 'Building', min: 0, color: 'bg-gray-500', textColor: 'text-gray-600' },
              ].map((category) => {
                const count = teamStats.filter(t =>
                  category.level === 'Building' ? t.teamAverage < 120 : t.teamAverage >= category.min
                ).length;
                const pct = teamStats.length > 0 ? Math.round((count / teamStats.length) * 100) : 0;
                return (
                  <div key={category.level} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 ${category.color} rounded mr-3`} />
                      <span className="text-sm font-medium text-gray-900">{category.level}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({category.min > 0 ? `${category.min}+` : '<120'} avg)
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">{count}</span>
                      <span className="text-xs text-gray-500">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'players' as const, label: 'Players', icon: User },
    { id: 'teams' as const, label: 'Teams', icon: Users },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
            <p className="mt-2 text-gray-600">Comprehensive tournament analytics and insights</p>
          </div>
        </div>

        <LeagueTournamentPicker
          onSelectionChange={handleSelectionChange}
          className="mb-8"
        />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!selectedTournament ? (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tournament selected</h3>
            <p className="mt-1 text-sm text-gray-500">Please select a tournament to view statistics.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'players' && renderPlayersTab()}
            {activeTab === 'teams' && renderTeamsTab()}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
