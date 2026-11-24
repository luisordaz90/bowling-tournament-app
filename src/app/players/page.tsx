// app/players/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, User, Mail, Phone, Trash2 } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import LeagueTournamentPicker from '../components/LeagueTournamentPicker';
import { AdminOrLeagueAdmin } from '@/components/rbac/PermissionGate';
import { api, Player } from '../../lib/api';

interface PlayerWithTeam extends Player {
  teamName?: string;
  role?: string;
}

export default function PlayersPage() {
  const t = useTranslations('players');
  const tc = useTranslations('common');
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSelectionChange = (selection: { leagueId: string; tournamentId: string } | null) => {
    if (selection) {
      setSelectedTournament(selection.tournamentId);
      fetchPlayers(selection.tournamentId);
    } else {
      setSelectedTournament('');
      setPlayers([]);
    }
  };

  const fetchPlayers = async (tournamentId: string) => {
    try {
      setLoading(true);
      // Get all teams in the tournament, then fetch players per team
      const teams = await api.registrations.getTeams(tournamentId);
      const allPlayers: PlayerWithTeam[] = [];

      await Promise.all(
        teams.map(async (teamEntry: any) => {
          const teamId = teamEntry.teamId || teamEntry.id;
          const teamName = teamEntry.teamDetails?.name || teamEntry.name || '';
          try {
            const roster = await api.registrations.getPlayers(tournamentId, teamId);
            roster.forEach((entry: any) => {
              const p = entry.playerDetails || entry;
              allPlayers.push({
                ...p,
                id: entry.playerId || p.id,
                teamName,
                role: entry.role,
              });
            });
          } catch {
            // team may have no roster
          }
        })
      );

      // Sort by name
      allPlayers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setPlayers(allPlayers);
      setError(null);
    } catch (err) {
      setError(tc('failedToFetch'));
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.players.create(formData);
      setPlayers([...players, response]);
      setFormData({ name: '', email: '', phone: '' });
      setShowCreateForm(false);
    } catch (err) {
      alert(tc('failedToCreate'));
      console.error('Error creating player:', err);
    }
  };

  const deletePlayer = async (id: string) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      await api.players.delete(id);
      setPlayers(players.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || tc('failedToDelete'));
      console.error('Error deleting player:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const key = status as 'invited' | 'active';
    return t(`status.${key}`);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="mt-2 text-gray-600">{t('subtitle')}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <AdminOrLeagueAdmin>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('create')}
              </button>
            </AdminOrLeagueAdmin>
          </div>
        </div>

        <LeagueTournamentPicker
          onSelectionChange={handleSelectionChange}
          className="mt-6"
        />

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Create Player Form */}
        {showCreateForm && (
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('createTitle')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t('playerName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={t('playerNamePlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {tc('email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={t('emailPlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    {tc('phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={t('phonePlaceholder')}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {tc('cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {t('create')}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !selectedTournament ? (
          <div className="mt-8 text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Select a league and tournament</h3>
            <p className="mt-1 text-sm text-gray-500">Choose a league and tournament above to see players.</p>
          </div>
        ) : players.length === 0 ? (
          <div className="mt-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noPlayers')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('noPlayersHint')}</p>
          </div>
        ) : (
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {players.map((player) => (
                  <li key={player.id}>
                    <Link href={`/players/${player.id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                            <div className="ml-4">
                              <div className="text-lg font-medium text-gray-900">{player.name}</div>
                              {player.teamName && (
                                <div className="text-sm text-gray-500">{player.teamName}{player.role ? ` \u00b7 ${player.role}` : ''}</div>
                              )}
                              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                {player.email && (
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-1" />
                                    <span>{player.email}</span>
                                  </div>
                                )}
                                {player.phone && (
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 mr-1" />
                                    <span>{player.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(player.status || 'active')}`}>
                              {getStatusLabel(player.status || 'active')}
                            </span>
                            <AdminOrLeagueAdmin>
                              <button
                                onClick={(e) => { e.preventDefault(); deletePlayer(player.id); }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </AdminOrLeagueAdmin>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
