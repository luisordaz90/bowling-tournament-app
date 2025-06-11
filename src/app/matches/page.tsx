// app/matches/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Trophy, Users, Clock, CheckCircle, XCircle, Play, Pause } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { tournamentApi, matchApi, teamApi, Tournament, Match, Team } from '../../lib/api';

export default function MatchesPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchMatches(selectedTournament);
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

  const fetchTeams = async () => {
    try {
      const response = await teamApi.getAll();
      setTeams(response.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const fetchMatches = async (tournamentId: string) => {
    try {
      setLoading(true);
      const response = await matchApi.getByTournament(tournamentId);
      setMatches(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (matchId: string, status: string) => {
    try {
      await matchApi.updateStatus(matchId, status);
      setMatches(matches.map(m => 
        m.id === matchId ? { ...m, status: status as any } : m
      ));
    } catch (err) {
      alert('Failed to update match status');
      console.error('Error updating match status:', err);
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'postponed':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'postponed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
            <p className="mt-2 text-gray-600">View and manage tournament matches</p>
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
            {selectedTournament && (
              <Link
                href={`/tournaments/${selectedTournament}/matches/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Match
              </Link>
            )}
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
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tournament selected</h3>
            <p className="mt-1 text-sm text-gray-500">Please select a tournament to view matches.</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="mt-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No matches scheduled</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by scheduling a new match.</p>
            <div className="mt-6">
              <Link
                href={`/tournaments/${selectedTournament}/matches/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Match
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* Match Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <Calendar className="h-6 w-6 text-gray-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Matches</p>
                    <p className="text-lg font-semibold text-gray-900">{matches.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {matches.filter(m => m.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <Play className="h-6 w-6 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {matches.filter(m => m.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-gray-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Scheduled</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {matches.filter(m => m.status === 'scheduled').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Matches List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {matches.map((match) => (
                  <li key={match.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Trophy className="h-10 w-10 text-blue-600" />
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h3 className="text-lg font-medium text-gray-900">
                                {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
                              </h3>
                              <span
                                className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  match.status
                                )}`}
                              >
                                {getStatusIcon(match.status)}
                                <span className="ml-1 capitalize">{match.status.replace('_', ' ')}</span>
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              {match.matchDate && (
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>{new Date(match.matchDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              {match.sessionNumber && (
                                <div>Session {match.sessionNumber}</div>
                              )}
                              {match.weekNumber && (
                                <div>Week {match.weekNumber}</div>
                              )}
                            </div>
                            {match.matchName && (
                              <div className="mt-1 text-sm text-gray-600">{match.matchName}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {match.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => updateMatchStatus(match.id, 'in_progress')}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </button>
                              <button
                                onClick={() => updateMatchStatus(match.id, 'postponed')}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                              >
                                <Pause className="h-3 w-3 mr-1" />
                                Postpone
                              </button>
                            </>
                          )}
                          {match.status === 'in_progress' && (
                            <button
                              onClick={() => updateMatchStatus(match.id, 'completed')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </button>
                          )}
                          {(match.status === 'scheduled' || match.status === 'postponed') && (
                            <button
                              onClick={() => updateMatchStatus(match.id, 'cancelled')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </button>
                          )}
                          <Link
                            href={`/matches/${match.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}