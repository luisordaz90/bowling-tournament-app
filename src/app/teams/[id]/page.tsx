// // src/app/teams/[id]/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';
// import { ArrowLeft, Users, Mail, Phone, UserPlus, Edit, Trash2, Trophy, BarChart3, Calendar, Plus } from 'lucide-react';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { teamApi, playerApi, tournamentApi, Team, Player, Tournament } from '../../../lib/api';

// interface TeamPlayer {
//   id: string;
//   playerId: string;
//   role: string;
//   isActive: boolean;
//   joinedDate: string;
//   playerDetails: Player;
// }

// interface TournamentRegistration {
//   id: string;
//   tournamentId: string;
//   seedNumber?: number;
//   totalTournamentScore: number;
//   gamesPlayedInTournament: number;
//   sessionsPlayedInTournament: number;
//   registrationDate: string;
//   status: string;
//   tournamentDetails: Tournament;
// }

// export default function TeamDetailPage() {
//   const params = useParams();
//   const teamId = params.id as string;
  
//   const [team, setTeam] = useState<Team | null>(null);
//   const [teamPlayers, setTeamPlayers] = useState<TeamPlayer[]>([]);
//   const [tournaments, setTournaments] = useState<TournamentRegistration[]>([]);
//   const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showAddPlayer, setShowAddPlayer] = useState(false);
//   const [selectedPlayer, setSelectedPlayer] = useState('');
//   const [playerRole, setPlayerRole] = useState('regular');
//   const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'tournaments'>('overview');

//   useEffect(() => {
//     fetchTeamData();
//     fetchAvailablePlayers();
//   }, [teamId]);

//   const fetchTeamData = async () => {
//     try {
//       setLoading(true);
//       const teamResponse = await teamApi.getById(teamId);
//       setTeam(teamResponse.data);
      
//       // Note: These endpoints would need to be implemented in your API
//       // For now, using mock data structure
//       setTeamPlayers([]);
//       setTournaments([]);
      
//       setError(null);
//     } catch (err) {
//       setError('Failed to fetch team data');
//       console.error('Error fetching team:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAvailablePlayers = async () => {
//     try {
//       const response = await playerApi.getAll();
//       setAvailablePlayers(response.data);
//     } catch (err) {
//       console.error('Error fetching players:', err);
//     }
//   };

//   const handleAddPlayer = async () => {
//     if (!selectedPlayer) return;

//     try {
//       // This would call your team player assignment API
//       // await teamApi.addPlayer(teamId, selectedPlayer, playerRole);
      
//       // For now, just refresh the data
//       await fetchTeamData();
//       setShowAddPlayer(false);
//       setSelectedPlayer('');
//       setPlayerRole('regular');
//     } catch (err) {
//       alert('Failed to add player to team');
//       console.error('Error adding player:', err);
//     }
//   };

//   const removePlayer = async (playerId: string) => {
//     if (!confirm('Are you sure you want to remove this player from the team?')) {
//       return;
//     }

//     try {
//       // This would call your team player removal API
//       // await teamApi.removePlayer(teamId, playerId);
      
//       await fetchTeamData();
//     } catch (err) {
//       alert('Failed to remove player from team');
//       console.error('Error removing player:', err);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'active':
//         return 'badge-success';
//       case 'inactive':
//         return 'badge-gray';
//       case 'withdrawn':
//         return 'badge-danger';
//       default:
//         return 'badge-gray';
//     }
//   };

//   const getRoleColor = (role: string) => {
//     switch (role) {
//       case 'captain':
//         return 'badge-primary';
//       case 'regular':
//         return 'badge-success';
//       case 'substitute':
//         return 'badge-warning';
//       default:
//         return 'badge-gray';
//     }
//   };

