import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home loads and has skip link', async ({ page }) => {
  await page.goto('/');
  const skip = page.locator('a', { hasText: 'Skip to content' });
  await expect(skip).toBeVisible();
});

test('a11y checks', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

