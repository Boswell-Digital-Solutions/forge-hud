import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-27T12:00:00Z') });
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
  await page.clock.runFor(2000);
  await expect(page.locator('.seg').filter({ hasText: /^Session / })).not.toHaveText('Session 00:00');
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
    await expect(page).toHaveScreenshot(`${skin}.png`, { fullPage: true, mask: [page.locator('.seg').filter({ hasText: /^Session / })] });
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.readout .flight')).toHaveCSS('animation-name', 'none');
  });
}

test('five bees, stationary provider icons, every activity state and provider', async ({ page }) => {
  const indicator = page.locator('.readout .backend-activity');
  await expect(indicator.locator('.bee')).toHaveCount(5);
  await expect(indicator).toHaveAttribute('data-moving', 'true');
  for (const provider of ['openai', 'anthropic', 'grok', 'gemini', 'deepseek']) {
    await page.getByLabel('LLM provider').selectOption(provider);
    await expect(indicator.locator('img')).toHaveAttribute('src', new RegExp(provider, "i"));
    await expect.poll(() => indicator.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(indicator.locator('.provider-icon')).toHaveCSS('animation-name', 'none');
  }
  await page.getByLabel('Backend', { exact: true }).selectOption('neuroforge');
  await expect(indicator.locator('.bee')).toHaveCount(0);
  await expect(indicator.locator('.sweep')).toHaveCount(1);
  const cases = { working: 'working', scanning: 'working', verifying: 'working', orchestrating: 'working', primed: 'attention', awaiting_authority: 'attention', complete: 'success', blocked: 'warning', degraded: 'warning', failed: 'critical', halted: 'critical', idle: 'neutral', stale: 'neutral', unknown: 'neutral' };
  for (const [state, tone] of Object.entries(cases)) {
    await page.getByLabel('Activity state').selectOption(state);
    await expect(indicator).toHaveAttribute('data-tone', tone);
    await expect(indicator).toHaveAttribute('data-moving', String(['working', 'scanning', 'verifying', 'orchestrating'].includes(state)));
    if (!['working', 'scanning', 'verifying', 'orchestrating'].includes(state)) await expect(indicator.locator('.sweep')).toHaveCSS('animation-play-state', 'paused');
    await expect(page.getByRole('button', { name: 'Request decision review' })).toBeDisabled();
  }
  await expect(indicator).toContainText('Last reported:');
  await page.getByLabel('LLM provider').selectOption('local');
  await expect(indicator).toContainText('Local model');
  await expect(indicator.locator('img')).toHaveCount(0);
  await page.getByLabel('LLM provider').selectOption('');
  await expect(indicator).toContainText('Unknown provider');
  await expect(indicator.locator('img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Emergency halt' }).click();
  await expect(indicator).toHaveAttribute('data-tone', 'critical');
  await page.getByLabel('Activity state').selectOption('working');
  await expect(indicator).toHaveAttribute('data-moving', 'false');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
