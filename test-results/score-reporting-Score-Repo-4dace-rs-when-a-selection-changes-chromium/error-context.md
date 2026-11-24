# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: score-reporting.spec.ts >> Score Reporting Page >> dropdowns update eligible players when a selection changes
- Location: e2e/score-reporting.spec.ts:73:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('select').first().locator('option')
Expected: 3
Received: undefined

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { mockAuth } from './helpers/auth-mock';
  3   | import { mockScorePageAPIs, TOURNAMENT, TEAMS, MATCH } from './helpers/api-mock';
  4   | 
  5   | const SCORE_URL = `/tournaments/${TOURNAMENT.id}/sessions/3/score`;
  6   | 
  7   | test.describe('Score Reporting Page', () => {
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await mockAuth(page);
  10  |     await mockScorePageAPIs(page);
  11  |   });
  12  | 
  13  |   test('displays match and team selectors', async ({ page }) => {
  14  |     await page.goto(SCORE_URL);
  15  | 
  16  |     // Header
  17  |     await expect(page.getByText('Report Scores')).toBeVisible();
  18  |     await expect(page.getByText('Test Tournament')).toBeVisible();
  19  | 
  20  |     // Single match auto-selected — should show match info
  21  |     await expect(page.getByText('CHARROS vs PIN PALS')).toBeVisible();
  22  | 
  23  |     // Team selector should be visible
  24  |     await expect(page.getByText('Select Your Team')).toBeVisible();
  25  |     await expect(page.getByText('Home')).toBeVisible();
  26  |     await expect(page.getByText('Away')).toBeVisible();
  27  |   });
  28  | 
  29  |   test('shows score grid after selecting a team', async ({ page }) => {
  30  |     await page.goto(SCORE_URL);
  31  | 
  32  |     // Click home team (CHARROS)
  33  |     await page.getByRole('button', { name: /CHARROS/i }).click();
  34  | 
  35  |     // Score grid should appear with player dropdowns
  36  |     await expect(page.getByText('CHARROS Scores')).toBeVisible();
  37  |     await expect(page.getByText('Game 1')).toBeVisible();
  38  |     await expect(page.getByText('Game 2')).toBeVisible();
  39  |     await expect(page.getByText('Game 3')).toBeVisible();
  40  |     await expect(page.getByText('Total')).toBeVisible();
  41  | 
  42  |     // Should have 3 rows (lineup_size = 3) with pre-selected regular/captain players
  43  |     const selects = page.locator('select');
  44  |     await expect(selects).toHaveCount(3);
  45  | 
  46  |     // First select should have the captain pre-selected
  47  |     await expect(selects.nth(0)).toHaveValue(/eeeeeeee/);
  48  |   });
  49  | 
  50  |   test('player dropdown shows roster with role labels', async ({ page }) => {
  51  |     await page.goto(SCORE_URL);
  52  |     await page.getByRole('button', { name: /CHARROS/i }).click();
  53  | 
  54  |     // Open first player dropdown
  55  |     const firstSelect = page.locator('select').nth(0);
  56  |     const options = firstSelect.locator('option');
  57  | 
  58  |     // First dropdown: placeholder + players not used in other rows
  59  |     // Rows 1-2 take the other 2 regulars, so row 0 sees: captain + substitute = 2 + placeholder
  60  |     await expect(options).toHaveCount(3); // "Select player..." + captain + substitute
  61  | 
  62  |     // Check role labels across all dropdowns
  63  |     const allSelects = page.locator('select');
  64  |     const allOptions: string[] = [];
  65  |     for (let i = 0; i < 3; i++) {
  66  |       const opts = await allSelects.nth(i).locator('option').allTextContents();
  67  |       allOptions.push(...opts);
  68  |     }
  69  |     expect(allOptions.some((t) => t.includes('(C)'))).toBe(true);    // captain
  70  |     expect(allOptions.some((t) => t.includes('(sub)'))).toBe(true);  // substitute
  71  |   });
  72  | 
  73  |   test('dropdowns update eligible players when a selection changes', async ({ page }) => {
  74  |     await page.goto(SCORE_URL);
  75  |     await page.getByRole('button', { name: /CHARROS/i }).click();
  76  | 
  77  |     const selects = page.locator('select');
  78  | 
  79  |     // Initial state: 3 rows pre-filled with captain + 2 regulars
  80  |     // Row 0 (captain) sees: placeholder + captain + substitute = 3 options
> 81  |     await expect(selects.nth(0).locator('option')).toHaveCount(3);
      |                                                    ^ Error: expect(locator).toHaveCount(expected) failed
  82  | 
  83  |     // Row 1 sees: placeholder + Carlos Serros + substitute = 3 options
  84  |     const row1OptionsBefore = await selects.nth(1).locator('option').allTextContents();
  85  |     expect(row1OptionsBefore.some((t) => t.includes('Julio Villanueva'))).toBe(true);
  86  |     expect(row1OptionsBefore.some((t) => t.includes('Alvaro Na'))).toBe(false);
  87  | 
  88  |     // Change row 0 from captain (Alvaro Na) to substitute (Julio Villanueva)
  89  |     // Get the option value for Julio Villanueva from the dropdown
  90  |     const julioOption = selects.nth(0).locator('option', { hasText: 'Julio Villanueva' });
  91  |     const julioValue = await julioOption.getAttribute('value');
  92  |     await selects.nth(0).selectOption(julioValue!);
  93  | 
  94  |     // Now row 1 should update: Julio Villanueva is taken, Alvaro Na is freed
  95  |     const row1OptionsAfter = await selects.nth(1).locator('option').allTextContents();
  96  |     expect(row1OptionsAfter.some((t) => t.includes('Alvaro Na'))).toBe(true);
  97  |     expect(row1OptionsAfter.some((t) => t.includes('Julio Villanueva'))).toBe(false);
  98  | 
  99  |     // Row 2 should also reflect the change
  100 |     const row2OptionsAfter = await selects.nth(2).locator('option').allTextContents();
  101 |     expect(row2OptionsAfter.some((t) => t.includes('Alvaro Na'))).toBe(true);
  102 |     expect(row2OptionsAfter.some((t) => t.includes('Julio Villanueva'))).toBe(false);
  103 |   });
  104 | 
  105 |   test('score inputs accept values and compute totals', async ({ page }) => {
  106 |     await page.goto(SCORE_URL);
  107 |     await page.getByRole('button', { name: /CHARROS/i }).click();
  108 | 
  109 |     // Fill scores for first player
  110 |     const inputs = page.locator('input[type="number"]');
  111 |     await inputs.nth(0).fill('200');
  112 |     await inputs.nth(1).fill('220');
  113 |     await inputs.nth(2).fill('210');
  114 | 
  115 |     // Row total cell should show 630
  116 |     await expect(page.getByRole('cell', { name: '630' })).toBeVisible();
  117 |   });
  118 | 
  119 |   test('submit button is disabled until all scores are filled', async ({ page }) => {
  120 |     await page.goto(SCORE_URL);
  121 |     await page.getByRole('button', { name: /CHARROS/i }).click();
  122 | 
  123 |     const submitBtn = page.getByRole('button', { name: /Submit Scores/i });
  124 |     await expect(submitBtn).toBeDisabled();
  125 | 
  126 |     // Fill all 9 score inputs (3 players x 3 games)
  127 |     const inputs = page.locator('input[type="number"]');
  128 |     const scores = [200, 220, 210, 180, 190, 185, 160, 170, 165];
  129 |     for (let i = 0; i < scores.length; i++) {
  130 |       await inputs.nth(i).fill(scores[i].toString());
  131 |     }
  132 | 
  133 |     await expect(submitBtn).toBeEnabled();
  134 |   });
  135 | 
  136 |   test('submits scores and shows success message', async ({ page }) => {
  137 |     await page.goto(SCORE_URL);
  138 |     await page.getByRole('button', { name: /CHARROS/i }).click();
  139 | 
  140 |     // Fill all scores
  141 |     const inputs = page.locator('input[type="number"]');
  142 |     const scores = [200, 220, 210, 180, 190, 185, 160, 170, 165];
  143 |     for (let i = 0; i < scores.length; i++) {
  144 |       await inputs.nth(i).fill(scores[i].toString());
  145 |     }
  146 | 
  147 |     // Submit
  148 |     await page.getByRole('button', { name: /Submit Scores/i }).click();
  149 | 
  150 |     // Success message
  151 |     await expect(page.getByText(/Scores submitted successfully/i)).toBeVisible();
  152 |   });
  153 | 
  154 |   test('add player button adds a row for substitutions', async ({ page }) => {
  155 |     await page.goto(SCORE_URL);
  156 |     await page.getByRole('button', { name: /CHARROS/i }).click();
  157 | 
  158 |     // Initially 3 rows
  159 |     await expect(page.locator('select')).toHaveCount(3);
  160 | 
  161 |     // Click add player
  162 |     await page.getByText('+ Add Player').click();
  163 | 
  164 |     // Now 4 rows
  165 |     await expect(page.locator('select')).toHaveCount(4);
  166 | 
  167 |     // The new row's dropdown should include the substitute
  168 |     const lastSelect = page.locator('select').nth(3);
  169 |     const options = await lastSelect.locator('option').allTextContents();
  170 |     expect(options.some((t) => t.includes('(sub)'))).toBe(true);
  171 |   });
  172 | 
  173 |   test('shows opponent scores when available', async ({ page }) => {
  174 |     await mockScorePageAPIs(page, {
  175 |       existingScores: [
  176 |         {
  177 |           matchId: MATCH.id,
  178 |           playerId: 'ffffffff-0000-0000-0000-000000000001',
  179 |           playerName: 'Fer Costa',
  180 |           teamId: TEAMS.away.id,
  181 |           teamName: 'PIN PALS',
```