// app/tournaments/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { EnhancedProtectedRoute } from '@/components/rbac/EnhancedProtectedRoute';
import { UserRole } from '@/lib/rbac';
import { tournamentApi } from '../../../lib/api';

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    maxTeams: '',
    totalSessions: '',
    sessionType: 'weekly',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await tournamentApi.create({
        ...formData,
        maxTeams: parseInt(formData.maxTeams),
        totalSessions: parseInt(formData.totalSessions),
      });
      
      router.push(`/tournaments/${response.id}`);
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Failed to create tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <EnhancedProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR]}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/tournaments"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tournaments
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Tournament</h1>
          <p className="mt-2 text-gray-600">Set up a new bowling tournament with teams and sessions.</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tournament Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Spring 2024 League"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Optional description of the tournament"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="maxTeams" className="block text-sm font-medium text-gray-700">
                  Maximum Teams *
                </label>
                <input
                  type="number"
                  name="maxTeams"
                  id="maxTeams"
                  required
                  min="2"
                  max="32"
                  value={formData.maxTeams}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="8"
                />
              </div>

              <div>
                <label htmlFor="totalSessions" className="block text-sm font-medium text-gray-700">
                  Total Sessions *
                </label>
                <input
                  type="number"
                  name="totalSessions"
                  id="totalSessions"
                  required
                  min="1"
                  max="52"
                  value={formData.totalSessions}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="12"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700">
                Session Type *
              </label>
              <select
                name="sessionType"
                id="sessionType"
                required
                value={formData.sessionType}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href="/tournaments"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </EnhancedProtectedRoute>
  );
}