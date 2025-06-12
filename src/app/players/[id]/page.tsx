// src/app/players/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Phone, 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  Star,
  ArrowLeft,
  Calendar,
  BarChart3,
  Edit,
  Trash2
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  playerApi, 
  tournamentApi, 
  Player, 
  Tournament, 
} from '../../../lib/api';


export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      
      // Fetch player details
      const [playerResponse, tournamentsResponse] = await Promise.all([
        playerApi.getById(playerId),
        tournamentApi.getAll()
      ]);
      
      setPlayer(playerResponse);
      setTournaments(tournamentsResponse);
      
      // Fetch player statistics for each tournament
      const statsPromises = tournamentsResponse.map(async (tournament) => {
        try {
          const statsResponse = await tournamentApi.getPlayerStatistics(
            tournament.id, 
            playerId
          );
          return {
            ...statsResponse,
            tournamentName: tournament.name
          };
        } catch (err) {
          // Player might not have stats in this tournament
          return null;
        }
      });
      
      const allStats = await Promise.all(statsPromises);
      const validStats = allStats.filter(stat => stat !== null) as any[];
      setPlayerStats(validStats);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch player data');
      console.error('Error fetching player data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = async () => {
    if (!player) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${player.name}? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      setDeleteLoading(true);
      await playerApi.delete(playerId);
      router.push('/players');
    } catch (err) {
      console.error('Error deleting player:', err);
      setError('Failed to delete player. They may have recorded scores.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getPerformanceColor = (average: number) => {
    if (average >= 200) return 'text-green-600';
    if (average >= 180) return 'text-blue-600';
    if (average >= 150) return 'text-purple-600';
    if (average >= 120) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getPerformanceBadge = (average: number) => {
    if (average >= 200) return { text: 'Elite', class: 'badge-success' };
    if (average >= 180) return { text: 'Expert', class: 'badge-primary' };
    if (average >= 150) return { text: 'Advanced', class: 'badge-warning' };
    if (average >= 120) return { text: 'Intermediate', class: 'badge-gray' };
    return { text: 'Beginner', class: 'badge-gray' };
  };

  const calculateOverallStats = () => {
    if (playerStats.length === 0) return null;

    const totalGames = playerStats.reduce((sum, stat) => sum + stat.gamesPlayed, 0);
    const totalPins = playerStats.reduce((sum, stat) => sum + (stat.totalPins || 0), 0);
    const overallAverage = totalGames > 0 ? totalPins / totalGames : 0;
    const highestGame = Math.max(...playerStats.map(stat => stat.highestGame));
    const highestSeries = Math.max(...playerStats.map(stat => stat.highestSeries));
    const totalMatches = playerStats.reduce((sum, stat) => sum + stat.matchesPlayed, 0);

    return {
      totalGames,
      totalPins,
      overallAverage,
      highestGame,
      highestSeries,
      totalMatches,
      tournamentsPlayed: playerStats.length
    };
  };

  const overallStats = calculateOverallStats();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container-wide py-8">
          <div className="flex items-center justify-center py-12">
            <div className="spinner h-8 w-8"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !player) {
    return (
      <ProtectedRoute>
        <div className="container-wide py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
            <Link href="/players" className="text-red-800 hover:text-red-900 underline mt-2 inline-block">
              Back to Players
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container-wide py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/players"
              className="btn-ghost"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Players
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{player?.name}</h1>
              <p className="text-gray-600">Player Profile & Statistics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/players/${playerId}/edit`}
              className="btn-primary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Player
            </Link>
            <button
              onClick={handleDeletePlayer}
              disabled={deleteLoading}
              className="btn-danger"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Information */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Player Information</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900">{player?.name}</p>
                    </div>
                  </div>

                  {player?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900">{player.email}</p>
                      </div>
                    </div>
                  )}

                  {player?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-gray-900">{player.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Handicap</p>
                      <p className="text-gray-900">{player?.handicap || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="text-gray-900">
                        {player?.createdAt ? new Date(player.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Statistics */}
            {overallStats && (
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Overall Statistics</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getPerformanceColor(overallStats.overallAverage)}`}>
                        {overallStats.overallAverage.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Overall Average</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{overallStats.totalGames}</div>
                      <div className="text-sm text-gray-500">Total Games</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{overallStats.highestGame}</div>
                      <div className="text-sm text-gray-500">Highest Game</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{overallStats.highestSeries}</div>
                      <div className="text-sm text-gray-500">Highest Series</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tournaments Played:</span>
                      <span className="font-medium">{overallStats.tournamentsPlayed}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Total Matches:</span>
                      <span className="font-medium">{overallStats.totalMatches}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Total Pins:</span>
                      <span className="font-medium">{overallStats.totalPins.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    {(() => {
                      const badge = getPerformanceBadge(overallStats.overallAverage);
                      return (
                        <span className={`badge ${badge.class} w-full text-center`}>
                          {badge.text} Level Player
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tournament Statistics */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Tournament Performance</h3>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="card-body p-0">
                {playerStats.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tournament statistics</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This player hasn't participated in any tournaments with recorded scores yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tournament
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Average
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Games
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            High Game
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            High Series
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Matches
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Level
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {playerStats.map((stat) => {
                          const badge = getPerformanceBadge(stat.currentAverage);
                          return (
                            <tr key={stat.tournamentId} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {stat.tournamentName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`text-lg font-semibold ${getPerformanceColor(stat.currentAverage)}`}>
                                  {stat.currentAverage.toFixed(1)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {stat.gamesPlayed}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900">{stat.highestGame}</span>
                                  {stat.highestGame >= 200 && (
                                    <Star className="h-4 w-4 text-yellow-500 ml-1" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900">{stat.highestSeries}</span>
                                  {stat.highestSeries >= 600 && (
                                    <Award className="h-4 w-4 text-purple-500 ml-1" />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {stat.matchesPlayed}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`badge ${badge.class}`}>
                                  {badge.text}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Trends */}
            {playerStats.length > 1 && (
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Performance Trends</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Best Tournament Average:</span>
                      <span className="font-medium text-green-600">
                        {Math.max(...playerStats.map(s => s.currentAverage)).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Most Games Played:</span>
                      <span className="font-medium">
                        {Math.max(...playerStats.map(s => s.gamesPlayed))} games
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Consistency:</span>
                      <span className="font-medium">
                        {(() => {
                          const averages = playerStats.map(s => s.currentAverage);
                          const avg = averages.reduce((a, b) => a + b, 0) / averages.length;
                          const variance = averages.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / averages.length;
                          const stdDev = Math.sqrt(variance);
                          return stdDev < 10 ? 'Very Consistent' : stdDev < 20 ? 'Consistent' : 'Variable';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}