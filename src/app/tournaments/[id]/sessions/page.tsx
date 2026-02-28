'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EnhancedProtectedRoute } from '@/components/rbac/EnhancedProtectedRoute';
import { UserRole } from '@/lib/rbac';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Users,
  Trophy,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  BarChart3
} from 'lucide-react';
import { tournamentApi, api, Tournament, LeagueSession as Session, Match } from '../../../../lib/api';

export default function SessionsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    sessionNumber: '',
    sessionDate: '',
    status: 'scheduled' as const
  });

  useEffect(() => {
    if (tournamentId) {
      fetchData();
    }
  }, [tournamentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tournamentData, sessionsData, matchesData] = await Promise.all([
        tournamentApi.getById(tournamentId),
        tournamentApi.getSessions(tournamentId),
        tournamentApi.getMatches(tournamentId)
      ]);

      setTournament(tournamentData);
      setSessions(sessionsData);
      setMatches(matchesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSession.sessionNumber || !newSession.sessionDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await tournamentApi.createSession(tournamentId, {
        sessionNumber: parseInt(newSession.sessionNumber),
        sessionDate: newSession.sessionDate,
        status: newSession.status
      });

      setNewSession({
        sessionNumber: '',
        sessionDate: '',
        status: 'scheduled'
      });
      setShowCreateForm(false);
      await fetchData();
    } catch (err: any) {
      console.error('Error creating session:', err);
      setError(err.response?.data?.error || 'Failed to create session');
    }
  };

  const updateSessionStatus = async (sessionId: string, status: string) => {
    try {
      await api.sessions.updateStatus(sessionId, status);
      await fetchData();
    } catch (err: any) {
      console.error('Error updating session status:', err);
      setError('Failed to update session status');
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This will also delete all associated matches.')) {
      return;
    }

    try {
      // For now, just show an error as delete may not be implemented
      setError('Session deletion is not yet implemented in the API');
    } catch (err: any) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session');
    }
  };

  const getSessionMatches = (sessionNumber: number) => {
    return matches.filter(match => match.sessionNumber === sessionNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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
    <EnhancedProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href={`/tournaments/${tournamentId}`}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Session Management</h1>
              <p className="text-gray-600">{tournament?.name}</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Create Session Form */}
      {showCreateForm && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Session</h3>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="sessionNumber" className="block text-sm font-medium text-gray-700">
                  Session Number *
                </label>
                <input
                  type="number"
                  id="sessionNumber"
                  min="1"
                  value={newSession.sessionNumber}
                  onChange={(e) => setNewSession({ ...newSession, sessionNumber: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="sessionDate" className="block text-sm font-medium text-gray-700">
                  Session Date *
                </label>
                <input
                  type="datetime-local"
                  id="sessionDate"
                  value={newSession.sessionDate}
                  onChange={(e) => setNewSession({ ...newSession, sessionDate: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={newSession.status}
                  onChange={(e) => setNewSession({ ...newSession, status: e.target.value as any })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions created</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first session.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => {
            const sessionMatches = getSessionMatches(session.sessionNumber);
            const completedMatches = sessionMatches.filter(m => m.status === 'completed');
            
            return (
              <div key={session.id} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Session {session.sessionNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(session.sessionDate).toLocaleDateString()} at{' '}
                          {new Date(session.sessionDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1 capitalize">{session.status.replace('_', ' ')}</span>
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        {session.status === 'scheduled' && (
                          <button
                            onClick={() => updateSessionStatus(session.id, 'active')}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Start Session"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        
                        {session.status === 'active' && (
                          <button
                            onClick={() => updateSessionStatus(session.id, 'completed')}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Complete Session"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        <Link
                          href={`/tournaments/${tournamentId}/sessions/${session.sessionNumber}/matches`}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title="View Matches"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete Session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {sessionMatches.length} Matches
                        </p>
                        <p className="text-xs text-gray-500">
                          {completedMatches.length} completed
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Progress: {sessionMatches.length > 0 ? Math.round((completedMatches.length / sessionMatches.length) * 100) : 0}%
                        </p>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${sessionMatches.length > 0 ? (completedMatches.length / sessionMatches.length) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Created: {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </EnhancedProtectedRoute>
  );
}