import { test, expect } from '@playwright/test';

test('homepage renders and shows title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/OpGrapes/);
});


