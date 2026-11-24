'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EnhancedProtectedRoute } from '@/components/rbac/EnhancedProtectedRoute';
import { PermissionGate } from '@/components/rbac/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/lib/rbac';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Calendar,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Pause,
  Users,
  BarChart3
} from 'lucide-react';
import { api, Tournament, Match, Team } from '../../../../../../lib/api';
import Breadcrumb from '../../../../../components/Breadcrumb';

export default function SessionMatchesPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  const sessionNumber = parseInt(params.sessionNumber as string);
  const permissions = usePermissions();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tournamentId && sessionNumber) {
      fetchData();
    }
  }, [tournamentId, sessionNumber]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tournamentData, sessionMatchesData, teamsData] = await Promise.all([
        api.tournaments.getById(tournamentId),
        api.sessions.getMatches(tournamentId, sessionNumber),
        api.registrations.getTeams(tournamentId)
      ]);

      setTournament(tournamentData);
      setMatches(sessionMatchesData.matches || sessionMatchesData);
      setTeams(teamsData.map((reg: any) => reg.teamDetails));
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load session matches');
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (matchId: string, status: string) => {
    try {
      await api.matches.updateStatus(matchId, status);
      await fetchData();
    } catch (err: any) {
      console.error('Error updating match status:', err);
      setError('Failed to update match status');
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'postponed':
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const totalMatches = matches.length;
  const progressPercentage = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <EnhancedProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[
        { label: 'Tournaments', href: '/tournaments' },
        { label: tournament?.name || 'Tournament', href: `/tournaments/${tournamentId}` },
        { label: 'Sessions', href: `/tournaments/${tournamentId}/sessions` },
        { label: `Session ${sessionNumber}` },
        { label: 'Matches' },
      ]} />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <Link
            href={`/tournaments/${tournamentId}/sessions`}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Session {sessionNumber} Matches
            </h1>
            <p className="text-gray-600">{tournament?.name}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Session Progress */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Session Progress</h3>
          <span className="text-sm text-gray-500">
            {completedMatches} of {totalMatches} matches completed
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="mt-2 text-center text-sm font-medium text-gray-900">
          {progressPercentage}% Complete
        </div>
      </div>

      {/* Match Statistics */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 text-gray-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Matches</p>
              <p className="text-lg font-semibold text-gray-900">{totalMatches}</p>
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
      {matches.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No matches in this session</h3>
          <p className="mt-1 text-sm text-gray-500">
            Matches will appear here once they are scheduled for this session.
          </p>
        </div>
      ) : (
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
                            className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}
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
                      <PermissionGate roles={[UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]}>
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
                      </PermissionGate>
                      <Link
                        href={`/tournaments/${tournamentId}/sessions/${sessionNumber}/score`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Report Scores
                      </Link>
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
      )}
      </div>
    </EnhancedProtectedRoute>
  );
}