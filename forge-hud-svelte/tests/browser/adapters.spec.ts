import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await page.goto('/adapters.html');
});
test('scenario progression retains disabled authority and halt dominates scenario changes', async ({ page }) => {
  await expect(page.locator('.readout')).toHaveAttribute('data-role', 'working');
  await page.getByRole('button', { name: 'Step forward' }).click();
  await expect(page.locator('.readout')).toHaveAttribute('data-role', 'awaiting_authority');
  await page.getByRole('button', { name: 'Step forward' }).click();
  await expect(page.locator('.readout')).toHaveAttribute('data-role', 'complete');
  await expect(page.getByRole('button', { name: 'Step forward' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Request decision review' })).toBeDisabled();
  await expect(page.getByText('Unverified', { exact: true })).toHaveCount(2);
  await page.getByRole('button', { name: 'Emergency halt' }).click();
  await page.getByRole('tab', { name: 'Application contract' }).click();
  await expect(page.locator('.readout')).toHaveAttribute('data-role', 'halted');
  await expect(page.getByRole('button', { name: 'Step forward' })).toBeDisabled();
  await page.getByRole('button', { name: 'Reset simulated halt' }).click();
  await expect(page.locator('.readout')).toHaveAttribute('data-role', 'scanning');
  await page.getByRole('button', { name: 'Step forward' }).click();
  await expect(page.locator('.readout')).toHaveAttribute('data-role', 'blocked');
});
test('keyboard tabs, details and quiet session timer', async ({ page }) => {
  const live = page.locator('[aria-live]');
  const before = await live.textContent();
  await page.clock.fastForward(2000);
  await expect(page.getByText('Session 00:02')).toBeVisible();
  await expect(live).toHaveText(before!);
  await page.getByRole('tab', { name: 'SMITH pipeline' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Forge Command decision' })).toBeFocused();
  await expect(page.locator('.readout')).toHaveAttribute('data-role', 'awaiting_authority');
  await page.keyboard.press('Home');
  await expect(page.getByRole('tab', { name: 'Application contract' })).toBeFocused();
  await page.getByRole('button', { name: 'Details' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#drawer')).toBeVisible();
  await expect(live).toHaveAttribute('aria-live', 'polite');
  await page.getByRole('button', { name: 'Emergency halt' }).click();
  await expect(page.locator('[aria-live="assertive"]')).toHaveCount(0);
});
for (const skin of ['operator', 'plain', 'dark'] as const) {
  test(`${skin} workspace accessibility and visual baseline`, async ({ page }) => {
    if (skin === 'plain') await page.getByLabel('Plain language').check();
    await page.emulateMedia({ colorScheme: skin === 'dark' ? 'dark' : 'light', reducedMotion: 'reduce' });
    await page.evaluate(() => document.fonts.ready);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await expect(page).toHaveScreenshot(`${skin}.png`, { fullPage: true });
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.glyph')).toHaveCSS('animation-name', 'none');
  });
}
