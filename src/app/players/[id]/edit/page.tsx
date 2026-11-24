'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Breadcrumb from '../../../components/Breadcrumb';
import { api, Player } from '../../../../lib/api';

interface FormData {
  name: string;
  email: string;
  phone: string;
  handicap: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  handicap?: string;
  general?: string;
}

export default function EditPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    handicap: '0',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (playerId) {
      fetchPlayer();
    }
  }, [playerId]);

  const fetchPlayer = async () => {
    try {
      setIsLoading(true);
      const player = await api.players.getById(playerId);
      setFormData({
        name: player.name,
        email: player.email || '',
        phone: player.phone || '',
        handicap: ((player as any).handicap ?? 0).toString(),
      });
    } catch {
      setErrors({ general: 'Failed to load player data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    const handicap = parseInt(formData.handicap);
    if (isNaN(handicap) || handicap < 0 || handicap > 50) {
      newErrors.handicap = 'Handicap must be between 0 and 50';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.players.update(playerId, {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      } as any);
      router.push(`/players/${playerId}`);
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to update player.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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

  return (
    <ProtectedRoute>
      <div className="container-wide py-8">
        <div className="max-w-xl">
          <Breadcrumb items={[
            { label: 'Players', href: '/players' },
            { label: formData.name || 'Player', href: `/players/${playerId}` },
            { label: 'Edit' },
          ]} />
          <div className="flex items-center space-x-4 mb-8">
            <Link href={`/players/${playerId}`} className="btn-ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Player
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Player</h1>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`form-input mt-1 ${errors.name ? 'border-red-500 ring-red-500' : ''}`}
                  />
                  {errors.name && <p className="form-error mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`form-input mt-1 ${errors.email ? 'border-red-500 ring-red-500' : ''}`}
                  />
                  {errors.email && <p className="form-error mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input mt-1"
                  />
                </div>

                <div>
                  <label htmlFor="handicap" className="form-label">
                    Handicap <span className="text-gray-400 font-normal">(0–50)</span>
                  </label>
                  <input
                    id="handicap"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.handicap}
                    onChange={(e) => setFormData({ ...formData, handicap: e.target.value })}
                    className={`form-input mt-1 ${errors.handicap ? 'border-red-500 ring-red-500' : ''}`}
                  />
                  {errors.handicap && <p className="form-error mt-1">{errors.handicap}</p>}
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <Link href={`/players/${playerId}`} className="btn-secondary">
                    Cancel
                  </Link>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
