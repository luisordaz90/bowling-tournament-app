// // src/app/players/[id]/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';
// import { ArrowLeft, User, Mail, Phone, Trophy, BarChart3, Target, TrendingUp, Calendar, Edit, Award, Star } from 'lucide-react';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { playerApi, tournamentApi, Player, Tournament } from '../../../lib/api';

// interface PlayerTournamentStats {
//   tournamentId: string;
//   tournamentName: string;
//   gamesPlayed: number;
//   totalPins: number;
//   currentAverage: number;
//   highestGame: number;
//   highestSeries: number;
//   matchesPlayed: number;
//   teamName?: string;
// }

// interface PlayerMatchScore {
//   id: string;
//   matchId: string;
//   tournamentId: string;
//   teamId: string;
//   game1Score: number;
//   game2Score: number;
//   game3Score: number;
//   totalScore: number;
//   handicapApplied: number;
//   finalScore: number;
//   recordedAt: string;
//   matchDate?: string;
// }

// export default function PlayerDetailPage() {
//   const params = useParams();
//   const playerId = params.id as string;
  
//   const [player, setPlayer] = useState<Player | null>(null);
//   const [tournamentStats, setTournamentStats] = useState<PlayerTournamentStats[]>([]);
//   const [recentScores, setRecentScores] = useState<PlayerMatchScore[]>([]);
//   const [tournaments, setTournaments] = useState<Tournament[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState<'overview' | 'statistics' | 'history'>('overview');

//   useEffect(() => {
//     fetchPlayerData();
//     fetchTournaments();
//   }, [playerId]);

//   const fetchPlayerData = async () => {
//     try {
//       setLoading(true);
//       const playerResponse = await playerApi.getById(playerId);
//       setPlayer(playerResponse.data);
      
//       // Note: These endpoints would need to be implemented in your API
//       // For now, using mock data structure
//       setTournamentStats([]);
//       setRecentScores([]);
      
//       setError(null);
//     } catch (err) {
//       setError('Failed to fetch player data');
//       console.error('Error fetching player:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchTournaments = async () => {
//     try {
//       const response = await tournamentApi.getAll();
//       setTournaments(response.data);
//     } catch (err) {
//       console.error('Error fetching tournaments:', err);
//     }
//   };

//   const calculateTrend = (scores: number[]) => {
//     if (scores.length < 2) return 0;
//     const recent = scores.slice(-5);
//     const older = scores.slice(-10, -5);
    
//     const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
//     const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
    
//     return recentAvg - olderAvg;
//   };

//   const getPerformanceColor = (average: number, handicap: number) => {
//     const adjusted = average + handicap;
//     if (adjusted >= 180) return 'text-green-600';
//     if (adjusted >= 150) return 'text-blue-600';
//     if (adjusted >= 120) return 'text-yellow-600';
//     return 'text-gray-600';
//   };

//   const getTrendIcon = (trend: number) => {
//     if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
//     if (trend < -5) return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
//     return <TrendingUp className="h-4 w-4 text-gray-400" />;
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

