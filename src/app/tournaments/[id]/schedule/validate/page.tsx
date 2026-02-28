// app/tournaments/[id]/schedule/validate/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EnhancedProtectedRoute } from '@/components/rbac/EnhancedProtectedRoute';
import { UserRole } from '@/lib/rbac';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  FileText,
  Users,
  Calendar,
  Trophy
} from 'lucide-react';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { api, Tournament } from '../../../../../lib/api';

interface ValidationIssue {
  type: string;
  message: string;
  session?: number;
  match?: string;
  teamId?: string;
  teamName?: string;
  conflictingTeam?: string;
  teamsPlaying?: number;
  expectedTeams?: number;
  missingTeams?: number;
  matchCount?: number;
  expected?: number;
  actual?: number;
  missing?: number;
  duplicates?: Array<{
    matchup: string;
    homeTeamId: string;
    awayTeamId: string;
  }>;
  sessions?: number[];
}

interface ValidationResults {
  tournamentId: string;
  totalTeams: number;
  totalMatches: number;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  isValid: boolean;
}

export default function ScheduleValidationPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [validation, setValidation] = useState<ValidationResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
      fetchValidation();
    }
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      const data = await api.tournaments.getById(tournamentId);
      setTournament(data);
    } catch (err) {
      console.error('Error fetching tournament:', err);
    }
  };

  const fetchValidation = async () => {
    try {
      setLoading(true);
      const data = await api.tournaments.validateSchedule(tournamentId);
      setValidation(data);
      setError(null);
    } catch (err: any) {
      console.error('Error validating schedule:', err);
      setError(err.message || 'Failed to validate schedule');
    } finally {
      setLoading(false);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'INSUFFICIENT_TEAMS':
      case 'INCOMPLETE_ROUND_ROBIN':
      case 'TEAM_CONFLICT':
      case 'DUPLICATE_MATCHUPS':
      case 'MISSING_MATCHUPS':
      case 'INCOMPLETE_SESSION':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'SESSION_COUNT_MISMATCH':
      case 'UNASSIGNED_MATCHES':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'INSUFFICIENT_TEAMS':
      case 'INCOMPLETE_ROUND_ROBIN':
      case 'TEAM_CONFLICT':
      case 'DUPLICATE_MATCHUPS':
      case 'MISSING_MATCHUPS':
      case 'INCOMPLETE_SESSION':
        return 'bg-red-50 border-red-200';
      case 'SESSION_COUNT_MISMATCH':
      case 'UNASSIGNED_MATCHES':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const renderIssueDetails = (issue: ValidationIssue) => {
    switch (issue.type) {
      case 'INSUFFICIENT_TEAMS':
        return (
          <div className="text-sm text-gray-700">
            <p>Tournament needs at least 2 teams to generate a valid schedule.</p>
            <p className="mt-1">Current teams: {issue.expected || 0}</p>
          </div>
        );
      
      case 'INCOMPLETE_ROUND_ROBIN':
        return (
          <div className="text-sm text-gray-700">
            <p>Expected {issue.expected} matches for a complete round-robin tournament.</p>
            <p className="mt-1">Currently has {issue.actual} matches ({issue.missing} missing).</p>
          </div>
        );
      
      case 'TEAM_CONFLICT':
        return (
          <div className="text-sm text-gray-700">
            <p>Team "{issue.teamName}" is scheduled to play {issue.matchCount} matches in session {issue.session}.</p>
            <p className="mt-1">Each team should only play one match per session.</p>
          </div>
        );
      
      case 'INCOMPLETE_SESSION':
        return (
          <div className="text-sm text-gray-700">
            <p>Session {issue.session} has {issue.teamsPlaying} teams playing, but should have {issue.expectedTeams}.</p>
            <p className="mt-1">This may indicate missing matches or scheduling conflicts.</p>
          </div>
        );
      
      case 'DUPLICATE_MATCHUPS':
        return (
          <div className="text-sm text-gray-700">
            <p>Found duplicate matchups in the tournament:</p>
            <ul className="mt-1 ml-4 list-disc">
              {issue.duplicates?.map((dup, index) => (
                <li key={index}>{dup.matchup}</li>
              ))}
            </ul>
          </div>
        );
      
      case 'MISSING_MATCHUPS':
        return (
          <div className="text-sm text-gray-700">
            <p>{issue.missing} matchups are missing for a complete round-robin.</p>
            <p className="mt-1">Some teams may not play against each other.</p>
          </div>
        );
      
      case 'SESSION_COUNT_MISMATCH':
        return (
          <div className="text-sm text-gray-700">
            <p>Expected {issue.expected} sessions for optimal round-robin scheduling.</p>
            <p className="mt-1">Currently has {issue.actual} sessions.</p>
          </div>
        );
      
      case 'UNASSIGNED_MATCHES':
        return (
          <div className="text-sm text-gray-700">
            <p>{issue.actual} matches are not assigned to any session.</p>
            <p className="mt-1">These matches need to be assigned to sessions for proper scheduling.</p>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-gray-700">
            <p>{issue.message}</p>
          </div>
        );
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
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Link
                href={`/tournaments/${tournamentId}/matches`}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Schedule Validation</h1>
                <p className="text-gray-600">{tournament?.name}</p>
              </div>
            </div>
            <button
              onClick={fetchValidation}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {validation && (
          <>
            {/* Validation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Teams</p>
                    <p className="text-2xl font-bold text-gray-900">{validation.totalTeams}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Matches</p>
                    <p className="text-2xl font-bold text-gray-900">{validation.totalMatches}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Critical Issues</p>
                    <p className="text-2xl font-bold text-red-600">{validation.issues.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  {validation.isValid ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Schedule Status</p>
                    <p className={`text-lg font-bold ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.isValid ? 'Valid' : 'Invalid'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Status */}
            <div className={`rounded-lg p-6 mb-8 ${validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                {validation.isValid ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 mr-3" />
                )}
                <div>
                  <h3 className={`text-lg font-medium ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                    {validation.isValid ? 'Schedule is Valid' : 'Schedule has Issues'}
                  </h3>
                  <p className={`text-sm ${validation.isValid ? 'text-green-700' : 'text-red-700'}`}>
                    {validation.isValid 
                      ? 'Your tournament schedule is properly configured and ready for matches.'
                      : `Found ${validation.issues.length} critical issue${validation.issues.length !== 1 ? 's' : ''} that need to be resolved.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Critical Issues */}
            {validation.issues.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Critical Issues</h2>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {validation.issues.length}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {validation.issues.map((issue, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getIssueColor(issue.type)}`}>
                        <div className="flex items-start">
                          {getIssueIcon(issue.type)}
                          <div className="ml-3 flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {issue.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            {renderIssueDetails(issue)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">Warnings</h2>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {validation.warnings.length}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getIssueColor(warning.type)}`}>
                        <div className="flex items-start">
                          {getIssueIcon(warning.type)}
                          <div className="ml-3 flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {warning.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            {renderIssueDetails(warning)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Issues */}
            {validation.issues.length === 0 && validation.warnings.length === 0 && (
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="p-8 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Perfect Schedule!</h3>
                  <p className="text-gray-600">
                    No validation issues or warnings were found. Your tournament schedule is properly configured.
                  </p>
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
                  href={`/tournaments/${tournamentId}/schedule/preview`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Schedule Preview
                </Link>

                <Link
                  href={`/tournaments/${tournamentId}/schedule/summary`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View Summary
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </EnhancedProtectedRoute>
  );
};