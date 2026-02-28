// app/tournaments/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { tournamentApi, Tournament, teamApi, Team } from '@/lib/api';
import Link from 'next/link';
import { EnhancedProtectedRoute } from '@/components/rbac/EnhancedProtectedRoute';
import { UserRole } from '@/lib/rbac';

interface FormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxTeams: string;
  totalSessions: string;
  sessionType: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  sessionsCompleted: string;
}

interface FormErrors {
  name?: string;
  startDate?: string;
  endDate?: string;
  maxTeams?: string;
  totalSessions?: string;
  sessionType?: string;
  general?: string;
}

export default function EditTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    maxTeams: '',
    totalSessions: '',
    sessionType: '',
    status: 'draft',
    sessionsCompleted: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Team management state
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [registeredTeams, setRegisteredTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [seedNumber, setSeedNumber] = useState<string>('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [teamMessage, setTeamMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load tournament data and teams
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load tournament data
        const tournamentResponse = await tournamentApi.getById(tournamentId);
        const tournament = tournamentResponse;

        // Format dates for input fields
        const formatDateForInput = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        setFormData({
          name: tournament.name,
          description: tournament.description || '',
          startDate: formatDateForInput(tournament.startDate),
          endDate: formatDateForInput(tournament.endDate),
          maxTeams: tournament.maxTeams.toString(),
          totalSessions: tournament.totalSessions.toString(),
          sessionType: tournament.sessionType,
          status: tournament.status,
          sessionsCompleted: tournament.sessionsCompleted.toString(),
        });

        // Load all teams
        const teamsResponse = await teamApi.getAll();
        setAllTeams(teamsResponse);

        // Load registered teams for this tournament
        const registeredTeamsResponse = await tournamentApi.getRegisteredTeams(tournamentId);
        setRegisteredTeams(registeredTeamsResponse);

      } catch (error) {
        console.error('Failed to load data:', error);
        setErrors({ general: 'Failed to load tournament data. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    };

    if (tournamentId) {
      loadData();
    }
  }, [tournamentId]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Tournament name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.maxTeams) {
      newErrors.maxTeams = 'Maximum teams is required';
    } else {
      const maxTeams = parseInt(formData.maxTeams);
      if (isNaN(maxTeams) || maxTeams < 2) {
        newErrors.maxTeams = 'Maximum teams must be at least 2';
      } else if (maxTeams > 50) {
        newErrors.maxTeams = 'Maximum teams cannot exceed 50';
      }
    }

    if (!formData.totalSessions) {
      newErrors.totalSessions = 'Total sessions is required';
    } else {
      const totalSessions = parseInt(formData.totalSessions);
      if (isNaN(totalSessions) || totalSessions < 1) {
        newErrors.totalSessions = 'Total sessions must be at least 1';
      } else if (totalSessions > 100) {
        newErrors.totalSessions = 'Total sessions cannot exceed 100';
      }
    }

    if (!formData.sessionType.trim()) {
      newErrors.sessionType = 'Session type is required';
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // Sessions completed validation
    if (formData.sessionsCompleted) {
      const sessionsCompleted = parseInt(formData.sessionsCompleted);
      const totalSessions = parseInt(formData.totalSessions);
      
      if (!isNaN(sessionsCompleted) && !isNaN(totalSessions)) {
        if (sessionsCompleted < 0) {
          newErrors.general = 'Sessions completed cannot be negative';
        } else if (sessionsCompleted > totalSessions) {
          newErrors.general = 'Sessions completed cannot exceed total sessions';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const updateData: Partial<Tournament> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxTeams: parseInt(formData.maxTeams),
        totalSessions: parseInt(formData.totalSessions),
        sessionType: formData.sessionType.trim(),
        status: formData.status,
        sessionsCompleted: formData.sessionsCompleted ? parseInt(formData.sessionsCompleted) : 0,
      };

      await tournamentApi.update(tournamentId, updateData);
      
      setSubmitMessage({
        type: 'success',
        text: 'Tournament updated successfully!'
      });

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push(`/tournaments/${tournamentId}`);
      }, 1500);

    } catch (error: any) {
      console.error('Failed to update tournament:', error);
      setSubmitMessage({
        type: 'error',
        text: error.response?.error || 'Failed to update tournament. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/tournaments/${tournamentId}`);
  };

  // Team management functions
  const getAvailableTeams = () => {
    const registeredTeamIds = registeredTeams.map(rt => rt.teamId);
    return allTeams.filter(team => !registeredTeamIds.includes(team.id));
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    console.log("HANDLE")
    e.preventDefault();
    
    if (!selectedTeamId) {
      setTeamMessage({ type: 'error', text: 'Please select a team to add.' });
      return;
    }

    setIsAddingTeam(true);
    setTeamMessage(null);

    try {
      const registrationData: { teamId: string; seedNumber?: number } = {
        teamId: selectedTeamId
      };

      if (seedNumber && !isNaN(parseInt(seedNumber))) {
        registrationData.seedNumber = parseInt(seedNumber);
      }

      await tournamentApi.registerTeam(tournamentId, registrationData);
      
      // Reload registered teams
      const registeredTeamsResponse = await tournamentApi.getRegisteredTeams(tournamentId);
      setRegisteredTeams(registeredTeamsResponse);
      
      // Clear form
      setSelectedTeamId('');
      setSeedNumber('');
      
      setTeamMessage({
        type: 'success',
        text: 'Team successfully added to tournament!'
      });
    } catch (error: any) {
      console.error('Failed to add team:', error);
      setTeamMessage({
        type: 'error',
        text: error.response?.error || 'Failed to add team. Please try again.'
      });
    } finally {
      setIsAddingTeam(false);
    }
  };

  const removeTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to remove this team from the tournament?')) {
      return;
    }

    try {
      // Note: The API doesn't have a direct remove team endpoint, 
      // so this would need to be implemented in the backend
      setTeamMessage({
        type: 'error',
        text: 'Team removal is not yet implemented in the API.'
      });
    } catch (error: any) {
      console.error('Failed to remove team:', error);
      setTeamMessage({
        type: 'error',
        text: 'Failed to remove team. Please try again.'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading tournament...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EnhancedProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.TOURNAMENT_DIRECTOR, UserRole.LEAGUE_MANAGER]}>
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/tournaments/${tournamentId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tournament
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Tournament</h1>
          <p className="text-gray-600 mt-2">Update tournament details and settings</p>
        </div>

        {/* Success/Error Messages */}
        {submitMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            submitMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {submitMessage.text}
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
            {errors.general}
          </div>
        )}

        {/* Team Management Messages */}
        {teamMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            teamMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {teamMessage.text}
          </div>
        )}


          {/* Team Management Section */}
          <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Add teams to this tournament ({registeredTeams.length}/{formData.maxTeams || 0} teams registered)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTeamManagement(!showTeamManagement)}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {showTeamManagement ? 'Hide' : 'Manage Teams'}
              </button>
            </div>

            {showTeamManagement && (
              <div className="space-y-6">
                {/* Add Team Form */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Team</h3>
                  
                  {getAvailableTeams().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No available teams to add.</p>
                      <p className="text-sm mt-1">
                        All teams are either already registered or you've reached the maximum team limit.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleAddTeam} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label htmlFor="teamSelect" className="block text-sm font-medium text-gray-700 mb-2">
                          Select Team *
                        </label>
                        <select
                          id="teamSelect"
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Choose a team</option>
                          {getAvailableTeams().map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name} (Captain: {team.captainName})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="seedNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Seed Number (Optional)
                        </label>
                        <input
                          id="seedNumber"
                          type="number"
                          min="1"
                          value={seedNumber}
                          onChange={(e) => setSeedNumber(e.target.value)}
                          placeholder="Enter seed"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={isAddingTeam || !selectedTeamId}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                          {isAddingTeam ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Add Team
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Registered Teams List */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Registered Teams</h3>
                  
                  {registeredTeams.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No teams registered yet.</p>
                      <p className="text-sm mt-1">Add teams above to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {registeredTeams.map((registration, index) => {
                        const team = registration.teamDetails;
                        return (
                          <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {team?.name || 'Unknown Team'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Captain: {team?.captainName || 'Unknown'}
                                  {registration.seedNumber && (
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                      Seed #{registration.seedNumber}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                registration.status === 'registered' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {registration.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeTeam(registration.teamId)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                                title="Remove team"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              <p className="text-gray-600 text-sm mt-1">Update the fundamental details about your tournament</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter tournament name"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter tournament description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Configuration */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Tournament Configuration</h2>
              <p className="text-gray-600 text-sm mt-1">Configure the structure and rules of your tournament</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxTeams" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Teams *
                </label>
                <input
                  id="maxTeams"
                  type="number"
                  min="2"
                  max="50"
                  value={formData.maxTeams}
                  onChange={(e) => handleInputChange('maxTeams', e.target.value)}
                  placeholder="Enter maximum teams"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.maxTeams ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.maxTeams && (
                  <p className="text-sm text-red-600 mt-1">{errors.maxTeams}</p>
                )}
              </div>

              <div>
                <label htmlFor="totalSessions" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Sessions *
                </label>
                <input
                  id="totalSessions"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.totalSessions}
                  onChange={(e) => handleInputChange('totalSessions', e.target.value)}
                  placeholder="Enter total sessions"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.totalSessions ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.totalSessions && (
                  <p className="text-sm text-red-600 mt-1">{errors.totalSessions}</p>
                )}
              </div>

              <div>
                <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type *
                </label>
                <select
                  id="sessionType"
                  value={formData.sessionType}
                  onChange={(e) => handleInputChange('sessionType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.sessionType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select session type</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="tournament">Tournament Style</option>
                  <option value="custom">Custom Schedule</option>
                </select>
                {errors.sessionType && (
                  <p className="text-sm text-red-600 mt-1">{errors.sessionType}</p>
                )}
              </div>

              <div>
                <label htmlFor="sessionsCompleted" className="block text-sm font-medium text-gray-700 mb-2">
                  Sessions Completed
                </label>
                <input
                  id="sessionsCompleted"
                  type="number"
                  min="0"
                  value={formData.sessionsCompleted}
                  onChange={(e) => handleInputChange('sessionsCompleted', e.target.value)}
                  placeholder="Enter completed sessions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Tournament Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Tournament Status</h2>
              <p className="text-gray-600 text-sm mt-1">Update the current status of your tournament</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Draft:</strong> Tournament is being set up and not yet started</p>
                <p><strong>Active:</strong> Tournament is currently running</p>
                <p><strong>Completed:</strong> Tournament has finished</p>
                <p><strong>Cancelled:</strong> Tournament has been cancelled</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[140px] flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Update Tournament
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </EnhancedProtectedRoute>
  );
}