//   if (error || !player) {
//     return (
//       <ProtectedRoute>
//         <div className="container-wide py-8">
//           <div className="text-center">
//             <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
//             <p className="text-gray-600">{error || 'Player not found'}</p>
//             <Link
//               href="/players"
//               className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Players
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
//             href="/players"
//             className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
//           >
//             <ArrowLeft className="h-4 w-4 mr-1" />
//             Back to Players
//           </Link>
          
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="flex items-center">
//                 <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
//                   <User className="h-8 w-8 text-blue-600" />
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold text-gray-900">{player.name}</h1>
//                   <p className="text-gray-600">Player Profile & Statistics</p>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3">
//               {player.handicap > 0 && (
//                 <span className="badge badge-primary">
//                   Handicap: {player.handicap}
//                 </span>
//               )}
//               <Link
//                 href={`/players/${playerId}/edit`}
//                 className="btn btn-secondary"
//               >
//                 <Edit className="h-4 w-4 mr-2" />
//                 Edit Player
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Player Info Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="card">
//             <div className="card-body">
//               <div className="flex items-center">
//                 <BarChart3 className="h-8 w-8 text-blue-600" />
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-500">Average Score</p>
//                   <p className={`text-2xl font-bold ${getPerformanceColor(player.averageScore, player.handicap)}`}>
//                     {player.averageScore > 0 ? player.averageScore.toFixed(1) : 'N/A'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="card">
//             <div className="card-body">
//               <div className="flex items-center">
//                 <Trophy className="h-8 w-8 text-green-600" />
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-500">Games Played</p>
//                   <p className="text-2xl font-bold text-gray-900">{player.totalGamesPlayed}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="card">
//             <div className="card-body">
//               <div className="flex items-center">
//                 <Target className="h-8 w-8 text-purple-600" />
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-500">Total Pins</p>
//                   <p className="text-2xl font-bold text-gray-900">{player.totalPins.toLocaleString()}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="card">
//             <div className="card-body">
//               <div className="flex items-center">
//                 <Star className="h-8 w-8 text-yellow-600" />
//                 <div className="ml-3">
//                   <p className="text-sm font-medium text-gray-500">Handicap</p>
//                   <p className="text-2xl font-bold text-gray-900">{player.handicap}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="border-b border-gray-200 mb-6">
//           <nav className="-mb-px flex space-x-8">
//             {[
//               { id: 'overview', name: 'Overview', icon: User },
//               { id: 'statistics', name: 'Statistics', icon: BarChart3 },
//               { id: 'history', name: 'Game History', icon: Calendar },
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
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="card">
//                 <div className="card-header">
//                   <h3 className="text-lg font-medium text-gray-900">Player Information</h3>
//                 </div>
//                 <div className="card-body">
//                   <dl className="space-y-4">
//                     <div>
//                       <dt className="text-sm font-medium text-gray-500">Full Name</dt>
//                       <dd className="text-sm text-gray-900">{player.name}</dd>
//                     </div>
//                     {player.email && (
//                       <div className="flex items-center">
//                         <Mail className="h-4 w-4 text-gray-400 mr-2" />
//                         <div>
//                           <dt className="text-sm font-medium text-gray-500">Email</dt>
//                           <dd className="text-sm text-gray-900">{player.email}</dd>
//                         </div>
//                       </div>
//                     )}
//                     {player.phone && (
//                       <div className="flex items-center">
//                         <Phone className="h-4 w-4 text-gray-400 mr-2" />
//                         <div>
//                           <dt className="text-sm font-medium text-gray-500">Phone</dt>
//                           <dd className="text-sm text-gray-900">{player.phone}</dd>
//                         </div>
//                       </div>
//                     )}
//                     <div>
//                       <dt className="text-sm font-medium text-gray-500">Handicap</dt>
//                       <dd className="text-sm text-gray-900">{player.handicap}</dd>
//                     </div>
//                     <div>
//                       <dt className="text-sm font-medium text-gray-500">Member Since</dt>
//                       <dd className="text-sm text-gray-900">
//                         {new Date(player.createdAt).toLocaleDateString()}
//                       </dd>
//                     </div>
//                     <div>
//                       <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
//                       <dd className="text-sm text-gray-900">
//                         {new Date(player.updatedAt).toLocaleDateString()}
//                       </dd>
//                     </div>
//                   </dl>
//                 </div>
//               </div>

