'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { User, Mail, Phone, Trophy, ArrowLeft, Calendar, Users, Trash2 } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Breadcrumb from '../../components/Breadcrumb';
import { AdminOrLeagueAdmin } from '@/components/rbac/PermissionGate';
import { api } from '../../../lib/api';

interface PlayerInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
}

interface TournamentMembership {
  tournamentId: string;
  tournamentName: string;
  tournamentStatus: string;
  teamId: string;
  teamName: string;
  role: string;
  leagueName: string;
  startDate?: string;
  endDate?: string;
}

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  const t = useTranslations('players');
  const tc = useTranslations('common');
  const tr = useTranslations('roster');

  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [memberships, setMemberships] = useState<TournamentMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playerId) fetchPlayerData();
  }, [playerId]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const playerData = await api.players.getById(playerId);
      setPlayer(playerData);

      // Fetch tournament memberships via team_players
      // Use the /api/me/teams-like query but for a specific player
      // For now, we'll use the player dashboard endpoint which returns current teams
      try {
        const dashboard = await api.players.getDashboard(playerId);
        if (dashboard?.currentTeams) {
          setMemberships(dashboard.currentTeams.map((t: any) => ({
            tournamentId: t.tournamentId,
            tournamentName: t.tournamentName,
            tournamentStatus: t.tournamentStatus || 'active',
            teamId: t.id || t.teamId,
            teamName: t.name || t.teamName,
            role: t.role,
            leagueName: t.leagueName || '',
            startDate: t.startDate,
            endDate: t.endDate,
          })));
        }
      } catch {
        // Dashboard may fail for players without teams — that's ok
      }

      setError(null);
    } catch {
      setError(tc('failedToFetch'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!player) return;
    if (!confirm(t('confirmDelete'))) return;
    try {
      await api.players.delete(playerId);
      router.push('/players');
    } catch (err: any) {
      setError(err.message || tc('failedToDelete'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !player) {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
            <Link href="/players" className="text-red-800 hover:text-red-900 underline mt-2 inline-block">
              {tc('back')}
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[
          { label: 'Players', href: '/players' },
          { label: player?.name || 'Player' },
        ]} />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/players" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{player!.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(player!.status || 'active')}`}>
                  {player!.status || 'active'}
                </span>
                {player!.createdAt && (
                  <span className="text-sm text-gray-500">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {new Date(player!.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <AdminOrLeagueAdmin>
            <button onClick={handleDelete} className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" />
              {tc('delete')}
            </button>
          </AdminOrLeagueAdmin>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Player info */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{tc('name')}</p>
                  <p className="text-lg font-semibold text-gray-900">{player!.name}</p>
                </div>
              </div>
              {player!.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{tc('email')}</p>
                    <p className="text-gray-900">{player!.email}</p>
                  </div>
                </div>
              )}
              {player!.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{tc('phone')}</p>
                    <p className="text-gray-900">{player!.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — Tournament memberships */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  {tc('tournaments') || 'Tournament Memberships'}
                </h3>
              </div>
              {memberships.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Not enrolled in any tournaments yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {memberships.map((m) => (
                    <li key={`${m.tournamentId}-${m.teamId}`}>
                      <Link href={`/tournaments/${m.tournamentId}`} className="block hover:bg-gray-50 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{m.tournamentName}</p>
                            <p className="text-sm text-gray-500">
                              <Users className="h-3 w-3 inline mr-1" />
                              {m.teamName} — <span className="capitalize">{tr(`roles.${m.role}`)}</span>
                            </p>
                            {m.leagueName && (
                              <p className="text-xs text-gray-400">{m.leagueName}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(m.tournamentStatus)}`}>
                              {m.tournamentStatus}
                            </span>
                            {m.startDate && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(m.startDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
