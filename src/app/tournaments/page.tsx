// app/tournaments/page.tsx
'use client';

import { useState, useEffect } from 'react';
//import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { Plus, Trophy, Calendar, Users, BarChart3, Edit, Trash2 } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { tournamentApi, Tournament } from '../../lib/api';

export default function TournamentsPage() {
  //const { user } = useUser();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await tournamentApi.getAll();
      setTournaments(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tournaments');
      console.error('Error fetching tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }

    try {
      await tournamentApi.delete(id);
      setTournaments(tournaments.filter(t => t.id !== id));
    } catch (err) {
      alert('Failed to delete tournament');
      console.error('Error deleting tournament:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
            <p className="mt-2 text-gray-600">Manage your bowling tournaments</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/tournaments/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Tournament
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {tournaments.length === 0 ? (
          <div className="mt-8 text-center">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tournaments</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new tournament.</p>
            <div className="mt-6">
              <Link
                href="/tournaments/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Tournament
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {tournament.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {tournament.sessionType} • {tournament.totalSessions} sessions
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        tournament.status
                      )}`}
                    >
                      {tournament.status}
                    </span>
                  </div>

                  {tournament.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {tournament.description}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Max {tournament.maxTeams} teams</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Progress: {tournament.sessionsCompleted}/{tournament.totalSessions}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/tournaments/${tournament.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/tournaments/${tournament.id}/edit`}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteTournament(tournament.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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