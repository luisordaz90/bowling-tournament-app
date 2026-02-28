'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { EnhancedProtectedRoute } from '@/components/rbac/EnhancedProtectedRoute';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Trophy,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Clock,
  Play,
  Pause,
  Target,
  TrendingUp
} from 'lucide-react';
import { tournamentApi, Tournament, ScheduleSummary, Match, LeagueSession as Session } from '../../../../../lib/api';

export default function ScheduleSummaryPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [scheduleSummary, setScheduleSummary] = useState<ScheduleSummary | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'validation'>('overview');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tournamentData, summaryData, matchesData, sessionsData] = await Promise.all([
        tournamentApi.getById(tournamentId),
        tournamentApi.getScheduleSummary(tournamentId),
        tournamentApi.getMatches(tournamentId),
        tournamentApi.getSessions(tournamentId)
      ]);

      setTournament(tournamentData);
      setScheduleSummary(summaryData);
      setMatches(matchesData);
      setSessions(sessionsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
      setError('Failed to load schedule summary');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    if (tournamentId) {
      fetchData();
    }
  }, [tournamentId, fetchData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-gray-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'postponed':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900">{scheduleSummary?.totalTeams || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{scheduleSummary?.totalSessions || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900">{scheduleSummary?.matchStats?.total || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {scheduleSummary?.matchStats?.total && scheduleSummary.matchStats.total > 0 
                  ? Math.round((scheduleSummary.matchStats.completed / scheduleSummary.matchStats.total) * 100)
                  : 0
                }%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Match Status Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Match Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-gray-500" />
            </div>
            <div className="text-xl font-bold text-gray-600">
              {scheduleSummary?.matchStats?.scheduled || 0}
            </div>
            <div className="text-sm text-gray-500">Scheduled</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Play className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-blue-600">
              {scheduleSummary?.matchStats?.inProgress || 0}
            </div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-xl font-bold text-green-600">
              {scheduleSummary?.matchStats?.completed || 0}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Pause className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-xl font-bold text-yellow-600">
              {scheduleSummary?.matchStats?.postponed || 0}
            </div>
            <div className="text-sm text-gray-500">Postponed</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="text-xl font-bold text-red-600">
              {scheduleSummary?.matchStats?.cancelled || 0}
            </div>
            <div className="text-sm text-gray-500">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Schedule Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Schedule Health</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {getValidationIcon(scheduleSummary?.isCompleteRoundRobin || false)}
              <div className="ml-3">
                <p className="font-medium text-gray-900">Complete Round Robin</p>
                <p className="text-sm text-gray-500">
                  {scheduleSummary?.matchStats?.total || 0} of {scheduleSummary?.expectedMatches || 0} matches created
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {(scheduleSummary?.expectedMatches || 0) > 0 
                  ? Math.round(((scheduleSummary?.matchStats?.total || 0) / (scheduleSummary?.expectedMatches || 1)) * 100)
                  : 0
                }%
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {getValidationIcon(scheduleSummary?.overallValidation.noTeamConflicts || false)}
              <div className="ml-3">
                <p className="font-medium text-gray-900">No Team Conflicts</p>
                <p className="text-sm text-gray-500">
                  Teams are not double-booked in sessions
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {getValidationIcon(scheduleSummary?.hasCorrectSessions || false)}
              <div className="ml-3">
                <p className="font-medium text-gray-900">Correct Session Count</p>
                <p className="text-sm text-gray-500">
                  {scheduleSummary?.totalSessions || 0} of {scheduleSummary?.expectedSessions || 0} sessions created
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {(scheduleSummary?.expectedSessions || 0) > 0 
                  ? Math.round(((scheduleSummary?.totalSessions || 0) / (scheduleSummary?.expectedSessions || 1)) * 100)
                  : 0
                }%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessionsTab = () => (
    <div className="space-y-6">
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions created</h3>
          <p className="mt-1 text-sm text-gray-500">Sessions will appear here once they are created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const sessionMatches = matches.filter(m => m.sessionNumber === session.sessionNumber);
            const completedMatches = sessionMatches.filter(m => m.status === 'completed');
            const progressPercentage = sessionMatches.length > 0 
              ? Math.round((completedMatches.length / sessionMatches.length) * 100) 
              : 0;

            return (
              <div key={session.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Session {session.sessionNumber}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {session.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(session.sessionDate).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Trophy className="h-4 w-4 mr-2" />
                    {sessionMatches.length} matches
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          progressPercentage === 100 ? 'bg-green-500' :
                          progressPercentage > 0 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Link
                    href={`/tournaments/${tournamentId}/sessions/${session.sessionNumber}/matches`}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    View matches →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderValidationTab = () => (
    <div className="space-y-6">
      {/* Overall Validation Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Overall Validation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              {getValidationIcon(scheduleSummary?.overallValidation?.completeRoundRobin || false)}
              <span className="ml-3 text-sm font-medium text-gray-900">Complete Round Robin</span>
            </div>
            <div className="flex items-center">
              {getValidationIcon(scheduleSummary?.overallValidation?.noTeamConflicts || false)}
              <span className="ml-3 text-sm font-medium text-gray-900">No Team Conflicts</span>
            </div>
            <div className="flex items-center">
              {getValidationIcon(scheduleSummary?.overallValidation?.allTeamsPlayingPerSession || false)}
              <span className="ml-3 text-sm font-medium text-gray-900">All Teams Playing Per Session</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              {getValidationIcon(scheduleSummary?.isCompleteRoundRobin || false)}
              <span className="ml-3 text-sm font-medium text-gray-900">Round Robin Complete</span>
            </div>
            <div className="flex items-center">
              {getValidationIcon(scheduleSummary?.hasCorrectSessions || false)}
              <span className="ml-3 text-sm font-medium text-gray-900">Correct Session Count</span>
            </div>
            <div className="flex items-center">
              {getValidationIcon(!scheduleSummary?.hasScheduleConflicts || false)}
              <span className="ml-3 text-sm font-medium text-gray-900">No Schedule Conflicts</span>
            </div>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Schedule Summary</h1>
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
              onClick={() => setActiveTab('sessions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Sessions
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'validation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Validation
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'sessions' && renderSessionsTab()}
        {activeTab === 'validation' && renderValidationTab()}
      </div>
      </div>
    </EnhancedProtectedRoute>
  );
}