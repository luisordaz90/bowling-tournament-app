// app/tournaments/[id]/schedule/preview/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EnhancedProtectedRoute } from '@/components/rbac/EnhancedProtectedRoute';
import { UserRole } from '@/lib/rbac';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shuffle,
  FileText,
  Eye
} from 'lucide-react';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { api, RoundRobinPreview, Tournament } from '../../../../../lib/api';

interface SessionMatch {
  homeTeam: { id: string; name: string };
  awayTeam: { id: string; name: string };
}

interface ScheduleSession {
  sessionNumber: number;
  matches: SessionMatch[];
  byeTeam?: { id: string; name: string };
}

export default function SchedulePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [preview, setPreview] = useState<RoundRobinPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
      fetchPreview();
    }
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      const data = await api.tournaments.getById(tournamentId);
      setTournament(data);
    } catch (err) {
      console.error('Error fetching tournament:', err);
      setError('Failed to fetch tournament details');
    }
  };

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const data = await api.tournaments.previewRoundRobin(tournamentId);
      setPreview(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching preview:', err);
      setError(err.message || 'Failed to generate schedule preview');
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    if (!preview?.isValidSchedule) {
      alert('Cannot generate schedule due to validation issues. Please review the issues below.');
      return;
    }

    try {
      setGenerating(true);
      await api.tournaments.generateRoundRobin(tournamentId, {
        startDate: new Date().toISOString(),
        daysBetweenSessions: 7,
        forceCreate: false
      });
      
      alert('Schedule generated successfully!');
      router.push(`/tournaments/${tournamentId}/matches`);
    } catch (err: any) {
      console.error('Error generating schedule:', err);
      alert(`Failed to generate schedule: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <EnhancedProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </EnhancedProtectedRoute>
    );
  }

  if (error) {
    return (
      <EnhancedProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </EnhancedProtectedRoute>
    );
  }

  return (
    <EnhancedProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href={`/tournaments/${tournamentId}/matches`}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Preview</h1>
              <p className="text-gray-600">{tournament?.name}</p>
            </div>
          </div>
        </div>

        {preview && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Teams</p>
                    <p className="text-2xl font-bold text-gray-900">{preview.totalTeams}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Sessions Required</p>
                    <p className="text-2xl font-bold text-gray-900">{preview.sessionsRequired}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Matches</p>
                    <p className="text-2xl font-bold text-gray-900">{preview.totalMatches}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  {preview.isValidSchedule ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  )}
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Schedule Status</p>
                    <p className={`text-lg font-bold ${preview.isValidSchedule ? 'text-green-600' : 'text-red-600'}`}>
                      {preview.isValidSchedule ? 'Valid' : 'Issues Found'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Schedule Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tournament Structure</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Teams per session: {preview.teamsPerSession}</li>
                      <li>Matches per session: {preview.matchesPerSession}</li>
                      <li>Matches per team: {preview.matchesPerTeam}</li>
                      <li>Has odd teams: {preview.hasOddTeams ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Session Capacity</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Sessions required: {preview.sessionsRequired}</li>
                      <li>Sessions available: {preview.sessionsAvailable}</li>
                      <li>Can fit in tournament: {preview.canFitInTournament ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Match Distribution</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Expected matches: {preview.expectedMatches}</li>
                      <li>Generated matches: {preview.totalMatches}</li>
                      <li>Complete round-robin: {preview.totalMatches === preview.expectedMatches ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Issues */}
            {preview.validationIssues.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Validation Issues</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {preview.validationIssues.map((issue, index) => (
                      <div key={index} className="flex items-start p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-800">{issue.type || 'Validation Error'}</p>
                          <p className="text-sm text-red-700">{issue.message || JSON.stringify(issue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Sessions */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Session Schedule</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {preview.schedule.map((session: ScheduleSession) => (
                    <div key={session.sessionNumber} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Session {session.sessionNumber}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Trophy className="h-4 w-4 mr-1" />
                          {session.matches.length} matches
                          {session.byeTeam && (
                            <span className="ml-4 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              {session.byeTeam.name} has bye
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {session.matches.map((match, matchIndex) => (
                          <div key={matchIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">
                              {match.homeTeam.name}
                            </span>
                            <span className="text-xs text-gray-500 mx-2">vs</span>
                            <span className="text-sm font-medium">
                              {match.awayTeam.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bye Schedule */}
            {preview.hasOddTeams && (
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Bye Schedule</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {preview.schedule.map((session: ScheduleSession) => (
                      <div key={session.sessionNumber} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="font-medium">Session {session.sessionNumber}</span>
                        <span className="text-sm text-gray-600">
                          {session.byeTeam?.name || 'No bye'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Link
                href={`/tournaments/${tournamentId}/matches`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Matches
              </Link>

              <div className="flex space-x-3">
                <Link
                  href={`/tournaments/${tournamentId}/schedule/validate`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Validate Schedule
                </Link>

                <button
                  onClick={generateSchedule}
                  disabled={!preview.isValidSchedule || generating}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    preview.isValidSchedule && !generating
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Shuffle className="h-4 w-4 mr-2" />
                      Generate Schedule
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </EnhancedProtectedRoute>
  );
};