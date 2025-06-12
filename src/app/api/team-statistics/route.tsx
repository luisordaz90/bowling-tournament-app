// src/app/api/team-statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { tournamentApi, teamStatisticsApi } from '../../../lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournamentId');
  const teamId = searchParams.get('teamId');

  try {
    if (tournamentId && teamId) {
      // Get specific team statistics for a tournament
      const response = await tournamentApi.getTeamStatistics(tournamentId, teamId);
      return NextResponse.json(response);
    } else if (tournamentId) {
      // Get all team statistics for a tournament
      const response = await tournamentApi.getAllTeamStatistics(tournamentId);
      return NextResponse.json(response);
    } else {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching team statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team statistics' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const tournamentId = searchParams.get('tournamentId');

  if (!teamId || !tournamentId) {
    return NextResponse.json(
      { error: 'Team ID and Tournament ID are required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    
    const response = await teamStatisticsApi.update(
      teamId, 
      tournamentId, 
      body
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating team statistics:', error);
    return NextResponse.json(
      { error: 'Failed to update team statistics' },
      { status: 500 }
    );
  }
}