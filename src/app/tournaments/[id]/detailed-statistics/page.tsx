'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EnhancedProtectedRoute } from '@/components/rbac/EnhancedProtectedRoute';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Users,
  Target,
  BarChart3,
  Crown,
  Medal,
  Award,
  Star,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { api, Tournament } from '../../../../lib/api';
import Breadcrumb from '../../../components/Breadcrumb';

interface PlayerStatistics {
  playerId: string;
  playerName: string;
  teamName: string;
  average: number;
  totalMatchesPlayed: number;
  totalScore: number;
  highestScore: number;
}

interface TeamStatistics {
  teamId: string;
  teamName: string;
  teamAverage: number;
  totalMatchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  totalTeamScore: number;
}

export default function DetailedStatisticsPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStatistics[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'teams' | 'rankings'>('overview');
  const [sortBy, setSortBy] = useState<string>('average');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (tournamentId) {
      fetchData();
    }
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tournamentData, playerStatsData, teamStatsData] = await Promise.all([
        api.tournaments.getById(tournamentId),
        api.statistics.getAllPlayerStats(tournamentId),
        api.statistics.getAllTeamStats(tournamentId)
      ]);

      setTournament(tournamentData);
      setPlayerStats(playerStatsData);
      setTeamStats(teamStatsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load tournament statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedPlayerStats = [...playerStats].sort((a, b) => {
    const aValue = a[sortBy as keyof PlayerStatistics] as number;
    const bValue = b[sortBy as keyof PlayerStatistics] as number;
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const sortedTeamStats = [...teamStats].sort((a, b) => {
    const aValue = a[sortBy as keyof TeamStatistics] as number;
    const bValue = b[sortBy as keyof TeamStatistics] as number;
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const getOverallStats = () => {
    if (playerStats.length === 0) return null;

    const totalPlayers = playerStats.length;
    const totalMatches = playerStats.reduce((sum, player) => sum + player.totalMatchesPlayed, 0);
    const totalScore = playerStats.reduce((sum, player) => sum + player.totalScore, 0);
    const averageScore = totalMatches > 0 ? totalScore / totalMatches : 0;
    const highestScore = Math.max(...playerStats.map(p => p.highestScore));
    const highestAverage = Math.max(...playerStats.map(p => p.average));

    return {
      totalPlayers,
      totalMatches,
      totalScore,
      averageScore,
      highestScore,
      highestAverage
    };
  };

  const getPerformanceColor = (average: number) => {
    if (average >= 180) return 'text-green-600';
    if (average >= 160) return 'text-blue-600';
    if (average >= 140) return 'text-purple-600';
    if (average >= 120) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getPerformanceBadge = (average: number) => {
    if (average >= 180) return { text: 'Elite', class: 'bg-green-100 text-green-800' };
    if (average >= 160) return { text: 'Strong', class: 'bg-blue-100 text-blue-800' };
    if (average >= 140) return { text: 'Competitive', class: 'bg-purple-100 text-purple-800' };
    if (average >= 120) return { text: 'Developing', class: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Building', class: 'bg-gray-100 text-gray-800' };
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-orange-600" />;
    return null;
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
    >
      <span>{children}</span>
      {sortBy === field && (
        sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      )}
    </button>
  );

  const overallStats = getOverallStats();

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Overall Statistics */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.totalPlayers}</div>
            <div className="text-sm text-gray-500">Players</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.totalMatches}</div>
            <div className="text-sm text-gray-500">Total Matches</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.averageScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Tournament Avg</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.highestScore}</div>
            <div className="text-sm text-gray-500">Highest Score</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.highestAverage.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Highest Average</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Trophy className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{overallStats.totalScore.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Pins</div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Individual Averages</h3>
          <div className="space-y-3">
            {playerStats
              .sort((a, b) => b.average - a.average)
              .slice(0, 5)
              .map((player, index) => {
                const badge = getPerformanceBadge(player.average);
                return (
                  <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                        {getRankIcon(index + 1)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{player.playerName}</p>
                        <p className="text-sm text-gray-500">{player.teamName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPerformanceColor(player.average)}`}>
                        {player.average.toFixed(1)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                        {badge.text}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Team Performances</h3>
          <div className="space-y-3">
            {teamStats
              .sort((a, b) => b.teamAverage - a.teamAverage)
              .slice(0, 5)
              .map((team, index) => {
                const badge = getPerformanceBadge(team.teamAverage);
                return (
                  <div key={team.teamId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                        {getRankIcon(index + 1)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{team.teamName}</p>
                        <p className="text-sm text-gray-500">
                          {team.matchesWon}-{team.matchesLost} record
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPerformanceColor(team.teamAverage)}`}>
                        {team.teamAverage.toFixed(1)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                        {badge.text}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlayersTab = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Individual Player Statistics</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortButton field="playerName">Player</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="teamName">Team</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="average">Average</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="totalMatchesPlayed">Matches</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="totalScore">Total Score</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="highestScore">High Score</SortButton>
              </th>
              <th className="px-6 py-3 text-left">Performance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPlayerStats.map((player, index) => {
              const badge = getPerformanceBadge(player.average);
              return (
                <tr key={player.playerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2 mr-3">
                        <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                        {index < 3 && getRankIcon(index + 1)}
                      </div>
                      <div className="font-medium text-gray-900">{player.playerName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{player.teamName}</td>
                  <td className="px-6 py-4">
                    <div className={`text-lg font-semibold ${getPerformanceColor(player.average)}`}>
                      {player.average.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{player.totalMatchesPlayed}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{player.totalScore.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{player.highestScore}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                      {badge.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTeamsTab = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Team Statistics</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <SortButton field="teamName">Team</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="teamAverage">Team Average</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="totalMatchesPlayed">Matches</SortButton>
              </th>
              <th className="px-6 py-3 text-left">Record</th>
              <th className="px-6 py-3 text-left">
                <SortButton field="totalTeamScore">Total Score</SortButton>
              </th>
              <th className="px-6 py-3 text-left">Win %</th>
              <th className="px-6 py-3 text-left">Performance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTeamStats.map((team, index) => {
              const badge = getPerformanceBadge(team.teamAverage);
              const winPercentage = team.totalMatchesPlayed > 0 
                ? Math.round((team.matchesWon / team.totalMatchesPlayed) * 100) 
                : 0;

              return (
                <tr key={team.teamId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2 mr-3">
                        <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                        {index < 3 && getRankIcon(index + 1)}
                      </div>
                      <div className="font-medium text-gray-900">{team.teamName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-lg font-semibold ${getPerformanceColor(team.teamAverage)}`}>
                      {team.teamAverage.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{team.totalMatchesPlayed}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="text-green-600 font-medium">{team.matchesWon}</span>
                    -
                    <span className="text-red-600 font-medium">{team.matchesLost}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{team.totalTeamScore.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            winPercentage >= 70 ? 'bg-green-500' :
                            winPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${winPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{winPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                      {badge.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRankingsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Individual Rankings</h3>
        <div className="space-y-4">
          {playerStats
            .sort((a, b) => b.average - a.average)
            .map((player, index) => (
              <div key={player.playerId} className={`flex items-center justify-between p-4 rounded-lg ${
                index < 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xl font-bold ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-500' :
                      index === 2 ? 'text-orange-600' : 'text-gray-700'
                    }`}>
                      #{index + 1}
                    </span>
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{player.playerName}</p>
                    <p className="text-sm text-gray-500">{player.teamName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getPerformanceColor(player.average)}`}>
                    {player.average.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">{player.totalMatchesPlayed} matches</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Team Rankings</h3>
        <div className="space-y-4">
          {teamStats
            .sort((a, b) => b.teamAverage - a.teamAverage)
            .map((team, index) => {
              const winPercentage = team.totalMatchesPlayed > 0 
                ? Math.round((team.matchesWon / team.totalMatchesPlayed) * 100) 
                : 0;

              return (
                <div key={team.teamId} className={`flex items-center justify-between p-4 rounded-lg ${
                  index < 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xl font-bold ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-500' :
                        index === 2 ? 'text-orange-600' : 'text-gray-700'
                      }`}>
                        #{index + 1}
                      </span>
                      {getRankIcon(index + 1)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{team.teamName}</p>
                      <p className="text-sm text-gray-500">
                        {team.matchesWon}-{team.matchesLost} ({winPercentage}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getPerformanceColor(team.teamAverage)}`}>
                      {team.teamAverage.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">{team.totalMatchesPlayed} matches</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <EnhancedProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        </div>
      </EnhancedProtectedRoute>
    );
  }

  return (
    <EnhancedProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[
        { label: 'Tournaments', href: '/tournaments' },
        { label: tournament?.name || 'Tournament', href: `/tournaments/${tournamentId}` },
        { label: 'Detailed Statistics' },
      ]} />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <Link
            href={`/tournaments/${tournamentId}`}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detailed Statistics</h1>
            <p className="text-gray-600">{tournament?.name}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'players'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Players
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'teams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Trophy className="h-4 w-4 inline mr-2" />
              Teams
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rankings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Crown className="h-4 w-4 inline mr-2" />
              Rankings
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'players' && renderPlayersTab()}
        {activeTab === 'teams' && renderTeamsTab()}
        {activeTab === 'rankings' && renderRankingsTab()}
      </div>
      </div>
    </EnhancedProtectedRoute>
  );
}