'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Users,
  Send,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Breadcrumb from '@/app/components/Breadcrumb';
import { api, Tournament, Match, Team } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RosterPlayer {
  playerId: string;
  role: string;
  playerDetails: { id: string; name: string; email?: string };
}

interface SessionScore {
  matchId: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  scores: number[];
  handicapApplied: number;
}

interface MatchWithTeams extends Match {
  homeTeamName?: string;
  awayTeamName?: string;
  pointsBreakdown?: {
    homeTeam: { gamePoints: number[]; seriesPoints: number; totalPoints: number };
    awayTeam: { gamePoints: number[]; seriesPoints: number; totalPoints: number };
  };
}

// One row in the score entry grid
interface ScoreRow {
  playerId: string;
  scores: (number | null)[];  // one per game
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScoreReportingPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const sessionNumber = parseInt(params.sessionNumber as string);

  // Data
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [rosters, setRosters] = useState<Record<string, RosterPlayer[]>>({});
  const [existingScores, setExistingScores] = useState<SessionScore[]>([]);

  // UI state
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [scoreRows, setScoreRows] = useState<ScoreRow[]>([]);
  const [gamesPerSession, setGamesPerSession] = useState(3);
  const [lineupSize, setLineupSize] = useState(3);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [tournamentData, sessionData, scoresData] = await Promise.all([
        api.tournaments.getById(tournamentId),
        api.sessions.getMatches(tournamentId, sessionNumber),
        api.sessions.getScores(tournamentId, sessionNumber).catch(() => []),
      ]);

      setTournament(tournamentData);
      setExistingScores(scoresData);

      const matchList: MatchWithTeams[] = sessionData.matches || sessionData;
      setMatches(matchList);

      // Fetch tournament details for games_per_session
      // The tournament object may have these from the API
      const gps = (tournamentData as any).gamesPerSession || 3;
      const ls = (tournamentData as any).lineupSize || 3;
      setGamesPerSession(gps);
      setLineupSize(ls);

      // Collect unique team IDs and fetch team data + rosters
      const teamIds = new Set<string>();
      for (const m of matchList) {
        teamIds.add(m.homeTeamId);
        teamIds.add(m.awayTeamId);
      }

      const teamMap: Record<string, Team> = {};
      const rosterMap: Record<string, RosterPlayer[]> = {};

      await Promise.all(
        Array.from(teamIds).map(async (teamId) => {
          const [teamData, rosterData] = await Promise.all([
            api.teams.getById(teamId),
            api.registrations.getPlayers(tournamentId, teamId).catch(() => []),
          ]);
          teamMap[teamId] = teamData;
          rosterMap[teamId] = rosterData;
        })
      );

      setTeams(teamMap);
      setRosters(rosterMap);

