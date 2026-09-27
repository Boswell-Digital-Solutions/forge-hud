import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-27T12:00:00Z') });
  await page.goto('/stream.html');
});
test('unknown selection stays static and actual reported identity wins', async ({ page }) => {
  const view = page.getByRole('region', { name: 'NeuroForge request activity' });
  await page.getByRole('button', { name: 'Select route', exact: true }).click();
  await expect(view).toContainText('Selected route: openai');
  await expect(view).toContainText('Execution provenance unknown');
  await expect(view.locator('.backend-activity')).toHaveCount(0);
  await page.getByRole('button', { name: 'Report provider result' }).click();
  await expect(view.locator('img')).toHaveAttribute('src', /deepseek/i);
  await expect(view).toContainText('reported-model');
  await expect(view.locator('.backend-activity')).toHaveAttribute('data-moving', 'false');
  await page.clock.runFor(15000);
  await expect(view).toContainText('stale');
});
test('simulation and unknown completion never claim the selected provider', async ({ page }) => {
  const view = page.getByRole('region', { name: 'NeuroForge request activity' });
  await page.getByRole('button', { name: 'Select route', exact: true }).click();
  await page.getByRole('button', { name: 'Report simulation' }).click();
  await expect(view).toContainText('Simulated execution');
  await expect(view.locator('img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset replay' }).click();
  await page.getByRole('button', { name: 'Select route', exact: true }).click();
  await page.getByRole('button', { name: 'Report unknown result' }).click();
  await expect(view).toContainText('Reported completed. Provenance unknown.');
  await expect(view.locator('.backend-activity')).toHaveCount(0);
});
test('disconnect and revoke clear eligibility and visible origin', async ({ page }) => {
  const view = page.getByRole('region', { name: 'NeuroForge request activity' });
  await page.getByRole('button', { name: 'Select route', exact: true }).click();
  await page.getByRole('button', { name: 'Disconnect stream' }).click();
  await expect(view).toContainText('disconnected');
  await expect(page.getByRole('button', { name: 'Report provider result' })).toBeDisabled();
  await page.getByRole('button', { name: 'Revoke access' }).click();
  await expect(view).not.toContainText('Author-Forge');
  await expect(view).toContainText('reports cleared');
});
for (const theme of ['light', 'dark'] as const) {
  test(`${theme} stream view is accessible and fits mobile`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Select route', exact: true }).click();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByRole('button', { name: 'Report provider result' }).click();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/stream-${theme}.png`, fullPage: true });
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.sweep')).toHaveCSS('animation-name', 'none');
    await page.screenshot({ path: `test-results/stream-${theme}-mobile.png`, fullPage: true });
  });
}
