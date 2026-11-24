// app/teams/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Users, Mail, Phone, Edit, Trash2, UserPlus } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import LeagueTournamentPicker from '../components/LeagueTournamentPicker';
import { PermissionGate, AdminOnly } from '@/components/rbac/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/lib/rbac';
import { api, Team } from '../../lib/api';

export default function TeamsPage() {
  const t = useTranslations('teams');
  const tc = useTranslations('common');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const permissions = usePermissions();
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    captainName: '',
    captainEmail: '',
    captainPhone: '',
  });

  const handleSelectionChange = (selection: { leagueId: string; tournamentId: string } | null) => {
    if (selection) {
      setSelectedTournament(selection.tournamentId);
      fetchTeams(selection.tournamentId);
    } else {
      setSelectedTournament('');
      setTeams([]);
    }
  };

  const fetchTeams = async (tournamentId: string) => {
    try {
      setLoading(true);
      const response = await api.registrations.getTeams(tournamentId);
      // The registration endpoint returns objects with team details nested
      const mapped = response.map((r: any) => r.teamDetails || r);
      setTeams(mapped);
      setError(null);
    } catch (err) {
      setError(tc('failedToFetch'));
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.teams.create(formData);
      setTeams([...teams, response]);
      setFormData({ name: '', captainName: '', captainEmail: '', captainPhone: '' });
      setShowCreateForm(false);
    } catch (err) {
      alert(tc('failedToCreate'));
      console.error('Error creating team:', err);
    }
  };

  const deleteTeam = async (id: string) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      await api.teams.delete(id);
      setTeams(teams.filter(t => t.id !== id));
    } catch (err) {
      alert(tc('failedToDelete'));
      console.error('Error deleting team:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'withdrawn':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <PermissionGate roles={[UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]}>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('create')}
              </button>
            </PermissionGate>
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

        {/* Create Team Form */}
        {showCreateForm && permissions.canCreateTeam && (
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('createTitle')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {tc('teamName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={t('teamNamePlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="captainName" className="block text-sm font-medium text-gray-700">
                    {t('captainName')} *
                  </label>
                  <input
                    type="text"
                    name="captainName"
                    id="captainName"
                    required
                    value={formData.captainName}
                    onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={t('captainNamePlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="captainEmail" className="block text-sm font-medium text-gray-700">
                    {t('captainEmail')} *
                  </label>
                  <input
                    type="email"
                    name="captainEmail"
                    id="captainEmail"
                    required
                    value={formData.captainEmail}
                    onChange={(e) => setFormData({ ...formData, captainEmail: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={t('captainEmailPlaceholder')}
                  />
                </div>
                <div>
                  <label htmlFor="captainPhone" className="block text-sm font-medium text-gray-700">
                    {t('captainPhone')}
                  </label>
                  <input
                    type="tel"
                    name="captainPhone"
                    id="captainPhone"
                    value={formData.captainPhone}
                    onChange={(e) => setFormData({ ...formData, captainPhone: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={t('captainPhonePlaceholder')}
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
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Select a league and tournament</h3>
            <p className="mt-1 text-sm text-gray-500">Choose a league and tournament above to see registered teams.</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="mt-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noTeams')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('noTeamsHint')}</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        team.status
                      )}`}
                    >
                      {team.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <UserPlus className="h-4 w-4 mr-2" />
                      <span>{team.captainName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{team.captainEmail}</span>
                    </div>
                    {team.captainPhone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{team.captainPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    {tc('registered')}: {new Date(team.registrationDate).toLocaleDateString()}
                  </div>

                  <div className="flex justify-between items-center">
                    <Link
                      href={`/teams/${team.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {tc('viewDetails')}
                    </Link>
                    <div className="flex space-x-2">
                      <PermissionGate roles={[UserRole.SUPER_ADMIN, UserRole.LEAGUE_ADMIN]}>
                        <button
                          onClick={() => {/* TODO: Implement edit */}}
                          className="text-gray-600 hover:text-gray-800"
                          title={tc('edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </PermissionGate>
                      <AdminOnly>
                        <button
                          onClick={() => deleteTeam(team.id)}
                          className="text-red-600 hover:text-red-800"
                          title={tc('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AdminOnly>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
