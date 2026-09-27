import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async ({page}) => { await page.goto('/'); });
test('every role and failure is labeled, with simulation actions disabled', async ({page}) => {
 for (const skin of ['smith','forge-command','authorforge','reviewer-simulated']) {
 await page.getByRole('combobox',{name:'Profile',exact:true}).selectOption(skin);
 for (const state of ['idle','working','scanning','verifying','orchestrating','awaiting_authority','primed','blocked','degraded','complete','failed','halted','unavailable']) {
  await page.getByRole('combobox',{name:'Process state',exact:true}).selectOption(state);
  await expect(page.locator('.forge-glyph')).toHaveAttribute('data-role',state);
  await expect(page.getByRole('button',{name:'Request review'})).toBeDisabled();
  await expect(page.locator('[aria-live="assertive"]')).toHaveCount(0);
  if (['blocked','failed','halted','degraded','unavailable'].includes(state)) await expect(page.locator('[data-forge-motion]')).toHaveAttribute('data-forge-motion','none');
 }
 }
});
test('elapsed changes never enter the live region', async ({page}) => {
 const live=page.locator('.forge-sr-only'); const before=await live.textContent();
 await page.getByRole('button',{name:'Advance timer'}).click();
 await expect(live).toHaveText(before!); await expect(page.getByText('Elapsed: 00:13')).toBeVisible();
 await page.getByRole('combobox',{name:'Process state',exact:true}).selectOption('blocked'); await expect(live).not.toHaveText(before!);
});
test('motion preferences, single completion and contrast',async ({page})=>{
 const motion=page.locator('[data-forge-motion]'); await expect(motion).toHaveCSS('animation-name','forge-rotation');
 await page.emulateMedia({reducedMotion:'reduce'}); await expect(motion).toHaveCSS('animation-name','none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.getByLabel('Reduced motion',{exact:true}).check(); await expect(motion).toHaveCSS('animation-name','none');
 await page.getByLabel('Reduced motion',{exact:true}).uncheck();
 await page.getByRole('combobox',{name:'Process state',exact:true}).selectOption('complete'); await expect(motion).toHaveCSS('animation-iteration-count','1');
 await page.getByLabel('High contrast',{exact:true}).check(); await expect(page.getByRole('region',{name:'Process status'})).toHaveCSS('background-color','rgb(0, 0, 0)');
 await page.emulateMedia({forcedColors:'active'}); await expect(page.locator('.forge-glyph')).toBeVisible();
});
test('all evidence and freshness states remain visible',async ({page})=>{
 for(const value of ['unverified','verifying','verified','stale','conflicted','invalid']) {
 await page.getByRole('combobox',{name:'Evidence',exact:true}).selectOption(value); await expect(page.getByRole('region',{name:'Evidence status'})).toContainText(`Evidence: ${value}`);
 }
 for(const value of ['current','aging','stale','unknown']) {
 await page.getByRole('combobox',{name:'Freshness',exact:true}).selectOption(value); await expect(page.getByRole('region',{name:'Evidence status'})).toContainText(`Freshness: ${value}`);
 }
 await page.getByLabel('Lock interaction').check(); await expect(page.getByRole('region',{name:'Authority status'})).toContainText('Interaction locked.');
});
test('keyboard focus and mobile layout',async ({page})=>{
 await page.keyboard.press('Tab'); await expect(page.getByRole('combobox',{name:'Profile',exact:true})).toBeFocused(); await expect(page.getByRole('combobox',{name:'Profile',exact:true})).toHaveCSS('outline-style','solid');
 await page.keyboard.press('Tab'); await expect(page.getByRole('combobox',{name:'Process state',exact:true})).toBeFocused();
 await page.setViewportSize({width:375,height:900}); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
for(const [name,skin] of [['operator','smith'],['plain','authorforge']]) test(`${name} accessibility and visual baseline`,async ({page})=>{
 await page.getByRole('combobox',{name:'Profile',exact:true}).selectOption(skin!); await page.getByLabel('Reduced motion',{exact:true}).check();
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await expect(page).toHaveScreenshot(`${name}.png`,{fullPage:true});
});

test('authority requests are callback-only and re-evaluate current constraints',async ({page})=>{
 await page.goto('/@fs'+process.cwd()+'/tests/browser/authority.html');
 const review=page.getByRole('button',{name:'Request review'});
 await expect(review).toBeEnabled(); await expect(page.getByRole('button',{name:'Unlisted action'})).toBeDisabled();
 await review.focus(); await page.keyboard.press('Enter'); await expect(page.getByText('Requests: 1')).toBeVisible();
 await expect(review).toHaveCSS('outline-style','solid');
 await page.getByLabel('Lock',{exact:true}).check(); await expect(review).toBeDisabled();
 await page.getByLabel('Lock',{exact:true}).uncheck(); await expect(review).toBeEnabled();
 await page.getByLabel('Simulation flag').check(); await expect(review).toBeDisabled();
 await page.getByLabel('Simulation flag').uncheck(); await page.getByLabel('Halt',{exact:true}).check();
 await expect(review).toBeDisabled(); await expect(page.locator('[aria-live="assertive"]')).toHaveCount(1);
 await expect(page.getByText('Requests: 1')).toBeVisible();
});
