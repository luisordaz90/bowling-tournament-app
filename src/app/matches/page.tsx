// app/matches/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Trophy, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause,
  Settings,
  Eye,
  BarChart3,
  AlertTriangle,
  Shuffle,
  FileText,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { PermissionGate } from '@/components/rbac/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/lib/rbac';
import { api, Tournament, Team, Match, ScheduleSummary } from '../../lib/api';

export default function MatchesPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const permissions = usePermissions();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [scheduleSummary, setScheduleSummary] = useState<ScheduleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'schedule' | 'generate'>('matches');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'session' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchMatches(selectedTournament);
      fetchScheduleSummary(selectedTournament);
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const data = await api.tournaments.getAll();
      setTournaments(data);
      if (data.length > 0) {
        setSelectedTournament(data[0].id);
      }
    } catch (err) {
      setError('Failed to fetch tournaments');
      console.error('Error fetching tournaments:', err);
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await api.teams.getAll();
      setTeams(data);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const fetchMatches = async (tournamentId: string) => {
    try {
      setLoading(true);
      const data = await api.tournaments.getMatches(tournamentId);
      setMatches(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch matches');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleSummary = async (tournamentId: string) => {
    try {
      const data = await api.tournaments.getScheduleSummary(tournamentId);
      setScheduleSummary(data);
    } catch (err) {
      console.error('Error fetching schedule summary:', err);
    }
  };

  const updateMatchStatus = async (matchId: string, status: string) => {
    try {
      const updatedMatch = await api.matches.updateStatus(matchId, status);
      setMatches(matches.map(m => 
        m.id === matchId ? updatedMatch : m
      ));
    } catch (err: any) {
      alert('Failed to update match status');
      console.error('Error updating match status:', err);
    }
  };

  const generateRoundRobinSchedule = async () => {
    if (!selectedTournament) return;
    
    try {
      const result = await api.tournaments.generateRoundRobin(selectedTournament, {
        startDate: new Date().toISOString(),
        daysBetweenSessions: 7,
        forceCreate: false
      });
      
      alert(`Successfully generated ${result.totalMatchesCreated} matches across ${result.totalSessionsCreated} sessions!`);
      fetchMatches(selectedTournament);
      fetchScheduleSummary(selectedTournament);
    } catch (err: any) {
      alert(`Failed to generate schedule: ${err.message}`);
      console.error('Error generating schedule:', err);
    }
  };

  const clearSchedule = async () => {
    if (!selectedTournament) return;
    
    if (!confirm('Are you sure you want to clear the entire tournament schedule? This action cannot be undone.')) {
      return;
    }
    
    try {
      const result = await api.tournaments.clearSchedule(selectedTournament);
      alert(result.message);
      fetchMatches(selectedTournament);
      fetchScheduleSummary(selectedTournament);
    } catch (err: any) {
      alert(`Failed to clear schedule: ${err.message}`);
      console.error('Error clearing schedule:', err);
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getFilteredAndSortedMatches = () => {
    let filteredMatches = matches.filter(match => {
      // Search filter
      const homeTeam = getTeamName(match.homeTeamId).toLowerCase();
      const awayTeam = getTeamName(match.awayTeamId).toLowerCase();
      const matchName = (match.matchName || '').toLowerCase();
      const searchMatch = searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm || 
        homeTeam.includes(searchMatch) || 
        awayTeam.includes(searchMatch) || 
        matchName.includes(searchMatch);

      // Status filter
      const matchesStatus = statusFilter === 'all' || match.status === statusFilter;

      // Session filter
      const matchesSession = sessionFilter === 'all' || 
        match.sessionNumber?.toString() === sessionFilter;

      return matchesSearch && matchesStatus && matchesSession;
    });

    // Sort matches
    filteredMatches.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = a.matchDate ? new Date(a.matchDate).getTime() : 0;
          bValue = b.matchDate ? new Date(b.matchDate).getTime() : 0;
          break;
        case 'session':
          aValue = a.sessionNumber || 0;
          bValue = b.sessionNumber || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredMatches;
  };

  const getUniqueSessions = () => {
    const sessions = matches
      .map(match => match.sessionNumber)
      .filter((session, index, self) => session !== null && self.indexOf(session) === index)
      .sort((a, b) => (a || 0) - (b || 0));
    return sessions;
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

  const renderMatchesTab = () => {
    const filteredMatches = getFilteredAndSortedMatches();
    const uniqueSessions = getUniqueSessions();

    return (
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search teams or matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Session Filter */}
            <div>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Sessions</option>
                {uniqueSessions.map(session => (
                  <option key={session} value={session?.toString()}>
                    Session {session}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="session">Sort by Session</option>
                <option value="status">Sort by Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {filteredMatches.length} of {matches.length} matches
            </div>
            {(searchTerm || statusFilter !== 'all' || sessionFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSessionFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-gray-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Matches</p>
              <p className="text-lg font-semibold text-gray-900">{filteredMatches.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredMatches.filter(m => m.status === 'completed').length}
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
                {filteredMatches.filter(m => m.status === 'in_progress').length}
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
                {filteredMatches.filter(m => m.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No matches scheduled</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by generating a round-robin schedule.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredMatches.map((match) => (
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
                      <PermissionGate roles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER, UserRole.SCOREKEEPER]}>
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
    );
  };

  const renderScheduleTab = () => (
    <div className="space-y-6">
      {scheduleSummary && (
        <>
          {/* Schedule Overview */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{scheduleSummary.totalTeams}</div>
                <div className="text-sm text-gray-500">Total Teams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{scheduleSummary.totalSessions}</div>
                <div className="text-sm text-gray-500">Sessions Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{scheduleSummary.matchStats.total}</div>
                <div className="text-sm text-gray-500">Total Matches</div>
              </div>
            </div>
          </div>

          {/* Schedule Validation */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Validation</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                {scheduleSummary.isCompleteRoundRobin ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={scheduleSummary.isCompleteRoundRobin ? 'text-green-700' : 'text-red-700'}>
                  Complete Round Robin ({scheduleSummary.matchStats.total}/{scheduleSummary.expectedMatches} matches)
                </span>
              </div>
              <div className="flex items-center">
                {scheduleSummary.overallValidation.noTeamConflicts ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                <span className={scheduleSummary.overallValidation.noTeamConflicts ? 'text-green-700' : 'text-yellow-700'}>
                  No Team Conflicts
                </span>
              </div>
              <div className="flex items-center">
                {scheduleSummary.hasCorrectSessions ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                <span className={scheduleSummary.hasCorrectSessions ? 'text-green-700' : 'text-yellow-700'}>
                  Correct Session Count ({scheduleSummary.totalSessions}/{scheduleSummary.expectedSessions})
                </span>
              </div>
            </div>
          </div>

          {/* Match Status Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Match Status Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-600">{scheduleSummary.matchStats.scheduled}</div>
                <div className="text-sm text-gray-500">Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{scheduleSummary.matchStats.inProgress}</div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{scheduleSummary.matchStats.completed}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">{scheduleSummary.matchStats.postponed}</div>
                <div className="text-sm text-gray-500">Postponed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{scheduleSummary.matchStats.cancelled}</div>
                <div className="text-sm text-gray-500">Cancelled</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderGenerateTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Round Robin Schedule Generator</h3>
        <p className="text-gray-600 mb-6">
          Generate a complete round-robin schedule where every team plays every other team once.
          This will automatically create sessions and matches based on the teams registered in the tournament.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-900">Generate New Schedule</h4>
              <p className="text-sm text-blue-700">Create matches for all registered teams</p>
            </div>
            <button
              onClick={generateRoundRobinSchedule}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Generate Schedule
            </button>
          </div>
          
          {matches.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-medium text-red-900">Clear Existing Schedule</h4>
                <p className="text-sm text-red-700">Remove all matches and auto-generated sessions</p>
              </div>
              <button
                onClick={clearSchedule}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear Schedule
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={`/tournaments/${selectedTournament}/schedule/preview`}
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Eye className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h4 className="font-medium">Preview Schedule</h4>
              <p className="text-sm text-gray-500">View schedule before generating</p>
            </div>
          </Link>
          
          <Link
            href={`/tournaments/${selectedTournament}/schedule/validate`}
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h4 className="font-medium">Validate Schedule</h4>
              <p className="text-sm text-gray-500">Check for conflicts and issues</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matches & Scheduling</h1>
            <p className="mt-2 text-gray-600">Manage tournament matches and generate schedules</p>
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

        {selectedTournament && (
          <>
            {/* Tabs */}
            <div className="mt-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('matches')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'matches'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Matches
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'schedule'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 inline mr-2" />
                    Schedule Overview
                  </button>
                  <PermissionGate roles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]}>
                    <button
                      onClick={() => setActiveTab('generate')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'generate'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Settings className="h-4 w-4 inline mr-2" />
                      Generate Schedule
                    </button>
                  </PermissionGate>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'matches' && renderMatchesTab()}
                  {activeTab === 'schedule' && renderScheduleTab()}
                  {activeTab === 'generate' && permissions.canManageSessions && renderGenerateTab()}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};