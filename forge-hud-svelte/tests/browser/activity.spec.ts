import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-27T12:00:00Z') });
  await page.goto('/activity.html');
});

test('concurrent origins keep provider selection separate from execution', async ({ page }) => {
  const smith = page.locator('[data-origin="forge-smithy"]');
  const command = page.locator('[data-origin="ForgeCommand"]');
  await expect(smith.locator('.bee')).toHaveCount(5);
  await expect(smith.locator('.backend-activity')).toHaveAttribute('data-moving', 'true');
  await expect(command).toContainText('Provider selected; execution not yet observed.');
  await expect(command.locator('.backend-activity')).toHaveAttribute('data-moving', 'false');
  await expect(command.locator('img')).toHaveAttribute('src', /gemini/);
  await page.getByRole('button', { name: 'Advance simulated work' }).click();
  await expect(smith).toHaveAttribute('data-phase', 'completed');
  await expect(smith.locator('.backend-activity')).toHaveAttribute('data-moving', 'false');
  await expect(command.locator('.backend-activity')).toHaveAttribute('data-moving', 'true');
  await page.getByRole('button', { name: 'Advance simulated work' }).click();
  await expect(command).toHaveAttribute('data-phase', 'completed');
  await expect(page.getByRole('button', { name: 'Advance simulated work' })).toBeDisabled();
});

test('disconnect and missed updates stop motion; authorized snapshot recovers', async ({ page }) => {
  const rows = page.locator('.activity-list li');
  await page.getByRole('button', { name: 'Disconnect feed' }).click();
  for (const row of await rows.all()) {
    await expect(row).toHaveAttribute('data-freshness', 'stale');
    await expect(row.locator('.backend-activity')).toHaveAttribute('data-moving', 'false');
  }
  await page.getByRole('button', { name: 'Reconnect snapshot' }).click();
  await expect(rows.first()).toHaveAttribute('data-freshness', 'current');
  await page.getByRole('button', { name: 'Simulate missed update' }).click();
  await expect(page.getByRole('status')).toContainText('needs a fresh snapshot');
  await expect(rows.first()).toHaveAttribute('data-freshness', 'stale');
  await page.getByRole('button', { name: 'Reconnect snapshot' }).click();
  await expect(page.getByRole('status')).toContainText('connected');
  await expect(rows.first()).toHaveAttribute('data-freshness', 'current');
});

test('freshness expires without restarting work; revoke and audience switch clear reports', async ({ page }) => {
  await page.clock.runFor(15000);
  await expect(page.locator('[data-freshness="stale"]')).toHaveCount(2);
  await expect(page.locator('.activity-list [data-moving="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Revoke audience' }).click();
  await expect(page.locator('.activity-list li')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reconnect snapshot' })).toBeDisabled();
  await page.getByLabel('Preview audience').selectOption('author');
  await expect(page.locator('[data-origin="Author-Forge"]')).toHaveCount(1);
  await expect(page.locator('[data-origin="forge-smithy"]')).toHaveCount(0);
  await page.getByLabel('Preview audience').selectOption('review');
  await expect(page.locator('[data-origin="tarcie-reviewer"]')).toHaveCount(1);
  await expect(page.locator('[data-origin="Author-Forge"]')).toHaveCount(0);
});

for (const theme of ['light', 'dark'] as const) {
  test(`${theme} origin view accessibility, reduced motion and responsive layout`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.evaluate(() => document.fonts.ready);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await expect(page.locator('.flight')).toHaveCSS('animation-name', 'none');
    await page.screenshot({ path: `test-results/origin-${theme}.png`, fullPage: true });
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/origin-${theme}-mobile.png`, fullPage: true });
  });
}

test('workspace details link opens the origin session preview', async ({ page }) => {
  await page.goto('/adapters.html');
  await page.getByRole('button', { name: 'Details', exact: true }).click();
  await page.getByRole('link', { name: 'Explore origin activity' }).click();
  await expect(page).toHaveURL(/activity\.html$/);
  await expect(page.getByRole('status')).toContainText('2 reports');
});