      // Auto-select first match if only one
      if (matchList.length === 1) {
        setSelectedMatchId(matchList[0].id);
      }
    } catch (err: any) {
      console.error('Error loading score reporting data:', err);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  }, [tournamentId, sessionNumber]);

  useEffect(() => {
    if (tournamentId && sessionNumber) {
      fetchData();
    }
  }, [fetchData]);

  // ── When match or team selection changes, initialize score grid ──────────

  useEffect(() => {
    if (!selectedMatchId || !selectedTeamId) {
      setScoreRows([]);
      return;
    }

    const roster = rosters[selectedTeamId] || [];
    const matchScores = existingScores.filter(
      (s) => s.matchId === selectedMatchId && s.teamId === selectedTeamId
    );

    if (matchScores.length > 0) {
      // Populate from existing scores
      setScoreRows(
        matchScores.map((s) => ({
          playerId: s.playerId,
          scores: s.scores,
        }))
      );
    } else {
      // Initialize empty rows for regular/captain players (up to lineupSize)
      const regulars = roster
        .filter((p) => p.role !== 'substitute')
        .slice(0, lineupSize);
      setScoreRows(
        regulars.map((p) => ({
          playerId: p.playerId,
          scores: Array(gamesPerSession).fill(null),
        }))
      );
    }
  }, [selectedMatchId, selectedTeamId, existingScores, rosters, lineupSize, gamesPerSession]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);

  const getTeamName = (teamId: string) => teams[teamId]?.name || 'Unknown Team';

  const getPlayerName = (teamId: string, playerId: string) => {
    const roster = rosters[teamId] || [];
    const p = roster.find((r) => r.playerId === playerId);
    return p?.playerDetails?.name || 'Unknown';
  };

  const getAvailablePlayers = (teamId: string, currentPlayerId: string) => {
    const roster = rosters[teamId] || [];
    const usedIds = new Set(scoreRows.map((r) => r.playerId).filter((id) => id !== currentPlayerId));
    return roster.filter((p) => !usedIds.has(p.playerId));
  };

  const teamHasExistingScores = (teamId: string) => {
    return existingScores.some(
      (s) => s.matchId === selectedMatchId && s.teamId === teamId
    );
  };

  const getOpponentTeamId = () => {
    if (!selectedMatch || !selectedTeamId) return null;
    return selectedTeamId === selectedMatch.homeTeamId
      ? selectedMatch.awayTeamId
      : selectedMatch.homeTeamId;
  };

  const getOpponentScores = () => {
    const opponentId = getOpponentTeamId();
    if (!opponentId) return [];
    return existingScores.filter(
      (s) => s.matchId === selectedMatchId && s.teamId === opponentId
    );
  };

  // ── Score row manipulation ────────────────────────────────────────────────

  const updateRowPlayer = (rowIndex: number, playerId: string) => {
    setScoreRows((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], playerId };
      return next;
    });
  };

  const updateRowScore = (rowIndex: number, gameIndex: number, value: string) => {
    const num = value === '' ? null : Math.min(300, Math.max(0, parseInt(value) || 0));
    setScoreRows((prev) => {
      const next = [...prev];
      const scores = [...next[rowIndex].scores];
      scores[gameIndex] = num;
      next[rowIndex] = { ...next[rowIndex], scores };
      return next;
    });
  };

  const addRow = () => {
    setScoreRows((prev) => [
      ...prev,
      { playerId: '', scores: Array(gamesPerSession).fill(null) },
    ]);
  };

  const removeRow = (rowIndex: number) => {
    setScoreRows((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const canSubmit = () => {
    if (!selectedMatchId || !selectedTeamId || submitting) return false;
    return scoreRows.every(
      (row) =>
        row.playerId &&
        row.scores.every((s) => s !== null && s >= 0 && s <= 300)
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const isEdit = teamHasExistingScores(selectedTeamId!);

      for (const row of scoreRows) {
        const scores = row.scores as number[];
        if (isEdit || editingPlayerId) {
          await api.sessions.updateScore(
            tournamentId,
            sessionNumber,
            row.playerId,
            { teamId: selectedTeamId!, scores }
          );
        } else {
          await api.sessions.submitScore(tournamentId, sessionNumber, {
            playerId: row.playerId,
            teamId: selectedTeamId!,
            scores,
          });
        }
      }

      setSuccess('Scores submitted successfully!');
      setEditingPlayerId(null);
      await fetchData(); // Refresh
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit scores';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (playerId: string) => {
    if (!selectedTeamId || !confirm('Delete this player\'s scores?')) return;
    try {
      await api.sessions.deleteScore(tournamentId, sessionNumber, playerId, selectedTeamId);
      setSuccess('Scores deleted');
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete scores');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </ProtectedRoute>
    );
  }

  const opponentScores = getOpponentScores();
  const opponentId = getOpponentTeamId();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Breadcrumb items={[
            { label: 'Tournaments', href: '/tournaments' },
            { label: tournament?.name || 'Tournament', href: `/tournaments/${tournamentId}` },
            { label: 'Sessions', href: `/tournaments/${tournamentId}/sessions` },
            { label: `Session ${sessionNumber}`, href: `/tournaments/${tournamentId}/sessions/${sessionNumber}/matches` },
            { label: 'Score Entry' },
          ]} />
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/tournaments/${tournamentId}/sessions/${sessionNumber}/matches`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Session {sessionNumber}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Report Scores
            </h1>
            <p className="text-gray-500 mt-1">
              {tournament?.name} &middot; Session {sessionNumber}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Match selector */}
          {matches.length > 1 && (
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Match
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMatchId(m.id);
                      setSelectedTeamId(null);
                    }}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedMatchId === m.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {getTeamName(m.homeTeamId)} vs {getTeamName(m.awayTeamId)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                          m.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : m.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Single match auto-display */}
          {matches.length === 1 && selectedMatch && (
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold">
                    {getTeamName(selectedMatch.homeTeamId)} vs{' '}
                    {getTeamName(selectedMatch.awayTeamId)}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedMatch.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : selectedMatch.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedMatch.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Team selector */}
          {selectedMatch && (
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Select Your Team
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[selectedMatch.homeTeamId, selectedMatch.awayTeamId].map(
                  (teamId) => {
                    const hasScores = teamHasExistingScores(teamId);
                    return (
                      <button
                        key={teamId}
                        onClick={() => setSelectedTeamId(teamId)}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          selectedTeamId === teamId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">
                          {getTeamName(teamId)}
                        </div>
                        {teamId === selectedMatch.homeTeamId && (
                          <span className="text-xs text-gray-400">Home</span>
                        )}
                        {teamId === selectedMatch.awayTeamId && (
                          <span className="text-xs text-gray-400">Away</span>
                        )}
                        {hasScores && (
                          <span className="ml-2 text-xs text-green-600 font-medium">
                            Scores submitted
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Score entry grid */}
          {selectedMatch && selectedTeamId && (
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {getTeamName(selectedTeamId)} Scores
                </h2>
                {scoreRows.length < (rosters[selectedTeamId]?.length || 0) && (
                  <button
                    onClick={addRow}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Player
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b">
                      <th className="pb-2 pr-2 w-48">Player</th>
                      {Array.from({ length: gamesPerSession }, (_, i) => (
                        <th key={i} className="pb-2 px-2 text-center w-24">
                          Game {i + 1}
                        </th>
                      ))}
                      <th className="pb-2 px-2 text-center w-20">Total</th>
                      <th className="pb-2 pl-2 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreRows.map((row, rowIdx) => {
                      const available = getAvailablePlayers(
                        selectedTeamId,
                        row.playerId
                      );
                      const total = row.scores.reduce(
                        (sum, s) => (sum ?? 0) + (s ?? 0),
                        0
                      );
                      const allFilled = row.scores.every(
                        (s) => s !== null
                      );

                      // Build a stable key from available player IDs so React
                      // re-mounts the <select> when sibling rows change players.
                      const optionsKey = available.map((p) => p.playerId).join(',');

                      return (
                        <tr key={rowIdx} className="border-b last:border-0">
                          <td className="py-2 pr-2">
                            <div className="relative">
                              <select
                                key={optionsKey}
                                value={row.playerId}
                                onChange={(e) =>
                                  updateRowPlayer(rowIdx, e.target.value)
                                }
                                className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select player...</option>
                                {available.map((p) => (
                                  <option
                                    key={p.playerId}
                                    value={p.playerId}
                                  >
                                    {p.playerDetails.name}
                                    {p.role === 'substitute' ? ' (sub)' : ''}
                                    {p.role === 'captain' ? ' (C)' : ''}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </td>
                          {row.scores.map((score, gameIdx) => (
                            <td key={gameIdx} className="py-2 px-2">
                              <input
                                type="number"
                                min={0}
                                max={300}
                                value={score ?? ''}
                                onChange={(e) =>
                                  updateRowScore(
                                    rowIdx,
                                    gameIdx,
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                className="w-full text-center bg-gray-50 border border-gray-300 rounded-md py-2 px-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </td>
                          ))}
                          <td className="py-2 px-2 text-center font-semibold text-sm tabular-nums">
                            {allFilled ? total : '—'}
                          </td>
                          <td className="py-2 pl-2">
                            {scoreRows.length > lineupSize && (
                              <button
                                onClick={() => removeRow(rowIdx)}
                                className="p-1 text-gray-400 hover:text-red-500"
                                title="Remove row"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Series total */}
              {scoreRows.length > 0 && (
                <div className="mt-3 pt-3 border-t flex justify-end">
                  <div className="text-sm text-gray-600">
                    Team Series:{' '}
                    <span className="font-bold text-gray-900 tabular-nums">
                      {scoreRows.reduce(
                        (sum, row) =>
                          sum +
                          row.scores.reduce(
                            (s, g) => (s ?? 0) + (g ?? 0),
                            0
                          )!,
                        0
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {teamHasExistingScores(selectedTeamId)
                    ? 'Update Scores'
                    : 'Submit Scores'}
                </button>
              </div>
            </div>
          )}

          {/* Opponent scores (read-only) */}
          {selectedMatch && opponentId && opponentScores.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {getTeamName(opponentId)} Scores
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase border-b">
                      <th className="pb-2 pr-2">Player</th>
                      {Array.from({ length: gamesPerSession }, (_, i) => (
                        <th key={i} className="pb-2 px-2 text-center">
                          Game {i + 1}
                        </th>
                      ))}
                      <th className="pb-2 px-2 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opponentScores.map((s) => (
                      <tr key={s.playerId} className="border-b last:border-0">
                        <td className="py-2 pr-2 text-sm font-medium">
                          {s.playerName}
                        </td>
                        {s.scores.map((score, i) => (
                          <td
                            key={i}
                            className="py-2 px-2 text-center text-sm tabular-nums"
                          >
                            {score}
                          </td>
                        ))}
                        <td className="py-2 px-2 text-center text-sm font-semibold tabular-nums">
                          {s.scores.reduce((a, b) => a + b, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t">
                      <td className="py-2 pr-2 text-sm font-semibold">
                        Team Total
                      </td>
                      {Array.from({ length: gamesPerSession }, (_, gi) => (
                        <td
                          key={gi}
                          className="py-2 px-2 text-center text-sm font-semibold tabular-nums"
                        >
                          {opponentScores.reduce(
                            (sum, s) => sum + (s.scores[gi] || 0),
                            0
                          )}
                        </td>
                      ))}
                      <td className="py-2 px-2 text-center text-sm font-bold tabular-nums">
                        {opponentScores.reduce(
                          (sum, s) =>
                            sum + s.scores.reduce((a, b) => a + b, 0),
                          0
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Match result (if completed) */}
          {selectedMatch?.status === 'completed' &&
            selectedMatch.pointsBreakdown && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Match Result
                </h2>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-500">
                      {getTeamName(selectedMatch.homeTeamId)}
                    </div>
                    <div className="text-3xl font-bold tabular-nums">
                      {selectedMatch.pointsBreakdown.homeTeam.totalPoints}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Games:{' '}
                      {selectedMatch.pointsBreakdown.homeTeam.gamePoints?.join(
                        '-'
                      )}{' '}
                      | Series:{' '}
                      {selectedMatch.pointsBreakdown.homeTeam.seriesPoints}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">
                      {getTeamName(selectedMatch.awayTeamId)}
                    </div>
                    <div className="text-3xl font-bold tabular-nums">
                      {selectedMatch.pointsBreakdown.awayTeam.totalPoints}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Games:{' '}
                      {selectedMatch.pointsBreakdown.awayTeam.gamePoints?.join(
                        '-'
                      )}{' '}
                      | Series:{' '}
                      {selectedMatch.pointsBreakdown.awayTeam.seriesPoints}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
