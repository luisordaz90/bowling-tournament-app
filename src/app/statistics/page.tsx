// app/statistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Trophy, Users, Target, TrendingUp, Medal, Star, Award } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { tournamentApi, Tournament, Statistics } from '../../lib/api';

export default function StatisticsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchStatistics(selectedTournament);
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

  const fetchStatistics = async (tournamentId: string) => {
    try {
      setLoading(true);
      const response = await tournamentApi.getStatistics(tournamentId);
      setStatistics(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
            <p className="mt-2 text-gray-600">Comprehensive tournament analytics and insights</p>
          </div>
        </div>

        {/* Tournament Selector */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <label htmlFor="tournament" className="block text-sm font-medium text-gray-700">
              Select Tournament:
            </label>
            <select
              id="tournament"
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="block w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !selectedTournament ? (
          <div className="mt-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tournament selected</h3>
            <p className="mt-1 text-sm text-gray-500">Please select a tournament to view statistics.</p>
          </div>
        ) : !statistics ? (
          <div className="mt-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No statistics available</h3>
            <p className="mt-1 text-sm text-gray-500">Statistics will appear once matches are completed.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
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

            {/* Additional Statistics */}
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
                          {statistics.totalGames > 0 ? 
                            Math.round(((statistics.highestGame - statistics.averageScore) / statistics.averageScore) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-500">Performance Spread</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded">
                        <div className="text-lg font-bold text-gray-900">
                          {statistics.totalMatches > 0 ? 
                            Math.round((statistics.completedMatches / statistics.totalMatches) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-500">Match Completion</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded">
                        <div className="text-lg font-bold text-gray-900">
                          {statistics.totalSessions > 0 ? 
                            Math.round((statistics.sessionsCompleted / statistics.totalSessions) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-500">Season Progress</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Breakdown */}
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

            {/* Data Export and Actions */}
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
                    {Math.round(calculateProgress(statistics.completedMatches, statistics.totalMatches))}%
                  </div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}