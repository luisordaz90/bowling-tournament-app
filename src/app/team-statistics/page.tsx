// src/app/team-statistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Medal, 
  Star, 
  Award, 
  Users, 
  Crown, 
  ChevronUp, 
  ChevronDown,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { 
  tournamentApi, 
  Tournament, 
} from '../../lib/api';

type SortField = 'teamName' | 'teamAverage' | 'matchesWon' | 'matchesLost' | 'totalMatchesPlayed' | 'totalTeamScore' | 'rankPosition';
type SortDirection = 'asc' | 'desc';

export default function TeamStatisticsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [teamStats, setTeamStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('rankPosition');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchTeamStatistics(selectedTournament);
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentApi.getAll();
      setTournaments(response);
      if (response.length > 0) {
        setSelectedTournament(response[0].id);
      }
    } catch (err) {
      setError('Failed to fetch tournaments');
      console.error('Error fetching tournaments:', err);
    }
  };

  const fetchTeamStatistics = async (tournamentId: string) => {
    try {
      setLoading(true);
      const response = await tournamentApi.getAllTeamStatistics(tournamentId);
      setTeamStats(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch team statistics');
      console.error('Error fetching team statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'rankPosition' ? 'asc' : 'desc');
    }
  };

  const sortedStats = [...teamStats].sort((a, b) => {
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
    if (average >= 180) return 'text-green-600';
    if (average >= 160) return 'text-blue-600';
    if (average >= 140) return 'text-purple-600';
    if (average >= 120) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTeamPerformanceBadge = (average: number) => {
    if (average >= 180) return { text: 'Elite', class: 'badge-success' };
    if (average >= 160) return { text: 'Strong', class: 'badge-primary' };
    if (average >= 140) return { text: 'Competitive', class: 'badge-warning' };
    if (average >= 120) return { text: 'Developing', class: 'badge-gray' };
    return { text: 'Building', class: 'badge-gray' };
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Award className="h-4 w-4 text-orange-600" />;
    return null;
  };

  const calculateLeaderboardStats = () => {
    if (teamStats.length === 0) return null;

    const topTeamAverage = Math.max(...teamStats.map(t => t.teamAverage));
    const mostWins = Math.max(...teamStats.map(t => t.matchesWon));
    const totalMatches = teamStats.reduce((sum, t) => sum + t.totalMatchesPlayed, 0);
    const totalScore = teamStats.reduce((sum, t) => sum + t.totalTeamScore, 0);
    const overallAverage = totalMatches > 0 ? Math.round(totalScore / totalMatches) : 0;

    return {
      topTeam: teamStats.find(t => t.teamAverage === topTeamAverage),
      winLeader: teamStats.find(t => t.matchesWon === mostWins),
      totalTeams: teamStats.length,
      overallAverage,
      totalMatches,
      averageWins: Math.round(teamStats.reduce((sum, t) => sum + t.matchesWon, 0) / teamStats.length),
    };
  };

  const calculateCompetitiveBalance = () => {
    if (teamStats.length === 0) return null;

    const winPercentages = teamStats.map(team => 
      team.totalMatchesPlayed > 0 ? (team.matchesWon / team.totalMatchesPlayed) * 100 : 0
    );
    
    const averageWinPct = winPercentages.reduce((sum, pct) => sum + pct, 0) / winPercentages.length;
    const variance = winPercentages.reduce((sum, pct) => sum + Math.pow(pct - averageWinPct, 2), 0) / winPercentages.length;
    const stdDev = Math.sqrt(variance);

    return {
      balance: stdDev < 15 ? 'Highly Competitive' : stdDev < 25 ? 'Competitive' : 'Wide Spread',
      stdDev: stdDev.toFixed(1),
      averageWinPct: averageWinPct.toFixed(1)
    };
  };

  const leaderboardStats = calculateLeaderboardStats();
  const competitiveBalance = calculateCompetitiveBalance();

  return (
    <ProtectedRoute>
      <div className="container-wide py-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Statistics</h1>
            <p className="mt-2 text-gray-600">Team performance analytics and standings</p>
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
            <p className="mt-1 text-sm text-gray-500">Please select a tournament to view team statistics.</p>
          </div>
        ) : teamStats.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No team statistics</h3>
            <p className="mt-1 text-sm text-gray-500">Statistics will appear once teams have completed matches.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tournament Overview Cards */}
            {leaderboardStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <Crown className="h-8 w-8 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Leading Team</p>
                        <p className="text-lg font-bold text-yellow-600">
                          {leaderboardStats.topTeam?.teamAverage.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">{leaderboardStats.topTeam?.teamName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <Trophy className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Most Wins</p>
                        <p className="text-lg font-bold text-blue-600">
                          {leaderboardStats.winLeader?.matchesWon}
                        </p>
                        <p className="text-xs text-gray-500">{leaderboardStats.winLeader?.teamName}</p>
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
                        <p className="text-xs text-gray-500">{leaderboardStats.totalTeams} teams</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Competition Level</p>
                        <p className="text-lg font-bold text-purple-600">
                          {competitiveBalance?.balance}
                        </p>
                        <p className="text-xs text-gray-500">σ = {competitiveBalance?.stdDev}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Statistics Table */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Team Performance Rankings</h3>
                  <div className="text-sm text-gray-500">
                    {teamStats.length} teams • Sorted by {sortField.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('rankPosition')}
                        >
                          <div className="flex items-center">
                            Rank
                            {getSortIcon('rankPosition')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('teamName')}
                        >
                          <div className="flex items-center">
                            Team
                            {getSortIcon('teamName')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('teamAverage')}
                        >
                          <div className="flex items-center">
                            Team Average
                            {getSortIcon('teamAverage')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('matchesWon')}
                        >
                          <div className="flex items-center">
                            Record (W-L)
                            {getSortIcon('matchesWon')}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('totalTeamScore')}
                        >
                          <div className="flex items-center">
                            Total Score
                            {getSortIcon('totalTeamScore')}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Win %
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedStats.map((team) => {
                        const performanceBadge = getTeamPerformanceBadge(team.teamAverage);
                        const winPercentage = team.totalMatchesPlayed > 0 
                          ? Math.round((team.matchesWon / team.totalMatchesPlayed) * 100) 
                          : 0;
                        const isTopPerformer = team.rankPosition && team.rankPosition <= 3;
                        
                        return (
                          <tr key={team.teamId} className={isTopPerformer ? 'bg-yellow-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900">
                                  #{team.rankPosition || 'N/A'}
                                </span>
                                {team.rankPosition && getRankIcon(team.rankPosition)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <Users className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                                  <div className="text-sm text-gray-500">{team.totalMatchesPlayed} matches played</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-lg font-semibold ${getPerformanceColor(team.teamAverage)}`}>
                                {team.teamAverage.toFixed(1)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {team.matchesWon}-{team.matchesLost}
                              </div>
                              <div className="text-xs text-gray-500">
                                {team.totalMatchesPlayed} games
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {team.totalTeamScore.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      winPercentage >= 70 ? 'bg-green-500' :
                                      winPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${winPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{winPercentage}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`badge ${performanceBadge.class}`}>
                                {performanceBadge.text}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                href={`/teams/${team.teamId}`}
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

            {/* Performance Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Performers */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {sortedStats.slice(0, 5).map((team, index) => (
                      <div key={team.teamId} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{team.teamName}</p>
                            <p className="text-xs text-gray-500">
                              {team.matchesWon}-{team.matchesLost} record
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${getPerformanceColor(team.teamAverage)}`}>
                            {team.teamAverage.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500">average</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Distribution */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Performance Distribution</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    {[
                      { level: 'Elite', min: 180, color: 'bg-green-500', textColor: 'text-green-600' },
                      { level: 'Strong', min: 160, color: 'bg-blue-500', textColor: 'text-blue-600' },
                      { level: 'Competitive', min: 140, color: 'bg-purple-500', textColor: 'text-purple-600' },
                      { level: 'Developing', min: 120, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
                      { level: 'Building', min: 0, color: 'bg-gray-500', textColor: 'text-gray-600' },
                    ].map((category) => {
                      const count = teamStats.filter(t => {
                        if (category.level === 'Building') return t.teamAverage < 120;
                        return t.teamAverage >= category.min;
                      }).length;
                      const percentage = teamStats.length > 0 ? Math.round((count / teamStats.length) * 100) : 0;
                      
                      return (
                        <div key={category.level} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-4 h-4 ${category.color} rounded mr-3`}></div>
                            <span className="text-sm font-medium text-gray-900">{category.level}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({category.min > 0 ? `${category.min}+` : '<120'} avg)
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 mr-2">{count}</span>
                            <span className="text-xs text-gray-500">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}