//   if (loading) {
//     return (
//       <ProtectedRoute>
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="spinner h-8 w-8"></div>
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   if (error || !team) {
//     return (
//       <ProtectedRoute>
//         <div className="container-wide py-8">
//           <div className="text-center">
//             <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
//             <p className="text-gray-600">{error || 'Team not found'}</p>
//             <Link
//               href="/teams"
//               className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Teams
//             </Link>
//           </div>
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   return (
//     <ProtectedRoute>
//       <div className="container-wide py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             href="/teams"
//             className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
//           >
//             <ArrowLeft className="h-4 w-4 mr-1" />
//             Back to Teams
//           </Link>
          
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="flex items-center">
//                 <Users className="h-8 w-8 text-blue-600 mr-3" />
//                 <div>
//                   <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
//                   <p className="text-gray-600">Team Details & Management</p>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3">
//               <span className={`badge ${getStatusColor(team.status)}`}>
//                 {team.status}
//               </span>
//               <Link
//                 href={`/teams/${teamId}/edit`}
//                 className="btn btn-secondary"
//               >
//                 <Edit className="h-4 w-4 mr-2" />
//                 Edit Team
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Team Info Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="card">
//             <div className="card-body">
//               <div className="flex items-center">
//                 <UserPlus className="h-8 w-8 text-blue-600" />
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-500">Team Captain</p>
//                   <p className="text-lg font-semibold text-gray-900">{team.captainName}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="card">
//             <div className="card-body">
//               <div className="flex items-center">
//                 <Mail className="h-8 w-8 text-green-600" />
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-500">Contact Email</p>
//                   <p className="text-lg font-semibold text-gray-900 truncate">{team.captainEmail}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="card">
//             <div className="card-body">
//               <div className="flex items-center">
//                 <Calendar className="h-8 w-8 text-purple-600" />
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-500">Registered</p>
//                   <p className="text-lg font-semibold text-gray-900">
//                     {new Date(team.registrationDate).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="border-b border-gray-200 mb-6">
//           <nav className="-mb-px flex space-x-8">
//             {[
//               { id: 'overview', name: 'Overview', icon: Users },
//               { id: 'players', name: 'Players', icon: UserPlus },
//               { id: 'tournaments', name: 'Tournaments', icon: Trophy },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id as any)}
//                 className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === tab.id
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                 }`}
//               >
//                 <tab.icon className="h-4 w-4 mr-2" />
//                 {tab.name}
//               </button>
//             ))}
//           </nav>
//         </div>

//         {/* Tab Content */}
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             <div className="card">
//               <div className="card-header">
//                 <h3 className="text-lg font-medium text-gray-900">Team Information</h3>
//               </div>
//               <div className="card-body">
//                 <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Team Name</dt>
//                     <dd className="text-sm text-gray-900">{team.name}</dd>
//                   </div>
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Status</dt>
//                     <dd className="text-sm text-gray-900">
//                       <span className={`badge ${getStatusColor(team.status)}`}>
//                         {team.status}
//                       </span>
//                     </dd>
//                   </div>
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Captain Name</dt>
//                     <dd className="text-sm text-gray-900">{team.captainName}</dd>
//                   </div>
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Captain Email</dt>
//                     <dd className="text-sm text-gray-900">{team.captainEmail}</dd>
//                   </div>
//                   {team.captainPhone && (
//                     <div>
//                       <dt className="text-sm font-medium text-gray-500">Captain Phone</dt>
//                       <dd className="text-sm text-gray-900">{team.captainPhone}</dd>
//                     </div>
//                   )}
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
//                     <dd className="text-sm text-gray-900">
//                       {new Date(team.registrationDate).toLocaleDateString()}
//                     </dd>
//                   </div>
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Created</dt>
//                     <dd className="text-sm text-gray-900">
//                       {new Date(team.createdAt).toLocaleDateString()}
//                     </dd>
//                   </div>
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
//                     <dd className="text-sm text-gray-900">
//                       {new Date(team.updatedAt).toLocaleDateString()}
//                     </dd>
//                   </div>
//                 </dl>
//               </div>
//             </div>

//             <div className="card">
//               <div className="card-header">
//                 <h3 className="text-lg font-medium text-gray-900">Quick Statistics</h3>
//               </div>
//               <div className="card-body">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="text-center p-4 bg-blue-50 rounded-lg">
//                     <div className="text-2xl font-bold text-blue-600">{teamPlayers.length}</div>
//                     <div className="text-sm text-gray-500">Active Players</div>
//                   </div>
//                   <div className="text-center p-4 bg-green-50 rounded-lg">
//                     <div className="text-2xl font-bold text-green-600">{tournaments.length}</div>
//                     <div className="text-sm text-gray-500">Tournaments</div>
//                   </div>
//                   <div className="text-center p-4 bg-purple-50 rounded-lg">
//                     <div className="text-2xl font-bold text-purple-600">
//                       {tournaments.reduce((sum, t) => sum + t.gamesPlayedInTournament, 0)}
//                     </div>
//                     <div className="text-sm text-gray-500">Total Games</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'players' && (
//           <div className="space-y-6">
//             <div className="card">
//               <div className="card-header">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-medium text-gray-900">Team Players</h3>
//                   <button
//                     onClick={() => setShowAddPlayer(true)}
//                     className="btn btn-primary"
//                   >
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Player
//                   </button>
//                 </div>
//               </div>
//               <div className="card-body">
//                 {teamPlayers.length === 0 ? (
//                   <div className="text-center py-8">
//                     <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">No players</h3>
//                     <p className="mt-1 text-sm text-gray-500">Get started by adding players to this team.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {teamPlayers.map((teamPlayer) => (
//                       <div key={teamPlayer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                         <div className="flex items-center">
//                           <UserPlus className="h-8 w-8 text-gray-400 mr-3" />
//                           <div>
//                             <div className="flex items-center">
//                               <h4 className="text-sm font-medium text-gray-900">
//                                 {teamPlayer.playerDetails.name}
//                               </h4>
//                               <span className={`ml-2 badge ${getRoleColor(teamPlayer.role)}`}>
//                                 {teamPlayer.role}
//                               </span>
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               Avg: {teamPlayer.playerDetails.averageScore} • 
//                               Handicap: {teamPlayer.playerDetails.handicap} • 
//                               Joined: {new Date(teamPlayer.joinedDate).toLocaleDateString()}
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Link
//                             href={`/players/${teamPlayer.playerId}`}
//                             className="text-blue-600 hover:text-blue-800 text-sm"
//                           >
//                             View Details
//                           </Link>
//                           <button
//                             onClick={() => removePlayer(teamPlayer.playerId)}
//                             className="text-red-600 hover:text-red-800"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Add Player Modal */}
//             {showAddPlayer && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-6 w-full max-w-md">
//                   <h3 className="text-lg font-medium text-gray-900 mb-4">Add Player to Team</h3>
//                   <div className="space-y-4">
//                     <div>
//                       <label className="form-label">Select Player</label>
//                       <select
//                         value={selectedPlayer}
//                         onChange={(e) => setSelectedPlayer(e.target.value)}
//                         className="form-input"
//                       >
//                         <option value="">Choose a player</option>
//                         {availablePlayers.map((player) => (
//                           <option key={player.id} value={player.id}>
//                             {player.name} (Avg: {player.averageScore})
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="form-label">Role</label>
//                       <select
//                         value={playerRole}
//                         onChange={(e) => setPlayerRole(e.target.value)}
//                         className="form-input"
//                       >
//                         <option value="regular">Regular</option>
//                         <option value="captain">Captain</option>
//                         <option value="substitute">Substitute</option>
//                       </select>
//                     </div>
//                   </div>
//                   <div className="flex justify-end space-x-3 mt-6">
//                     <button
//                       onClick={() => setShowAddPlayer(false)}
//                       className="btn btn-secondary"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       onClick={handleAddPlayer}
//                       disabled={!selectedPlayer}
//                       className="btn btn-primary"
//                     >
//                       Add Player
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'tournaments' && (
//           <div className="card">
//             <div className="card-header">
//               <h3 className="text-lg font-medium text-gray-900">Tournament Registrations</h3>
//             </div>
//             <div className="card-body">
//               {tournaments.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Trophy className="mx-auto h-12 w-12 text-gray-400" />
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">No tournaments</h3>
//                   <p className="mt-1 text-sm text-gray-500">This team hasn't been registered for any tournaments yet.</p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {tournaments.map((tournament) => (
//                     <div key={tournament.id} className="border border-gray-200 rounded-lg p-4">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <h4 className="text-sm font-medium text-gray-900">
//                             {tournament.tournamentDetails.name}
//                           </h4>
//                           <div className="text-sm text-gray-500 mt-1">
//                             Registered: {new Date(tournament.registrationDate).toLocaleDateString()} • 
//                             Status: {tournament.status} • 
//                             Games: {tournament.gamesPlayedInTournament}
//                           </div>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-sm font-medium text-gray-900">
//                             Score: {tournament.totalTournamentScore}
//                           </div>
//                           {tournament.seedNumber && (
//                             <div className="text-sm text-gray-500">
//                               Seed: #{tournament.seedNumber}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// }

// src/app/teams/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
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
  Trash2,
  Shield,
  Crown,
  Medal
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  teamApi, 
  tournamentApi, 
  teamStatisticsApi,
  Team, 
  Tournament, 
  TeamStatistic,
  TeamTournamentStatistic 
} from '../../../lib/api';

interface TeamDetailStats extends TeamTournamentStatistic {
  tournamentName: string;
  rank?: number;
  totalTeams?: number;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teamStats, setTeamStats] = useState<TeamDetailStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Fetch team details
      const [teamResponse, tournamentsResponse] = await Promise.all([
        teamApi.getById(teamId),
        tournamentApi.getAll()
      ]);
      
      setTeam(teamResponse.data);
      setTournaments(tournamentsResponse.data);
      
      // Fetch team statistics for each tournament
      const statsPromises = tournamentsResponse.data.map(async (tournament) => {
        try {
          const statsResponse = await teamStatisticsApi.getTeamInTournament(
            tournament.id, 
            teamId
          );
          return {
            ...statsResponse.data,
            tournamentName: tournament.name
          };
        } catch (err) {
          // Team might not have stats in this tournament
          return null;
        }
      });
      
      const allStats = await Promise.all(statsPromises);
      const validStats = allStats.filter(stat => stat !== null) as TeamDetailStats[];
      setTeamStats(validStats);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch team data');
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${team.name}? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    try {
      setDeleteLoading(true);
      await teamApi.delete(teamId);
      router.push('/teams');
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Failed to delete team. They may be registered in active tournaments.');
    } finally {
      setDeleteLoading(false);
    }
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

  const calculateOverallStats = () => {
    if (teamStats.length === 0) return null;

    const totalMatches = teamStats.reduce((sum, stat) => sum + stat.totalMatchesPlayed, 0);
    const totalWins = teamStats.reduce((sum, stat) => sum + stat.matchesWon, 0);
    const totalLosses = teamStats.reduce((sum, stat) => sum + stat.matchesLost, 0);
    const totalScore = teamStats.reduce((sum, stat) => sum + stat.totalTeamScore, 0);
    const overallAverage = totalMatches > 0 ? totalScore / totalMatches : 0;
    const winPercentage = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

    return {
      totalMatches,
      totalWins,
      totalLosses,
      totalScore,
      overallAverage,
      winPercentage,
      tournamentsPlayed: teamStats.length,
      bestTournamentAverage: Math.max(...teamStats.map(s => s.teamAverage)),
      bestRank: Math.min(...teamStats.filter(s => s.rankPosition).map(s => s.rankPosition!))
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

  if (error && !team) {
    return (
      <ProtectedRoute>
        <div className="container-wide py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
            <Link href="/teams" className="text-red-800 hover:text-red-900 underline mt-2 inline-block">
              Back to Teams
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
              href="/teams"
              className="btn-ghost"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{team?.name}</h1>
              <p className="text-gray-600">Team Profile & Statistics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/teams/${teamId}/edit`}
              className="btn-primary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Team
            </Link>
            <button
              onClick={handleDeleteTeam}
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
          {/* Team Information */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Team Information</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Team Name</p>
                      <p className="text-lg font-semibold text-gray-900">{team?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Captain</p>
                      <p className="text-gray-900">{team?.captainName}</p>
                    </div>
                  </div>

                  {team?.captainEmail && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900">{team.captainEmail}</p>
                      </div>
                    </div>
                  )}

                  {team?.captainPhone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-gray-900">{team.captainPhone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registered</p>
                      <p className="text-gray-900">
                        {team?.registrationDate ? new Date(team.registrationDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`badge ${
                        team?.status === 'active' ? 'badge-success' :
                        team?.status === 'inactive' ? 'badge-gray' : 'badge-danger'
                      }`}>
                        {team?.status?.charAt(0).toUpperCase()}{team?.status?.slice(1)}
                      </span>
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
                      <div className="text-2xl font-bold text-gray-900">{overallStats.totalMatches}</div>
                      <div className="text-sm text-gray-500">Total Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{overallStats.totalWins}</div>
                      <div className="text-sm text-gray-500">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{overallStats.totalLosses}</div>
                      <div className="text-sm text-gray-500">Losses</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Win Percentage:</span>
                      <span className="font-medium">{overallStats.winPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Tournaments Played:</span>
                      <span className="font-medium">{overallStats.tournamentsPlayed}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Best Average:</span>
                      <span className="font-medium">{overallStats.bestTournamentAverage.toFixed(1)}</span>
                    </div>
                    {overallStats.bestRank !== Infinity && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Best Rank:</span>
                        <span className="font-medium">#{overallStats.bestRank}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    {(() => {
                      const badge = getTeamPerformanceBadge(overallStats.overallAverage);
                      return (
                        <span className={`badge ${badge.class} w-full text-center`}>
                          {badge.text} Level Team
                        </span>
                      );
                    })()}
                  </div>

                  {/* Win Rate Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Win Rate</span>
                      <span className="font-medium">{overallStats.winPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          overallStats.winPercentage >= 70 ? 'bg-green-500' :
                          overallStats.winPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${overallStats.winPercentage}%` }}
                      ></div>
                    </div>
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
                {teamStats.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tournament statistics</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This team hasn't participated in any tournaments with recorded matches yet.
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
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Team Average
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Record (W-L)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Win Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {teamStats.map((stat) => {
                          const badge = getTeamPerformanceBadge(stat.teamAverage);
                          const winPercentage = stat.totalMatchesPlayed > 0 
                            ? Math.round((stat.matchesWon / stat.totalMatchesPlayed) * 100) 
                            : 0;
                          const isTopRank = stat.rankPosition && stat.rankPosition <= 3;
                          
                          return (
                            <tr key={stat.tournamentId} className={isTopRank ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {stat.tournamentName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {stat.totalMatchesPlayed} matches played
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-900">
                                    #{stat.rankPosition || 'N/A'}
                                  </span>
                                  {stat.rankPosition && getRankIcon(stat.rankPosition)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`text-lg font-semibold ${getPerformanceColor(stat.teamAverage)}`}>
                                  {stat.teamAverage.toFixed(1)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {stat.matchesWon}-{stat.matchesLost}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {stat.totalTeamScore.toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
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

            {/* Performance Analysis */}
            {teamStats.length > 1 && (
              <div className="card mt-6">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Performance Analysis</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tournament Progression */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Tournament Progression</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Best Performance:</span>
                          <span className="font-medium text-green-600">
                            {Math.max(...teamStats.map(s => s.teamAverage)).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Lowest Performance:</span>
                          <span className="font-medium text-red-600">
                            {Math.min(...teamStats.map(s => s.teamAverage)).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Consistency:</span>
                          <span className="font-medium">
                            {(() => {
                              const averages = teamStats.map(s => s.teamAverage);
                              const avg = averages.reduce((a, b) => a + b, 0) / averages.length;
                              const variance = averages.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / averages.length;
                              const stdDev = Math.sqrt(variance);
                              return stdDev < 10 ? 'Very Consistent' : stdDev < 20 ? 'Consistent' : 'Variable';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Competitive Analysis */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Competitive Record</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Most Wins:</span>
                          <span className="font-medium">
                            {Math.max(...teamStats.map(s => s.matchesWon))} wins
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Best Win Rate:</span>
                          <span className="font-medium">
                            {Math.max(...teamStats.map(s => 
                              s.totalMatchesPlayed > 0 ? (s.matchesWon / s.totalMatchesPlayed) * 100 : 0
                            )).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Top 3 Finishes:</span>
                          <span className="font-medium">
                            {teamStats.filter(s => s.rankPosition && s.rankPosition <= 3).length}
                          </span>
                        </div>
                      </div>
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