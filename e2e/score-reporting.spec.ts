import { test, expect } from '@playwright/test';
import { mockAuth } from './helpers/auth-mock';
import { mockScorePageAPIs, TOURNAMENT, TEAMS, MATCH } from './helpers/api-mock';

const SCORE_URL = `/tournaments/${TOURNAMENT.id}/sessions/3/score`;

test.describe('Score Reporting Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockScorePageAPIs(page);
  });

  test('displays match and team selectors', async ({ page }) => {
    await page.goto(SCORE_URL);

    // Header
    await expect(page.getByText('Report Scores')).toBeVisible();
    await expect(page.getByText('Test Tournament')).toBeVisible();

    // Single match auto-selected — should show match info
    await expect(page.getByText('CHARROS vs PIN PALS')).toBeVisible();

    // Team selector should be visible
    await expect(page.getByText('Select Your Team')).toBeVisible();
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Away')).toBeVisible();
  });

  test('shows score grid after selecting a team', async ({ page }) => {
    await page.goto(SCORE_URL);

    // Click home team (CHARROS)
    await page.getByRole('button', { name: /CHARROS/i }).click();

    // Score grid should appear with player dropdowns
    await expect(page.getByText('CHARROS Scores')).toBeVisible();
    await expect(page.getByText('Game 1')).toBeVisible();
    await expect(page.getByText('Game 2')).toBeVisible();
    await expect(page.getByText('Game 3')).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();

    // Should have 3 rows (lineup_size = 3) with pre-selected regular/captain players
    const selects = page.locator('select');
    await expect(selects).toHaveCount(3);

    // First select should have the captain pre-selected
    await expect(selects.nth(0)).toHaveValue(/eeeeeeee/);
  });

  test('player dropdown shows roster with role labels', async ({ page }) => {
    await page.goto(SCORE_URL);
    await page.getByRole('button', { name: /CHARROS/i }).click();

    // Open first player dropdown
    const firstSelect = page.locator('select').nth(0);
    const options = firstSelect.locator('option');

    // First dropdown: placeholder + players not used in other rows
    // Rows 1-2 take the other 2 regulars, so row 0 sees: captain + substitute = 2 + placeholder
    await expect(options).toHaveCount(3); // "Select player..." + captain + substitute

    // Check role labels across all dropdowns
    const allSelects = page.locator('select');
    const allOptions: string[] = [];
    for (let i = 0; i < 3; i++) {
      const opts = await allSelects.nth(i).locator('option').allTextContents();
      allOptions.push(...opts);
    }
    expect(allOptions.some((t) => t.includes('(C)'))).toBe(true);    // captain
    expect(allOptions.some((t) => t.includes('(sub)'))).toBe(true);  // substitute
  });

  test('dropdowns update eligible players when a selection changes', async ({ page }) => {
    await page.goto(SCORE_URL);
    await page.getByRole('button', { name: /CHARROS/i }).click();

    const selects = page.locator('select');

    // Initial state: 3 rows pre-filled with captain + 2 regulars
    // Row 0 (captain) sees: placeholder + captain + substitute = 3 options
    await expect(selects.nth(0).locator('option')).toHaveCount(3);

    // Row 1 sees: placeholder + Carlos Serros + substitute = 3 options
    const row1OptionsBefore = await selects.nth(1).locator('option').allTextContents();
    expect(row1OptionsBefore.some((t) => t.includes('Julio Villanueva'))).toBe(true);
    expect(row1OptionsBefore.some((t) => t.includes('Alvaro Na'))).toBe(false);

    // Change row 0 from captain (Alvaro Na) to substitute (Julio Villanueva)
    // Get the option value for Julio Villanueva from the dropdown
    const julioOption = selects.nth(0).locator('option', { hasText: 'Julio Villanueva' });
    const julioValue = await julioOption.getAttribute('value');
    await selects.nth(0).selectOption(julioValue!);

    // Now row 1 should update: Julio Villanueva is taken, Alvaro Na is freed
    const row1OptionsAfter = await selects.nth(1).locator('option').allTextContents();
    expect(row1OptionsAfter.some((t) => t.includes('Alvaro Na'))).toBe(true);
    expect(row1OptionsAfter.some((t) => t.includes('Julio Villanueva'))).toBe(false);

    // Row 2 should also reflect the change
    const row2OptionsAfter = await selects.nth(2).locator('option').allTextContents();
    expect(row2OptionsAfter.some((t) => t.includes('Alvaro Na'))).toBe(true);
    expect(row2OptionsAfter.some((t) => t.includes('Julio Villanueva'))).toBe(false);
  });

  test('score inputs accept values and compute totals', async ({ page }) => {
    await page.goto(SCORE_URL);
    await page.getByRole('button', { name: /CHARROS/i }).click();

    // Fill scores for first player
    const inputs = page.locator('input[type="number"]');
    await inputs.nth(0).fill('200');
    await inputs.nth(1).fill('220');
    await inputs.nth(2).fill('210');

    // Row total cell should show 630
    await expect(page.getByRole('cell', { name: '630' })).toBeVisible();
  });

  test('submit button is disabled until all scores are filled', async ({ page }) => {
    await page.goto(SCORE_URL);
    await page.getByRole('button', { name: /CHARROS/i }).click();

    const submitBtn = page.getByRole('button', { name: /Submit Scores/i });
    await expect(submitBtn).toBeDisabled();

    // Fill all 9 score inputs (3 players x 3 games)
    const inputs = page.locator('input[type="number"]');
    const scores = [200, 220, 210, 180, 190, 185, 160, 170, 165];
    for (let i = 0; i < scores.length; i++) {
      await inputs.nth(i).fill(scores[i].toString());
    }

    await expect(submitBtn).toBeEnabled();
  });

  test('submits scores and shows success message', async ({ page }) => {
    await page.goto(SCORE_URL);
    await page.getByRole('button', { name: /CHARROS/i }).click();

    // Fill all scores
    const inputs = page.locator('input[type="number"]');
    const scores = [200, 220, 210, 180, 190, 185, 160, 170, 165];
    for (let i = 0; i < scores.length; i++) {
      await inputs.nth(i).fill(scores[i].toString());
    }

    // Submit
    await page.getByRole('button', { name: /Submit Scores/i }).click();

    // Success message
    await expect(page.getByText(/Scores submitted successfully/i)).toBeVisible();
  });

  test('add player button adds a row for substitutions', async ({ page }) => {
    await page.goto(SCORE_URL);
    await page.getByRole('button', { name: /CHARROS/i }).click();

    // Initially 3 rows
    await expect(page.locator('select')).toHaveCount(3);

    // Click add player
    await page.getByText('+ Add Player').click();

    // Now 4 rows
    await expect(page.locator('select')).toHaveCount(4);

    // The new row's dropdown should include the substitute
    const lastSelect = page.locator('select').nth(3);
    const options = await lastSelect.locator('option').allTextContents();
    expect(options.some((t) => t.includes('(sub)'))).toBe(true);
  });

  test('shows opponent scores when available', async ({ page }) => {
    await mockScorePageAPIs(page, {
      existingScores: [
        {
          matchId: MATCH.id,
          playerId: 'ffffffff-0000-0000-0000-000000000001',
          playerName: 'Fer Costa',
          teamId: TEAMS.away.id,
          teamName: 'PIN PALS',
          scores: [210, 220, 230],
          handicapApplied: 0,
        },
        {
          matchId: MATCH.id,
          playerId: 'ffffffff-0000-0000-0000-000000000002',
          playerName: 'Luis Ordaz',
          teamId: TEAMS.away.id,
          teamName: 'PIN PALS',
          scores: [180, 190, 185],
          handicapApplied: 10,
        },
        {
          matchId: MATCH.id,
          playerId: 'ffffffff-0000-0000-0000-000000000003',
          playerName: 'Andres Carrasco',
          teamId: TEAMS.away.id,
          teamName: 'PIN PALS',
          scores: [195, 200, 205],
          handicapApplied: 0,
        },
      ],
    });

    await page.goto(SCORE_URL);
    // Select home team to see opponent (away) scores
    await page.getByRole('button', { name: /CHARROS/i }).click();

    // Opponent scores section
    await expect(page.getByText('PIN PALS Scores')).toBeVisible();
    await expect(page.getByText('Fer Costa')).toBeVisible();
    await expect(page.getByText('Luis Ordaz')).toBeVisible();
    await expect(page.getByText('Andres Carrasco')).toBeVisible();
  });

  test('shows "Scores submitted" badge on team that already submitted', async ({ page }) => {
    await mockScorePageAPIs(page, {
      existingScores: [
        {
          matchId: MATCH.id,
          playerId: 'ffffffff-0000-0000-0000-000000000001',
          playerName: 'Fer Costa',
          teamId: TEAMS.away.id,
          teamName: 'PIN PALS',
          scores: [210, 220, 230],
          handicapApplied: 0,
        },
      ],
    });

    await page.goto(SCORE_URL);

    // Away team should show "Scores submitted"
    await expect(page.getByText('Scores submitted')).toBeVisible();
  });

  test('team series total updates as scores are entered', async ({ page }) => {
    await page.goto(SCORE_URL);
    await page.getByRole('button', { name: /CHARROS/i }).click();

    const inputs = page.locator('input[type="number"]');

    // Enter scores for first player only
    await inputs.nth(0).fill('200');
    await inputs.nth(1).fill('220');
    await inputs.nth(2).fill('210');

    // Team Series should show at least 630
    await expect(page.getByText('Team Series:')).toBeVisible();
    await expect(page.getByRole('cell', { name: '630' })).toBeVisible();
  });
});

test.describe('Score Reporting - Navigation', () => {
  test('back link navigates to session matches', async ({ page }) => {
    await mockAuth(page);
    await mockScorePageAPIs(page);

    await page.goto(SCORE_URL);

    const backLink = page.getByRole('link', { name: /Back to Session 3/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute(
      'href',
      `/tournaments/${TOURNAMENT.id}/sessions/3/matches`
    );
  });
});
