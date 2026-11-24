// src/app/api/player-statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournamentId');
  const playerId = searchParams.get('playerId');

  try {
    if (tournamentId && playerId) {
      // Get specific player statistics for a tournament
      const response = await api.statistics.getPlayerStats(tournamentId, playerId);
      return NextResponse.json(response);
    } else if (tournamentId) {
      // Get all player statistics for a tournament
      const response = await api.statistics.getAllPlayerStats(tournamentId);
      return NextResponse.json(response);
    } else {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching player statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player statistics' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('playerId');
  const tournamentId = searchParams.get('tournamentId');

  if (!playerId || !tournamentId) {
    return NextResponse.json(
      { error: 'Player ID and Tournament ID are required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    const response = await api.statistics.updatePlayerStats(playerId, tournamentId, body);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating player statistics:', error);
    return NextResponse.json(
      { error: 'Failed to update player statistics' },
      { status: 500 }
    );
  }
}