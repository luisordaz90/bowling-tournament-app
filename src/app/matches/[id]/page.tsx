// app/matches/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  Clock,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Breadcrumb from '../../components/Breadcrumb';
import { api, Match, Team, Player, PlayerMatchScore, TeamMatchScore } from '../../../lib/api';

interface TeamPlayer {
  id: string;
  playerId: string;
  role: string;
  playerDetails: Player;
}

export default function MatchDetailsPage() {
  const params = useParams();
  const matchId = params.id as string;
  
  const [match, setMatch] = useState<Match | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<TeamPlayer[]>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<TeamPlayer[]>([]);
  const [playerScores, setPlayerScores] = useState<PlayerMatchScore[]>([]);
  const [teamScores, setTeamScores] = useState<TeamMatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scores' | 'summary'>('scores');
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [newScore, setNewScore] = useState({
    playerId: '',
    teamId: '',
    game1Score: 0,
    game2Score: 0,
    game3Score: 0,
    handicapApplied: 0
  });

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch match details
      const matchData = await api.matches.getById(matchId);
      setMatch(matchData);
      
      // Fetch team details
      const [homeTeamData, awayTeamData] = await Promise.all([
        api.teams.getById(matchData.homeTeamId),
        api.teams.getById(matchData.awayTeamId)
      ]);
      setHomeTeam(homeTeamData);
      setAwayTeam(awayTeamData);
      
      // Fetch team players
      if (matchData.tournamentId) {
        const [homePlayersData, awayPlayersData] = await Promise.all([
          api.registrations.getPlayers(matchData.tournamentId, matchData.homeTeamId),
          api.registrations.getPlayers(matchData.tournamentId, matchData.awayTeamId)
        ]);
        setHomeTeamPlayers(homePlayersData);
        setAwayTeamPlayers(awayPlayersData);
      }
      
      // Fetch scores
      await fetchScores();
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching match details:', err);
      setError('Failed to fetch match details');
    } finally {
      setLoading(false);
    }
  };

  const fetchScores = async () => {
    try {
      const [playerScoresRaw, teamScoresData] = await Promise.all([
        api.matches.getPlayerScores(matchId),
        api.matches.getTeamScores(matchId)
      ]);
      // Transform API shape (scores array) into flat game1/2/3 shape the UI expects
      const transformed = (playerScoresRaw as any[]).map((p: any) => {
        const scoresByGame: Record<number, number> = {};
        (p.scores || []).forEach((s: any) => { scoresByGame[s.gameNumber] = s.score; });
        const g1 = scoresByGame[1] || 0;
        const g2 = scoresByGame[2] || 0;
        const g3 = scoresByGame[3] || 0;
        const total = g1 + g2 + g3;
        return {
          id: p.playerId,
          matchId,
          teamId: p.teamId,
          playerId: p.playerId,
          game1Score: g1,
          game2Score: g2,
          game3Score: g3,
          totalScore: total,
          handicapApplied: p.handicapApplied || 0,
          finalScore: total + ((p.handicapApplied || 0) * (p.scores?.length || 0)),
        } as PlayerMatchScore;
      });
      setPlayerScores(transformed);
      setTeamScores(teamScoresData);
    } catch (err) {
      console.error('Error fetching scores:', err);
    }
  };

  const updateMatchStatus = async (status: string) => {
    if (!match) return;
    
    try {
      const updatedMatch = await api.matches.updateStatus(matchId, status);
      setMatch(updatedMatch);
    } catch (err: any) {
      alert(`Failed to update match status: ${err.message}`);
    }
  };

  const resetScoreForm = () => {
    setNewScore({ playerId: '', teamId: '', game1Score: 0, game2Score: 0, game3Score: 0, handicapApplied: 0 });
    setEditingScoreId(null);
  };

  const handleEditScore = (score: PlayerMatchScore) => {
    setEditingScoreId(score.id);
    setNewScore({
      playerId: score.playerId,
      teamId: score.teamId,
      game1Score: score.game1Score,
      game2Score: score.game2Score,
      game3Score: score.game3Score,
      handicapApplied: score.handicapApplied,
    });
    // Scroll to the score form
    document.getElementById('score-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const addPlayerScore = async () => {
    if (!newScore.playerId || !newScore.teamId) {
      alert('Please select a player and team');
      return;
    }

    try {
      await api.matches.addPlayerScore(matchId, newScore);
      await fetchScores();
      resetScoreForm();
    } catch (err: any) {
      alert(`Failed to save player score: ${err.message}`);
    }
  };

  const calculateTeamScore = async (teamId: string) => {
    try {
      await api.matches.calculateTeamScore(matchId, teamId);
      await fetchScores();
    } catch (err: any) {
      alert(`Failed to calculate team score: ${err.message}`);
    }
  };

  const getPlayerName = (playerId: string) => {
    const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
    const player = allPlayers.find(p => p.playerId === playerId);
    return player?.playerDetails?.name || 'Unknown Player';
  };

  const getTeamPlayerScores = (teamId: string) => {
    return playerScores.filter(score => score.teamId === teamId);
  };

  const getTeamScore = (teamId: string) => {
    return teamScores.find(score => score.teamId === teamId);
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !match) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error || 'Match not found'}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[
          { label: 'Matches', href: '/matches' },
          { label: 'Match Details' },
        ]} />
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/matches"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {homeTeam?.name} vs {awayTeam?.name}
                </h1>
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                  {match.matchDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(match.matchDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {match.sessionNumber && (
                    <div>Session {match.sessionNumber}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(match.status)}`}>
                {getStatusIcon(match.status)}
                <span className="ml-1 capitalize">{match.status.replace('_', ' ')}</span>
              </span>
              
              {match.status === 'scheduled' && (
                <button
                  onClick={() => updateMatchStatus('in_progress')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Match
                </button>
              )}
              
              {match.status === 'in_progress' && (
                <button
                  onClick={() => updateMatchStatus('completed')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Match
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('scores')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scores'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="h-4 w-4 inline mr-2" />
                Scores
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Match Summary
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'scores' && (
          <div className="space-y-8">
            {/* Add / Edit Score Form */}
            {(match.status === 'in_progress' || match.status === 'completed') && (
              <div id="score-form" className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingScoreId ? 'Edit Player Score' : 'Add Player Score'}
                  </h3>
                  {editingScoreId && (
                    <button
                      onClick={resetScoreForm}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel Edit
                    </button>
                  )}
                </div>
                {editingScoreId && (
                  <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mb-4">
                    Re-entering scores will add a new record. To correct a score, enter the updated values and click Save.
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                    <select
                      value={newScore.teamId}
                      onChange={(e) => setNewScore({ ...newScore, teamId: e.target.value, playerId: '' })}
                      disabled={!!editingScoreId}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    >
                      <option value="">Select Team</option>
                      <option value={match.homeTeamId}>{homeTeam?.name}</option>
                      <option value={match.awayTeamId}>{awayTeam?.name}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
                    <select
                      value={newScore.playerId}
                      onChange={(e) => setNewScore({ ...newScore, playerId: e.target.value })}
                      disabled={!newScore.teamId || !!editingScoreId}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    >
                      <option value="">Select Player</option>
                      {newScore.teamId === match.homeTeamId &&
                        homeTeamPlayers.map((player) => (
                          <option key={player.playerId} value={player.playerId}>
                            {player.playerDetails.name}
                          </option>
                        ))}
                      {newScore.teamId === match.awayTeamId &&
                        awayTeamPlayers.map((player) => (
                          <option key={player.playerId} value={player.playerId}>
                            {player.playerDetails.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Game 1</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={newScore.game1Score}
                      onChange={(e) => setNewScore({ ...newScore, game1Score: parseInt(e.target.value) || 0 })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Game 2</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={newScore.game2Score}
                      onChange={(e) => setNewScore({ ...newScore, game2Score: parseInt(e.target.value) || 0 })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Game 3</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={newScore.game3Score}
                      onChange={(e) => setNewScore({ ...newScore, game3Score: parseInt(e.target.value) || 0 })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={addPlayerScore}
                      disabled={!newScore.playerId || !newScore.teamId}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {editingScoreId ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Score
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Score
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Team Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Home Team */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{homeTeam?.name}</h3>
                    <button
                      onClick={() => calculateTeamScore(match.homeTeamId)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Calculate Team Score
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Team Summary */}
                  {(() => {
                    const teamScore = getTeamScore(match.homeTeamId);
                    return teamScore ? (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total Score:</span>
                            <span className="ml-2 font-bold text-lg">{teamScore.finalTeamScore}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Team Average:</span>
                            <span className="ml-2 font-bold">{teamScore.teamAverage}</span>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Player Scores */}
                  <div className="space-y-4">
                    {getTeamPlayerScores(match.homeTeamId).map((score) => (
                      <div key={score.id} className={`border rounded-lg p-4 ${editingScoreId === score.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{getPlayerName(score.playerId)}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-blue-600">{score.finalScore}</span>
                            {(match.status === 'in_progress' || match.status === 'completed') && (
                              <button
                                onClick={() => handleEditScore(score)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                title="Edit score"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="text-center">
                            <div className="text-gray-500">Game 1</div>
                            <div className="font-medium">{score.game1Score}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Game 2</div>
                            <div className="font-medium">{score.game2Score}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Game 3</div>
                            <div className="font-medium">{score.game3Score}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Total</div>
                            <div className="font-medium">{score.totalScore}</div>
                          </div>
                        </div>
                        {score.handicapApplied > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            Handicap: +{score.handicapApplied}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {getTeamPlayerScores(match.homeTeamId).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No scores recorded yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Away Team */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{awayTeam?.name}</h3>
                    <button
                      onClick={() => calculateTeamScore(match.awayTeamId)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Calculate Team Score
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Team Summary */}
                  {(() => {
                    const teamScore = getTeamScore(match.awayTeamId);
                    return teamScore ? (
                      <div className="mb-6 p-4 bg-green-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total Score:</span>
                            <span className="ml-2 font-bold text-lg">{teamScore.finalTeamScore}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Team Average:</span>
                            <span className="ml-2 font-bold">{teamScore.teamAverage}</span>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Player Scores */}
                  <div className="space-y-4">
                    {getTeamPlayerScores(match.awayTeamId).map((score) => (
                      <div key={score.id} className={`border rounded-lg p-4 ${editingScoreId === score.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{getPlayerName(score.playerId)}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-green-600">{score.finalScore}</span>
                            {(match.status === 'in_progress' || match.status === 'completed') && (
                              <button
                                onClick={() => handleEditScore(score)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                title="Edit score"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="text-center">
                            <div className="text-gray-500">Game 1</div>
                            <div className="font-medium">{score.game1Score}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Game 2</div>
                            <div className="font-medium">{score.game2Score}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Game 3</div>
                            <div className="font-medium">{score.game3Score}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Total</div>
                            <div className="font-medium">{score.totalScore}</div>
                          </div>
                        </div>
                        {score.handicapApplied > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            Handicap: +{score.handicapApplied}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {getTeamPlayerScores(match.awayTeamId).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No scores recorded yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Match Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Match Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Match Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Match ID:</dt>
                      <dd className="font-medium">{match.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Status:</dt>
                      <dd>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(match.status)}`}>
                          {match.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </dd>
                    </div>
                    {match.matchDate && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Date:</dt>
                        <dd className="font-medium">{new Date(match.matchDate).toLocaleDateString()}</dd>
                      </div>
                    )}
                    {match.sessionNumber && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Session:</dt>
                        <dd className="font-medium">{match.sessionNumber}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Teams</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Home Team:</dt>
                      <dd className="font-medium">{homeTeam?.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Away Team:</dt>
                      <dd className="font-medium">{awayTeam?.name}</dd>
                    </div>
                    {match.winnerTeamId && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Winner:</dt>
                        <dd className="font-medium text-green-600">
                          {match.winnerTeamId === match.homeTeamId ? homeTeam?.name : awayTeam?.name}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>

            {/* Final Scores */}
            {teamScores.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Final Team Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teamScores.map((teamScore) => {
                    const team = teamScore.teamId === match.homeTeamId ? homeTeam : awayTeam;
                    const isWinner = teamScores.length === 2 && teamScore.finalTeamScore === Math.max(...teamScores.map(ts => ts.finalTeamScore));
                    
                    return (
                      <div key={teamScore.teamId} className={`p-4 rounded-lg border-2 ${isWinner ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <div className="text-center">
                          <h4 className="font-medium text-gray-900">{team?.name}</h4>
                          {isWinner && <div className="text-xs text-green-600 font-medium">WINNER</div>}
                          <div className="text-3xl font-bold mt-2">{teamScore.finalTeamScore}</div>
                          <div className="text-sm text-gray-500">Average: {teamScore.teamAverage}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Team Rosters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{homeTeam?.name} Roster</h3>
                <div className="space-y-3">
                  {homeTeamPlayers.map((player) => (
                    <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{player.playerDetails.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{player.role}</div>
                      </div>
                      <div className="text-sm text-gray-500">

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{awayTeam?.name} Roster</h3>
                <div className="space-y-3">
                  {awayTeamPlayers.map((player) => (
                    <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{player.playerDetails.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{player.role}</div>
                      </div>
                      <div className="text-sm text-gray-500">

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};