// app/tournaments/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Users, Calendar, BarChart3, ArrowLeft, Plus } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { tournamentApi, Tournament, Standing, Statistics } from '../../../lib/api';

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'standings' | 'statistics'>('overview');

  useEffect(() => {
    fetchTournamentData();
  }, [tournamentId]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentResponse, standingsResponse, statisticsResponse] = await Promise.all([
        tournamentApi.getById(tournamentId),
        tournamentApi.getStandings(tournamentId),
        tournamentApi.getStatistics(tournamentId),
      ]);
      
      setTournament(tournamentResponse.data);
      setStandings(standingsResponse.data);
      setStatistics(statisticsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tournament data');
      console.error('Error fetching tournament data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !tournament) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error || 'Tournament not found'}</p>
            <Link
              href="/tournaments"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tournaments
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/tournaments"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tournaments
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
                  <p className="text-gray-600">{tournament.description}</p>
                </div>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                tournament.status
              )}`}
            >
              {tournament.status}
            </span>
          </div>
        </div>

        {/* Tournament Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Teams</p>
                <p className="text-lg font-semibold text-gray-900">
                  {statistics?.totalTeams || 0} / {tournament.maxTeams}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <p className="text-lg font-semibold text-gray-900">
                  {tournament.sessionsCompleted} / {tournament.totalSessions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg Score</p>
                <p className="text-lg font-semibold text-gray-900">
                  {statistics?.averageScore || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: Trophy },
              { id: 'standings', name: 'Standings', icon: BarChart3 },
              { id: 'statistics', name: 'Statistics', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Details</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Session Type</dt>
                  <dd className="text-sm text-gray-900">{tournament.sessionType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Sessions</dt>
                  <dd className="text-sm text-gray-900">{tournament.totalSessions}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Max Teams</dt>
                  <dd className="text-sm text-gray-900">{tournament.maxTeams}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">{new Date(tournament.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href={`/tournaments/${tournamentId}/teams`}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Teams</p>
                    <p className="text-sm text-gray-500">Register and organize teams</p>
                  </div>
                </Link>
                <Link
                  href={`/tournaments/${tournamentId}/matches`}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Calendar className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Schedule Matches</p>
                    <p className="text-sm text-gray-500">Create and manage matches</p>
                  </div>
                </Link>
                <Link
                  href={`/tournaments/${tournamentId}/sessions`}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="h-6 w-6 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">League Sessions</p>
                    <p className="text-sm text-gray-500">Manage tournament sessions</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tournament Standings</h3>
            </div>
            {standings.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No standings available yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matches
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        W-L
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Win %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {standings.map((standing, index) => (
                      <tr key={standing.teamId} className={index < 3 ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{standing.rank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{standing.teamName}</div>
                            <div className="text-sm text-gray-500">{standing.captainName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.matchesPlayed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.matchesWon}-{standing.matchesLost}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.winPercentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.averageScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.totalScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'statistics' && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Participation</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Teams</dt>
                  <dd className="text-sm font-medium text-gray-900">{statistics.totalTeams}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Players</dt>
                  <dd className="text-sm font-medium text-gray-900">{statistics.totalPlayers}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Games</dt>
                  <dd className="text-sm font-medium text-gray-900">{statistics.totalGames}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Scoring Records</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Highest Game</dt>
                  <dd className="text-sm font-medium text-gray-900">{statistics.highestGame}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Highest Series</dt>
                  <dd className="text-sm font-medium text-gray-900">{statistics.highestSeries}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Average Score</dt>
                  <dd className="text-sm font-medium text-gray-900">{statistics.averageScore}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Tournament Progress</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Sessions Completed</dt>
                  <dd className="text-sm font-medium text-gray-900">{statistics.sessionsCompleted}/{statistics.totalSessions}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Matches</dt>
                  <dd className="text-sm font-medium text-gray-900">{statistics.totalMatches}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Completed Matches</dt>
                  <dd className="text-sm font-medium text-gray-900">{statistics.completedMatches}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}