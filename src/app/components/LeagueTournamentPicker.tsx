// app/components/LeagueTournamentPicker.tsx
'use client';

import { useState, useEffect } from 'react';
import { api, League, Tournament } from '../../lib/api';

interface LeagueTournamentPickerProps {
  onSelectionChange: (selection: { leagueId: string; tournamentId: string } | null) => void;
  className?: string;
}

export default function LeagueTournamentPicker({ onSelectionChange, className = '' }: LeagueTournamentPickerProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchTournaments(selectedLeague);
    } else {
      setTournaments([]);
      setSelectedTournament('');
      onSelectionChange(null);
    }
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedLeague && selectedTournament) {
      onSelectionChange({ leagueId: selectedLeague, tournamentId: selectedTournament });
    } else if (selectedLeague && !selectedTournament) {
      onSelectionChange(null);
    }
  }, [selectedTournament]);

  const fetchLeagues = async () => {
    try {
      const data = await api.leagues.getAll();
      setLeagues(data);
      if (data.length === 1) {
        setSelectedLeague(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching leagues:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async (leagueId: string) => {
    try {
      const data = await api.tournaments.getAll(leagueId);
      setTournaments(data);
      if (data.length === 1) {
        setSelectedTournament(data[0].id);
      } else {
        setSelectedTournament('');
      }
    } catch (err) {
      console.error('Error fetching tournaments:', err);
    }
  };

  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId);
    setSelectedTournament('');
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="h-9 w-48 bg-gray-200 animate-pulse rounded-md" />
        <div className="h-9 w-48 bg-gray-200 animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">League</label>
        <select
          value={selectedLeague}
          onChange={(e) => handleLeagueChange(e.target.value)}
          className="block w-56 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Select league</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>{league.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tournament</label>
        <select
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          disabled={!selectedLeague || tournaments.length === 0}
          className="block w-56 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
        >
          <option value="">Select tournament</option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