//               <div className="card">
//                 <div className="card-header">
//                   <h3 className="text-lg font-medium text-gray-900">Performance Summary</h3>
//                 </div>
//                 <div className="card-body">
//                   <div className="space-y-4">
//                     <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
//                       <span className="text-sm font-medium text-gray-900">Current Average</span>
//                       <span className="text-lg font-bold text-blue-600">
//                         {player.averageScore > 0 ? player.averageScore.toFixed(1) : 'N/A'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
//                       <span className="text-sm font-medium text-gray-900">With Handicap</span>
//                       <span className="text-lg font-bold text-green-600">
//                         {player.averageScore > 0 ? (player.averageScore + player.handicap).toFixed(1) : 'N/A'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
//                       <span className="text-sm font-medium text-gray-900">Total Games</span>
//                       <span className="text-lg font-bold text-purple-600">{player.totalGamesPlayed}</span>
//                     </div>
//                     <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
//                       <span className="text-sm font-medium text-gray-900">Total Pins</span>
//                       <span className="text-lg font-bold text-yellow-600">{player.totalPins.toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="card">
//               <div className="card-header">
//                 <h3 className="text-lg font-medium text-gray-900">Tournament Participation</h3>
//               </div>
//               <div className="card-body">
//                 {tournamentStats.length === 0 ? (
//                   <div className="text-center py-8">
//                     <Trophy className="mx-auto h-12 w-12 text-gray-400" />
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">No tournament data</h3>
//                     <p className="mt-1 text-sm text-gray-500">This player hasn't participated in any tournaments yet.</p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {tournamentStats.map((stat) => (
//                       <div key={stat.tournamentId} className="border border-gray-200 rounded-lg p-4">
//                         <h4 className="font-medium text-gray-900">{stat.tournamentName}</h4>
//                         <div className="mt-2 space-y-1 text-sm text-gray-600">
//                           <div>Games: {stat.gamesPlayed}</div>
//                           <div>Average: {stat.currentAverage.toFixed(1)}</div>
//                           <div>High Game: {stat.highestGame}</div>
//                           <div>High Series: {stat.highestSeries}</div>
//                         </div>
//                         {stat.teamName && (
//                           <div className="mt-2 text-xs text-gray-500">
//                             Team: {stat.teamName}
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'statistics' && (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div className="card">
//                 <div className="card-header">
//                   <h4 className="text-lg font-medium text-gray-900">Overall Statistics</h4>
//                 </div>
//                 <div className="card-body">
//                   <div className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-500">Games Played</span>
//                       <span className="text-sm font-medium text-gray-900">{player.totalGamesPlayed}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-500">Total Pins</span>
//                       <span className="text-sm font-medium text-gray-900">{player.totalPins.toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-500">Current Average</span>
//                       <span className="text-sm font-medium text-gray-900">
//                         {player.averageScore > 0 ? player.averageScore.toFixed(1) : 'N/A'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-500">Handicap</span>
//                       <span className="text-sm font-medium text-gray-900">{player.handicap}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-500">Adjusted Average</span>
//                       <span className="text-sm font-medium text-gray-900">
//                         {player.averageScore > 0 ? (player.averageScore + player.handicap).toFixed(1) : 'N/A'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="card">
//                 <div className="card-header">
//                   <h4 className="text-lg font-medium text-gray-900">Performance Metrics</h4>
//                 </div>
//                 <div className="card-body">
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-gray-500">Consistency</span>
//                       <div className="flex items-center">
//                         <span className="text-sm font-medium text-gray-900 mr-2">
//                           {player.totalGamesPlayed > 10 ? 'Good' : 'Building'}
//                         </span>
//                         <div className={`h-2 w-16 rounded-full ${player.totalGamesPlayed > 10 ? 'bg-green-200' : 'bg-yellow-200'}`}>
//                           <div className={`h-2 rounded-full ${player.totalGamesPlayed > 10 ? 'bg-green-500' : 'bg-yellow-500'}`} 
//                                style={{ width: `${Math.min(100, (player.totalGamesPlayed / 20) * 100)}%` }}>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-gray-500">Experience Level</span>
//                       <span className="text-sm font-medium text-gray-900">
//                         {player.totalGamesPlayed > 50 ? 'Experienced' : 
//                          player.totalGamesPlayed > 20 ? 'Intermediate' : 'Beginner'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-gray-500">Performance Rating</span>
//                       <div className="flex items-center">
//                         {Array.from({ length: 5 }).map((_, i) => (
//                           <Star key={i} className={`h-4 w-4 ${
//                             i < Math.floor((player.averageScore + player.handicap) / 40) ? 
//                             'text-yellow-400 fill-current' : 'text-gray-300'
//                           }`} />
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="card">
//                 <div className="card-header">
//                   <h4 className="text-lg font-medium text-gray-900">Tournament Records</h4>
//                 </div>
//                 <div className="card-body">
//                   <div className="space-y-3">
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-500">Tournaments Played</span>
//                       <span className="text-sm font-medium text-gray-900">{tournamentStats.length}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-500">Best Tournament Avg</span>
//                       <span className="text-sm font-medium text-gray-900">
//                         {tournamentStats.length > 0 ? 
//                           Math.max(...tournamentStats.map(s => s.currentAverage)).toFixed(1) : 'N/A'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-500">Highest Game</span>
//                       <span className="text-sm font-medium text-gray-900">
//                         {tournamentStats.length > 0 ? 
//                           Math.max(...tournamentStats.map(s => s.highestGame)) : 'N/A'}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-500">Highest Series</span>
//                       <span className="text-sm font-medium text-gray-900">
//                         {tournamentStats.length > 0 ? 
//                           Math.max(...tournamentStats.map(s => s.highestSeries)) : 'N/A'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="card">
//               <div className="card-header">
//                 <h3 className="text-lg font-medium text-gray-900">Performance Breakdown by Tournament</h3>
//               </div>
//               <div className="card-body">
//                 {tournamentStats.length === 0 ? (
//                   <div className="text-center py-8">
//                     <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">No tournament statistics</h3>
//                     <p className="mt-1 text-sm text-gray-500">Statistics will appear once the player participates in tournaments.</p>
//                   </div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Tournament
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Games
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Average
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             High Game
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             High Series
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Total Pins
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {tournamentStats.map((stat) => (
//                           <tr key={stat.tournamentId}>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm font-medium text-gray-900">{stat.tournamentName}</div>
//                               {stat.teamName && (
//                                 <div className="text-sm text-gray-500">{stat.teamName}</div>
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {stat.gamesPlayed}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {stat.currentAverage.toFixed(1)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {stat.highestGame}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {stat.highestSeries}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {stat.totalPins.toLocaleString()}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'history' && (
//           <div className="card">
//             <div className="card-header">
//               <h3 className="text-lg font-medium text-gray-900">Recent Game History</h3>
//             </div>
//             <div className="card-body">
//               {recentScores.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Calendar className="mx-auto h-12 w-12 text-gray-400" />
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">No game history</h3>
//                   <p className="mt-1 text-sm text-gray-500">Game history will appear once matches are recorded.</p>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Game 1
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Game 2
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Game 3
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Series Total
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Handicap
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Final Score
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {recentScores.map((score) => (
//                         <tr key={score.id}>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {score.matchDate ? 
//                               new Date(score.matchDate).toLocaleDateString() : 
//                               new Date(score.recordedAt).toLocaleDateString()
//                             }
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {score.game1Score}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {score.game2Score}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {score.game3Score}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                             {score.totalScore}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             +{score.handicapApplied}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
//                             {score.finalScore}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Quick Actions */}
//         <div className="mt-8 card">
//           <div className="card-header">
//             <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
//           </div>
//           <div className="card-body">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <Link
//                 href={`/players/${playerId}/edit`}
//                 className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 <Edit className="h-6 w-6 text-blue-600 mr-3" />
//                 <div>
//                   <p className="font-medium text-gray-900">Edit Player</p>
//                   <p className="text-sm text-gray-500">Update player information</p>
//                 </div>
//               </Link>
//               <button
//                 className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                 onClick={() => {
//                   const data = JSON.stringify({
//                     player,
//                     statistics: tournamentStats,
//                     recentScores: recentScores.slice(0, 10)
//                   }, null, 2);
//                   const blob = new Blob([data], { type: 'application/json' });
//                   const url = URL.createObjectURL(blob);
//                   const a = document.createElement('a');
//                   a.href = url;
//                   a.download = `${player.name.replace(/\s+/g, '-')}-stats.json`;
//                   a.click();
//                 }}
//               >
//                 <BarChart3 className="h-6 w-6 text-green-600 mr-3" />
//                 <div>
//                   <p className="font-medium text-gray-900">Export Stats</p>
//                   <p className="text-sm text-gray-500">Download player data</p>
//                 </div>
//               </button>
//               <button
//                 className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//                 onClick={() => window.print()}
//               >
//                 <Award className="h-6 w-6 text-purple-600 mr-3" />
//                 <div>
//                   <p className="font-medium text-gray-900">Print Report</p>
//                   <p className="text-sm text-gray-500">Generate player report</p>
//                 </div>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }

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
  playerStatisticsApi,
  Player, 
  Tournament, 
  PlayerStatistic,
  PlayerTournamentStatistic 
} from '../../../lib/api';

interface PlayerDetailStats extends PlayerTournamentStatistic {
  tournamentName: string;
  rank?: number;
  totalPlayers?: number;
}

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerDetailStats[]>([]);
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
      
      setPlayer(playerResponse.data);
      setTournaments(tournamentsResponse.data);
      
      // Fetch player statistics for each tournament
      const statsPromises = tournamentsResponse.data.map(async (tournament) => {
        try {
          const statsResponse = await playerStatisticsApi.getPlayerInTournament(
            tournament.id, 
            playerId
          );
          return {
            ...statsResponse.data,
            tournamentName: tournament.name
          };
        } catch (err) {
          // Player might not have stats in this tournament
          return null;
        }
      });
      
      const allStats = await Promise.all(statsPromises);
      const validStats = allStats.filter(stat => stat !== null) as PlayerDetailStats[];
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