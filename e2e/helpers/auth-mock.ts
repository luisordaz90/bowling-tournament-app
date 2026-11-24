import { Page } from '@playwright/test';

/**
 * Intercepts the Auth0 session endpoint to return a mock authenticated user.
 * Must be called before navigating to any page that uses `useUser()`.
 */
export async function mockAuth(
  page: Page,
  overrides: Record<string, unknown> = {}
) {
  const mockUser = {
    sub: 'auth0|test-captain-001',
    name: 'Test Captain',
    email: 'captain@test.local',
    email_verified: true,
    'https://bowling-tournament-api.com/roles': ['player'],
    ...overrides,
  };

  // Auth0 SDK v4 for Next.js fetches user profile from /auth/profile
  await page.route('**/auth/profile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser),
    })
  );

  // Mock the token endpoint so API calls don't fail on auth
  await page.route('**/api/auth/token', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'mock-test-token' }),
    })
  );
}

export function mockAdmin(page: Page) {
  return mockAuth(page, {
    sub: 'auth0|test-admin-001',
    name: 'Test Admin',
    email: 'admin@test.local',
    'https://bowling-tournament-api.com/roles': ['superadmin'],
  });
}
