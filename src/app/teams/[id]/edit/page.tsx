'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Breadcrumb from '../../../components/Breadcrumb';
import { api } from '../../../../lib/api';

interface FormData {
  name: string;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  status: 'active' | 'inactive' | 'withdrawn';
}

interface FormErrors {
  name?: string;
  captainName?: string;
  captainEmail?: string;
  general?: string;
}

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    captainName: '',
    captainEmail: '',
    captainPhone: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeam();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const team = await api.teams.getById(teamId);
      setFormData({
        name: team.name,
        captainName: team.captainName,
        captainEmail: team.captainEmail,
        captainPhone: team.captainPhone || '',
        status: team.status,
      });
    } catch {
      setErrors({ general: 'Failed to load team data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Team name is required';
    if (!formData.captainName.trim()) newErrors.captainName = 'Captain name is required';
    if (!formData.captainEmail.trim()) {
      newErrors.captainEmail = 'Captain email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.captainEmail)) {
      newErrors.captainEmail = 'Enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.teams.update(teamId, {
        name: formData.name.trim(),
        captainName: formData.captainName.trim(),
        captainEmail: formData.captainEmail.trim(),
        captainPhone: formData.captainPhone.trim() || undefined,
        status: formData.status,
      });
      router.push(`/teams/${teamId}`);
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to update team.' });
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
            { label: 'Teams', href: '/teams' },
            { label: formData.name || 'Team', href: `/teams/${teamId}` },
            { label: 'Edit' },
          ]} />
          <div className="flex items-center space-x-4 mb-8">
            <Link href={`/teams/${teamId}`} className="btn-ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Team</h1>
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
                    Team Name <span className="text-red-500">*</span>
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
                  <label htmlFor="captainName" className="form-label">
                    Captain Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="captainName"
                    type="text"
                    value={formData.captainName}
                    onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                    className={`form-input mt-1 ${errors.captainName ? 'border-red-500 ring-red-500' : ''}`}
                  />
                  {errors.captainName && <p className="form-error mt-1">{errors.captainName}</p>}
                </div>

                <div>
                  <label htmlFor="captainEmail" className="form-label">
                    Captain Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="captainEmail"
                    type="email"
                    value={formData.captainEmail}
                    onChange={(e) => setFormData({ ...formData, captainEmail: e.target.value })}
                    className={`form-input mt-1 ${errors.captainEmail ? 'border-red-500 ring-red-500' : ''}`}
                  />
                  {errors.captainEmail && <p className="form-error mt-1">{errors.captainEmail}</p>}
                </div>

                <div>
                  <label htmlFor="captainPhone" className="form-label">Captain Phone</label>
                  <input
                    id="captainPhone"
                    type="tel"
                    value={formData.captainPhone}
                    onChange={(e) => setFormData({ ...formData, captainPhone: e.target.value })}
                    className="form-input mt-1"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FormData['status'] })}
                    className="form-input mt-1"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <Link href={`/teams/${teamId}`} className="btn-secondary">
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
