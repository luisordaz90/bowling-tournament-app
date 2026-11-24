import { Page } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api';

// Reusable test fixtures
export const TOURNAMENT = {
  id: 'aaaaaaaa-0000-0000-0000-000000000001',
  name: 'Test Tournament',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  maxTeams: 16,
  totalSessions: 10,
  sessionType: 'weekly',
  sessionsCompleted: 2,
  status: 'active' as const,
  gamesPerSession: 3,
  lineupSize: 3,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const TEAMS = {
  home: {
    id: 'bbbbbbbb-0000-0000-0000-000000000001',
    name: 'CHARROS',
    captainName: 'Alvaro Na',
    captainEmail: 'alvaro@test.local',
    status: 'active' as const,
    registrationDate: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  away: {
    id: 'bbbbbbbb-0000-0000-0000-000000000002',
    name: 'PIN PALS',
    captainName: 'Fer Costa',
    captainEmail: 'fer@test.local',
    status: 'active' as const,
    registrationDate: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
};

export const MATCH = {
  id: 'cccccccc-0000-0000-0000-000000000001',
  tournamentId: TOURNAMENT.id,
  homeTeamId: TEAMS.home.id,
  awayTeamId: TEAMS.away.id,
  sessionId: 'dddddddd-0000-0000-0000-000000000001',
  sessionNumber: 3,
  status: 'scheduled' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const PLAYERS = {
  home: [
    { playerId: 'eeeeeeee-0000-0000-0000-000000000001', role: 'captain', playerDetails: { id: 'eeeeeeee-0000-0000-0000-000000000001', name: 'Alvaro Na' } },
    { playerId: 'eeeeeeee-0000-0000-0000-000000000002', role: 'regular', playerDetails: { id: 'eeeeeeee-0000-0000-0000-000000000002', name: 'Carlos Serros' } },
    { playerId: 'eeeeeeee-0000-0000-0000-000000000003', role: 'regular', playerDetails: { id: 'eeeeeeee-0000-0000-0000-000000000003', name: 'Hugo Brihuega' } },
    { playerId: 'eeeeeeee-0000-0000-0000-000000000004', role: 'substitute', playerDetails: { id: 'eeeeeeee-0000-0000-0000-000000000004', name: 'Julio Villanueva' } },
  ],
  away: [
    { playerId: 'ffffffff-0000-0000-0000-000000000001', role: 'captain', playerDetails: { id: 'ffffffff-0000-0000-0000-000000000001', name: 'Fer Costa' } },
    { playerId: 'ffffffff-0000-0000-0000-000000000002', role: 'regular', playerDetails: { id: 'ffffffff-0000-0000-0000-000000000002', name: 'Luis Ordaz' } },
    { playerId: 'ffffffff-0000-0000-0000-000000000003', role: 'regular', playerDetails: { id: 'ffffffff-0000-0000-0000-000000000003', name: 'Andres Carrasco' } },
  ],
};

/**
 * Mocks all API endpoints needed by the score reporting page.
 * Optionally accepts existing scores to simulate a partially-scored match.
 */
export async function mockScorePageAPIs(
  page: Page,
  options: { existingScores?: any[] } = {}
) {
  const { existingScores = [] } = options;

  // Tournament
  await page.route(`${API_BASE}/tournaments/${TOURNAMENT.id}`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TOURNAMENT) });
    }
    return route.continue();
  });

  // Session matches
  await page.route(`${API_BASE}/tournaments/${TOURNAMENT.id}/sessions/3/matches`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ matches: [MATCH] }),
    })
  );

  // Session scores (GET)
  await page.route(`${API_BASE}/tournaments/${TOURNAMENT.id}/sessions/3/scores`, (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(existingScores),
      });
    }
    // POST — score submission
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-score-id', matchCompleted: false }),
      });
    }
    return route.continue();
  });

  // Teams
  await page.route(`${API_BASE}/teams/${TEAMS.home.id}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TEAMS.home) })
  );
  await page.route(`${API_BASE}/teams/${TEAMS.away.id}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TEAMS.away) })
  );

  // Rosters
  await page.route(`${API_BASE}/registrations/players?tournamentId=${TOURNAMENT.id}&teamId=${TEAMS.home.id}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PLAYERS.home) })
  );
  await page.route(`${API_BASE}/registrations/players?tournamentId=${TOURNAMENT.id}&teamId=${TEAMS.away.id}`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(PLAYERS.away) })
  );
}
