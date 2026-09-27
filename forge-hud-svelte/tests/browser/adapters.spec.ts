import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => { await page.goto('/adapters.html'); });
test('two application contracts preserve meaning across footer, rail and Next Action', async ({ page }) => {
  await expect(page.locator('.forge-glyph[data-role="working"]')).toHaveCount(3);
  await expect(page.getByLabel('HUD footer')).toContainText('Interaction locked');
  await page.getByRole('combobox', { name: 'Application contract' }).selectOption('command');
  await expect(page.locator('.forge-glyph[data-role="awaiting_authority"]')).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Request decision review' })).toBeDisabled();
  await page.getByLabel('Emergency halt', { exact: true }).check();
  await expect(page.locator('.forge-glyph[data-role="halted"]')).toHaveCount(3);
  await expect(page.locator('[data-forge-motion="none"]')).toHaveCount(3);
  await expect(page.getByLabel('HUD rail')).toContainText('System halted — interaction locked');
  await expect(page.getByRole('button', { name: 'Request decision review' })).toBeDisabled();
});
test('one announcement owner, quiet timer and keyboard details', async ({ page }) => {
  await expect(page.locator('.forge-sr-only')).toHaveCount(1);
  const before = await page.locator('.forge-sr-only').textContent();
  await page.getByRole('button', { name: 'Advance timer' }).click();
  await expect(page.locator('.forge-sr-only')).toHaveText(before!);
  const summary = page.locator('summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details')).toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
  await expect(summary).toHaveCSS('outline-style', 'solid');
  await page.getByLabel('Emergency halt', { exact: true }).check();
  await expect(page.locator('.forge-sr-only')).not.toHaveText(before!);
  await expect(page.locator('[aria-live="assertive"]')).toHaveCount(0);
});
for (const skin of ['operator','plain']) {
  test(`${skin} adapter accessibility and visual baseline`, async ({ page }) => {
    if (skin === 'plain') await page.getByLabel('Plain-language skin').check();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await expect(page).toHaveScreenshot(`${skin}.png`, { fullPage: true });
    await page.setViewportSize({ width: 375, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
