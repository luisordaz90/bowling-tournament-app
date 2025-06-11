// app/players/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, User, Mail, Phone, Trophy, BarChart3, Edit, Trash2 } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute';
import { playerApi, Player } from '../../lib/api';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    handicap: '',
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await playerApi.getAll();
      setPlayers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch players');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await playerApi.create({
        ...formData,
        handicap: formData.handicap ? parseInt(formData.handicap) : 0,
      });
      setPlayers([...players, response.data]);
      setFormData({ name: '', email: '', phone: '', handicap: '' });
      setShowCreateForm(false);
    } catch (err) {
      alert('Failed to create player');
      console.error('Error creating player:', err);
    }
  };

  const deletePlayer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player?')) {
      return;
    }

    try {
      await playerApi.delete(id);
      setPlayers(players.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete player');
      console.error('Error deleting player:', err);
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
            <h1 className="text-3xl font-bold text-gray-900">Players</h1>
            <p className="mt-2 text-gray-600">Manage bowling players and their statistics</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Player
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Create Player Form */}
        {showCreateForm && (
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Player</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Player's full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="player@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label htmlFor="handicap" className="block text-sm font-medium text-gray-700">
                    Handicap
                  </label>
                  <input
                    type="number"
                    name="handicap"
                    id="handicap"
                    min="0"
                    max="50"
                    value={formData.handicap}
                    onChange={(e) => setFormData({ ...formData, handicap: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Player
                </button>
              </div>
            </form>
          </div>
        )}

        {players.length === 0 ? (
          <div className="mt-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No players</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new player.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Player
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            {/* Players Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {players.map((player) => (
                  <li key={player.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-lg font-medium text-gray-900">{player.name}</div>
                              {player.handicap > 0 && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Handicap: {player.handicap}
                                </span>
                              )}
                            </div>
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

                        <div className="flex items-center space-x-6">
                          {/* Player Statistics */}
                          <div className="text-right">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="text-center">
                                <div className="flex items-center text-gray-500">
                                  <BarChart3 className="h-4 w-4 mr-1" />
                                  <span>Average</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-900">
                                  {player.averageScore > 0 ? player.averageScore : 'N/A'}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center text-gray-500">
                                  <Trophy className="h-4 w-4 mr-1" />
                                  <span>Games</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-900">
                                  {player.totalGamesPlayed}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-gray-500">Total Pins</div>
                                <div className="text-lg font-semibold text-gray-900">
                                  {player.totalPins.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {/* TODO: Implement edit */}}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deletePlayer(player.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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