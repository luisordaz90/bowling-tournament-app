// src/app/player-statistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, BarChart3, Target, TrendingUp, Medal, Star, Award, User, Crown, ChevronUp, ChevronDown } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { tournamentApi, playerStatisticsApi, Tournament, PlayerStatistic } from '../../lib/api';

// interface PlayerStatistic {
//   playerId: string;
//   playerName: string;
//   teamId: string;
//   tournamentId: string;
//   gamesPlayed: number;
//   totalPins: number;
//   currentAverage: number;
//   highestGame: number;
//   highestSeries: number;
//   matchesPlayed: number;
// }

type SortField = 'playerName' | 'currentAverage' | 'highestGame' | 'highestSeries' | 'gamesPlayed' | 'totalPins';
type SortDirection = 'asc' | 'desc';

export default function PlayerStatisticsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [playerStats, setPlayerStats] = useState<PlayerStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('currentAverage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchPlayerStatistics(selectedTournament);
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentApi.getAll();
      setTournaments(response.data);
      if (response.data.length > 0) {
        setSelectedTournament(response.data[0].id);
      }
    } catch (err) {
      setError('Failed to fetch tournaments');
      console.error('Error fetching tournaments:', err);
    }
  };

  const fetchPlayerStatistics = async (tournamentId: string) => {
    try {
      setLoading(true);
      const response = await playerStatisticsApi.getViaNextApi(tournamentId);
      setPlayerStats(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch player statistics');
      console.error('Error fetching player statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStats = [...playerStats].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? Number(aValue) - Number(bValue)
      : Number(bValue) - Number(aValue);
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  const getPerformanceColor = (average: number) => {
    if (average >= 200) return 'text-green-600';
    if (average >= 180) return 'text-blue-600';
    if (average >= 150) return 'text-purple-600';
    if (average >= 120) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getPerformanceBadge = (average: number) => {
    if (average >= 200) return { text: 'Elite', class: 'badge-success' };
    if (average >= 180) return { text: 'Expert', class: 'badge-primary' };
    if (average >= 150) return { text: 'Advanced', class: 'badge-warning' };
    if (average >= 120) return { text: 'Intermediate', class: 'badge-gray' };
    return { text: 'Beginner', class: 'badge-gray' };
  };

  const calculateLeaderboardStats = () => {
    if (playerStats.length === 0) return null;

    const highestAverage = Math.max(...playerStats.map(p => p.currentAverage));
    const highestGame = Math.max(...playerStats.map(p => p.highestGame));
    const highestSeries = Math.max(...playerStats.map(p => p.highestSeries));
    const totalGames = playerStats.reduce((sum, p) => sum + p.gamesPlayed, 0);
    const totalPins = playerStats.reduce((sum, p) => sum + p.totalPins, 0);
    const overallAverage = totalGames > 0 ? Math.round(totalPins / totalGames) : 0;

    return {
      highestAverage: playerStats.find(p => p.currentAverage === highestAverage),
      highestGamePlayer: playerStats.find(p => p.highestGame === highestGame),
      highestSeriesPlayer: playerStats.find(p => p.highestSeries === highestSeries),
      totalPlayers: playerStats.length,
      overallAverage,
      totalGames,
    };
  };

  const leaderboardStats = calculateLeaderboardStats();

  return (
    <ProtectedRoute>
      <div className="container-wide py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Player Statistics</h1>
            <p className="mt-2 text-gray-600">Comprehensive player performance analytics</p>
          </div>
        </div>

        {/* Tournament Selector */}
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <label htmlFor="tournament" className="form-label">
                Select Tournament:
              </label>
              <select
                id="tournament"
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="form-input max-w-xs"
              >
                <option value="">Select a tournament</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner h-8 w-8"></div>
          </div>
        ) : !selectedTournament ? (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tournament selected</h3>
            <p className="mt-1 text-sm text-gray-500">Please select a tournament to view player statistics.</p>
          </div>
        ) : playerStats.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No player statistics</h3>
            <p className="mt-1 text-sm text-gray-500">Statistics will appear once players have completed games.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Leaderboard Highlights */}
            {leaderboardStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <Crown className="h-8 w-8 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Highest Average</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {leaderboardStats.highestAverage?.currentAverage.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">{leaderboardStats.highestAverage?.playerName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <Star className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Highest Game</p>
                        <p className="text-lg font-bold text-blue-600">
                          {leaderboardStats.highestGamePlayer?.highestGame}
                        </p>
                        <p className="text-xs text-gray-500">{leaderboardStats.highestGamePlayer?.playerName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <Medal className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Highest Series</p>
                        <p className="text-lg font-bold text-purple-600">
                          {leaderboardStats.highestSeriesPlayer?.highestSeries}
                        </p>
                        <p className="text-xs text-gray-500">{leaderboardStats.highestSeriesPlayer?.playerName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Tournament Average</p>
                        <p className="text-lg font-bold text-green-600">
                          {leaderboardStats.overallAverage}
                        </p>
                        <p className="text-xs text-gray-500">{leaderboardStats.totalPlayers} players</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Table */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Player Performance Rankings</h3>
                  <div className="text-sm text-gray-500">
                    {playerStats.length} players • Sorted by {sortField.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rank
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('playerName')}
                        >
                          <div className="flex items-center">
                            Player
                            {getSortIcon('playerName')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('currentAverage')}
                        >
                          <div className="flex items-center">
                            Average
                            {getSortIcon('currentAverage')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('gamesPlayed')}
                        >
                          <div className="flex items-center">
                            Games
                            {getSortIcon('gamesPlayed')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('highestGame')}
                        >
                          <div className="flex items-center">
                            High Game
                            {getSortIcon('highestGame')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('highestSeries')}
                        >
                          <div className="flex items-center">
                            High Series
                            {getSortIcon('highestSeries')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('totalPins')}
                        >
                          <div className="flex items-center">
                            Total Pins
                            {getSortIcon('totalPins')}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedStats.map((player, index) => {
                        const performanceBadge = getPerformanceBadge(player.currentAverage);
                        const isTopPerformer = index < 3 && sortField === 'currentAverage' && sortDirection === 'desc';
                        
                        return (
                          <tr key={player.playerId} className={isTopPerformer ? 'bg-yellow-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                                {isTopPerformer && (
                                  <Trophy className={`h-4 w-4 ml-2 ${
                                    index === 0 ? 'text-yellow-500' : 
                                    index === 1 ? 'text-gray-400' : 'text-orange-600'
                                  }`} />
                                )}
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {player.gamesPlayed}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{player.highestGame}</span>
                              {player.highestGame >= 200 && (
                                <Star className="h-4 w-4 text-yellow-500 inline ml-1" />
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{player.highestSeries}</span>
                              {player.highestSeries >= 600 && (
                                <Award className="h-4 w-4 text-purple-500 inline ml-1" />
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {player.totalPins.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`badge ${performanceBadge.class}`}>
                                {performanceBadge.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                href={`/players/${player.playerId}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
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
            </div>

            {/* Performance Distribution */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Performance Distribution</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { level: 'Elite', min: 200, color: 'bg-green-500', textColor: 'text-green-600' },
                    { level: 'Expert', min: 180, color: 'bg-blue-500', textColor: 'text-blue-600' },
                    { level: 'Advanced', min: 150, color: 'bg-purple-500', textColor: 'text-purple-600' },
                    { level: 'Intermediate', min: 120, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
                    { level: 'Beginner', min: 0, color: 'bg-gray-500', textColor: 'text-gray-600' },
                  ].map((category) => {
                    const count = playerStats.filter(p => {
                      if (category.level === 'Beginner') return p.currentAverage < 120;
                      return p.currentAverage >= category.min;
                    }).length;
                    const percentage = playerStats.length > 0 ? Math.round((count / playerStats.length) * 100) : 0;
                    
                    return (
                      <div key={category.level} className="text-center p-4 border border-gray-200 rounded-lg">
                        <div className={`w-16 h-16 ${category.color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">{count}</span>
                        </div>
                        <div className={`text-sm font-medium ${category.textColor}`}>{category.level}</div>
                        <div className="text-xs text-gray-500">{percentage}% of players</div>
                        <div className="text-xs text-gray-400">
                          {category.min > 0 ? `${category.min}+ avg` : 'Under 120'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}